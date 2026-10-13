import {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {getCategories} from '../services/catalog/catalogService';
import {
  buildLocalizedFilterChips,
  localizeCategories,
} from '../utils/categoryLocalization';

/**
 * The category list for the Home grid, loaded from the local catalog pack.
 *
 * Display names/descriptions follow the active language. English `name` stays the stable
 * id used by navigation and the packaged catalog.
 */
const useCategoryCatalog = () => {
  const {i18n} = useTranslation();
  const [rawCategories, setRawCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const local = await getCategories();
      setRawCategories(
        local.map(category => ({
          ...category,
          thumbnail: {uri: category.imageUrl},
        })),
      );
      setHasError(false);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(
    () => localizeCategories(rawCategories, i18n.language),
    [i18n.language, rawCategories],
  );

  const filterChips = useMemo(
    () => buildLocalizedFilterChips(rawCategories, i18n.language),
    [i18n.language, rawCategories],
  );

  return {categories, filterChips, isLoading, hasError, refresh: load};
};

export default useCategoryCatalog;
