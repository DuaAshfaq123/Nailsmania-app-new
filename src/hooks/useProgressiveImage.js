import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  CACHE_TIER,
  cacheImage,
  peekCachedImageUri,
} from '../services/cache/imageCacheService';
import {
  isImageKnownLoaded,
  markImageLoaded,
} from '../services/cache/imageLoadRegistry';

/**
 * Resolve the best *synchronously known* uri so FastImage can mount on the very
 * first render — no async filesystem work before first paint. Prefer an in-memory
 * RNFS `file://` hit when present; otherwise hand FastImage the network url and
 * let its native disk cache (Glide / SDWebImage) own gallery decoding.
 */
const resolveInitialUri = (url, tier) => {
  if (!url?.trim()) {
    return null;
  }

  const normalized = url.trim();
  return peekCachedImageUri(normalized, tier) || normalized;
};

/**
 * @param {'gallery' | 'viewer'} mode
 *   gallery — thumbnail only; FastImage cache only (no competing RNFS downloads)
 *   viewer  — optional preview → full upgrade; RNFS warmed for download/share
 */
export const useProgressiveImage = ({
  mode = 'gallery',
  cacheKey,
  primaryUrl,
  previewUrl,
}) => {
  const isViewer = mode === 'viewer';
  const normalizedPrimary = primaryUrl?.trim() || '';
  const normalizedPreview = previewUrl?.trim() || '';

  const hasDistinctPreview =
    isViewer &&
    Boolean(normalizedPreview) &&
    normalizedPreview !== normalizedPrimary;

  const primaryTier = isViewer ? CACHE_TIER.FULL : CACHE_TIER.THUMBNAIL;
  const previewTier = CACHE_TIER.THUMBNAIL;

  // Resolved synchronously — the source is available on the first render, so
  // FastImage mounts immediately and starts decoding without an async gate.
  const resolvedPrimaryUri = useMemo(
    () => resolveInitialUri(normalizedPrimary, primaryTier),
    [normalizedPrimary, primaryTier],
  );
  const resolvedPreviewUri = useMemo(
    () =>
      hasDistinctPreview
        ? resolveInitialUri(normalizedPreview, previewTier)
        : null,
    [hasDistinctPreview, normalizedPreview, previewTier],
  );

  // A gallery thumbnail we have already painted once should not flash a skeleton
  // again when its cell is recycled during scrolling.
  const initiallyReady = !isViewer && isImageKnownLoaded(cacheKey);

  const loadIdRef = useRef(0);
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [isPrimaryReady, setIsPrimaryReady] = useState(initiallyReady);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadId = loadIdRef.current + 1;
    loadIdRef.current = loadId;

    setIsPreviewReady(false);
    setIsPrimaryReady(!isViewer && isImageKnownLoaded(cacheKey));
    setHasError(!normalizedPrimary);

    if (!normalizedPrimary) {
      return () => {
        loadIdRef.current += 1;
      };
    }

    // Gallery mode: do NOT also RNFS-download every thumbnail. That competed with
    // FastImage for bandwidth and was a major scroll-jank source. Viewer / download
    // / share paths still warm the RNFS full-tier cache when needed.
    if (isViewer) {
      cacheImage(normalizedPrimary, primaryTier).catch(() => {});
      if (hasDistinctPreview) {
        cacheImage(normalizedPreview, previewTier).catch(() => {});
      }
    }

    return () => {
      loadIdRef.current += 1;
    };
  }, [
    cacheKey,
    hasDistinctPreview,
    isViewer,
    normalizedPreview,
    normalizedPrimary,
    previewTier,
    primaryTier,
  ]);

  const handlePreviewLoadEnd = useCallback(() => {
    setIsPreviewReady(true);
  }, []);

  const handlePrimaryLoadEnd = useCallback(() => {
    if (cacheKey) {
      markImageLoaded(cacheKey);
    }
    setIsPrimaryReady(true);
  }, [cacheKey]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsPrimaryReady(true);
    setIsPreviewReady(true);
  }, []);

  const hasVisibleContent = isViewer
    ? isPrimaryReady || (hasDistinctPreview && isPreviewReady)
    : isPrimaryReady;

  const showSkeleton = !hasError && !hasVisibleContent;
  const showPreview =
    hasDistinctPreview &&
    Boolean(resolvedPreviewUri) &&
    isPreviewReady &&
    !isPrimaryReady;
  const showPrimaryUpgrade = isViewer && hasDistinctPreview && isPrimaryReady;

  return {
    resolvedPrimaryUri,
    resolvedPreviewUri,
    isPrimaryReady,
    isPreviewReady,
    hasVisibleContent,
    hasError,
    showSkeleton,
    showPreview,
    showPrimaryUpgrade,
    handlePreviewLoadEnd,
    handlePrimaryLoadEnd,
    handleError,
  };
};
