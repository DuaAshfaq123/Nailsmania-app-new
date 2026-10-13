import {StyleSheet} from 'react-native';

export const createStyles = theme =>
  StyleSheet.create({
    content: {
      paddingHorizontal: theme.layout.screenPadding,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.layout.tabBarClearance,
    },
    introTitle: {
      ...theme.text.title,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    introBody: {
      ...theme.text.body,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.lg,
    },
    tipsTitle: {
      ...theme.text.label,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    tipRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing.xs,
    },
    tipBullet: {
      ...theme.text.body,
      color: theme.colors.accent.terracotta,
      marginRight: theme.spacing.sm,
    },
    // flex + minWidth:0 so long tips wrap inside the row rather than overflowing it.
    tipText: {
      flex: 1,
      minWidth: 0,
      ...theme.text.body,
      color: theme.colors.text.secondary,
    },
    // One card shape shared by the email and phone blocks — the two channels must not
    // drift apart visually, so they render from the same styles rather than a copy.
    contactCard: {
      alignItems: 'center',
      backgroundColor: theme.colors.bg.muted,
      borderRadius: theme.radius.lg,
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.lg,
    },
    contactIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.accent.primaryMuted,
      marginBottom: theme.spacing.md,
    },
    contactLabel: {
      // Field-label role — same token Edit Profile uses for "Name" / "Email".
      ...theme.text.label,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xxs,
    },
    contactValue: {
      ...theme.text.title,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
    },
    contactButton: {
      alignSelf: 'stretch',
    },
    responseNote: {
      ...theme.text.caption,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
      marginTop: theme.spacing.lg,
    },
  });
