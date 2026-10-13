import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import {Linking, Platform} from 'react-native';
import RNFS from 'react-native-fs';
import i18n from 'i18next';
import {debugWarn} from '../../utils/debugLog';
import {navigateWhenReady} from '../../navigation/navigationRef';
import {
  hasNotificationPermission,
  requestNotificationPermission,
} from './notificationService';

export const DOWNLOAD_CHANNEL_ID = 'downloads';

const NOTIFICATION_ID_PREFIX = 'download-';
const PRESS_ACTION_ID = 'open-download';
// iOS reports a tap on the notification body under this reserved identifier instead of
// the press action we declared, so both have to be accepted.
const IOS_DEFAULT_PRESS_ACTION_ID = 'default';

const isViewableUri = uri =>
  typeof uri === 'string' && uri.startsWith('content://');

const handledIds = new Set();

export const ensureDownloadChannel = async () => {
  await notifee.createChannel({
    id: DOWNLOAD_CHANNEL_ID,
    name: i18n.t('notifications:downloadChannelName'),
    description: i18n.t('notifications:downloadChannelDescription'),
    importance: AndroidImportance.DEFAULT,
  });
};

const ensureNotificationPermission = async () => {
  if (await hasNotificationPermission()) {
    return true;
  }

  return Platform.OS === 'ios' ? requestNotificationPermission() : false;
};


export const notifyDownloadComplete = async ({mediaUri, localPath} = {}) => {
  try {
    if (!(await ensureNotificationPermission())) {
      return;
    }

    const tappableTarget =
      Platform.OS === 'ios' ? Boolean(localPath) : isViewableUri(mediaUri);

    if (Platform.OS === 'android') {
      await ensureDownloadChannel();
    }

    await notifee.displayNotification({
      id: `${NOTIFICATION_ID_PREFIX}${Date.now()}`,
      title: i18n.t('notifications:downloadCompleteTitle'),
      body: tappableTarget
        ? i18n.t('notifications:downloadCompleteBodyTappable')
        : i18n.t('notifications:downloadCompleteBody'),
      data: tappableTarget ? {mediaUri, localPath: localPath || ''} : {},
      android: {
        channelId: DOWNLOAD_CHANNEL_ID,
        smallIcon: 'ic_notification',
        color: '#D98E6E',
        largeIcon: mediaUri,
        timestamp: Date.now(),
        showTimestamp: true,
        autoCancel: true,
        pressAction: {id: PRESS_ACTION_ID, launchActivity: 'default'},
      },
      ios: {
        foregroundPresentationOptions: {alert: true, badge: false, sound: true},
      },
    });
  } catch (error) {
    debugWarn('Downloads', 'Failed to post download notification', error);
  }
};

export const openDownloadedMedia = async uri => {
  if (!isViewableUri(uri)) {
    return false;
  }
  try {
    await Linking.openURL(uri);
    return true;
  } catch (error) {
    debugWarn('Downloads', 'Failed to open saved image', error);
    return false;
  }
};

const openDownloadedImageInApp = async localPath => {
  if (!localPath) {
    return false;
  }

  try {
    if (!(await RNFS.exists(localPath))) {
      return false;
    }
  } catch (error) {
    debugWarn('Downloads', 'Failed to read saved image', error);
    return false;
  }

  navigateWhenReady('ViewImages', {image: `file://${localPath}`});
  return true;
};

export const handleDownloadNotificationEvent = async event => {
  if (event?.type !== EventType.PRESS) {
    return;
  }

  const pressActionId = event.detail?.pressAction?.id;
  if (
    pressActionId !== PRESS_ACTION_ID &&
    pressActionId !== IOS_DEFAULT_PRESS_ACTION_ID
  ) {
    return;
  }

  const notification = event.detail.notification;
  const id = notification?.id;
  if (!id?.startsWith(NOTIFICATION_ID_PREFIX)) {
    return;
  }
  if (handledIds.has(id)) {
    return;
  }
  handledIds.add(id);

  if (Platform.OS === 'ios') {
    await openDownloadedImageInApp(notification?.data?.localPath);
    return;
  }

  await openDownloadedMedia(notification?.data?.mediaUri);
};
