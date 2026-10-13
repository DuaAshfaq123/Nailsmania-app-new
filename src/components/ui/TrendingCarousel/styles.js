import {StyleSheet} from 'react-native';
import {screenWidth} from '../../../utils/responsive';
import {Spacing} from '../../../theme/spacing';

export const CARD_GAP = Spacing.md;
export const VIEWPORT_WIDTH = screenWidth;
export const INDICATOR_TRACK_WIDTH = 48;
export const INDICATOR_THUMB_WIDTH = 18;

export const createStyles = theme =>
  StyleSheet.create({
    indicatorTrack: {
      alignSelf: 'center',
      width: INDICATOR_TRACK_WIDTH,
      height: 3,
      borderRadius: 2,
      marginTop: theme.spacing.sm,
      overflow: 'hidden',
      backgroundColor: theme.colors.border.hairline,
    },
    indicatorThumb: {
      width: INDICATOR_THUMB_WIDTH,
      height: 3,
      borderRadius: 2,
      backgroundColor: theme.colors.accent.terracotta,
    },
    container: {
      marginBottom: theme.spacing.md,
    },
    listContent: {
      paddingHorizontal: theme.layout.screenPadding,
      gap: theme.spacing.md,
    },
    skeletonRow: {
      flexDirection: 'row',
      paddingHorizontal: theme.layout.screenPadding,
      gap: theme.spacing.md,
    },
    skeletonCard: {
      marginBottom: theme.spacing.sm,
    },
  });
