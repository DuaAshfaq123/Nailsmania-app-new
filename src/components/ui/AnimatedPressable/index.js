import React, {useRef, useCallback} from 'react';
import {Animated, Pressable} from 'react-native';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {useTheme} from '../../../theme/ThemeContext';
import {createStyles} from './styles';

const AnimatedPressable = ({children, onPress, style, disabled}) => {
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: theme.motion.press.scale,
        ...theme.motion.spring.press,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: theme.motion.press.lift,
        ...theme.motion.spring.press,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, theme.motion.press, theme.motion.spring.press, translateY]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        ...theme.motion.spring.release,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        ...theme.motion.spring.release,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, theme.motion.spring.release, translateY]);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button">
      <Animated.View
        style={[styles.container, style, {transform: [{scale}, {translateY}]}]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default AnimatedPressable;
