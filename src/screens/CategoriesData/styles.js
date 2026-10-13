import {StyleSheet} from 'react-native';
import {screenWidth} from '../../utils/responsive';

export const getPinHeights = theme =>
  [160, 200, 180, 220, 170, 190].map(
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
    heights: {short: 168, medium: 208, tall: 248},
  };
};

export const createStyles = theme => {
  const skeletonLayout = getSkeletonLayout(theme);

  return StyleSheet.create({
    contentFill: {
      flex: 1,
    },
    list: {
      flex: 1,
    },
    listContent: {
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
    footerLoader: {
      paddingHorizontal: theme.layout.screenPadding,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
    },
    galleryAd: {
      marginVertical: theme.spacing.sm,
    },
    footerSpacer: {
      height: theme.spacing.lg,
    },
    galleryRow: {
      flexDirection: 'row',
      paddingHorizontal: theme.layout.screenPadding,
      gap: theme.layout.columnGap,
    },
    galleryColumn: {
      flex: 1,
    },
    galleryColumnSpacer: {
      flex: 1,
    },
  });
};
