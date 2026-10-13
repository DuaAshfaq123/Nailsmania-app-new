import {StyleSheet} from 'react-native';

export const createStyles = theme =>
  StyleSheet.create({
    // Fills the Modal's window, so no zIndex or elevation is needed: the window itself is
    // already above the app's, which is the whole reason the sheet moved into a Modal.
    //
    // Anchored to the bottom like every other sheet in the app, but on an OPAQUE ground
    // rather than theme.colors.overlay.scrim. The tree behind this is mid-switch and must
    // not show through at all — a dimmed screen is still a visible screen. bg.base is
    // theme-reactive, so the cover is correct in both light and dark mode.
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: theme.colors.bg.base,
    },
    // paddingBottom lives here rather than being applied inline from an inset: SafeAreaView
    // contributes the device inset natively, and this is the sheet's own breathing room on
    // top of it.
    sheetWrapper: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.md,
    },
    // Same surface treatment as GuidanceSheet and the other sheets — elevated background,
    // hairline border, xl radius, float shadow — so this reads as part of the same family.
    //
    // Everything is centred on the cross axis rather than laid out in rows, which is what
    // makes the sheet direction-agnostic: there is no leading/trailing content to mirror,
    // so it is laid out identically in English, Urdu and Arabic and only the text itself
    // changes. minHeight gives it the presence of a sheet instead of a small centred
    // dialog, and guarantees room for the title, the message at its longest translation,
    // and the spinner without anything being clipped.
    sheet: {
      minHeight: theme.spacing.xxxl * 4,
      alignItems: 'center',
      backgroundColor: theme.colors.bg.elevated,
      borderRadius: theme.radius.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border.hairline,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      ...theme.shadows.float,
    },
    grabber: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border.hairline,
      marginBottom: theme.spacing.lg,
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.accent.primaryMuted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border.gold,
      marginBottom: theme.spacing.lg,
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
    },
    spinner: {
      marginTop: theme.spacing.lg,
    },
  });
