export const INTERSTITIAL_MIN_INTERVAL_MS = 120_000;
export const INTERSTITIAL_VIEWS_BEFORE_SHOW = 5;
export const INTERSTITIAL_MIN_DWELL_MS = 8_000;

export const MIN_SESSION_MS_BEFORE_ADS = 15_000;
export const MIN_ENGAGEMENT_ACTIONS_BEFORE_ADS = 2;

// Minimum gap between two SESSION ads (see SessionAdGate / showSessionAd). Session ads
// deliberately bypass INTERSTITIAL_MIN_INTERVAL_MS so a per-session trigger can actually
// fire, but without some floor two triggers that come due at the same moment — first
// Full View and first Home-opened design usually coincide — could stack back to back.
// Shorter than the natural-break interval because these fire at most three times per
// session by construction.
export const SESSION_AD_MIN_SPACING_MS = 30_000;

export const AD_SAFE_TOUCH_SPACING = 16;
export const HOME_BANNER_MIN_SCROLL_Y = 120;

export const GALLERY_AD_EVERY_ROWS = 10;
export const GALLERY_MASONRY_COLUMNS = 2;
