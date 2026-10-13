import {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {prepareAndShareImage} from '../services/share/shareImageService';
import {debugError} from '../utils/debugLog';
import useToast from './useToast';

export const useImageShare = () => {
  const {t} = useTranslation('imageViewer');
  const toast = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const shareImage = useCallback(async imageUrl => {
    if (!imageUrl || isSharing) {
      return;
    }

    try {
      setIsSharing(true);
      await prepareAndShareImage(imageUrl);
    } catch (error) {
      if (error?.message !== 'User did not share') {
        debugError('Share', 'Share error', error);
        toast.show(t('imageViewer:shareErrorMessage'), {type: 'error'});
      }
    } finally {
      setIsSharing(false);
    }
  }, [isSharing, t, toast]);

  return {
    isSharing,
    shareImage,
  };
};
