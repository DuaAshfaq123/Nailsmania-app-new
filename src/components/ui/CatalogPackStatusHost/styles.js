import {StyleSheet} from 'react-native';

export const createStyles = theme =>
  StyleSheet.create({
    host: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingBottom: theme.layout.tabBarClearance,
    },
  });
