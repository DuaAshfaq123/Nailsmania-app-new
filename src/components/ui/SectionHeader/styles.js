import {StyleSheet} from 'react-native';
import {scriptSafeTracking} from '../../../theme/typography';

export const createStyles = theme =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingHorizontal: theme.layout.screenPadding,
      marginBottom: theme.spacing.lg,
      marginTop: theme.spacing.xl,
    },
    titleRow: {
      flex: 1,
      paddingRight: theme.spacing.md,
    },
    title: {
      ...theme.text.sectionTitle,
      color: theme.colors.text.primary,
    },
    titleSerif: {
      ...theme.text.sectionSerif,
      color: theme.colors.text.primary,
    },
    subtitle: {
      marginTop: theme.spacing.xxs,
      ...theme.text.caption,
      color: theme.colors.text.secondary,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      paddingBottom: 4,
    },
    action: {
      ...theme.text.overline,
      color: theme.colors.accent.terracotta,
      textTransform: 'uppercase',
      // Tighter than the overline token's 2.8 because this is a short inline action
      // ("SEE ALL"), not a standalone section eyebrow.
      letterSpacing: scriptSafeTracking(1.2),
    },
  });
