import notifee, {
  AlarmType,
  AndroidImportance,
  AuthorizationStatus,
  TriggerType,
} from '@notifee/react-native';
import {Platform} from 'react-native';
import i18n from 'i18next';
import {NOTIFICATION_MESSAGES} from '../../constants/notificationMessages';
import {debugLog, debugWarn} from '../../utils/debugLog';
import {productionLog, productionError} from '../../utils/productionLog';

export const DAILY_CHANNEL_ID = 'daily-inspiration';

/** Local hour the reminder fires, on a 24h clock. */
export const DAILY_NOTIFICATION_HOUR = 18;
export const DAILY_NOTIFICATION_MINUTE = 0;

/**
 * How many days ahead to keep scheduled.
 *
 * A single RepeatFrequency.DAILY trigger would be simpler, but it replays ONE fixed payload
 * forever — it cannot pick a new random message each day. So each day is its own one-shot
 * trigger and the app keeps a rolling window topped up on every foreground. Fourteen days
 * covers a typical stretch without opening the app; opening (or returning to foreground)
 * tops the window back up. Triggers are persisted by Notifee and fire via AlarmManager in
 * foreground, background, and killed states (and after reboot via BOOT_COMPLETED).
 */
export const SCHEDULE_WINDOW_DAYS = 14;

const TRIGGER_ID_PREFIX = 'daily-';

