import EncryptedStorage from 'react-native-encrypted-storage';
import {
  LANGUAGE_PREFERENCE_KEY,
  LANGUAGE_OPTIONS,
  normalizeLanguage,
} from './languages';
import {debugError, debugLog} from '../utils/debugLog';

// Records that a restart has already been attempted to bring the native layout direction
// in line with a given language. Read on the next launch so a direction flip that refuses
// to stick degrades into "wrong direction, right text" instead of a restart loop.
const DIRECTION_RESTART_MARK_KEY = 'app_language_direction_restart';

export const loadStoredLanguage = async () => {
  try {
    const stored = await EncryptedStorage.getItem(LANGUAGE_PREFERENCE_KEY);
    return normalizeLanguage(stored || LANGUAGE_OPTIONS.EN);
  } catch (error) {
    debugError('i18n', 'Failed to load language preference', error);
    return LANGUAGE_OPTIONS.EN;
  }
};

export const saveStoredLanguage = async language => {
  const next = normalizeLanguage(language);
  try {
    await EncryptedStorage.setItem(LANGUAGE_PREFERENCE_KEY, next);
  } catch (error) {
    debugError('i18n', 'Failed to save language preference', error);
  }
  return next;
};

export const loadDirectionRestartMark = async () => {
  try {
    return await EncryptedStorage.getItem(DIRECTION_RESTART_MARK_KEY);
  } catch (error) {
    debugError('i18n', 'Failed to read direction restart mark', error);
    return null;
  }
};

export const markDirectionRestart = async language => {
  try {
    await EncryptedStorage.setItem(DIRECTION_RESTART_MARK_KEY, language);
  } catch (error) {
    debugError('i18n', 'Failed to write direction restart mark', error);
  }
};

export const clearDirectionRestartMark = async () => {
  try {
    await EncryptedStorage.removeItem(DIRECTION_RESTART_MARK_KEY);
  } catch {
    // Absent key throws on some platforms; nothing depends on the removal succeeding.
    debugLog('i18n', 'Direction restart mark was already clear');
  }
};
