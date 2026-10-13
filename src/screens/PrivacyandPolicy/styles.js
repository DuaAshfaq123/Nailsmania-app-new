import {StyleSheet} from 'react-native';

export const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.bg.base,
    },
    privacyText: {
      ...theme.text.body,
      textAlign: 'justify',
      marginBottom: theme.spacing.sm,
      color: theme.colors.text.secondary,
      lineHeight: theme.lineHeights.body + 4,
    },
    headertext: {
      ...theme.text.h3,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xs,
      color: theme.colors.text.primary,
    },
    linkText: {
      ...theme.text.link,
      color: theme.colors.accent.primary,
    },
    linkTextSpaced: {
      ...theme.text.link,
      color: theme.colors.accent.primary,
      marginBottom: theme.spacing.xs,
    },
    highlightText: {
      ...theme.text.link,
      color: theme.colors.accent.primary,
    },
  });
