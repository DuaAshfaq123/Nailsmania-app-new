import {StyleSheet} from 'react-native';
import {AD_SAFE_TOUCH_SPACING} from '../../constants/admob';

export const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg.base,
    },
    imageStage: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageFill: {
      flex: 1,
      width: '100%',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    loader: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Spans the full width so the page counter can be centred on the screen while the
    // back button stays anchored to the leading edge.
    topBar: {
      position: 'absolute',
      left: theme.layout.screenPadding,
      right: theme.layout.screenPadding,
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 10,
    },
    bottomBarWrap: {
      position: 'absolute',
      left: theme.layout.screenPadding,
      right: theme.layout.screenPadding,
      zIndex: 10,
    },
    bottomBar: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.xs,
      position: 'relative',
    },
    iconButton: {
      width: 44,
      height: 44,
      backgroundColor: theme.colors.bg.surface,
    },
    bottomBarSurface: {
      backgroundColor: theme.colors.bg.surface,
    },
    iconButtonInner: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButton: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xxs,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xxs,
      borderRadius: theme.radius.lg,
    },
    actionLabel: {
      // Same token as the bottom tab bar: both are small labels sitting under an icon,
      // so they should match. Replaces a text.caption base with hardcoded fontSize/
      // fontWeight overrides — and fontWeight is unreliable on Android anyway when the
      // family is an explicit Poppins face, since it can't synthesize a weight that the
      // named font file doesn't provide.
      ...theme.text.tabLabel,
      textAlign: 'center',
    },
    // Anchored to bottomBarWrap, whose top edge is the action bar's, so it still straddles
    // that edge — but this parent does not clip, unlike the glass surface itself.
    doneBadge: {
      position: 'absolute',
      right: theme.spacing.sm,
      top: -10,
      width: 28,
      height: 28,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.bg.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.gold,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border.gold,
    },
    bannerWrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      zIndex: 5,
      paddingBottom: AD_SAFE_TOUCH_SPACING,
      overflow: 'hidden',
    },
    // The pill sits in a flexible middle slot with an invisible spacer of the back
    // button's exact size on the trailing edge. Equal 44pt gutters on both sides put the
    // counter on the screen's centre line rather than in the space left over beside the
    // back button. Non-interactive, so it never eats a back tap.
    counterSlot: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    counterSpacer: {
      width: 44,
      height: 44,
    },
    counterPill: {
      paddingHorizontal: theme.spacing.md,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.bg.surface,
    },
    counterLabel: {
      ...theme.text.caption,
      color: theme.colors.accent.gold,
    },
  });
