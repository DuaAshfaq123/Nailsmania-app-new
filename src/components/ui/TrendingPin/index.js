import React, {useEffect, useRef} from 'react';
import {Animated, Text, View} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {useTheme} from '../../../theme/ThemeContext';
import AnimatedPressable from '../AnimatedPressable';
import SaveButton from '../SaveButton';
import {createStyles, TRENDING_CARD_HEIGHT, TRENDING_CARD_WIDTH} from './styles';

const TrendingPin = ({
  imageUrl,
  categoryName,
  onPress,
  index = 0,
  showSave = false,
  saved = false,
  onSavePress,
  // Opt-in layout variant for the card stacked down a column rather than scrolled along
  // the Trending row (Home's collection section). Everything else about the card is
  // shared, so the two presentations stay visually identical by construction.
  fullWidth = false,
}) => {
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: theme.motion.duration.entrance,
      delay: index * theme.motion.stagger.pin,
      useNativeDriver: true,
    }).start();
  }, [entrance, index, theme.motion.duration.entrance, theme.motion.stagger.pin]);

  if (!imageUrl) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.wrapper,
        fullWidth ? styles.wrapperFullWidth : null,
        {
          opacity: entrance,
          transform: [
            {
              translateY: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            },
          ],
        },
      ]}>
      <Text style={styles.categoryName} numberOfLines={1}>
        {categoryName}
      </Text>

      <AnimatedPressable onPress={onPress} style={styles.pressable}>
        <View
          style={[
            styles.imageCard,
            fullWidth ? styles.imageCardFullWidth : null,
          ]}>
          <FastImage
            source={{uri: imageUrl, priority: FastImage.priority.normal}}
            style={styles.image}
            resizeMode={FastImage.resizeMode.cover}
          />
         
          {showSave && onSavePress ? (
            <SaveButton saved={saved} onPress={onSavePress} />
          ) : null}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
};

export default TrendingPin;
export {TRENDING_CARD_HEIGHT, TRENDING_CARD_WIDTH};
