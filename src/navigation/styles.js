import {StyleSheet} from 'react-native';

// The native-stack header styles that used to live here (headerTitle/headerStyle/
// headerTint/backButton) are gone: every screen now renders the app's own BackHeader,
// so no screen in the stack shows a React Navigation header any more.
export const createStyles = theme =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.bg.base,
    },
  });
