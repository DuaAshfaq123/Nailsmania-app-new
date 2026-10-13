import {StyleSheet} from 'react-native';

export const createStyles = theme =>
  StyleSheet.create({
    scrollContent: {
      paddingBottom: theme.layout.tabBarClearance,
    },
    menuGroup: {
      paddingHorizontal: theme.layout.screenPadding,
      marginBottom: theme.spacing.md,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.bg.muted,
      borderRadius: theme.radius.lg,
      marginBottom: theme.spacing.xs,
    },
    themeOptionSelected: {
      backgroundColor: theme.colors.accent.primaryMuted,
    },
    themeOptionIcon: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.bg.surface,
      marginEnd: theme.spacing.md,
    },
    themeOptionLabel: {
      ...theme.text.body,
      color: theme.colors.text.primary,
      flex: 1,
    },
    themeOptionCheck: {
      marginStart: theme.spacing.xs,
    },

    accountCard: {
      backgroundColor: theme.colors.bg.muted,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      // Matches SettingMenuItem's own gap, so the profile card and the action rows below
      // it sit on the same rhythm as every other row in Settings.
      marginBottom: theme.spacing.xs,
    },
    accountGuestSubtitle: {
      ...theme.text.body,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.md,
    },
    accountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.colors.bg.surface,
      // Accent ring in the same terracotta as the active bottom-tab item, so the
      // avatar reads as a deliberate branded element instead of a bare image.
      borderWidth: 2,
      borderColor: theme.colors.accent.terracotta,
    },
    avatarPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    accountInfo: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    accountName: {
      ...theme.text.title,
      color: theme.colors.text.primary,
    },
    accountEmail: {
      ...theme.text.caption,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xxs,
    },
    deleteAccountButton: {
      marginTop: theme.spacing.sm,
    },
  });
