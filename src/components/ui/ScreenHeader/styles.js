import {StyleSheet} from 'react-native';

const controlSize = theme => theme.layout.categoryThumbSize;

export const createStyles = theme =>
  StyleSheet.create({
    // Top-aligned, not centre-aligned. With alignItems:'center' the 40px back control is
    // taller than a single-line title, so it pulled the title down a few px — meaning a
    // back screen with no subtitle sat lower than a tab screen. Aligning to the top makes
    // the title start at exactly paddingTop on every screen, with or without a back
    // button, with or without a subtitle.
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: theme.layout.screenPadding,
      paddingBottom: theme.layout.headerPaddingBottom,
      backgroundColor: theme.colors.bg.base,
    },
    backButton: {
      width: controlSize(theme),
      height: controlSize(theme),
      borderRadius: controlSize(theme) / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.bg.muted,
    },
    // flex: 1 so the title always claims whatever header width is left over. Space on the
    // right is reserved by the right slot's own presence, never by an empty spacer — a
    // screen with no right action gives its title the full remaining width.
    titleWrap: {
      flex: 1,
    },
    // Applied only when a back button precedes the title, so titles on headers without one
    // start flush with the screen padding (matching Home, Settings, and Saved).
    titleWrapWithBack: {
      marginLeft: theme.spacing.md,
    },
    titleWrapWithRight: {
      marginRight: theme.spacing.sm,
    },
    title: {
      ...theme.text.brand,
      color: theme.colors.text.primary,
    },
    subtitle: {
      marginTop: theme.spacing.xxs,
      ...theme.text.subtitle,
      color: theme.colors.text.secondary,
    },
    rightSlot: {
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
  });
