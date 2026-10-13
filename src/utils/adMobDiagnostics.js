/**
 * AdMob Diagnostic Tool
 * 
 * Run this from a React DevTools console to diagnose AdMob issues:
 * 
 * Example:
 * import {getAdMobDiagnostics} from './utils/adMobDiagnostics';
 * console.log(getAdMobDiagnostics());
 */

import {AdMobService, InterstitialAdManager, AdEngagementGate} from '../services/admob/adMobService';
import {isAdsEnabled, isDebugBuild, isUsingTestAds, getBannerAdUnitId, getInterstitialAdUnitId, getAdMobAppId} from '../config/admobConfig';
import {IAPService} from '../services/iap/iapService';
import {getDiagnosticHistory} from './productionLog';

/**
 * Comprehensive diagnostic report for AdMob configuration and state
 */
export const getAdMobDiagnostics = () => {
  return {
    timestamp: new Date().toISOString(),
    configuration: {
      adsEnabled: isAdsEnabled,
      debugBuild: isDebugBuild(),
      usingTestAds: isUsingTestAds(),
      appId: getAdMobAppId() || 'NOT_SET',
      bannerUnitId: getBannerAdUnitId() || 'NOT_SET',
      interstitialUnitId: getInterstitialAdUnitId() || 'NOT_SET',
    },
    service: {
      initialized: AdMobService.isInitialized(),
      supported: AdMobService.isSupported(),
      error: AdMobService.getInitError()?.message || 'NO_ERROR',
      config: AdMobService.getConfiguration(),
    },
    interstitial: {
      isLoaded: InterstitialAdManager.isLoaded,
      isShowing: InterstitialAdManager.isShowing,
      canShow: InterstitialAdManager.canShow(),
      qualifiedViews: InterstitialAdManager.qualifiedImageViewCount,
      loadAttempts: InterstitialAdManager.loadAttempts,
      failureCount: InterstitialAdManager.failureCount,
    },
    engagementGate: AdEngagementGate.getDiagnostics(),
    subscription: {
      userSubscribed: IAPService.isSubscribed(),
    },
    diagnosticLogs: getDiagnosticHistory(),
  };
};

/**
 * Pretty-print the diagnostic report
 */
export const printAdMobDiagnostics = () => {
  const diagnostics = getAdMobDiagnostics();
  console.group('[AdMob Diagnostics]');
  console.log('Timestamp:', diagnostics.timestamp);
  
  console.group('Configuration');
  Object.entries(diagnostics.configuration).forEach(([key, value]) => {
    console.log(`  ${key}:`, value);
  });
  console.groupEnd();
  
  console.group('Service Status');
  Object.entries(diagnostics.service).forEach(([key, value]) => {
    console.log(`  ${key}:`, value);
  });
  console.groupEnd();
  
  console.group('Interstitial Status');
  Object.entries(diagnostics.interstitial).forEach(([key, value]) => {
    console.log(`  ${key}:`, value);
  });
  console.groupEnd();
  
  console.group('Engagement Gate');
  Object.entries(diagnostics.engagementGate).forEach(([key, value]) => {
    if (typeof value === 'object') {
      console.log(`  ${key}:`, JSON.stringify(value, null, 2));
    } else {
      console.log(`  ${key}:`, value);
    }
  });
  console.groupEnd();
  
  console.group('Diagnostic Logs (Last 20)');
  const recentLogs = diagnostics.diagnosticLogs.captured.slice(-20);
  recentLogs.forEach((log, index) => {
    console.log(`[${index + 1}] [${log.level}] ${log.scope}: ${log.message}`, log.data);
  });
  console.groupEnd();
  
  console.groupEnd();
  
  return diagnostics;
};

/**
 * Check if ads should be showing (comprehensive check)
 */
export const shouldAdsBeShowing = () => {
  const diagnostics = getAdMobDiagnostics();
  const issues = [];
  
  if (!diagnostics.configuration.adsEnabled) {
    issues.push('❌ Ads disabled - not running on Android');
  }
  
  if (!diagnostics.service.initialized) {
    issues.push('❌ AdMobService not initialized');
  }
  
  if (diagnostics.service.error !== 'NO_ERROR') {
    issues.push(`❌ AdMobService initialization error: ${diagnostics.service.error}`);
  }
  
  if (!diagnostics.configuration.bannerUnitId || diagnostics.configuration.bannerUnitId === 'NOT_SET') {
    issues.push('❌ Banner unit ID not set');
  }
  
  if (diagnostics.subscription.userSubscribed) {
    issues.push('⚠️  User has active subscription - ads hidden');
  }
  
  if (!diagnostics.engagementGate.canShowAds) {
    const reasons = [];
    if (!diagnostics.engagementGate.hasMeaningfulEngagement) {
      reasons.push('no meaningful engagement');
    }
    if (!diagnostics.engagementGate.requirements.sessionTimeOk) {
      reasons.push(`session too new (${diagnostics.engagementGate.sessionAgeMs}ms < ${diagnostics.engagementGate.minSessionMs}ms)`);
    }
    if (!diagnostics.engagementGate.requirements.engagementsOk) {
      reasons.push(`not enough engagements (${diagnostics.engagementGate.engagementCount} < ${diagnostics.engagementGate.minEngagements})`);
    }
    issues.push(`⚠️  Engagement gate not met: ${reasons.join(', ')}`);
  }
  
  return {
    shouldShow: issues.length === 0,
    issues,
    diagnostics,
  };
};

export default {
  getAdMobDiagnostics,
  printAdMobDiagnostics,
  shouldAdsBeShowing,
};
