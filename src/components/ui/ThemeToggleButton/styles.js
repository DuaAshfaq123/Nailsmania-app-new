import {StyleSheet} from 'react-native';
import {moderateScale} from '../../../utils/responsive';

const trackWidth = moderateScale(60);
const trackHeight = moderateScale(32);
const padding = moderateScale(3);
const thumbSize = trackHeight - padding * 2;

export const SWITCH_METRICS = {
  trackWidth,
  trackHeight,
  padding,
  thumbSize,
  iconSize: moderateScale(15),
  hintIconSize: moderateScale(13),
  travel: trackWidth - thumbSize - padding * 2,
};

export const createStyles = theme => {
  const isDark = theme.colorScheme === 'dark';

  // Shared slot geometry — thumb and both hint icons use the exact same box
  // so they share one vertical center line.
  const slot = {
    position: 'absolute',
    top: SWITCH_METRICS.padding,
    width: SWITCH_METRICS.thumbSize,
    height: SWITCH_METRICS.thumbSize,
    alignItems: 'center',
    justifyContent: 'center',
  };

  return StyleSheet.create({
    root: {
      justifyContent: 'center',
    },
    track: {
      width: SWITCH_METRICS.trackWidth,
      height: SWITCH_METRICS.trackHeight,
      borderRadius: theme.radius.pill,
      backgroundColor: isDark
        ? theme.colors.accent.primaryMuted
        : theme.colors.bg.muted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark
        ? theme.colors.border.gold
        : theme.colors.border.hairline,
    },
    sunHint: {
      ...slot,
      left: SWITCH_METRICS.padding,
    },
    moonHint: {
      ...slot,
      right: SWITCH_METRICS.padding,
    },
    thumb: {
      ...slot,
      left: SWITCH_METRICS.padding,
      backgroundColor: isDark
        ? theme.colors.bg.elevated
        : theme.colors.bg.surface,
      borderRadius: theme.radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border.gold,
      zIndex: 1,
    },
  });
};
