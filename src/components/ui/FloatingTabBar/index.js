import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Platform, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {Icons} from '../../../constants';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {useTheme} from '../../../theme/ThemeContext';
import {directionalOffset} from '../../../utils/rtl';
import GlassSurface from '../GlassSurface';
import {createStyles} from './styles';

const FloatingTabBar = ({state, navigation}) => {
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const {t} = useTranslation(['common', 'upload']);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const [tabWidth, setTabWidth] = useState(0);

  const TAB_CONFIG = useMemo(
    () => ({
      Categories: {
        icon: 'home',
        iconOutline: 'home-outline',
        label: t('common:tabHome'),
      },
      Favorites: {
        icon: 'heart',
        iconOutline: 'heart-outline',
        label: t('common:tabSaved'),
      },
      Upload: {
        icon: 'add-circle',
        iconOutline: 'add-circle-outline',
        label: t('upload:uploadTabLabel'),
      },
      Settings: {
        icon: 'settings',
        iconOutline: 'settings-outline',
        label: t('common:tabMore'),
      },
    }),
    [t],
  );

  // The row of tabs is laid out by Yoga, so RTL reverses it for free and the indicator's
  // `start` edge pins it under the first tab either way. The slide itself is a transform,
  // which RTL never mirrors — without negating it the pill would walk away from the tab
  // it is meant to sit behind, off the far end of the bar.
  useEffect(() => {
    if (tabWidth > 0) {
      Animated.spring(indicatorX, {
        toValue: directionalOffset(state.index * tabWidth),
        ...theme.motion.spring.release,
        useNativeDriver: true,
      }).start();
    }
  }, [indicatorX, state.index, tabWidth, theme.motion.spring.release]);

  return (
    <View
      style={[
        styles.wrapper,
        {paddingBottom: Math.max(insets.bottom, theme.spacing.sm)},
      ]}>
      <View
        pointerEvents="none"
        style={[
          styles.bottomScrim,
          {
            height:
              Math.max(insets.bottom, theme.spacing.sm) + theme.spacing.xxxl,
          },
        ]}
      />
      <GlassSurface
        style={styles.container}
        borderRadius={theme.radius.xl}
        blurAmount={Platform.OS === 'ios' ? 28 : 20}
        intensity="strong"
        shadow="float">
        <View
          style={styles.inner}
          onLayout={e => {
            const width = e.nativeEvent.layout.width;
            const innerPadding = theme.spacing.xxs * 2;
            const nextTabWidth = (width - innerPadding) / state.routes.length;
            setTabWidth(nextTabWidth);
            indicatorX.setValue(directionalOffset(state.index * nextTabWidth));
          }}>
          {tabWidth > 0 ? (
            <Animated.View
              style={[
                styles.activeIndicator,
                {
                  width: tabWidth,
                  transform: [{translateX: indicatorX}],
                },
              ]}
            />
          ) : null}
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const config = TAB_CONFIG[route.name] || {
              icon: 'ellipse',
              iconOutline: 'ellipse-outline',
              label: route.name,
            };

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? {selected: true} : {}}
                onPress={onPress}
                style={styles.tab}
                activeOpacity={0.75}>
                <Icons.Ionicons
                  name={isFocused ? config.icon : config.iconOutline}
                  size={22}
                  color={
                    isFocused
                      ? theme.colors.accent.terracotta
                      : theme.colors.text.secondary
                  }
                />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.label,
                    isFocused ? styles.labelActive : styles.labelInactive,
                  ]}>
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </GlassSurface>
    </View>
  );
};

export default FloatingTabBar;
