import {View} from 'react-native';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Home from '../../screens/Home';
import Favorites from '../../screens/Favorites';
import Upload from '../../screens/Upload';
import Settings from '../../screens/Settings';
import {FloatingTabBar} from '../../components/ui';
import useThemedStyles from '../../hooks/useThemedStyles';
import {createStyles} from './styles';

const Tab = createBottomTabNavigator();

// Defined once at module scope, not inline in JSX — a fresh arrow function on every
// BottomStack render would give React Navigation a "new" tabBar component type each time,
// risking an unnecessary remount of FloatingTabBar instead of a normal re-render.
const renderTabBar = props => <FloatingTabBar {...props} />;

const BottomStack = () => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.root}>
      <Tab.Navigator
        tabBar={renderTabBar}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          lazy: true,
        }}>
        <Tab.Screen name="Categories" component={Home} />
        <Tab.Screen name="Favorites" component={Favorites} />
        <Tab.Screen name="Upload" component={Upload} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>
    </View>
  );
};

export default BottomStack;
