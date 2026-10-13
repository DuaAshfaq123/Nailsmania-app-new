import {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {debugError} from '../utils/debugLog';
import {getFavoriteKey} from '../utils/imageRef';
import {
  getLocalFavorites,
  peekLocalFavorites,
  setLocalFavorites,
  subscribeLocalFavorites,
} from '../services/favorites/favoritesService';
import {getDesignsByIds} from '../services/catalog/catalogService';
import useToast from './useToast';


export const useFavorites = () => {
  const {t} = useTranslation(['favorites', 'common']);
  const toast = useToast();
  const [records, setRecords] = useState(() => peekLocalFavorites() || []);
  const [loading, setLoading] = useState(() => peekLocalFavorites() === null);

  const applyRecords = useCallback(
    next => {
      setRecords(next);
    },
    [],
  );

  const loadFavorites = useCallback(async () => {
    try {
      const stored = await getLocalFavorites();
      const localDesigns = await getDesignsByIds(stored.map(record => record.key));
      const currentById = new Map(
        localDesigns.map(imageRef => [getFavoriteKey(imageRef), imageRef]),
      );
      applyRecords(
        stored.map(record => ({
          ...record,
          imageRef: currentById.get(record.key) || record.imageRef,
        })),
      );
    } finally {
      setLoading(false);
    }
  }, [applyRecords]);

  useEffect(() => {
    loadFavorites();
    return subscribeLocalFavorites(applyRecords);
  }, [applyRecords, loadFavorites]);

  const toggleFavorite = useCallback(
    async (imageRef, categoryName = 'Featured') => {
      const key = getFavoriteKey(imageRef);
      if (!key) {
        return false;
      }

      const previous = records;
      const wasLiked = previous.some(record => record.key === key);
      const optimistic = wasLiked
        ? previous.filter(record => record.key !== key)
        : [...previous, {key, imageRef, categoryName}];
      applyRecords(optimistic);
      try {
        await setLocalFavorites(optimistic);
        toast.show(
          t(wasLiked ? 'favorites:removedToast' : 'favorites:savedToast'),
          {type: wasLiked ? 'info' : 'success'},
        );
        return !wasLiked;
      } catch (error) {
        debugError('Favorites', 'Toggle failed — rolling back', error);
        applyRecords(previous);
        toast.show(t('common:somethingWentWrong'), {type: 'error'});
        return wasLiked;
      }
    },
    [records, applyRecords, t, toast],
  );

  const removeFavorite = useCallback(
    async imageRef => {
      const key = getFavoriteKey(imageRef);
      if (!key) {
        return;
      }
      const previous = records;
      const next = previous.filter(record => record.key !== key);
      applyRecords(next);
      try {
        await setLocalFavorites(next);
      } catch (error) {
        debugError('Favorites', 'Remove failed — rolling back', error);
        applyRecords(previous);
      }
    },
    [records, applyRecords],
  );

  const isFavorited = useCallback(
    imageRef => records.some(record => record.key === getFavoriteKey(imageRef)),
    [records],
  );

  return {
    favorites: records.map(record => record.key),
    favoriteImages: records.map(record => record.imageRef),
    loading,
    isGuest: false,
    loadFavorites,
    toggleFavorite,
    removeFavorite,
    isFavorited,
  };
};
