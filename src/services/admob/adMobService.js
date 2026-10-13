import {Platform} from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';
import {isAdsEnabled, isUsingTestAds, getBannerAdUnitId, getInterstitialAdUnitId, getAdMobAppId} from '../../config/admobConfig';
import {debugLog, debugWarn} from '../../utils/debugLog';
import {productionLog, productionWarn, productionError} from '../../utils/productionLog';
import InterstitialAdManager from './interstitialAdManager';

let isInitialized = false;
let initPromise = null;
let initError = null;

export const AdMobService = {
  initialize: async () => {
    // Check if ads are enabled
    if (!isAdsEnabled) {
      debugLog('AdMobService', 'Ads disabled for this platform');
      productionLog('AdMobService', 'Ads disabled for this platform');
      return;
    }

    // Already initialized
    if (isInitialized) {
      debugLog('AdMobService', 'Already initialized');
      return;
    }

    // Initialization in progress
    if (initPromise) {
      return initPromise;
    }

    initPromise = (async () => {
      try {
        const testMode = isUsingTestAds();
        const appId = getAdMobAppId();
        const bannerUnitId = getBannerAdUnitId();
        const interstitialUnitId = getInterstitialAdUnitId();
        
        // Log configuration BEFORE initialization
        productionLog('AdMobService', 'Starting initialization', {
          platform: Platform.OS,
          testMode,
          appIdSet: !!appId,
          bannerUnitIdSet: !!bannerUnitId,
          interstitialUnitIdSet: !!interstitialUnitId,
        });

        // Validate configuration
        if (!bannerUnitId) {
          productionWarn('AdMobService', 'Missing banner ad unit ID - ads may not load');
        }
        if (!interstitialUnitId) {
          productionWarn('AdMobService', 'Missing interstitial ad unit ID - interstitials may not load');
        }

        // Initialize Google Mobile Ads SDK
        const result = await mobileAds().initialize();
        
        productionLog('AdMobService', 'Google Mobile Ads SDK initialized', {
          mode: testMode ? 'test' : 'production',
          initResult: !!result,
        });

        debugLog('AdMobService', 'Google Mobile Ads SDK initialized', {
          mode: testMode ? 'test' : 'production',
        });

        // Initialize interstitial ads
        InterstitialAdManager.initialize();
        
        isInitialized = true;
        productionLog('AdMobService', 'AdMobService fully initialized');
        
      } catch (error) {
        initError = error;

        // Log error in both systems
        productionError('AdMobService', 'Failed to initialize Google Mobile Ads SDK', error);
        debugWarn('AdMobService', 'Failed to initialize Google Mobile Ads SDK', error);

        // Do NOT initialize the interstitial here — the native SDK is not ready,
        // so InterstitialAd.createForAdRequest()/load() would throw
        // ("Exception in native call from JS"). Leave it uninitialized; the next
        // successful AdMobService.initialize() will set it up.
      } finally {
        initPromise = null;
      }
    })();

    return initPromise;
  },

  isInitialized: () => isInitialized,

  isSupported: () => isAdsEnabled,

  getInitError: () => initError,

  /**
   * Diagnostic method to verify ad configuration
   * Returns object with all ad settings for debugging
   */
  getConfiguration: () => {
    return {
      isSupported: isAdsEnabled,
      isInitialized,
      platform: Platform.OS,
      testMode: isUsingTestAds(),
      appId: getAdMobAppId() || 'NOT_SET',
      bannerUnitId: getBannerAdUnitId() || 'NOT_SET',
      interstitialUnitId: getInterstitialAdUnitId() || 'NOT_SET',
      initError: initError ? initError.message : 'NO_ERROR',
    };
  },
};

export {InterstitialAdManager};
