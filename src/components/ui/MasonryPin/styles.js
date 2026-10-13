import {StyleSheet} from 'react-native';

export const createStyles = theme =>
  StyleSheet.create({
    wrapper: {
      marginBottom: theme.spacing.lg,
    },
    pressable: {
      width: '100%',
    },
    imageCard: {
      borderRadius: theme.radius.xl,
      overflow: 'hidden',
      position: 'relative',
      width: '100%',
    },
    gradientBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '48%',
      backgroundColor: theme.colors.overlay.gradientEnd,
      zIndex: 4,
    },
    overlayLabelWrap: {
      position: 'absolute',
      left: theme.spacing.md,
      right: theme.spacing.md,
      bottom: theme.spacing.md,
      zIndex: 4,
    },
    overlayLabel: {
      ...theme.text.cardOverlay,
      color: theme.colors.text.inverse,
      textTransform: 'uppercase',
    },
    meta: {
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xxs,
    },
    metaTitle: {
      ...theme.text.cardMeta,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xxs,
    },
    metaSubtitle: {
      ...theme.text.caption,
      color: theme.colors.text.secondary,
      lineHeight: theme.lineHeights.caption + 3,
    },
    invalidPlaceholder: {
      width: '100%',
      overflow: 'hidden',
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.skeleton.base,
    },
    invalidIconWrap: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
