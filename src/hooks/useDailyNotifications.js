import {useEffect, useRef} from 'react';
import {AppState} from 'react-native';
import {initializeDailyNotifications} from '../services/notifications';

/**
 * Keeps the daily 6 PM reminder scheduled (random message per day).
 *
 * Mounted ONCE, at the app root. Runs on mount and on every return to the foreground, which
 * is what covers the two cases the schedule cannot cover by itself:
 *   - app restart: the rolling window is topped back up to a full 14 days,
 *   - long absence: a user who has not opened the app for over two weeks gets a fresh window.
 *
 * Android delivers via AlarmManager (and BOOT_COMPLETED after reboot). iOS delivers via
 * UNUserNotificationCenter, which persists the same 14 one-shot timestamps across
 * background, kill, and reboot. Both platforms ask for permission only on the first pass.
 *
 * Duplicate scheduling is impossible regardless of how often this runs: the scheduler derives
 * a deterministic id per calendar day and skips ids that already exist. The inFlight ref here
 * is only about not stacking overlapping async passes.
 */
const useDailyNotifications = () => {
  const inFlightRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const sync = async ({requestPermission}) => {
      if (inFlightRef.current) {
        return;
      }
      inFlightRef.current = true;
      try {
        // initializeDailyNotifications never throws — it reports internally and resolves
        // to false — so a failure here cannot surface as an unhandled rejection.
        await initializeDailyNotifications({requestPermission});
      } finally {
        if (!cancelled) {
          inFlightRef.current = false;
        }
      }
    };

    // Only the first pass may show the permission dialog. Later foreground passes read the
    // current setting instead, so a user who declined is never re-prompted on every return
    // to the app.
    sync({requestPermission: true});

    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        sync({requestPermission: false});
      }
    });

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);
};

export default useDailyNotifications;
