import React, {useEffect, useRef} from 'react';
import {Animated, Text, View} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {useTheme} from '../../../theme/ThemeContext';
import AnimatedPressable from '../AnimatedPressable';
import {createStyles} from './styles';

const CategoryMasonryCard = ({
  title,
  subtitle,
  thumbnail,
  height,
  onPress,
  index = 0,
}) => {
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: theme.motion.duration.entrance,
      delay: index * theme.motion.stagger.card,
      useNativeDriver: true,
    }).start();
  }, [entrance, index, theme.motion.duration.entrance, theme.motion.stagger.card]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: entrance,
          transform: [
            {
              translateY: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [14, 0],
              }),
            },
          ],
        },
      ]}>
      <AnimatedPressable onPress={onPress} style={styles.pressable}>
        <View style={[styles.imageCard, {height}]}>
          <FastImage
            source={thumbnail}
            style={[styles.image, {height}]}
            resizeMode={FastImage.resizeMode.cover}
          />
        </View>
      </AnimatedPressable>

      <View style={styles.meta}>
        <Text style={styles.metaTitle} numberOfLines={1}>
          {title.toUpperCase()}
        </Text>
        {subtitle ? (
          <Text style={styles.metaSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
};

export default CategoryMasonryCard;
