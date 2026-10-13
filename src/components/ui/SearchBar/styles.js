import {StyleSheet} from 'react-native';
import {scriptSafeTracking} from '../../../theme/typography';

export const createStyles = theme =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },
    inner: {
      width: '100%',
      backgroundColor: theme.colors.bg.surface,
    },
    innerContent: {
      minHeight: theme.spacing.xxl + theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    iconCircle: {
      width: theme.spacing.xl + theme.spacing.xs,
      height: theme.spacing.xl + theme.spacing.xs,
      borderRadius: theme.radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.accent.primaryMuted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border.gold,
    },
    placeholder: {
      ...theme.text.inputCompact,
      color: theme.colors.text.secondary,
      flex: 1,
      letterSpacing: scriptSafeTracking(0.1),
    },
  });
