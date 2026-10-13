import {StyleSheet} from 'react-native';
import {screenWidth} from '../../utils/responsive';

export const getPinHeights = theme =>
  [170, 210, 185, 225, 175, 195].map(
    h => (h / 160) * theme.layout.pinBaseHeight,
  );

export const getSkeletonLayout = theme => {
  const horizontalPadding = theme.layout.screenPadding * 2;
  const columnGap = theme.layout.columnGap;
  const columnWidth = (screenWidth - horizontalPadding - columnGap) / 2;

  return {
    columnWidth,
    columnGap,
    radius: theme.radius.lg,
    heights: {short: 168, medium: 188, tall: 218},
  };
};

export const createStyles = theme => {
  const skeletonLayout = getSkeletonLayout(theme);

  return StyleSheet.create({
    listContent: {
      paddingBottom: theme.layout.tabBarClearance,
    },
    emptyCtaWrap: {
      paddingHorizontal: theme.layout.screenPadding,
      marginTop: theme.spacing.lg,
    },
    emptyScrollContent: {
      flexGrow: 1,
      paddingBottom: theme.layout.tabBarClearance,
    },
    guestButtonWrap: {
      paddingHorizontal: theme.layout.screenPadding,
      paddingBottom: theme.spacing.xl,
    },
    skeletonWrap: {
      paddingHorizontal: theme.layout.screenPadding,
      paddingTop: theme.spacing.md,
    },
    skeletonMasonryRow: {
      flexDirection: 'row',
      gap: skeletonLayout.columnGap,
    },
    skeletonColumn: {
      flex: 1,
    },
    skeletonGap: {
      marginTop: theme.spacing.sm,
    },
  });
};
