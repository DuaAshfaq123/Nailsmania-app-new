import {StyleSheet} from 'react-native';

export const createStyles = theme =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.bg.base,
    },
  });
