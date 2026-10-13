import React, {useEffect, useRef} from 'react';
import {Animated, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Icons} from '../../../constants';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {useTheme} from '../../../theme/ThemeContext';
import {createStyles} from './styles';

// Success, warning, error and info share one surface treatment (solid terracotta,
// white text) for a consistent app-wide toast identity; the glyph alone distinguishes
// them. Icons are white too, so they stay legible on that fixed background.
const ICONS_BY_TYPE = {
  success: 'checkmark-circle',
  warning: 'warning',
  error: 'alert-circle',
  info: 'information-circle',
};

// Presentational toast pill, slid in from the top. Visibility is entirely driven by
// `toast` being non-null — ToastContext owns the show/auto-dismiss timing.
const Toast = ({toast, onDismiss}) => {
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) {
      return;
    }

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        ...theme.motion.spring.sheet,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: theme.motion.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: theme.motion.duration.fast,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: theme.motion.duration.fast,
          useNativeDriver: true,
        }),
      ]).start();
    };
  }, [toast, translateY, opacity, theme.motion]);

  if (!toast) {
    return null;
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
      pointerEvents="box-none">
      <Animated.View
        style={[
          styles.wrapper,
          {opacity, transform: [{translateY}]},
        ]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onDismiss}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite">
          {/* Deliberately a plain View, not GlassSurface: GlassSurface layers a BlurView
              and a translucent tint OVER its own background, so a toast built on it can
              never be fully opaque — text ended up competing with whatever was on screen
              behind it. A solid brand surface guarantees readable contrast in both
              light and dark mode. */}
          <View style={styles.surface}>
            <Icons.Ionicons
              name={ICONS_BY_TYPE[toast.type] || ICONS_BY_TYPE.info}
              size={20}
              color={theme.colors.text.inverse}
              style={styles.icon}
            />
            <Text style={styles.message} numberOfLines={2}>
              {toast.message}
            </Text>
            {toast.action ? (
              <TouchableOpacity
                onPress={() => {
                  // Dismiss first so the toast can't linger after the action runs.
                  onDismiss();
                  toast.action.onPress();
                }}
                style={styles.actionButton}
                accessibilityRole="button">
                <Text style={styles.actionLabel}>{toast.action.label}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export default Toast;
