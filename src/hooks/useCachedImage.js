import {useEffect, useState} from 'react';
import {cacheImage, getCachedImageUri} from '../services/cache/imageCacheService';

// Use local cache when available; otherwise show remote immediately and cache in background.
export const useCachedImage = remoteUrl => {
  const normalizedUrl = remoteUrl?.trim() || '';
  const [displayUri, setDisplayUri] = useState(normalizedUrl);

  useEffect(() => {
    if (!normalizedUrl) {
      setDisplayUri('');
      return undefined;
    }

    let cancelled = false;

    const resolveDisplayUri = async () => {
      const cachedUri = await getCachedImageUri(normalizedUrl);
      if (cancelled) {
        return;
      }

      if (cachedUri) {
        setDisplayUri(cachedUri);
        return;
      }

      setDisplayUri(normalizedUrl);
      cacheImage(normalizedUrl).catch(() => {});
    };

    resolveDisplayUri();

    return () => {
      cancelled = true;
    };
  }, [normalizedUrl]);

  return {
    displayUri: normalizedUrl ? displayUri : null,
    isReady: Boolean(normalizedUrl),
  };
};
