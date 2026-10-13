import {useState, useEffect, useCallback, useRef} from 'react';
import {
  fetchAllCategoryImages,
  fetchCategoryImages,
  subscribeToCategoryImages,
  paginateImages,
} from '../services';
import {Config} from '../constants';
import {debugError, debugLog} from '../utils/debugLog';
import {getGalleryUrl, getViewerFullUrl} from '../utils/imageRef';
import {
  CACHE_TIER,
  prefetchThumbnailImages,
  preloadFastImages,
} from '../services/cache/imageCacheService';

const PREFETCH_AHEAD_COUNT = 16;
const FAST_IMAGE_PRELOAD_LIMIT = 24;

export const useCategoryImages = selectedCategory => {
  const [loadedImages, setLoadedImages] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [allImages, setAllImages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  // Guards against overlapping refreshes: a second pull while one is in flight is
  // ignored rather than firing another read and racing the first one's setState.
  const refreshLockRef = useRef(false);
  const pageNumRef = useRef(1);
  const prevLoadedCountRef = useRef(0);
  const loadMoreLockRef = useRef(false);
  const loadingStartedAtRef = useRef(0);
  const didPrefetchRef = useRef(false);
  const hasReceivedImagesRef = useRef(false);
  const prefetchedCountRef = useRef(0);

  const LOADING_MORE_MIN_MS = 120;

  const applyPagination = useCallback((images, page = pageNumRef.current) => {
    const {images: sliced, isComplete} = paginateImages(
      images,
      page,
      Config.IMAGE_BATCH_SIZE,
      Config.IMAGE_INITIAL_BATCH_SIZE,
    );

    debugLog('useCategoryImages', `Pagination applied for "${selectedCategory}"`, {
      page,
      totalImages: images.length,
      loadedCount: sliced.length,
      isComplete,
      batchSize: Config.IMAGE_BATCH_SIZE,
      initialBatchSize: Config.IMAGE_INITIAL_BATCH_SIZE,
    });

    setLoadedImages(sliced);
    setLoadingComplete(isComplete);
  }, [selectedCategory]);

  useEffect(() => {
    debugLog('useCategoryImages', `Category changed → "${selectedCategory}"`);
    pageNumRef.current = 1;
    prevLoadedCountRef.current = 0;
    loadMoreLockRef.current = false;
    didPrefetchRef.current = false;
    hasReceivedImagesRef.current = false;
    prefetchedCountRef.current = 0;
    setPageNum(1);
    setLoadingComplete(false);
    setAllImages([]);
    setLoadedImages([]);
    setLoadingMore(false);
    setIsInitialLoading(true);
    setHasError(false);
    setRefreshing(false);
    refreshLockRef.current = false;
  }, [selectedCategory]);

  useEffect(() => {
    let cancelled = false;

    const finishInitialLoad = (source, images) => {
      if (cancelled) {
        debugLog('useCategoryImages', `Ignored stale ${source} response for "${selectedCategory}"`);
        return;
      }

      debugLog('useCategoryImages', `Initial load via ${source} for "${selectedCategory}"`, {
        count: images.length,
        firstUrlLength: getViewerFullUrl(images[0])?.length,
      });

      setAllImages(images);
      hasReceivedImagesRef.current = images.length > 0;
      pageNumRef.current = 1;
      applyPagination(images, 1);
      setIsInitialLoading(false);
      setHasError(false);
    };

    const handleError = (source, error) => {
      debugError('useCategoryImages', `${source} failed for "${selectedCategory}"`, error);
      if (!cancelled) {
        setIsInitialLoading(false);
        if (!hasReceivedImagesRef.current) {
          setAllImages([]);
          setLoadedImages([]);
          // Only an error when we have nothing to show: a failure after data has already
          // arrived (e.g. a dropped snapshot) should not replace a populated list with an
          // error screen.
          setHasError(true);
        }
      }
    };

    debugLog('useCategoryImages', `Starting fetch for "${selectedCategory}"`);

    if (selectedCategory === 'All') {
      fetchAllCategoryImages()
        .then(images => finishInitialLoad('fetchAll', images))
        .catch(error => handleError('fetchAll', error));
      return () => {
        cancelled = true;
      };
    }

    const unsubscribe = subscribeToCategoryImages(
      selectedCategory,
      images => {
        if (cancelled) {
          return;
        }
        debugLog('useCategoryImages', `Live snapshot for "${selectedCategory}"`, {
          count: images.length,
        });
        setAllImages(images);
        hasReceivedImagesRef.current = images.length > 0;
        applyPagination(images, pageNumRef.current);
        setIsInitialLoading(false);
      },
      error => handleError('subscribe', error),
    );

    fetchCategoryImages(selectedCategory)
      .then(images => finishInitialLoad('fetch', images))
      .catch(error => handleError('fetch', error));

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [selectedCategory, applyPagination]);

  useEffect(() => {
    if (allImages.length > 0) {
      applyPagination(allImages, pageNumRef.current);
    }
  }, [pageNum, allImages, applyPagination]);

  useEffect(() => {
    if (!loadingMore || loadedImages.length <= prevLoadedCountRef.current) {
      prevLoadedCountRef.current = loadedImages.length;
      return undefined;
    }

    const elapsed = Date.now() - loadingStartedAtRef.current;
    const delay = Math.max(0, LOADING_MORE_MIN_MS - elapsed);
    const timer = setTimeout(() => {
      setLoadingMore(false);
      loadMoreLockRef.current = false;
      prevLoadedCountRef.current = loadedImages.length;
    }, delay);

    return () => clearTimeout(timer);
  }, [loadedImages.length, loadingMore]);

  // Pull-to-refresh reshuffles the packaged category and rebuilds the first page.
  //
  // Pagination is reset to page one and `allImages` is replaced wholesale rather than
  // appended to, so a refresh cannot produce duplicates. The category itself is never
  // touched, so the user's selection is preserved. Ordering comes from the service layer,
  // so a refreshed list is ordered identically to a cold load.
  const refresh = useCallback(async () => {
    if (refreshLockRef.current) {
      debugLog('useCategoryImages', 'Refresh already in flight — ignoring');
      return;
    }

    refreshLockRef.current = true;
    setRefreshing(true);

    try {
      const images =
        selectedCategory === 'All'
          ? await fetchAllCategoryImages()
          : await fetchCategoryImages(selectedCategory);

      debugLog('useCategoryImages', `Refreshed "${selectedCategory}"`, {
        count: images.length,
      });

      hasReceivedImagesRef.current = images.length > 0;
      pageNumRef.current = 1;
      didPrefetchRef.current = false;
      prefetchedCountRef.current = 0;
      loadMoreLockRef.current = false;
      setLoadingMore(false);
      setPageNum(1);
      setAllImages(images);
      applyPagination(images, 1);
      setHasError(false);
    } catch (error) {
      debugError('useCategoryImages', `Refresh failed for "${selectedCategory}"`, error);
      // Keep whatever is already on screen; only surface an error if there is nothing.
      if (!hasReceivedImagesRef.current) {
        setHasError(true);
      }
    } finally {
      setRefreshing(false);
      refreshLockRef.current = false;
    }
  }, [applyPagination, selectedCategory]);

  const loadMore = useCallback(() => {
    if (
      loadMoreLockRef.current ||
      loadingMore ||
      loadingComplete ||
      loadedImages.length >= allImages.length
    ) {
      return;
    }

    debugLog('useCategoryImages', `Loading more for "${selectedCategory}"`, {
      currentPage: pageNumRef.current,
      totalImages: allImages.length,
    });

    loadMoreLockRef.current = true;
    loadingStartedAtRef.current = Date.now();
    setLoadingMore(true);
    setPageNum(prev => {
      const next = prev + 1;
      pageNumRef.current = next;
      return next;
    });
  }, [
    allImages.length,
    loadedImages.length,
    loadingComplete,
    loadingMore,
    selectedCategory,
  ]);

  useEffect(() => {
    if (
      isInitialLoading ||
      loadingComplete ||
      didPrefetchRef.current ||
      allImages.length <= Config.IMAGE_INITIAL_BATCH_SIZE
    ) {
      return undefined;
    }

    didPrefetchRef.current = true;
    const timer = setTimeout(() => {
      if (!loadMoreLockRef.current && !loadingComplete) {
        loadMore();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [
    allImages.length,
    isInitialLoading,
    loadMore,
    loadingComplete,
  ]);

  useEffect(() => {
    if (loadedImages.length === 0) {
      return;
    }

    const startIndex = Math.max(0, prefetchedCountRef.current - PREFETCH_AHEAD_COUNT);
    const nextBatch = loadedImages.slice(startIndex);

    const thumbnailUrls = nextBatch
      .map(imageRef => getGalleryUrl(imageRef))
      .filter(Boolean);

    prefetchedCountRef.current = loadedImages.length;
    prefetchThumbnailImages(thumbnailUrls);
    preloadFastImages(
      thumbnailUrls,
      FAST_IMAGE_PRELOAD_LIMIT,
      CACHE_TIER.THUMBNAIL,
    );
  }, [loadedImages]);

  return {
    loadedImages,
    loadingMore,
    isInitialLoading,
    loadingComplete,
    loadMore,
    refreshing,
    refresh,
    hasError,
  };
};
