import {Platform} from 'react-native';
import Config from 'react-native-config';
import {TestIds} from 'react-native-google-mobile-ads';


export const isAdsEnabled =
  Platform.OS === 'android' || Platform.OS === 'ios';

export const getAppEnvironment = () =>
  Config.APP_ENV || (__DEV__ ? 'development' : 'production');

/**
 * True unless the native Android release build explicitly opts into production ads.
 * Defaults to test ads when configuration is missing (safe fallback).
 */
export const isDebugBuild = () => {
  if (Config.ADMOB_BUILD_TYPE === 'release' && Config.ADMOB_USE_TEST_ADS !== 'true') {
    return false;
  }
  return true;
};

/**
 * Debug → Google official test ad unit IDs (TestIds).
 * Release → production IDs from .env only.
 */
export const isUsingTestAds = () => isAdsEnabled && isDebugBuild();

export const getBannerAdUnitId = () => {
  if (!isAdsEnabled) {
    return null;
  }
  if (isUsingTestAds()) {
    return TestIds.ADAPTIVE_BANNER;
  }
  return Platform.OS === 'ios'
    ? Config.ADMOB_IOS_BANNER_ID || null
    : Config.ADMOB_BANNER_ID || null;
};

export const getInterstitialAdUnitId = () => {
  if (!isAdsEnabled) {
    return null;
  }
  if (isUsingTestAds()) {
    return TestIds.INTERSTITIAL;
  }
  return Platform.OS === 'ios'
    ? Config.ADMOB_IOS_INTERSTITIAL_ID || null
    : Config.ADMOB_INTERSTITIAL_ID || null;
};

export const getAdMobAppId = () => {
  if (!isAdsEnabled || isUsingTestAds()) {
    return null;
  }
  return Platform.OS === 'ios'
    ? Config.ADMOB_IOS_APP_ID || null
    : Config.ADMOB_APP_ID || null;
};
