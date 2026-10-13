import {scale, verticalScale} from '../utils/responsive';

export const Spacing = {
  xxs: scale(4),
  xs: scale(8),
  sm: scale(12),
  md: scale(16),
  lg: scale(20),
  xl: scale(24),
  xxl: scale(32),
  xxxl: scale(48),
};

export const Layout = {
  screenPadding: scale(20),
  columnGap: scale(10),
  pinBaseHeight: verticalScale(172),
  categoryBaseHeight: verticalScale(212),
  collectionCardWidth: scale(200),
  collectionCardHeight: verticalScale(140),
  trendingCardWidth: scale(260),
  trendingCardHeight: verticalScale(190),
  categoryRowHeight: verticalScale(56),
  categoryThumbSize: scale(40),
  tabBarBottomInset: Spacing.lg,
  tabBarHeight: verticalScale(56),
  tabBarClearance: verticalScale(124),
  headerPaddingBottom: Spacing.md,
};
