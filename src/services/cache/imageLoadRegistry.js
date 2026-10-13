const MAX_ENTRIES = 600;
const loadedKeys = new Map();

export const isImageKnownLoaded = cacheKey => {
  if (!cacheKey) {
    return false;
  }
  return loadedKeys.has(cacheKey);
};

export const markImageLoaded = cacheKey => {
  if (!cacheKey) {
    return;
  }

  if (loadedKeys.has(cacheKey)) {
    loadedKeys.delete(cacheKey);
  }

  loadedKeys.set(cacheKey, Date.now());

  if (loadedKeys.size > MAX_ENTRIES) {
    const oldestKey = loadedKeys.keys().next().value;
    loadedKeys.delete(oldestKey);
  }
};

export const clearImageLoadRegistry = () => {
  loadedKeys.clear();
};
