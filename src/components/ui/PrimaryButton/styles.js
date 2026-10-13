import {StyleSheet} from 'react-native';
import {verticalScale} from '../../../utils/responsive';

// Minimum accessible touch target (WCAG 2.5.5 / Material guidance is 44-48dp).
const MIN_HEIGHT = verticalScale(48);

export const createStyles = theme =>
  StyleSheet.create({
    base: {
      minHeight: MIN_HEIGHT,
      borderRadius: theme.radius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    disabled: {
      opacity: 0.5,
    },
    labelWithIcon: {
      marginLeft: theme.spacing.xs,
    },

    variant_primary: {
      backgroundColor: theme.colors.accent.primary,
    },
    label_primary: {
      ...theme.text.button,
      color: theme.colors.text.inverse,
    },

    variant_secondary: {
      backgroundColor: theme.colors.bg.muted,
      borderWidth: 1,
      borderColor: theme.colors.border.hairline,
    },
    label_secondary: {
      ...theme.text.button,
      color: theme.colors.text.primary,
    },

    variant_destructive: {
      backgroundColor: theme.colors.semantic.error,
    },
    label_destructive: {
      ...theme.text.button,
      color: theme.colors.text.inverse,
    },
  });
