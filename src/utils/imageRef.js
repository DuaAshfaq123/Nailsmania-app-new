const FULL_URL_FIELDS = [
  'fullUrl',
  'fullURL',
  'originalUrl',
  'originUrl',
  'url',
  'uri',
  'imageUrl',
  'imageURL',
  'downloadURL',
  'src',
];

const THUMBNAIL_URL_FIELDS = [
  'thumbnailUrl',
  'thumbnailURL',
  'thumbUrl',
  'thumb',
  'previewUrl',
  'preview',
];

const pickString = (source, fields) => {
  for (const field of fields) {
    const value = source[field];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
};

const pickPositiveNumber = value =>
  typeof value === 'number' && value > 0 ? value : undefined;

// Fields an entry may carry to record when it was added. Catalogue entries are plain URL
// strings today, so this is almost always absent — it exists so that entries which DO
// carry a timestamp are ordered by it, and so future entries need no code change.
const CREATED_AT_FIELDS = [
  'createdAt',
  'addedAt',
  'uploadedAt',
  'timestamp',
  'date',
];

// Normalises timestamp objects, Dates, epoch numbers, or ISO strings to milliseconds.
// Returns undefined for anything unusable, which the sort treats as "no timestamp".
const pickCreatedAtMs = source => {
  for (const field of CREATED_AT_FIELDS) {
    const value = source[field];
    if (value == null) {
      continue;
    }
    if (typeof value?.toMillis === 'function') {
      return value.toMillis();
    }
    if (typeof value?.seconds === 'number') {
      return value.seconds * 1000;
    }
    if (value instanceof Date) {
      return value.getTime();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Date.parse(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
};

/**
 * Normalizes catalog entries into a gallery/viewer image reference.
 * Plain strings are treated as both thumbnail and full-resolution URLs.
 */
export const parseImageRef = entry => {
  if (typeof entry === 'string') {
    const fullUrl = entry.trim();
    if (!fullUrl) {
      return null;
    }

    return {
      fullUrl,
      thumbnailUrl: fullUrl,
    };
  }

  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const fullUrl = pickString(entry, FULL_URL_FIELDS);
  if (!fullUrl) {
    return null;
  }

  const thumbnailUrl = pickString(entry, THUMBNAIL_URL_FIELDS) || fullUrl;

  return {
    fullUrl,
    thumbnailUrl,
    width: pickPositiveNumber(entry.width),
    height: pickPositiveNumber(entry.height),
    createdAtMs: pickCreatedAtMs(entry),
    designId: entry.designId || entry.id,
    fullPath: entry.fullPath,
    thumbPath: entry.thumbPath,
    categoryName: entry.categoryName || entry.categoryId,
  };
};

export const coerceImageRef = input => {
  if (!input) {
    return null;
  }

  if (typeof input === 'string') {
    return parseImageRef(input);
  }

  if (input.imageRef) {
    return coerceImageRef(input.imageRef);
  }

  if (input.image) {
    return coerceImageRef(input.image);
  }

  return parseImageRef(input);
};

export const getGalleryUrl = ref => {
  const imageRef = coerceImageRef(ref);
  return imageRef?.thumbnailUrl || imageRef?.fullUrl || '';
};

export const getViewerFullUrl = ref => {
  const imageRef = coerceImageRef(ref);
  return imageRef?.fullUrl || '';
};

/** Gallery grid: thumbnail only — never full-resolution. */
export const getProgressiveGallerySources = ref => {
  const imageRef = coerceImageRef(ref);
  if (!imageRef) {
    return null;
  }

  const thumbnailUrl = imageRef.thumbnailUrl || imageRef.fullUrl;
  if (!thumbnailUrl) {
    return null;
  }

  return {
    cacheKey: thumbnailUrl,
    thumbnailUrl,
  };
};

/** Image viewer: thumbnail first, then full-resolution upgrade. */
export const getViewerProgressiveSources = ref => {
  const imageRef = coerceImageRef(ref);
  if (!imageRef?.fullUrl) {
    return null;
  }

  const {thumbnailUrl, fullUrl} = imageRef;
  const previewUrl =
    thumbnailUrl && thumbnailUrl !== fullUrl ? thumbnailUrl : undefined;

  return {
    cacheKey: fullUrl,
    primaryUrl: fullUrl,
    previewUrl,
  };
};

export const getFavoriteKey = ref => {
  const imageRef = coerceImageRef(ref);
  return imageRef?.designId || imageRef?.fullPath || imageRef?.fullUrl || '';
};

export const imageRefKey = ref => getFavoriteKey(ref) || '';

export const resolveRouteImageRef = routeParams => {
  if (!routeParams) {
    return null;
  }

  if (routeParams.imageRef) {
    return coerceImageRef(routeParams.imageRef);
  }

  if (routeParams.image) {
    return coerceImageRef(routeParams.image);
  }

  return null;
};

/**
 * Normalises the viewer's swipeable playlist out of its route params.
 *
 * The `images` param is optional by design. A caller that only knows about a single image
 * — or a deep link, or any future entry point — still gets a valid one-item list here, so
 * the pager degrades to exactly the pre-slider behaviour instead of rendering nothing.
 *
 * Entries are de-duplicated by full URL: the category gallery can legitimately surface the
 * same file twice across pages, and a duplicate would otherwise appear as two identical
 * pages and break index<->image alignment after a swipe.
 */
export const resolveRouteImageList = routeParams => {
  const single = resolveRouteImageRef(routeParams);
  const raw = Array.isArray(routeParams?.images) ? routeParams.images : [];

  const refs = raw.map(coerceImageRef).filter(ref => ref?.fullUrl);

  if (refs.length === 0) {
    return single?.fullUrl ? [single] : [];
  }

  const seen = new Set();
  const deduped = [];
  refs.forEach(ref => {
    if (seen.has(ref.fullUrl)) {
      return;
    }
    seen.add(ref.fullUrl);
    deduped.push(ref);
  });

  return deduped;
};

/**
 * Where the tapped image sits in the resolved playlist.
 *
 * The caller's own index is only a hint: it was computed against the pre-dedup array, and
 * the list can also have changed between navigate() and mount (pagination, a like being
 * removed). Matching by full URL first keeps the viewer opening on the image the user
 * actually tapped; the numeric hint is the fallback, clamped into range.
 */
export const resolveRouteImageIndex = (routeParams, images) => {
  if (!images?.length) {
    return 0;
  }

  const targetUrl = getViewerFullUrl(resolveRouteImageRef(routeParams));
  if (targetUrl) {
    const matched = images.findIndex(ref => ref.fullUrl === targetUrl);
    if (matched >= 0) {
      return matched;
    }
  }

  const hinted = routeParams?.initialIndex;
  if (typeof hinted === 'number' && Number.isFinite(hinted)) {
    return Math.min(Math.max(Math.trunc(hinted), 0), images.length - 1);
  }

  return 0;
};
