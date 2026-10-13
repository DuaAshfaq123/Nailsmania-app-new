import {StyleSheet} from 'react-native';

export const createStyles = theme =>
  StyleSheet.create({
    block: {
      backgroundColor: theme.colors.skeleton.base,
      overflow: 'hidden',
    },
    shimmer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '60%',
      backgroundColor: theme.colors.skeleton.highlight,
      borderRadius: theme.radius.xs,
    },
  });
