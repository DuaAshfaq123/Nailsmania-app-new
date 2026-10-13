import {StyleSheet} from 'react-native';

export const createStyles = theme =>
  StyleSheet.create({
    wrapper: {
      overflow: 'hidden',
    },
    androidFallback: {
      backgroundColor: theme.colors.bg.surface,
      opacity: 0.92,
    },
    androidFallbackStrong: {
      backgroundColor: theme.colors.bg.surface,
      opacity: 0.97,
    },
    tint: {
      backgroundColor: theme.colors.bg.glass,
    },
    tintStrong: {
      backgroundColor: theme.colors.bg.surface,
    },
    border: {
      ...StyleSheet.absoluteFillObject,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border.hairline,
    },
    borderStrong: {
      ...StyleSheet.absoluteFillObject,
      borderWidth: 1,
      borderColor: theme.colors.border.gold,
    },
    content: {
      position: 'relative',
      zIndex: 1,
    },
  });
