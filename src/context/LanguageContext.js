import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {I18nManager} from 'react-native';
import RNRestart from 'react-native-restart';
import i18n from '../i18n';
import {
  LANGUAGE_OPTIONS,
  isRtlLanguage,
  normalizeLanguage,
} from '../i18n/languages';
import {
  clearDirectionRestartMark,
  loadDirectionRestartMark,
  loadStoredLanguage,
  markDirectionRestart,
  saveStoredLanguage,
} from '../i18n/languageStorage';
import {debugError, debugLog} from '../utils/debugLog';

const LanguageContext = createContext(null);

/**
 * Restart strategies understood by the patched native module.
 *
 * SOFT recreates the React instance in place — no process death, so no cold start. That is
 * enough for a direction change because nothing caches the flag across a reload: a new JS
 * context re-reads I18nManager's constants, and the Fabric surface re-reads I18nUtil when
 * the reloaded tree is mounted and measured.
 *
 * HARD kills and relaunches the process. It is reserved for the reconciliation in hydrate,
 * which by definition runs because a previous attempt did NOT take — retrying that with the
 * same soft reload would just fail the same way.
 */
const RESTART_STRATEGY = {
  SOFT: 'language-change',
  // Must match RestartModule.HARD_RESTART_REASON exactly.
  HARD: 'hard-restart',
};

/**
 * Flips the native layout direction and reloads.
 *
 * A reload of some kind is unavoidable. React Native reads I18nManager's native constants
 * once per JS context (see Libraries/ReactNative/I18nManager.js — `const i18nConstants =
 * getI18nManagerConstants()` runs at import), so every style, every Yoga layout pass and
 * every Text alignment in the RUNNING bundle is already resolved against the old direction.
 * Only a new JS context can re-read it.
 *
 * The two frames are NOT padding to make the switch feel considered — they are the minimum
 * needed for the restart sheet to be on screen before the instance is torn down. One frame
 * commits the render that mounts it, the second lets the UI thread actually draw it; firing
 * on the same tick would tear down mid-commit and flash the half-flipped screen the sheet
 * exists to hide.
 *
 * Nothing here waits on persistence. The native module commits the layout-direction
 * preference synchronously before it acts (see patches/react-native-restart+0.0.28.patch),
 * so correctness no longer depends on a sleep outlasting a background disk write.
 */
const applyDirectionAndRestart = (shouldBeRtl, strategy = RESTART_STRATEGY.SOFT) => {
  I18nManager.forceRTL(shouldBeRtl);
  debugLog(
    'i18n',
    `Reloading (${strategy}) to apply ${shouldBeRtl ? 'RTL' : 'LTR'} layout`,
  );
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        RNRestart.restart(strategy);
      } catch (error) {
        // Nothing sensible is left to do — the preference is already written, so the next
        // launch picks the direction up regardless of how the app is closed.
        debugError('i18n', 'Failed to restart for direction change', error);
      }
    });
  });
};

export const LanguageProvider = ({children}) => {
  const [language, setLanguageState] = useState(() =>
    normalizeLanguage(i18n.language),
  );
  const [isReady, setIsReady] = useState(false);
  // True from the moment a direction-changing switch is committed until the process
  // actually goes away, so the UI can show that a restart is under way instead of
  // rendering a half-flipped frame.
  const [isRestarting, setIsRestarting] = useState(false);

  useEffect(() => {
    let alive = true;

    const hydrate = async () => {
      const stored = await loadStoredLanguage();
      const shouldBeRtl = isRtlLanguage(stored);

      // The stored language and the native direction can disagree after a fresh install
      // that restores a backed-up preference, after an upgrade from the build that pinned
      // the app to LTR, or if a soft reload did not manage to apply the flip.
      //
      // This is also the automatic fallback for the fast path: reaching here at all means
      // the previous attempt left the two out of step, so the retry below asks for a HARD
      // restart rather than repeating a soft reload that has already been shown not to work.
      if (shouldBeRtl !== I18nManager.isRTL) {
        const alreadyTried = await loadDirectionRestartMark();

        // Restarting to fix a mismatch that survives the restart would loop forever, so
        // one attempt per language is all this gets. If it did not take, the app carries
        // on in the direction it actually has — text still translates — rather than
        // becoming unlaunchable.
        if (alreadyTried === stored) {
          debugError(
            'i18n',
            `Direction restart for "${stored}" did not take; continuing in ${
              I18nManager.isRTL ? 'RTL' : 'LTR'
            }`,
          );
          await clearDirectionRestartMark();
        } else {
          await markDirectionRestart(stored);
          if (alive) {
            setIsRestarting(true);
          }
          applyDirectionAndRestart(shouldBeRtl, RESTART_STRATEGY.HARD);
          return;
        }
      } else {
        await clearDirectionRestartMark();
      }

      await i18n.changeLanguage(stored);
      if (alive) {
        setLanguageState(stored);
        setIsReady(true);
      }
    };

    hydrate();

    return () => {
      alive = false;
    };
  }, []);

  const setLanguage = useCallback(
    async nextLanguage => {
      const normalized = normalizeLanguage(nextLanguage);
      if (normalized === language) {
        return;
      }

      // Only a change of direction needs the restart. Urdu to Arabic (or back) keeps the
      // app in RTL, so those switch instantly, the same way English always has.
      const needsRestart = isRtlLanguage(normalized) !== I18nManager.isRTL;

      // The sheet goes up first, before anything is awaited. Everything below this line
      // takes time the user would otherwise spend looking at the old, unchanged screen.
      if (needsRestart) {
        setIsRestarting(true);
      }

      // Persisted before the relaunch, so the choice survives however the switch ends.
      // This is the ONLY write on this path: the boot-loop guard is deliberately not
      // written here, because the restart-mark exists to stop the reconciliation in
      // hydrate() from looping, and hydrate writes it itself when it acts. Writing it here
      // too put a second EncryptedStorage round-trip — which is real crypto work on
      // Android — between the user's tap and the relaunch, and bought nothing: a
      // user-initiated switch that fails to take is caught by hydrate on the next launch,
      // which then marks and retries exactly once.
      await saveStoredLanguage(normalized);

      if (needsRestart) {
        applyDirectionAndRestart(isRtlLanguage(normalized));
        return;
      }

      await i18n.changeLanguage(normalized);
      setLanguageState(normalized);
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      isReady,
      isRestarting,
      // The direction the app is actually laid out in right now — not the one the newly
      // picked language implies. Between committing a switch and the process dying those
      // two differ, and styling against the language would tear the layout apart for that
      // window.
      isRtl: I18nManager.isRTL,
      setLanguage,
      options: LANGUAGE_OPTIONS,
    }),
    [isReady, isRestarting, language, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
