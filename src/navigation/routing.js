import {Platform, StatusBar, View} from 'react-native';
import React, {useMemo} from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import bottomStack from './bottomStack/bottomStack';
import CategoriesData from '../screens/CategoriesData';
import Support from '../screens/Support';
import ViewImages from '../screens/ImageViewer';
import PrivacyandPolicy from '../screens/PrivacyandPolicy';
import TermsAndConditions from '../screens/TermsandConditions';
import AboutUs from '../screens/AboutUs';
import useThemedStyles from '../hooks/useThemedStyles';
import {useTheme} from '../theme/ThemeContext';
import {isRTL} from '../utils/rtl';
import {flushPendingNavigation, navigationRef} from './navigationRef';
import {createStyles} from './styles';

// A push should travel against the reading direction — new screens enter from the right
// in English and from the left in Urdu/Arabic. react-native-screens takes this as a named
// animation rather than a semantic one, so the name has to be chosen here; nothing else
// about the navigation structure changes.
const PUSH_ANIMATION = isRTL ? 'slide_from_left' : 'slide_from_right';

const Stack = createNativeStackNavigator();

const Routing = () => {
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);

  const navigationTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: theme.colors.bg.base,
        card: theme.colors.bg.base,
        text: theme.colors.text.primary,
        border: theme.colors.border.hairline,
        primary: theme.colors.accent.primary,
      },
    }),
    [theme],
  );

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={theme.colors.statusBar.barStyle}
        backgroundColor={theme.colors.bg.base}
        translucent={Platform.OS === 'android'}
      />
      <NavigationContainer
        ref={navigationRef}
        onReady={flushPendingNavigation}
        theme={navigationTheme}>
        <Stack.Navigator
          screenOptions={{
            contentStyle: {backgroundColor: theme.colors.bg.base},
            animation: PUSH_ANIMATION,
          }}>
          <Stack.Screen
            name="bottomStack"
            component={bottomStack}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="ViewImages"
            component={ViewImages}
            options={{
              headerShown: false,
              animation: 'none',
              gestureEnabled: false,
              fullScreenGestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="PrivacyandPolicy"
            component={PrivacyandPolicy}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="TermsAndConditions"
            component={TermsAndConditions}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AboutUs"
            component={AboutUs}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CategoriesData"
            component={CategoriesData}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Support"
            component={Support}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

export default Routing;
