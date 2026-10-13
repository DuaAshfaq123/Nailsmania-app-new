import {StyleSheet} from 'react-native';

const iconWrapSize = theme => theme.layout.categoryThumbSize;

export const createStyles = theme =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.bg.muted,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
    iconWrap: {
      width: iconWrapSize(theme),
      height: iconWrapSize(theme),
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.bg.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    label: {
      flex: 1,
      ...theme.text.body,
      color: theme.colors.text.primary,
    },
  });
