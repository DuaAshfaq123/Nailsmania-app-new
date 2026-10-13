import {StyleSheet} from 'react-native';

export const createStyles = theme =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.layout.screenPadding,
      backgroundColor: theme.colors.overlay.scrim,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    // Deliberately a plain View rather than GlassSurface: this renders inside a Modal
    // window, where BlurView cannot blur the content behind it, so a glass surface would
    // read as a flat translucent tint and let the underlying screen bleed through the
    // dialog text. A solid themed surface is legible in both light and dark mode.
    card: {
      width: '100%',
      maxWidth: 400,
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      backgroundColor: theme.colors.bg.elevated,
      borderRadius: theme.radius.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border.hairline,
      ...theme.shadows.float,
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.accent.primaryMuted,
    },
    // Destructive confirmations get a red-tinted icon halo so the weight of the action
    // reads before the user parses the copy.
    iconWrapDestructive: {
      backgroundColor: theme.colors.semantic.errorMuted,
    },
    title: {
      ...theme.text.h3,
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    message: {
      ...theme.text.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    actions: {
      alignSelf: 'stretch',
    },
    confirmButton: {
      alignSelf: 'stretch',
    },
    cancelButton: {
      alignSelf: 'stretch',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    cancelText: {
      ...theme.text.button,
      color: theme.colors.text.secondary,
    },
  });
