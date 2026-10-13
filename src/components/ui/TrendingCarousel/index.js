import React, {useCallback, useRef} from 'react';
import {Animated, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {getGalleryUrl} from '../../../utils/imageRef';
import {mirrorScrollDrivenRange} from '../../../utils/rtl';
import SectionHeader from '../SectionHeader';
import SkeletonBlock from '../SkeletonBlock';
import TrendingPin, {
  TRENDING_CARD_HEIGHT,
  TRENDING_CARD_WIDTH,
} from '../TrendingPin';
import {
  CARD_GAP,
  INDICATOR_THUMB_WIDTH,
  INDICATOR_TRACK_WIDTH,
  VIEWPORT_WIDTH,
  createStyles,
} from './styles';

const TrendingSkeleton = ({styles}) => (
  <View style={styles.skeletonRow}>
    {[0, 1, 2].map(index => (
      <SkeletonBlock
        key={`trending_skeleton_${index}`}
        width={TRENDING_CARD_WIDTH}
        height={TRENDING_CARD_HEIGHT}
        borderRadius={20}
        style={styles.skeletonCard}
      />
    ))}
  </View>
);

const TrendingCarousel = ({
  items,
  isLoading,
  onItemPress,
  title,
  // Optional: supplied by Home so trending cards carry the same save control as the
  // gallery. Omitted elsewhere, in which case no heart renders.
  showSave = false,
  isItemSaved,
  onItemSavePress,
}) => {
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation('home');
  // Drives the scroll indicator below the row. Native-driven, so tracking the finger
  // costs nothing on the JS thread.
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderItem = useCallback(
    ({item, index}) => (
      <TrendingPin
        imageUrl={getGalleryUrl(item.imageRef || item.imageUrl)}
        categoryName={item.displayCategoryName || item.categoryName}
        index={index}
        // Index is forwarded so the viewer can open on the right page of the row.
        onPress={() => onItemPress?.(item, index)}
        showSave={showSave}
        saved={isItemSaved ? isItemSaved(item) : false}
        onSavePress={onItemSavePress ? () => onItemSavePress(item) : undefined}
      />
    ),
    [isItemSaved, onItemPress, onItemSavePress, showSave],
  );

  const keyExtractor = useCallback(item => item.id, []);

  // Total scrollable distance: full content width minus one viewport. Approximated from
  // the card metrics rather than measured, which avoids an extra layout pass.
  const scrollExtent =
    items.length * (TRENDING_CARD_WIDTH + CARD_GAP) - CARD_GAP - VIEWPORT_WIDTH;

  if (!isLoading && items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <SectionHeader
        title={
          title ||
          t('home:trendingSectionTitle', {year: new Date().getFullYear()})
        }
      />
      {isLoading ? (
        <TrendingSkeleton styles={styles} />
      ) : (
        <>
          <Animated.FlatList
            horizontal
            data={items}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            initialNumToRender={4}
            maxToRenderPerBatch={6}
            windowSize={5}
            removeClippedSubviews
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {x: scrollX}}}],
              {useNativeDriver: true},
            )}
          />
          {/* A short track with a thumb that tracks scroll position. The row already
              shows a sliver of the next card; this makes "there is more, and you are
              here" explicit without adding chrome over the artwork. Hidden when
              everything already fits. */}
          {items.length > 1 ? (
            <View style={styles.indicatorTrack}>
              <Animated.View
                style={[
                  styles.indicatorThumb,
                  {
                    transform: [
                      {
                        // Mirrored rather than negated: the row itself scrolls
                        // right-to-left under RTL, so scrollX rests at its maximum and
                        // counts down, and the thumb has to travel the other way along a
                        // track whose own ends have already swapped.
                        translateX: scrollX.interpolate({
                          inputRange: [0, Math.max(1, scrollExtent)],
                          outputRange: mirrorScrollDrivenRange([
                            0,
                            INDICATOR_TRACK_WIDTH - INDICATOR_THUMB_WIDTH,
                          ]),
                          extrapolate: 'clamp',
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
          ) : null}
        </>
      )}
    </View>
  );
};

export default TrendingCarousel;
