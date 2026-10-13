import {StyleSheet} from 'react-native';

export const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.xxxl,
    },
    iconWrap: {
      width: theme.spacing.xxl + theme.spacing.lg,
      height: theme.spacing.xxl + theme.spacing.lg,
      borderRadius: (theme.spacing.xxl + theme.spacing.lg) / 2,
      backgroundColor: theme.colors.bg.muted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
    },
    title: {
      ...theme.text.sectionSerif,
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      ...theme.text.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      maxWidth: 280,
    },
  });
