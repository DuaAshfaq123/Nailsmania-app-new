import React, {useCallback, useEffect, useRef} from 'react';
import {Animated, Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Icons} from '../../../constants';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {THEME_OPTIONS, useTheme} from '../../../theme/ThemeContext';
import {mirrorTransformRange} from '../../../utils/rtl';
import {createStyles, SWITCH_METRICS} from './styles';

// A CONSUMER of the existing theme system, not a second one. It reads the already-resolved
// colorScheme and writes back through ThemeProvider's setThemePreference, which persists to
// EncryptedStorage under the same 'theme_preference' key the Settings selector uses — so the
// two surfaces stay in sync with no extra plumbing and nothing new is stored.
//
// The control is a two-state switch: off = light, on = dark. It always commits an EXPLICIT
// light/dark preference (never 'system'): a binary switch cannot express "follow the device".
// The three-way System/Light/Dark control in Settings remains the way to opt back in.
const ThemeToggleButton = ({style}) => {
  const {theme, colorScheme, setThemePreference} = useTheme();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation('home');
  const isDark = colorScheme === 'dark';
  const progress = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isDark ? 1 : 0,
      duration: theme.motion.duration.fast,
      useNativeDriver: true,
    }).start();
  }, [isDark, progress, theme.motion.duration.fast]);

  const handlePress = useCallback(() => {
    setThemePreference(isDark ? THEME_OPTIONS.LIGHT : THEME_OPTIONS.DARK);
  }, [isDark, setThemePreference]);

  // The thumb's resting slot is pinned with `left`, which RTL already moves to the right
  // end of the track. Only the travel needs mirroring, so the thumb still ends up under
  // the moon hint rather than sliding out of the track.
  const thumbTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: mirrorTransformRange([0, SWITCH_METRICS.travel]),
  });

  const sunHintOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const moonHintOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const iconColor = theme.colors.accent.terracotta;
  const hintColor = theme.colors.text.tertiary;

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.root, style]}
      accessibilityRole="switch"
      accessibilityState={{checked: isDark}}
      accessibilityLabel={
        isDark
          ? t('home:themeToggleToLightLabel')
          : t('home:themeToggleToDarkLabel')
      }>
      <View style={styles.track}>
        <Animated.View
          style={[styles.sunHint, {opacity: sunHintOpacity}]}
          pointerEvents="none">
          <Icons.Ionicons
            name="sunny"
            size={SWITCH_METRICS.hintIconSize}
            color={hintColor}
          />
        </Animated.View>

        <Animated.View
          style={[styles.moonHint, {opacity: moonHintOpacity}]}
          pointerEvents="none">
          <Icons.Ionicons
            name="moon"
            size={SWITCH_METRICS.hintIconSize}
            color={hintColor}
          />
        </Animated.View>

        <Animated.View
          style={[styles.thumb, {transform: [{translateX: thumbTranslateX}]}]}>
          <Icons.Ionicons
            name={isDark ? 'moon' : 'sunny'}
            size={SWITCH_METRICS.iconSize}
            color={iconColor}
          />
        </Animated.View>
      </View>
    </Pressable>
  );
};

export default ThemeToggleButton;
