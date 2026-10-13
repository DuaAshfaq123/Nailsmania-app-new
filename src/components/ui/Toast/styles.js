import {StyleSheet} from 'react-native';

export const createStyles = theme =>
  StyleSheet.create({
    safeArea: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999,
      elevation: 999,
      alignItems: 'center',
    },
    wrapper: {
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.sm,
    },
    surface: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      maxWidth: '100%',
      // Solid brand terracotta — the same colour as the active bottom-tab selection —
      // identical in light and dark mode, so the toast reads as one consistent app
      // element rather than shifting appearance with the theme. Deliberately opaque:
      // a plain View (not GlassSurface, whose BlurView can't blur content beneath an
      // absolutely-positioned overlay and leaves text competing with the screen behind).
      backgroundColor: theme.colors.accent.terracotta,
      borderRadius: theme.radius.pill,
      ...theme.shadows.float,
    },
    icon: {
      marginRight: theme.spacing.xs,
    },
    actionButton: {
      marginLeft: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xxs,
    },
    actionLabel: {
      ...theme.text.button,
      // White on the terracotta surface, underlined so it reads as an action rather
      // than part of the message.
      color: theme.colors.text.inverse,
      textDecorationLine: 'underline',
    },
    message: {
      ...theme.text.body,
      // text.inverse is #FFFFFF in both themes and is the established "text on accent"
      // colour (PrimaryButton's primary label uses it). A theme-reactive colour would
      // go dark in light mode and near-vanish against this terracotta.
      color: theme.colors.text.inverse,
      flexShrink: 1,
    },
  });
