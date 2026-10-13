import {useState, useCallback} from 'react';
import {Platform} from 'react-native';
import {useTranslation} from 'react-i18next';
import {downloadImage} from '../services/download/downloadService';
import {notifyDownloadComplete} from '../services/notifications/downloadNotificationService';
import {isDownloadPermissionError, openAppSettings} from '../utils/permissions';
import {debugError} from '../utils/debugLog';
import useConfirm from './useConfirm';
import useToast from './useToast';

// Encapsulates image download state and progress — keeps UI screens logic-free
export const useImageDownload = () => {
  const {t} = useTranslation(['imageViewer', 'common']);
  const toast = useToast();
  const confirm = useConfirm();
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  const startDownload = useCallback(
    async (imageUrl, onSuccess) => {
      try {
        setDownloading(true);
        setDownloadComplete(false);
        setDownloadProgress(0);

        const saved = await downloadImage(imageUrl, setDownloadProgress);

        notifyDownloadComplete(saved);

        toast.show(
          saved.savedToGallery
            ? t('imageViewer:downloadSuccessMessageGallery')
            : t('imageViewer:downloadSuccessMessageFile'),
          {type: 'success'},
        );
        setDownloadComplete(true);
        onSuccess?.();
      } catch (error) {
        debugError('Download', 'Download error', error);

        if (isDownloadPermissionError(error)) {
          // Actionable, unlike the old acknowledge-only alert: storage permission can
          // only be restored from system Settings, so offer to open it directly.
          confirm({
            title: t('imageViewer:permissionRequiredTitle'),
            message:
              Platform.OS === 'ios'
                ? t('imageViewer:permissionRequiredMessageIOS')
                : t('imageViewer:permissionRequiredMessage'),
            confirmLabel: t('common:openSettings'),
            cancelLabel: t('common:notNow'),
            icon: 'lock-closed-outline',
            onConfirm: openAppSettings,
          });
          return;
        }

        toast.show(t('imageViewer:downloadErrorMessage'), {type: 'error'});
      } finally {
        setDownloading(false);
      }
    },
    [confirm, t, toast],
  );

  return {
    downloadProgress,
    downloading,
    downloadComplete,
    startDownload,
  };
};
