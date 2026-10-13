import {useCallback, useEffect, useState} from 'react';
import {fetchRandomCategoryImages} from '../services';
import {debugError} from '../utils/debugLog';

const useRandomDesigns = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setItems(await fetchRandomCategoryImages(10));
    } catch (error) {
      debugError('RandomDesigns', 'Failed to load local designs', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {items, isLoading, refresh};
};

export default useRandomDesigns;
