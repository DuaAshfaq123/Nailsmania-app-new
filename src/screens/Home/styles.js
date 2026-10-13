import {StyleSheet} from 'react-native';
import {screenWidth} from '../../utils/responsive';

export const getSkeletonLayout = theme => {
  const horizontalPadding = theme.layout.screenPadding * 2;
  const columnGap = theme.layout.columnGap;
  const columnWidth = (screenWidth - horizontalPadding - columnGap) / 2;

  return {
    columnWidth,
    columnGap,
    radius: theme.radius.xl,
    heights: {short: 160, medium: 200, tall: 240},
  };
};

export const createStyles = theme => {
  const skeletonLayout = getSkeletonLayout(theme);

  return StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: theme.colors.bg.base,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: theme.layout.tabBarClearance,
    },
    header: {
      backgroundColor: theme.colors.bg.base,
      paddingHorizontal: theme.layout.screenPadding,
      // paddingTop is applied inline from the safe-area inset so it matches
      // ScreenHeader's formula exactly (insets.top + spacing.xs).
      paddingBottom: theme.spacing.md,
    },
    brandHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xl,
    },
    // flex + minWidth:0 so a long greeting truncates inside the row instead of pushing
    // the toggle off the right edge.
    brandTextWrap: {
      flex: 1,
      minWidth: 0,
      marginRight: theme.spacing.md,
    },
    // Nudged down to sit optically centred against the wordmark's cap height rather
    // than its line box.
    themeToggleWrap: {
      marginTop: theme.spacing.xxs,
    },
    // Clipping frame for the collapse animation. overflow:'hidden' is what lets the
    // animated height crop the chips instead of squashing them — the inner content keeps
    // its natural size the whole time, so the chips are never re-laid-out mid-animation
    // and their touch targets always match what is drawn.
    chipsCollapsible: {
      overflow: 'hidden',
    },
    brandTitle: {
      ...theme.text.brand,
      color: theme.colors.text.brand,
    },
    brandEyebrow: {
      marginTop: theme.spacing.xs,
      ...theme.text.overline,
      color: theme.colors.text.secondary,
      textTransform: 'uppercase',
    },
    greeting: {
      marginTop: theme.spacing.sm,
      ...theme.text.subtitle,
      color: theme.colors.text.primary,
    },
    skeletonContainer: {
      paddingHorizontal: theme.layout.screenPadding,
      paddingTop: theme.spacing.sm,
    },
    skeletonMasonryRow: {
      flexDirection: 'row',
      gap: skeletonLayout.columnGap,
    },
    skeletonColumn: {
      flex: 1,
    },
    skeletonGap: {
      marginTop: theme.spacing.lg,
    },
    // Same horizontal gutter as MasonryGrid, so swapping between the two collection
    // presentations never shifts the section's left or right edge. The gap between cards
    // is the card's own (TrendingPin's full-width variant carries it).
    collectionList: {
      paddingHorizontal: theme.layout.screenPadding,
    },
    adBannerBottom: {
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
  });
};
