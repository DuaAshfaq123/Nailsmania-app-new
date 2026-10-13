import {AdEventType, InterstitialAd} from 'react-native-google-mobile-ads';
import {
  INTERSTITIAL_MIN_DWELL_MS,
  INTERSTITIAL_MIN_INTERVAL_MS,
  INTERSTITIAL_VIEWS_BEFORE_SHOW,
  SESSION_AD_MIN_SPACING_MS,
} from '../../constants/admob';
import {getInterstitialAdUnitId, isAdsEnabled} from '../../config/admobConfig';
import {debugLog, debugWarn} from '../../utils/debugLog';
import {productionLog, productionWarn, productionError} from '../../utils/productionLog';
import {IAPService} from '../iap/iapService';
import AdEngagementGate from './adEngagementGate';
import SessionAdGate from './sessionAdGate';

const ALLOWED_NATURAL_BREAKS = new Set(['post_download']);

class InterstitialAdManager {
  constructor() {
    this.interstitial = null;
    this.isLoaded = false;
    this.isShowing = false;
    this.lastShownAt = 0;
    this.qualifiedImageViewCount = 0;
    this.currentViewStartedAt = 0;
    this.unsubscribers = [];
    this.loadAttempts = 0;
    this.failureCount = 0;
  }

  initialize() {
    if (!isAdsEnabled) {
      productionLog('InterstitialAdManager', 'Ads disabled, skipping initialization');
      return;
    }

    if (IAPService.isSubscribed()) {
      productionLog('InterstitialAdManager', 'User subscribed, skipping interstitial initialization');
      return;
    }

    const unitId = getInterstitialAdUnitId();
    if (!unitId) {
      productionWarn('InterstitialAdManager', 'Missing interstitial ad unit ID - interstitials disabled');
      debugWarn('InterstitialAdManager', 'Missing interstitial ad unit ID');
      return;
    }

    productionLog('InterstitialAdManager', 'Initializing interstitial ads', {unitId});

    this.cleanupListeners();
    this.interstitial = InterstitialAd.createForAdRequest(unitId);

    this.unsubscribers.push(
      this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
        this.isLoaded = true;
        this.failureCount = 0; // Reset failure count on success
        debugLog('InterstitialAdManager', 'Interstitial loaded');
        productionLog('InterstitialAdManager', 'Interstitial ad loaded', {
          unitId,
          loadAttempts: this.loadAttempts,
        });
      }),
      this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        this.isLoaded = false;
        this.isShowing = false;
        debugLog('InterstitialAdManager', 'Interstitial closed');
        productionLog('InterstitialAdManager', 'Interstitial ad closed');
        this.preload();
      }),
      this.interstitial.addAdEventListener(AdEventType.ERROR, error => {
        this.isLoaded = false;
        this.isShowing = false;
        this.failureCount += 1;
        
        debugWarn('InterstitialAdManager', 'Interstitial error', error);
        productionError('InterstitialAdManager', 'Interstitial ad error', {
          errorCode: error?.code,
          errorMessage: error?.message,
          failureCount: this.failureCount,
          unitId,
        });
        
        this.preload();
      }),
    );

    this.preload();
  }

  preload() {
    if (!this.interstitial || IAPService.isSubscribed()) {
      return;
    }

    try {
      this.loadAttempts += 1;
      this.isLoaded = false;
      this.interstitial.load();
      debugLog('InterstitialAdManager', 'Preload attempt started', {
        attempt: this.loadAttempts,
      });
      productionLog('InterstitialAdManager', 'Interstitial preload initiated', {
        attempt: this.loadAttempts,
      });
    } catch (error) {
      this.failureCount += 1;
      debugWarn('InterstitialAdManager', 'Failed to preload interstitial', error);
      productionError('InterstitialAdManager', 'Failed to preload interstitial', {
        errorCode: error?.code,
        errorMessage: error?.message,
        failureCount: this.failureCount,
        attempt: this.loadAttempts,
      });
    }
  }

  beginImageView() {
    this.currentViewStartedAt = Date.now();
  }

  endImageView() {
    const dwellMs = Date.now() - this.currentViewStartedAt;
    this.currentViewStartedAt = 0;

    if (dwellMs >= INTERSTITIAL_MIN_DWELL_MS) {
      this.qualifiedImageViewCount += 1;
      debugLog('InterstitialAdManager', 'Qualified image view recorded', {
        dwellMs,
        total: this.qualifiedImageViewCount,
      });
      productionLog('InterstitialAdManager', 'Qualified image view', {
        dwellMs,
        totalQualified: this.qualifiedImageViewCount,
      });
    }
  }

  canShow() {
    if (!isAdsEnabled || IAPService.isSubscribed()) {
      return false;
    }

    if (!AdEngagementGate.canShowAds()) {
      return false;
    }

    if (!this.interstitial || !this.isLoaded || this.isShowing) {
      return false;
    }

    if (this.qualifiedImageViewCount < INTERSTITIAL_VIEWS_BEFORE_SHOW) {
      return false;
    }

    if (Date.now() - this.lastShownAt < INTERSTITIAL_MIN_INTERVAL_MS) {
      return false;
    }

    return true;
  }

  tryShowAtNaturalBreak(reason) {
    if (!ALLOWED_NATURAL_BREAKS.has(reason)) {
      debugWarn(
        'InterstitialAdManager',
        'Blocked interstitial — disallowed trigger',
        {reason},
      );
      productionWarn('InterstitialAdManager', 'Interstitial show blocked - invalid trigger', {
        reason,
        allowedReasons: Array.from(ALLOWED_NATURAL_BREAKS),
      });
      return false;
    }

    if (!this.canShow()) {
      productionLog('InterstitialAdManager', 'Interstitial cannot show - conditions not met', {
        reason,
        isLoaded: this.isLoaded,
        isShowing: this.isShowing,
        qualifiedViews: this.qualifiedImageViewCount,
        minViewsRequired: INTERSTITIAL_VIEWS_BEFORE_SHOW,
        timeSinceLastShow: Date.now() - this.lastShownAt,
        minIntervalMs: INTERSTITIAL_MIN_INTERVAL_MS,
        engagementGate: AdEngagementGate.canShowAds(),
      });
      return false;
    }

    this.isShowing = true;
    this.lastShownAt = Date.now();
    this.qualifiedImageViewCount = 0;

    try {
      this.interstitial.show();
      debugLog('InterstitialAdManager', 'Interstitial shown at natural break', {
        reason,
      });
      productionLog('InterstitialAdManager', 'Interstitial shown', {
        reason,
        totalShown: Math.floor((this.lastShownAt) / 1000),
      });
      return true;
    } catch (error) {
      debugWarn('InterstitialAdManager', 'Failed to show interstitial', error);
      productionError('InterstitialAdManager', 'Failed to show interstitial', {
        reason,
        errorCode: error?.code,
        errorMessage: error?.message,
      });
      this.isShowing = false;
      return false;
    }
  }

  /**
   * Gate for the once-per-session ads (first Full View, first Saved visit, first design
   * opened from Home). Intentionally a SEPARATE gate from canShow():
   *
   *  KEPT     - AdEngagementGate.canShowAds(): >= 15s session age and >= 2 engagements.
   *             This is the AdMob-policy-critical part. Without it an interstitial could
   *             land within a second or two of cold launch, which reads as an
   *             accidental-click pattern.
   *  BYPASSED - INTERSTITIAL_VIEWS_BEFORE_SHOW (5 qualified 8s views) and
   *             INTERSTITIAL_MIN_INTERVAL_MS (2 min). A per-session trigger fires at most
   *             once and typically before five images have ever been viewed, so keeping
   *             those caps would mean the feature effectively never ran.
   *  ADDED    - SESSION_AD_MIN_SPACING_MS, so two triggers coming due together cannot
   *             stack into consecutive interstitials.
   *
   * canShow() and the post_download natural break are untouched by any of this.
   */
  canShowSessionAd() {
    if (!isAdsEnabled || IAPService.isSubscribed()) {
      return false;
    }

    if (!AdEngagementGate.canShowAds()) {
      return false;
    }

    if (!this.interstitial || !this.isLoaded || this.isShowing) {
      return false;
    }

    if (Date.now() - this.lastShownAt < SESSION_AD_MIN_SPACING_MS) {
      return false;
    }

    return true;
  }

  /**
   * Shows one interstitial for a batch of pending session triggers.
   *
   * The batch is consumed ONLY on a successful show. A blocked attempt (ad not loaded yet,
   * engagement gate not satisfied, spacing not elapsed) consumes nothing, so the trigger
   * stays pending and gets another chance at the next qualifying moment rather than being
   * silently burnt — this is what makes the behaviour reliable on a fast cold launch where
   * the 15s engagement floor has not been reached yet.
   *
   * @param {string[]} triggers candidate triggers from SESSION_AD_TRIGGERS
   * @returns {boolean} whether an ad was actually shown
   */
  showSessionAd(triggers) {
    const pending = SessionAdGate.getPending(triggers ?? []);
    if (pending.length === 0) {
      return false;
    }

    if (!this.canShowSessionAd()) {
      productionLog('InterstitialAdManager', 'Session ad cannot show - conditions not met', {
        pending,
        isLoaded: this.isLoaded,
        isShowing: this.isShowing,
        timeSinceLastShow: Date.now() - this.lastShownAt,
        minSpacingMs: SESSION_AD_MIN_SPACING_MS,
        engagementGate: AdEngagementGate.canShowAds(),
      });
      return false;
    }

    this.isShowing = true;
    this.lastShownAt = Date.now();
    this.qualifiedImageViewCount = 0;

    try {
      this.interstitial.show();
      // Consumed only once show() has been accepted. Every trigger in the batch is spent
      // together so that, when the first Full View of the session IS the first design
      // opened from Home, the two triggers resolve to one ad instead of two.
      SessionAdGate.consume(pending);
      debugLog('InterstitialAdManager', 'Session ad shown', {pending});
      productionLog('InterstitialAdManager', 'Session interstitial shown', {pending});
      return true;
    } catch (error) {
      debugWarn('InterstitialAdManager', 'Failed to show session interstitial', error);
      productionError('InterstitialAdManager', 'Failed to show session interstitial', {
        pending,
        errorCode: error?.code,
        errorMessage: error?.message,
      });
      this.isShowing = false;
      return false;
    }
  }

  cleanupListeners() {
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers = [];
  }

  reset() {
    this.cleanupListeners();
    this.interstitial = null;
    this.isLoaded = false;
    this.isShowing = false;
    this.qualifiedImageViewCount = 0;
    this.currentViewStartedAt = 0;
    this.loadAttempts = 0;
    this.failureCount = 0;
  }
}

export default new InterstitialAdManager();
