import RNFS from 'react-native-fs';
import FastImage from '@d11/react-native-fast-image';

export const CACHE_TIER = {
  THUMBNAIL: 'thumbnail',
  FULL: 'full',
};

const CACHE_DIRS = {
  [CACHE_TIER.THUMBNAIL]: `${RNFS.CachesDirectoryPath}/gallery_thumbnails`,
  [CACHE_TIER.FULL]: `${RNFS.CachesDirectoryPath}/gallery_full`,
};

const SUPPORTED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
const MAX_CONCURRENT_DOWNLOADS = 6;
const THUMBNAIL_PRELOAD_LIMIT = 24;

const memoryCache = new Map();
const inFlight = new Map();
const pendingQueue = [];

let activeDownloads = 0;

const toFileUri = filePath =>
  filePath.startsWith('file://') ? filePath : `file://${filePath}`;

const memoryKey = (url, tier) => `${tier}:${url}`;
const isLocalUri = url => url.startsWith('file://');

const urlToCacheKey = url => {
  let hash = 0;
  for (let i = 0; i < url.length; i += 1) {
    // Bitwise ops are the algorithm here (32-bit hashCode), not a style slip —
    // the wraparound they produce is required for a stable, fixed-width hash.
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + url.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

const getExtension = imageUrl => {
  const path = imageUrl.split('?')[0];
  const ext = path.split('.').pop()?.toLowerCase();

  if (ext && SUPPORTED_EXTENSIONS.has(ext)) {
    return ext === 'jpeg' ? 'jpg' : ext;
  }

  return 'jpg';
};

const getCachePath = (imageUrl, tier = CACHE_TIER.THUMBNAIL) => {
  const extension = getExtension(imageUrl);
  return `${CACHE_DIRS[tier]}/${urlToCacheKey(imageUrl)}.${extension}`;
};

const ensureCacheDir = async tier => {
  const dir = CACHE_DIRS[tier];
  const exists = await RNFS.exists(dir);
  if (!exists) {
    await RNFS.mkdir(dir);
  }
};

const runNextDownload = () => {
  if (activeDownloads >= MAX_CONCURRENT_DOWNLOADS || pendingQueue.length === 0) {
    return;
  }

  const next = pendingQueue.shift();
  if (!next) {
    return;
  }

  activeDownloads += 1;
  next()
    .catch(() => {})
    .finally(() => {
      activeDownloads -= 1;
      runNextDownload();
    });
};

const enqueueDownload = task => {
  pendingQueue.push(task);
  runNextDownload();
};

/**
 * Synchronous, filesystem-free lookup. Returns a cached `file://` uri only if it
 * is already known in memory, otherwise null. Lets callers mount an image on the
 * very first render without awaiting an async RNFS.exists() round-trip.
 */
export const peekCachedImageUri = (imageUrl, tier = CACHE_TIER.THUMBNAIL) => {
  if (!imageUrl?.trim()) {
    return null;
  }

  if (isLocalUri(imageUrl.trim())) {
    return imageUrl.trim();
  }

  const key = memoryKey(imageUrl.trim(), tier);
  return memoryCache.has(key) ? memoryCache.get(key) : null;
};

export const getCachedImageUri = async (
  imageUrl,
  tier = CACHE_TIER.THUMBNAIL,
) => {
  if (!imageUrl?.trim()) {
    return null;
  }

  const normalizedUrl = imageUrl.trim();
  if (isLocalUri(normalizedUrl)) {
    return normalizedUrl;
  }
  const key = memoryKey(normalizedUrl, tier);

  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }

  const cachePath = getCachePath(normalizedUrl, tier);
  const exists = await RNFS.exists(cachePath);

  if (!exists) {
    return null;
  }

  const uri = toFileUri(cachePath);
  memoryCache.set(key, uri);
  return uri;
};

export const cacheImage = (imageUrl, tier = CACHE_TIER.THUMBNAIL) => {
  if (!imageUrl?.trim()) {
    return Promise.reject(new Error('Invalid image URL'));
  }

  const normalizedUrl = imageUrl.trim();
  if (isLocalUri(normalizedUrl)) {
    return Promise.resolve(normalizedUrl);
  }
  const key = memoryKey(normalizedUrl, tier);

  if (memoryCache.has(key)) {
    return Promise.resolve(memoryCache.get(key));
  }

  if (inFlight.has(key)) {
    return inFlight.get(key);
  }

  const promise = new Promise((resolve, reject) => {
    enqueueDownload(async () => {
      try {
        const existingUri = await getCachedImageUri(normalizedUrl, tier);
        if (existingUri) {
          resolve(existingUri);
          return;
        }

        await ensureCacheDir(tier);
        const cachePath = getCachePath(normalizedUrl, tier);
        const result = await RNFS.downloadFile({
          fromUrl: normalizedUrl,
          toFile: cachePath,
        }).promise;

        if (result.statusCode !== 200) {
          await RNFS.unlink(cachePath).catch(() => {});
          throw new Error(`Cache download failed with status ${result.statusCode}`);
        }

        const uri = toFileUri(cachePath);
        memoryCache.set(key, uri);
        resolve(uri);
      } catch (error) {
        reject(error);
      } finally {
        inFlight.delete(key);
      }
    });
  });

  inFlight.set(key, promise);
  return promise;
};

export const prefetchImages = (imageUrls, tier = CACHE_TIER.THUMBNAIL) => {
  const uniqueUrls = [
    ...new Set(imageUrls.filter(url => typeof url === 'string' && url.trim())),
  ];

  uniqueUrls.forEach(url => {
    cacheImage(url, tier).catch(() => {});
  });
};

export const prefetchThumbnailImages = imageUrls =>
  prefetchImages(imageUrls, CACHE_TIER.THUMBNAIL);

export const prefetchFullImages = imageUrls =>
  prefetchImages(imageUrls, CACHE_TIER.FULL);

export const preloadFastImages = (
  imageUrls,
  limit = THUMBNAIL_PRELOAD_LIMIT,
  tier = CACHE_TIER.THUMBNAIL,
) => {
  const sources = [...new Set(imageUrls.filter(url => typeof url === 'string' && url.trim()))]
    .slice(0, limit)
    .map(uri => ({
      uri: uri.trim(),
      priority: FastImage.priority.high,
      cache: FastImage.cacheControl.immutable,
    }));

  if (sources.length > 0) {
    FastImage.preload(sources);
  }
};
