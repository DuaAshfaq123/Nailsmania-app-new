import React, {useEffect, useRef} from 'react';
import {Animated, View} from 'react-native';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {mirrorTransformRange} from '../../../utils/rtl';
import {createStyles} from './styles';

const SkeletonBlock = ({width, height, borderRadius, style}) => {
  const styles = useThemedStyles(createStyles);
  const shimmer = useRef(new Animated.Value(0)).current;
  const animationWidth =
    typeof width === 'number' && Number.isFinite(width) ? width : 100;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1100,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const shimmerOpacity = shimmer.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.85, 0.3],
  });

  // Sweeps with the reading direction: left-to-right normally, right-to-left in Urdu and
  // Arabic. A transform is never mirrored for us, so the range is flipped here.
  const shimmerTranslate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: mirrorTransformRange([-animationWidth, animationWidth]),
  });

  return (
    <View
      style={[
        styles.block,
        typeof width !== 'undefined' ? {width} : null,
        typeof height !== 'undefined' ? {height} : null,
        typeof borderRadius !== 'undefined' ? {borderRadius} : null,
        style,
      ]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            opacity: shimmerOpacity,
            transform: [{translateX: shimmerTranslate}],
          },
        ]}
      />
    </View>
  );
};

export default SkeletonBlock;
