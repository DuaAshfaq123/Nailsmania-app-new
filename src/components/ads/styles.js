import {StyleSheet} from 'react-native';
import {AD_SAFE_TOUCH_SPACING} from '../../constants/admob';
import {scriptSafeTracking} from '../../theme/typography';

export const createStyles = theme =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      width: '100%',
      paddingTop: AD_SAFE_TOUCH_SPACING,
      paddingBottom: AD_SAFE_TOUCH_SPACING,
    },
    adLabel: {
      // tabLabel is the 10px medium token — replaces a caption base with a hardcoded
      // fontSize override. Tracking stays custom: this disclosure label needs to read
      // as small print, not as a wide-tracked overline.
      ...theme.text.tabLabel,
      letterSpacing: scriptSafeTracking(0.6),
      textTransform: 'uppercase',
      color: theme.colors.text.tertiary,
      marginBottom: theme.spacing.xxs,
      alignSelf: 'flex-start',
      paddingHorizontal: theme.layout.screenPadding,
    },
    adSlot: {
      width: '100%',
      alignItems: 'center',
      overflow: 'hidden',
      backgroundColor: theme.colors.bg.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border.hairline,
    },
    bannerSkeleton: {
      width: '100%',
    },
  });
