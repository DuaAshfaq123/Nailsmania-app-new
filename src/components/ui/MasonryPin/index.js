import React, {useEffect, useRef} from 'react';
import {Animated, Text, View} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import {Icons} from '../../../constants';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {useTheme} from '../../../theme/ThemeContext';
import AnimatedPressable from '../AnimatedPressable';
import ProgressiveImage from '../ProgressiveImage';
import SaveButton from '../SaveButton';
import SkeletonBlock from '../SkeletonBlock';
import {createStyles} from './styles';

const MasonryPin = ({
  cacheKey,
  primaryUrl,
  imageUrl,
  height,
  onPress,
  index = 0,
  skipEntrance = false,
  priority = FastImage.priority.normal,
  title,
  subtitle,
  showSave = false,
  saved = false,
  onSavePress,
  onVisible,
}) => {
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const entrance = useRef(new Animated.Value(skipEntrance ? 1 : 0)).current;
  const hasEntered = useRef(skipEntrance);

  const resolvedCacheKey = cacheKey || primaryUrl || imageUrl || `pin_${index}`;
  const resolvedPrimaryUrl = primaryUrl || imageUrl;
  const hasValidUrl =
    typeof resolvedPrimaryUrl === 'string' && resolvedPrimaryUrl.trim().length > 0;

  useEffect(() => {
    if (skipEntrance || hasEntered.current) {
      return;
    }
    hasEntered.current = true;

    Animated.timing(entrance, {
      toValue: 1,
      duration: theme.motion.duration.fast,
      delay: Math.min(index, 3) * theme.motion.stagger.pin,
      useNativeDriver: true,
    }).start();
  }, [
    entrance,
    index,
    skipEntrance,
    theme.motion.duration.fast,
    theme.motion.stagger.pin,
  ]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: entrance,
          transform: skipEntrance
            ? undefined
            : [
                {
                  translateY: entrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
                  }),
                },
              ],
        },
      ]}>
      <AnimatedPressable onPress={onPress} style={styles.pressable}>
        <View style={[styles.imageCard, {height}]}>
          {hasValidUrl ? (
            <ProgressiveImage
              mode="gallery"
              cacheKey={resolvedCacheKey}
              primaryUrl={resolvedPrimaryUrl}
              height={height}
              priority={priority}
              borderRadius={theme.radius.xl}
              onVisible={onVisible}
            />
          ) : (
            <View style={[styles.invalidPlaceholder, {height}]}>
              <SkeletonBlock
                width="100%"
                height={height}
                borderRadius={theme.radius.xl}
              />
              <View style={styles.invalidIconWrap}>
                <Icons.Ionicons
                  name="image-outline"
                  size={28}
                  color={theme.colors.text.tertiary}
                />
              </View>
            </View>
          )}

          {title ? (
            <>
              <View style={styles.gradientBottom} />
              <View style={styles.overlayLabelWrap}>
                <Text style={styles.overlayLabel} numberOfLines={1}>
                  {title.toUpperCase()}
                </Text>
              </View>
            </>
          ) : null}
         
          {showSave && onSavePress && hasValidUrl ? (
            <SaveButton saved={saved} onPress={onSavePress} />
          ) : null}
        </View>
      </AnimatedPressable>

      {title || subtitle ? (
        <View style={styles.meta}>
          {title ? (
            <Text style={styles.metaTitle} numberOfLines={1}>
              {title.toUpperCase()}
            </Text>
          ) : null}
          {subtitle ? (
            <Text style={styles.metaSubtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Animated.View>
  );
};

export default React.memo(MasonryPin);