/** `daily-2026-08-10` — stable per calendar day so re-scheduling is idempotent. */
const buildTriggerId = date =>
  `${TRIGGER_ID_PREFIX}${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/**
 * Resolves one pool entry in the active app language.
 *
 * The English array remains the canonical list: it fixes how many messages there are and
 * what each INDEX means, and it is the fallback if a locale is missing an entry. The
 * displayed copy comes from the locale files, keyed by that index.
 *
 * `id` is the index, not the title. De-duplication has to compare something that is stable
 * across languages — comparing translated titles would silently stop matching the moment
 * the user switched language mid-window.
 */
const localizeMessage = index => {
  const fallback = NOTIFICATION_MESSAGES[index];
  return {
    id: index,
    title: i18n.t(`notifications:messages.${index}.title`, {
      defaultValue: fallback.title,
    }),
    body: i18n.t(`notifications:messages.${index}.body`, {
      defaultValue: fallback.body,
    }),
  };
};

/**
 * Picks a random engagement message from the pool, already localized.
 *
 * Chosen at schedule time (not at fire time) so the title/body are baked into the
 * AlarmManager trigger and still deliver when the JS process is not running. That baking
 * is also why the language is resolved here: the payload is fixed when it is scheduled, so
 * a notification scheduled today arrives in the language that was selected today. Changing
 * language rewrites the window on the next foreground, because scheduleDailyNotifications
 * runs then and any slot it has to create picks up the new language.
 */
export const pickRandomMessage = (excludeIds = []) => {
  const indexes = NOTIFICATION_MESSAGES.map((_, index) => index);
  const pool = indexes.filter(index => !excludeIds.includes(index));
  const source = pool.length > 0 ? pool : indexes;
  return localizeMessage(source[Math.floor(Math.random() * source.length)]);
};

/** The next `count` local 18:00 timestamps, starting today if 18:00 has not passed yet. */
const buildUpcomingSlots = (now, count) => {
  const slots = [];
  for (let offset = 0; slots.length < count; offset += 1) {
    const slot = new Date(now);
    slot.setDate(slot.getDate() + offset);
    slot.setHours(DAILY_NOTIFICATION_HOUR, DAILY_NOTIFICATION_MINUTE, 0, 0);
    if (slot.getTime() > now.getTime()) {
      slots.push(slot);
    }
  }
  return slots;
};

/**
 * Creates the notification channel. Idempotent in Notifee — calling it again with the same
 * id updates the channel rather than creating a duplicate — so it is safe on every start.
 *
 * Importance DEFAULT, not HIGH: this is a once-a-day gentle nudge, not something that has
 * earned the right to interrupt with a heads-up banner.
 */
export const ensureChannel = async () => {
  await notifee.createChannel({
    id: DAILY_CHANNEL_ID,
    name: i18n.t('notifications:channelName'),
    description: i18n.t('notifications:channelDescription'),
    importance: AndroidImportance.DEFAULT,
  });
};

/**
 * Requests POST_NOTIFICATIONS (Android 13+). Below API 33 this resolves as authorised
 * without showing anything. Returns whether notifications may be posted.
 */
export const requestNotificationPermission = async () => {
  try {
    const settings = await notifee.requestPermission();
    const granted =
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
    debugLog('Notifications', 'Permission result', {
      authorizationStatus: settings.authorizationStatus,
      granted,
    });
    return granted;
  } catch (error) {
    debugWarn('Notifications', 'Permission request failed', error);
    productionError('Notifications', 'Permission request failed', {
      errorMessage: error?.message,
    });
    return false;
  }
};

export const hasNotificationPermission = async () => {
  try {
    const settings = await notifee.getNotificationSettings();
    return (
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    debugWarn('Notifications', 'Failed to read notification settings', error);
    return false;
  }
};

/**
 * Brings the scheduled window in line with the next SCHEDULE_WINDOW_DAYS days.
 *
 * Idempotent by construction, which is what prevents duplicate schedules across app
 * restarts, backgrounding, and reboot:
 *   - the target set of ids is derived purely from today's date,
 *   - ids already scheduled are skipped rather than recreated (message stays as first picked),
 *   - any `daily-` trigger outside the window is cancelled.
 *
 * Android alarms are INEXACT (SET_AND_ALLOW_WHILE_IDLE): a daily reminder tolerates a few
 * minutes of Doze drift, and this avoids the SCHEDULE_EXACT_ALARM permission and the Play
 * Store declaration that comes with it. iOS uses UNCalendar-style timestamp triggers and
 * ignores AlarmManager; Apple still fires them with the device locked or the app killed.
 */
export const scheduleDailyNotifications = async () => {
  const now = new Date();
  const slots = buildUpcomingSlots(now, SCHEDULE_WINDOW_DAYS);
  const wantedIds = new Set(slots.map(buildTriggerId));

  const existingIds = await notifee.getTriggerNotificationIds();
  const existingDailyIds = existingIds.filter(id =>
    id.startsWith(TRIGGER_ID_PREFIX),
  );

  const staleIds = existingDailyIds.filter(id => !wantedIds.has(id));
  if (staleIds.length > 0) {
    await notifee.cancelTriggerNotifications(staleIds);
    debugLog('Notifications', 'Cancelled stale daily triggers', {staleIds});
  }

  const existingSet = new Set(existingDailyIds);
  const created = [];
  // Prefer unique messages within this scheduling pass so a fresh 14-day window does not
  // accidentally stack the same copy on neighbouring days. Tracked by pool index rather
  // than by title, which keeps working whatever language the titles are in.
  const usedIds = [];

  for (const slot of slots) {
    const id = buildTriggerId(slot);
    if (existingSet.has(id)) {
      continue;
    }

    const message = pickRandomMessage(usedIds);
    usedIds.push(message.id);

    await notifee.createTriggerNotification(
      {
        id,
        title: message.title,
        body: message.body,
        android: {
          channelId: DAILY_CHANNEL_ID,
          // A white-on-transparent silhouette. Android masks small icons to a single
          // colour, so the full-colour app logo would render as a solid white blob.
          smallIcon: 'ic_notification',
          color: '#D98E6E',
          pressAction: {id: 'default'},
        },
        ios: {
          sound: 'default',
          foregroundPresentationOptions: {
            alert: true,
            badge: false,
            sound: true,
          },
        },
      },
      Platform.OS === 'android'
        ? {
            type: TriggerType.TIMESTAMP,
            timestamp: slot.getTime(),
            alarmManager: {type: AlarmType.SET_AND_ALLOW_WHILE_IDLE},
          }
        : {
            type: TriggerType.TIMESTAMP,
            timestamp: slot.getTime(),
          },
    );
    created.push(id);
  }

  debugLog('Notifications', 'Daily schedule synced', {
    created,
    kept: existingDailyIds.filter(id => wantedIds.has(id)),
  });
  productionLog('Notifications', 'Daily schedule synced', {
    createdCount: created.length,
    cancelledCount: staleIds.length,
    windowDays: SCHEDULE_WINDOW_DAYS,
  });

  return {created, cancelled: staleIds};
};

/**
 * Full setup: channel, permission, schedule. Never throws — a notification failure must
 * not take the app down, so everything is contained and reported instead.
 */
export const initializeDailyNotifications = async ({
  requestPermission = true,
} = {}) => {
  try {
    if (Platform.OS === 'android') {
      await ensureChannel();
    }

    const granted = requestPermission
      ? await requestNotificationPermission()
      : await hasNotificationPermission();

    if (!granted) {
      // Not an error. The user is entitled to decline; the app simply schedules nothing
      // and tries again on a later foreground in case they change it in system settings.
      debugLog('Notifications', 'Permission not granted — skipping schedule');
      return false;
    }

    await scheduleDailyNotifications();
    return true;
  } catch (error) {
    debugWarn(
      'Notifications',
      'Failed to initialise daily notifications',
      error,
    );
    productionError(
      'Notifications',
      'Failed to initialise daily notifications',
      {
        errorMessage: error?.message,
      },
    );
    return false;
  }
};

/** Cancels every scheduled daily reminder. Exposed for a future "turn reminders off". */
export const cancelDailyNotifications = async () => {
  try {
    const existingIds = await notifee.getTriggerNotificationIds();
    const dailyIds = existingIds.filter(id => id.startsWith(TRIGGER_ID_PREFIX));
    if (dailyIds.length > 0) {
      await notifee.cancelTriggerNotifications(dailyIds);
    }
    debugLog('Notifications', 'Cancelled all daily triggers', {dailyIds});
  } catch (error) {
    debugWarn('Notifications', 'Failed to cancel daily notifications', error);
  }
};
