import {StyleSheet} from 'react-native';

export const createStyles = theme =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.bg.base,
    },
    content: {
      flex: 1,
    },
  });
