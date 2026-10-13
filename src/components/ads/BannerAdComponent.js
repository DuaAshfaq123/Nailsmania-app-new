import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppState, View} from 'react-native';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {getBannerAdUnitId, isAdsEnabled} from '../../config/admobConfig';
import {IAPService} from '../../services/iap/iapService';
import AdEngagementGate from '../../services/admob/adEngagementGate';
import {AdMobService} from '../../services/admob/adMobService';
import {SkeletonBlock} from '../ui';
import {debugWarn} from '../../utils/debugLog';
import {
  productionLog,
  productionWarn,
  productionError,
} from '../../utils/productionLog';
import {createStyles} from './styles';
import useThemedStyles from '../../hooks/useThemedStyles';

/**
 * Banner reliability strategy (production-grade):
 *
 * - AdMob never fills 100% of requests. A no-fill (code 3) or transient network
 *   error is normal, NOT terminal. We therefore retry with bounded exponential
 *   backoff instead of latching to a permanent failure.
 * - Retries force a fresh native ad view via a `reloadKey` remount — the most
 *   version-safe reload path across colleft
 *  releases.
 * - The first mount is gated on the Google Mobile Ads SDK being initialized,
 *   removing the init-vs-mount race that silently kills the first request.
 * - While loading/retrying we show the app's standard SkeletonBlock loader so
 *   the slot is never an empty white box. Final failure collapses to null.
 */
const MAX_RETRY_ATTEMPTS = 4;
const RETRY_BASE_DELAY_MS = 4000;
const RETRY_MAX_DELAY_MS = 30000;
const BANNER_SKELETON_HEIGHT = 50;

const STATUS = {
  LOADING: 'loading',
  LOADED: 'loaded',
  FAILED: 'failed',
};

const getRetryDelay = attempt =>
  Math.min(RETRY_BASE_DELAY_MS * 2 ** attempt, RETRY_MAX_DELAY_MS);

const BannerAdComponent = ({
  style,
  contentStyle,
  showLabel = true,
  onLoaded,
}) => {
  const styles = useThemedStyles(createStyles);
  const unitId = getBannerAdUnitId();

  const [canShowAds, setCanShowAds] = useState(() =>
    AdEngagementGate.canShowAds(),
  );
  // Gate the first ad request on the SDK being ready to avoid the init race.
  const [ready, setReady] = useState(() => AdMobService.isInitialized());
  const [status, setStatus] = useState(STATUS.LOADING);
  const [reloadKey, setReloadKey] = useState(0);

  const mountedRef = useRef(true);
  const attemptRef = useRef(0);
  const retryTimerRef = useRef(null);
  const statusRef = useRef(status);
  statusRef.current = status;

  const shouldRender =
    isAdsEnabled &&
    !IAPService.isSubscribed() &&
    !!unitId &&
    canShowAds;

  // Lifecycle + subscriptions. Kept in one effect so cleanup is centralized.
  useEffect(() => {
    mountedRef.current = true;

    // Engagement gate: reveal ads only once meaningful interaction has occurred.
    setCanShowAds(AdEngagementGate.canShowAds());
    const unsubscribeGate = AdEngagementGate.subscribe(value => {
      if (mountedRef.current) {
        setCanShowAds(value);
      }
    });

    // Resolve SDK readiness. initialize() is idempotent and resolves for late
    // callers even if init is already complete or in flight.
    if (!AdMobService.isInitialized()) {
      AdMobService.initialize().finally(() => {
        if (mountedRef.current) {
          setReady(true);
        }
      });
    }

    // App resume recovery: give a collapsed banner a fresh chance after the app
    // returns to the foreground (network may have recovered while backgrounded).
    const appStateSub = AppState.addEventListener('change', nextState => {
      if (
        nextState === 'active' &&
        mountedRef.current &&
        statusRef.current === STATUS.FAILED
      ) {
        attemptRef.current = 0;
        setStatus(STATUS.LOADING);
        setReloadKey(key => key + 1);
      }
    });

    return () => {
      mountedRef.current = false;
      unsubscribeGate();
      appStateSub.remove();
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, []);

  const handleAdLoaded = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    attemptRef.current = 0;
    if (mountedRef.current) {
      setStatus(STATUS.LOADED);
    }
    onLoaded?.();
    productionLog('BannerAdComponent', 'Banner ad loaded successfully', {
      unitId,
    });
  }, [onLoaded, unitId]);

  const handleAdFailedToLoad = useCallback(
    error => {
      debugWarn('BannerAdComponent', 'Banner failed to load', error);

      const nextAttempt = attemptRef.current + 1;

      if (nextAttempt >= MAX_RETRY_ATTEMPTS) {
        productionError(
          'BannerAdComponent',
          'Banner ad failed permanently (retries exhausted)',
          {
            errorCode: error?.code,
            errorMessage: error?.message,
            attempts: nextAttempt,
            unitId,
          },
        );
        if (mountedRef.current) {
          setStatus(STATUS.FAILED);
        }
        return;
      }

      const delay = getRetryDelay(attemptRef.current);
      attemptRef.current = nextAttempt;

      productionWarn(
        'BannerAdComponent',
        'Banner ad failed, scheduling retry',
        {
          errorCode: error?.code,
          errorMessage: error?.message,
          attempt: nextAttempt,
          retryInMs: delay,
          unitId,
        },
      );

      // Stay in LOADING (skeleton visible) and remount for a fresh request.
      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null;
        if (mountedRef.current) {
          setReloadKey(key => key + 1);
        }
      }, delay);
    },
    [unitId],
  );

  // Nothing to show (disabled / subscribed / no unit / pre-engagement) or the
  // banner has permanently failed: collapse with zero reserved space.
  if (!shouldRender || status === STATUS.FAILED) {
    return null;
  }

  const showSkeleton = !ready || status !== STATUS.LOADED;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.adSlot, contentStyle]}>
        {ready ? (
          <BannerAd
            key={reloadKey}
            unitId={unitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            onAdLoaded={handleAdLoaded}
            onAdFailedToLoad={handleAdFailedToLoad}
          />
        ) : null}
        {showSkeleton ? (
          <SkeletonBlock
            height={BANNER_SKELETON_HEIGHT}
            borderRadius={8}
            style={styles.bannerSkeleton}
          />
        ) : null}
      </View>
    </View>
  );
};

export default React.memo(BannerAdComponent);
