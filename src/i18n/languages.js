export const LANGUAGE_OPTIONS = {
  EN: 'en',
  UR: 'ur',
  AR: 'ar',
};

export const LANGUAGE_PREFERENCE_KEY = 'app_language';

// English only for the nails launch. ur.json / ar.json still hold the old mehndi text,
// so they are switched off here. To bring a language back after it has been translated,
// add it to this array (and keep it in RTL_LANGUAGES below if it is right-to-left).
// A saved 'ur' / 'ar' preference or an Urdu/Arabic device falls back to English via
// normalizeLanguage and the RNLocalize best-match in i18n/index.js.
export const SUPPORTED_LANGUAGES = [LANGUAGE_OPTIONS.EN];

/**
 * The single source of truth for which languages lay out right-to-left.
 *
 * Everything that needs to know the app's direction derives it from here — the boot-time
 * reconciliation in index.js, LanguageContext's restart decision, and the RTL helpers in
 * utils/rtl.js. Adding a fourth language means adding it here and nowhere else.
 */
export const RTL_LANGUAGES = [LANGUAGE_OPTIONS.UR, LANGUAGE_OPTIONS.AR];

/**
 * Accepts a bare tag ('ur') or a regional one ('ur-PK'), because i18next hands back
 * whichever the device reported when the app falls through to RNLocalize's best match.
 */
export const toBaseLanguage = language =>
  String(language || '')
    .split('-')[0]
    .toLowerCase();

export const isRtlLanguage = language =>
  RTL_LANGUAGES.includes(toBaseLanguage(language));

export const normalizeLanguage = language => {
  const base = toBaseLanguage(language);
  return SUPPORTED_LANGUAGES.includes(base) ? base : LANGUAGE_OPTIONS.EN;
};
