import EncryptedStorage from 'react-native-encrypted-storage';
import {Config} from '../../constants';
import {debugError} from '../../utils/debugLog';
import {getFavoriteKey} from '../../utils/imageRef';

const listeners = new Set();

// Last known records for this process. Screens mount their own useFavorites, and without
// this every mount repeats the storage read — long enough for a saved design to paint an
// empty heart before flipping to a filled one. Never populated from disk across launches,
// so the image refs it holds always point at the pack paths resolved this session.
let cachedRecords = null;

export const peekLocalFavorites = () => cachedRecords;

const normalizeRecord = value => {
  if (typeof value === 'string') {
    return {key: value, imageRef: value, categoryName: 'Featured'};
  }
  const imageRef = value?.imageRef || value;
  const key = value?.key || getFavoriteKey(imageRef);
  return key ? {key, imageRef, categoryName: value?.categoryName || 'Featured'} : null;
};

export const getLocalFavorites = async () => {
  try {
    const stored = await EncryptedStorage.getItem(Config.FAVORITES_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    cachedRecords = Array.isArray(parsed)
      ? parsed.map(normalizeRecord).filter(Boolean)
      : [];
    return cachedRecords;
  } catch (error) {
    debugError('Favorites', 'Failed to read local favourites', error);
    return [];
  }
};

export const setLocalFavorites = async records => {
  try {
    await EncryptedStorage.setItem(
      Config.FAVORITES_STORAGE_KEY,
      JSON.stringify(records),
    );
    cachedRecords = records;
    listeners.forEach(listener => listener(records));
  } catch (error) {
    debugError('Favorites', 'Failed to save local favourites', error);
    throw error;
  }
};

export const subscribeLocalFavorites = listener => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
