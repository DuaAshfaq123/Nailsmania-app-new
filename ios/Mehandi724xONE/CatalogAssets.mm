#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

/**
 * iOS counterpart of Android's CatalogAssets module.
 *
 * `thumbs` and `full` are On-Demand Resource tags. Requests are retained for
 * the lifetime of the app so iOS cannot purge an in-use catalog underneath
 * JavaScript. Home requests `thumbs`; the viewer requests `full`.
 */
@interface CatalogAssets : RCTEventEmitter <RCTBridgeModule>
@property(nonatomic, strong) NSMutableDictionary<NSString *, NSBundleResourceRequest *> *requests;
@property(nonatomic, strong) NSMutableDictionary<NSString *, NSString *> *statuses;
@property(nonatomic, assign) BOOL hasListeners;
@end

@implementation CatalogAssets

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (instancetype)init
{
  self = [super init];
  if (self) {
    _requests = [NSMutableDictionary dictionary];
    _statuses = [NSMutableDictionary dictionary];
  }
  return self;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"CatalogPackProgress"];
}

/**
 * Replays the latest status per pack. Events are not buffered, so a screen that subscribes
 * after a download already reported would otherwise have no status to show.
 */
- (void)startObserving
{
  self.hasListeners = YES;

  @synchronized(self.requests) {
    [self.requests enumerateKeysAndObjectsUsingBlock:^(
                       NSString *packName,
                       NSBundleResourceRequest *request,
                       __unused BOOL *stop) {
      [self emitProgressForPack:packName
                        request:request
                         status:self.statuses[packName] ?: @"pending"];
    }];
  }
}

- (void)stopObserving
{
  self.hasListeners = NO;
}

- (void)dealloc
{
  for (NSBundleResourceRequest *request in self.requests.allValues) {
    @try {
      [request.progress removeObserver:self forKeyPath:@"fractionCompleted"];
    } @catch (__unused NSException *exception) {
    }
  }
}

- (NSString *)rootPathForPack:(NSString *)packName
{
  NSBundle *bundle = [NSBundle mainBundle];

  if ([packName isEqualToString:@"thumbs"]) {
    NSString *manifestPath = [bundle pathForResource:@"catalog"
                                             ofType:@"json"
                                        inDirectory:@"thumbs"];
    return manifestPath.stringByDeletingLastPathComponent;
  }

  NSURL *designsURL = [bundle URLForResource:@"designs"
                               withExtension:nil
                                subdirectory:@"full"];
  return designsURL.URLByDeletingLastPathComponent.path;
}

- (void)emitProgressForPack:(NSString *)packName
                    request:(NSBundleResourceRequest *)request
                     status:(NSString *)status
{
  // Same lock as `requests` (and @synchronized is recursive per thread, so nesting inside
  // the callers that already hold it is safe) because progress arrives off the main thread.
  if (packName != nil) {
    @synchronized(self.requests) {
      self.statuses[packName] = status ?: @"downloading";
    }
  }

  if (!self.hasListeners) {
    return;
  }

  NSProgress *progress = request.progress;
  [self sendEventWithName:@"CatalogPackProgress"
                     body:@{
                       @"packName" : packName ?: @"",
                       @"status" : status ?: @"downloading",
                       @"bytesDownloaded" : @(progress.completedUnitCount),
                       @"totalBytes" : @(progress.totalUnitCount > 0
                                             ? progress.totalUnitCount
                                             : 0),
                       @"fraction" : @(progress.fractionCompleted),
                     }];
}

- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(NSDictionary<NSKeyValueChangeKey, id> *)change
                       context:(void *)context
{
  if (![keyPath isEqualToString:@"fractionCompleted"]) {
    [super observeValueForKeyPath:keyPath ofObject:object change:change context:context];
    return;
  }

  @synchronized(self.requests) {
    [self.requests enumerateKeysAndObjectsUsingBlock:^(
                       NSString *packName,
                       NSBundleResourceRequest *request,
                       BOOL *stop) {
      if (request.progress == object) {
        NSString *status =
            request.progress.fractionCompleted >= 1.0 ? @"completed" : @"downloading";
        [self emitProgressForPack:packName request:request status:status];
        *stop = YES;
      }
    }];
  }
}

RCT_REMAP_METHOD(ensurePack,
                 ensurePack:(NSString *)packName
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  if (![packName isEqualToString:@"thumbs"] &&
      ![packName isEqualToString:@"full"]) {
    reject(@"UNKNOWN_CATALOG_PACK",
           [NSString stringWithFormat:@"Unknown catalog pack: %@", packName],
           nil);
    return;
  }

  @synchronized(self.requests) {
    NSBundleResourceRequest *existing = self.requests[packName];
    NSString *existingPath = [self rootPathForPack:packName];
    if (existing != nil && existingPath != nil) {
      [self emitProgressForPack:packName request:existing status:@"completed"];
      resolve(existingPath);
      return;
    }

    NSBundleResourceRequest *request =
        [[NSBundleResourceRequest alloc] initWithTags:[NSSet setWithObject:packName]];
    request.loadingPriority =
        [packName isEqualToString:@"thumbs"]
            ? NSBundleResourceRequestLoadingPriorityUrgent
            : 0.8;
    self.requests[packName] = request;
    [request.progress addObserver:self
                       forKeyPath:@"fractionCompleted"
                          options:NSKeyValueObservingOptionNew
                          context:nil];
    [self emitProgressForPack:packName request:request status:@"pending"];

    [request beginAccessingResourcesWithCompletionHandler:^(NSError *error) {
      if (error != nil) {
        @synchronized(self.requests) {
          [request.progress removeObserver:self forKeyPath:@"fractionCompleted"];
          [self.requests removeObjectForKey:packName];
        }
        [self emitProgressForPack:packName request:request status:@"failed"];
        reject(@"PACK_DOWNLOAD_FAILED", error.localizedDescription, error);
        return;
      }

      NSString *rootPath = [self rootPathForPack:packName];
      if (rootPath == nil) {
        @synchronized(self.requests) {
          [request.progress removeObserver:self forKeyPath:@"fractionCompleted"];
          [self.requests removeObjectForKey:packName];
        }
        [request endAccessingResources];
        [self emitProgressForPack:packName request:request status:@"failed"];
        reject(@"PACK_PATH_MISSING",
               [NSString stringWithFormat:
                   @"ODR tag %@ completed but its catalog directory is missing",
                   packName],
               nil);
        return;
      }

      [self emitProgressForPack:packName request:request status:@"completed"];
      resolve(rootPath);
    }];
  }
}

RCT_REMAP_METHOD(resolveBaseAsset,
                 resolveBaseAsset:(NSString *)relativePath
                 baseResolver:(RCTPromiseResolveBlock)resolve
                 baseRejecter:(RCTPromiseRejectBlock)reject)
{
  NSString *bundleRelativePath = relativePath;
  if ([bundleRelativePath hasPrefix:@"catalog/"]) {
    bundleRelativePath =
        [bundleRelativePath substringFromIndex:[@"catalog/" length]];
  }

  NSString *extension = bundleRelativePath.pathExtension;
  NSString *resourcePath = [bundleRelativePath stringByDeletingPathExtension];
  NSString *path = [[NSBundle mainBundle] pathForResource:resourcePath
                                                  ofType:extension];
  if (path == nil) {
    reject(@"BASE_ASSET_RESOLVE_FAILED",
           [NSString stringWithFormat:@"Missing bundled catalog asset: %@",
                                      relativePath],
           nil);
    return;
  }

  resolve([NSURL fileURLWithPath:path].absoluteString);
}

@end
