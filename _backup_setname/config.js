import {Platform} from 'react-native';
import RNConfig from 'react-native-config';

// Contact details come from .env (SUPPORT_EMAIL / SUPPORT_PHONE). They are baked in at
// BUILD time, so changing .env requires a rebuild. Fallbacks are intentionally empty:
// set your own values in .env instead of hardcoding personal details in the repo.
const FALLBACK_SUPPORT_EMAIL = '';
const FALLBACK_SUPPORT_PHONE = '';

// TODO: change if you pick a different application id.
const APP_ID = 'com.nails724xone';
const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${APP_ID}`;
// TODO: fill in once the nails app exists on the App Store. Until then iOS shares the Play link.
const APP_STORE_URL = '';

// App-wide configuration values — no secrets, only non-sensitive config
export const Config = {
  FAVORITES_STORAGE_KEY: 'favorites',
  IMAGE_BATCH_SIZE: 30,
  IMAGE_INITIAL_BATCH_SIZE: 16,
  PLAY_STORE_URL,
  PLAY_STORE_MARKET_URL: `market://details?id=${APP_ID}`,
  APP_STORE_URL,
  SHARE_MESSAGE: `Check out Nails App! It has amazing nail art designs. ${
    Platform.OS === 'ios' && APP_STORE_URL ? APP_STORE_URL : PLAY_STORE_URL
  }`,
  CONTACT_EMAIL: (RNConfig.SUPPORT_EMAIL || FALLBACK_SUPPORT_EMAIL).trim(),
  CONTACT_PHONE: (RNConfig.SUPPORT_PHONE || FALLBACK_SUPPORT_PHONE).trim(),
};
