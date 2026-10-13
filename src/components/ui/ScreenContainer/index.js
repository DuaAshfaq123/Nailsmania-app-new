import {Platform, StatusBar, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {useTheme} from '../../../theme/ThemeContext';
import {createStyles} from './styles';

const ScreenContainer = ({children, edges = ['top'], style, contentStyle}) => {
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={edges}>
      <StatusBar
        barStyle={theme.colors.statusBar.barStyle}
        backgroundColor={theme.colors.bg.base}
        translucent={Platform.OS === 'android'}
      />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
};

export default ScreenContainer;
