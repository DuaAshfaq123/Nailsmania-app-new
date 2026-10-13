import {StyleSheet} from 'react-native';

export const createStyles = theme =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: theme.colors.bg.base,
      padding: theme.spacing.md,
      paddingTop: theme.spacing.sm,
    },
    text: {
      ...theme.text.body,
      textAlign: 'left',
      marginBottom: theme.spacing.sm,
      color: theme.colors.text.secondary,
      lineHeight: theme.lineHeights.body + 4,
    },
    boldText: {
      ...theme.text.h3,
      color: theme.colors.text.primary,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
  });
