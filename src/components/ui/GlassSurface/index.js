import React from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {useTheme} from '../../../theme/ThemeContext';
import {createStyles} from './styles';

const GlassSurface = ({
  children,
  style,
  blurAmount = Platform.OS === 'ios' ? 30 : 22,
  borderRadius,
  contentStyle,
  shadow = 'float',
  intensity = 'default',
}) => {
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const radius = borderRadius ?? theme.radius.xl;
  const blurType = theme.isDark ? 'dark' : 'light';
  const isStrong = intensity === 'strong';
  const shadowStyle =
    shadow === 'card'
      ? theme.shadows.card
      : shadow === 'none'
      ? null
      : isStrong
      ? theme.shadows.elevated
      : theme.shadows.float;
  const useNativeBlur = Platform.OS === 'ios';

  return (
    <View style={[styles.wrapper, shadowStyle, style, {borderRadius: radius}]}>
      {useNativeBlur ? (
        <BlurView
          style={[StyleSheet.absoluteFillObject, {borderRadius: radius}]}
          blurType={blurType}
          blurAmount={blurAmount}
          reducedTransparencyFallbackColor={theme.colors.bg.surface}
          overlayColor="transparent"
        />
      ) : (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            isStrong ? styles.androidFallbackStrong : styles.androidFallback,
            {borderRadius: radius},
          ]}
        />
      )}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          isStrong ? styles.tintStrong : styles.tint,
          {borderRadius: radius},
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          isStrong ? styles.borderStrong : styles.border,
          {borderRadius: radius},
        ]}
      />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
};

export default GlassSurface;
