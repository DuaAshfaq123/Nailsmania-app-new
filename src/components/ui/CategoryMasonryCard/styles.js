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
      width: '100%',
    },
    image: {
      width: '100%',
      height: '100%',
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
  });
