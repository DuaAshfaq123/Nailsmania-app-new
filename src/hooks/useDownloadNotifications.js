import {useEffect} from 'react';
import notifee, {EventType} from '@notifee/react-native';
import {handleDownloadNotificationEvent} from '../services/notifications/downloadNotificationService';

const useDownloadNotifications = () => {
  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(
      handleDownloadNotificationEvent,
    );
    notifee
      .getInitialNotification()
      .then(initial => {
        if (!initial) {
          return undefined;
        }
        return handleDownloadNotificationEvent({
          type: EventType.PRESS,
          detail: initial,
        });
      })
      .catch(() => {});
    return unsubscribe;
  }, []);
};

export default useDownloadNotifications;
