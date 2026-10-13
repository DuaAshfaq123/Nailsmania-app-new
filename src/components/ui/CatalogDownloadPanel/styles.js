import {StyleSheet} from 'react-native';

export const createStyles = theme =>
  StyleSheet.create({
    card: {
      marginHorizontal: theme.layout.screenPadding,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      padding: theme.spacing.lg,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.bg.surface,
    },
    cardCompact: {
      marginHorizontal: theme.layout.screenPadding,
      marginTop: 0,
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.md,
    },
    spinner: {
      marginBottom: theme.spacing.md,
    },
    title: {
      ...theme.text.sectionSerif,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    body: {
      ...theme.text.body,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.md,
    },
    track: {
      height: 8,
      borderRadius: 4,
      overflow: 'hidden',
      backgroundColor: theme.colors.bg.muted,
    },
    fill: {
      height: '100%',
      borderRadius: 4,
      backgroundColor: theme.colors.accent.terracotta,
    },
    percent: {
      ...theme.text.caption,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.sm,
    },
    retry: {
      marginTop: theme.spacing.md,
    },
  });
