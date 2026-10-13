import {StyleSheet} from 'react-native';

export const createStyles = theme =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingHorizontal: theme.layout.screenPadding,
      gap: theme.layout.columnGap,
    },
    column: {
      flex: 1,
    },
  });
