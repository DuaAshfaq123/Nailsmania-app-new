import {
  MIN_ENGAGEMENT_ACTIONS_BEFORE_ADS,
  MIN_SESSION_MS_BEFORE_ADS,
} from '../../constants/admob';
import {debugLog} from '../../utils/debugLog';
import {productionLog} from '../../utils/productionLog';

/**
 * Tracks meaningful user engagement before any ad format may render.
 * Prevents ads on splash, cold launch, and pre-interaction navigation.
 */
class AdEngagementGate {
  constructor() {
    this.sessionStartedAt = 0;
    this.engagementCount = 0;
    this.hasMeaningfulEngagement = false;
    this.listeners = new Set();
    // Last value broadcast to listeners. Used to suppress redundant notifications —
    // see notifyListeners().
    this.lastNotifiedValue = false;
    this.eligibilityTimer = null;
  }

  markSessionStarted() {
    this.sessionStartedAt = Date.now();
    this.engagementCount = 0;
    this.hasMeaningfulEngagement = false;
    this.lastNotifiedValue = false;
    debugLog('AdEngagementGate', 'Session started');
    productionLog('AdEngagementGate', 'Session started', {
      minSessionMs: MIN_SESSION_MS_BEFORE_ADS,
      minEngagements: MIN_ENGAGEMENT_ACTIONS_BEFORE_ADS,
    });

    // canShowAds() is partly time-based, so it can flip to true with no further user
    // action once MIN_SESSION_MS_BEFORE_ADS elapses. Nothing would re-evaluate it in
    // that case, so eligibility is scheduled explicitly rather than relying on some
    // later engagement happening to re-check it. (It previously appeared to work only
    // because the Home scroll handler fired ~60 notifications a second — the very
    // behaviour that saturated the JS thread.)
    if (this.eligibilityTimer) {
      clearTimeout(this.eligibilityTimer);
    }
    this.eligibilityTimer = setTimeout(() => {
      this.eligibilityTimer = null;
      this.notifyListeners();
    }, MIN_SESSION_MS_BEFORE_ADS);

    this.notifyListeners();
  }

  recordEngagement(reason = 'interaction') {
    this.engagementCount += 1;
    this.hasMeaningfulEngagement = true;
    // debugLog is a no-op in release. Deliberately no productionLog here: this is a
    // hot path (every tap, and historically every scroll frame), and each
    // productionLog is an unconditional console.log that crosses the bridge to
    // logcat in a release build. Engagement state is still inspectable on demand via
    // getDiagnostics().
    debugLog('AdEngagementGate', 'Engagement recorded', {
      reason,
      count: this.engagementCount,
    });
    this.notifyListeners();
  }

  getTimeSinceSessionStart() {
    if (!this.sessionStartedAt) {
      return 0;
    }
    return Date.now() - this.sessionStartedAt;
  }

  canShowAds() {
    if (!this.sessionStartedAt) {
      return false;
    }

    const sessionAgeMs = this.getTimeSinceSessionStart();
    const hasEnoughTime = sessionAgeMs >= MIN_SESSION_MS_BEFORE_ADS;
    const hasEnoughActions =
      this.engagementCount >= MIN_ENGAGEMENT_ACTIONS_BEFORE_ADS;

    return this.hasMeaningfulEngagement && hasEnoughTime && hasEnoughActions;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Broadcasts only on an actual transition. Every subscriber turns this callback
  // straight into a React setState (BannerAdComponent, useAdEngagement), so notifying
  // unconditionally meant one state update per subscriber per call — with several
  // banners mounted, a single scroll gesture produced thousands of re-renders and
  // starved the JS thread that RN also dispatches touch events on. The gate is a
  // latch, so the only thing subscribers care about is the transition.
  notifyListeners() {
    const value = this.canShowAds();
    if (value === this.lastNotifiedValue) {
      return;
    }
    this.lastNotifiedValue = value;
    this.listeners.forEach(listener => listener(value));
  }

  /**
   * Diagnostic method to get engagement gate state
   */
  getDiagnostics() {
    return {
      sessionStartedAt: this.sessionStartedAt,
      sessionAgeMs: this.getTimeSinceSessionStart(),
      engagementCount: this.engagementCount,
      hasMeaningfulEngagement: this.hasMeaningfulEngagement,
      canShowAds: this.canShowAds(),
      minSessionMs: MIN_SESSION_MS_BEFORE_ADS,
      minEngagements: MIN_ENGAGEMENT_ACTIONS_BEFORE_ADS,
      requirements: {
        sessionTimeOk: this.getTimeSinceSessionStart() >= MIN_SESSION_MS_BEFORE_ADS,
        engagementsOk: this.engagementCount >= MIN_ENGAGEMENT_ACTIONS_BEFORE_ADS,
        meaningfulEngagementOk: this.hasMeaningfulEngagement,
      },
    };
  }
}

export default new AdEngagementGate();
