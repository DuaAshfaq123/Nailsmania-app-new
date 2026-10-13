import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

import en from './locales/en.json';
import ur from './locales/ur.json';
import ar from './locales/ar.json';

import {LANGUAGE_OPTIONS, SUPPORTED_LANGUAGES} from './languages';

/**
 * One JSON file per language (`en.json` / `ur.json` / `ar.json`).
 * Top-level keys are namespaces (common, home, settings, …) so existing
 * `t('home:key')` / `useTranslation('home')` call sites keep working.
 */
const namespaces = Object.keys(en);

const resources = {
  [LANGUAGE_OPTIONS.EN]: en,
  [LANGUAGE_OPTIONS.UR]: ur,
  [LANGUAGE_OPTIONS.AR]: ar,
};

const deviceLanguageTag =
  RNLocalize.findBestLanguageTag(SUPPORTED_LANGUAGES)?.languageTag ??
  LANGUAGE_OPTIONS.EN;

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguageTag,
  fallbackLng: LANGUAGE_OPTIONS.EN,
  ns: namespaces,
  defaultNS: 'common',
  interpolation: {escapeValue: false},
  compatibilityJSON: 'v4',
});

export default i18n;
