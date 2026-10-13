import React, {useCallback, useMemo, useRef} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {
  EmptyState,
  ScreenContainer,
  ScreenHeader,
  SkeletonBlock,
} from '../../components/ui';
import {BannerAdComponent} from '../../components/ads';
import {isAdsEnabled} from '../../config/admobConfig';
import {
  GALLERY_AD_EVERY_ROWS,
  GALLERY_MASONRY_COLUMNS,
} from '../../constants/admob';
import {useCategoryImages, useFavorites} from '../../hooks';
import useCategoryCatalog from '../../hooks/useCategoryCatalog';
import useThemedStyles from '../../hooks/useThemedStyles';
import {AdEngagementGate, resolveFullImageRefs} from '../../services';
import {useTheme} from '../../theme/ThemeContext';
import {
  buildGalleryRows,
  createGalleryGetItemLayout,
} from '../../utils/buildGalleryRows';
import {
  getFavoriteKey,
  getProgressiveGallerySources,
  getGalleryUrl,
  getViewerFullUrl,
  imageRefKey,
} from '../../utils/imageRef';
import GalleryRow from './GalleryRow';
import {createStyles, getPinHeights, getSkeletonLayout} from './styles';

const SKELETON_LAYOUTS = {
  initial: [
    ['tall', 'short', 'medium'],
    ['medium', 'tall', 'short'],
  ],
  footer: [
    ['tall', 'short', 'medium'],
    ['medium', 'tall', 'short'],
  ],
};

const MasonrySkeleton = ({styles, layout, columns, wrapStyle}) => (
  <View style={wrapStyle}>
    <View style={styles.skeletonMasonryRow}>
      {columns.map((heights, columnIndex) => (
        <View key={`column_${columnIndex}`} style={styles.skeletonColumn}>
          {heights.map((size, rowIndex) => (
            <SkeletonBlock
              key={`${columnIndex}_${size}_${rowIndex}`}
              width={layout.columnWidth}
              height={layout.heights[size]}
              borderRadius={layout.radius}
              style={rowIndex > 0 ? styles.skeletonGap : undefined}
            />
          ))}
        </View>
      ))}
    </View>
  </View>
);

const SCROLL_PREFETCH_THROTTLE_MS = 120;
const SCROLL_END_DISTANCE = 480;
const GALLERY_AD_ITEM_INTERVAL =
  GALLERY_AD_EVERY_ROWS * GALLERY_MASONRY_COLUMNS;

const getStablePinHeight = (stableKey, pinHeights) => {
  if (!stableKey || pinHeights.length === 0) {
    return pinHeights[0];
  }

  let hash = 0;
  for (let i = 0; i < stableKey.length; i += 1) {
    hash = (hash + stableKey.charCodeAt(i)) % pinHeights.length;
  }

  return pinHeights[hash];
};

const CategoriesData = ({route}) => {
  const navigation = useNavigation();
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation('categoriesData');
  const skeletonLayout = useMemo(() => getSkeletonLayout(theme), [theme]);
  const {selectedCategory} = route.params;
  const {categories} = useCategoryCatalog();
  const {categoryTitle, categoryDescription} = useMemo(() => {
    const match = categories.find(
      category => category.name === selectedCategory,
    );
    return {
      categoryTitle: match?.displayName || selectedCategory,
      categoryDescription: match?.description || '',
    };
  }, [categories, selectedCategory]);
  const lastPrefetchAtRef = useRef(0);

  const {
    loadedImages,
    loadingMore,
    isInitialLoading,
    loadingComplete,
    loadMore,
    refreshing,
    refresh,
    hasError,
  } = useCategoryImages(selectedCategory);

  // The gallery, Saved, and the viewer share the same device-local favorites store.
  const {favorites, toggleFavorite} = useFavorites();

  const pinHeights = useMemo(() => getPinHeights(theme), [theme]);

  const masonryItems = useMemo(
    () =>
      loadedImages
        .filter(imageRef => imageRef?.fullUrl)
        .map(imageRef => {
          const stableKey = imageRefKey(imageRef);
          const sources = getProgressiveGallerySources(imageRef);
          const fallbackUrl = getGalleryUrl(imageRef);

          return {
            id: stableKey,
            imageRef,
            cacheKey: sources?.cacheKey || fallbackUrl,
            thumbnailUrl: sources?.thumbnailUrl || fallbackUrl,
            height: getStablePinHeight(stableKey, pinHeights),
          };
        }),
    [loadedImages, pinHeights],
  );

  const galleryRows = useMemo(
    () =>
      buildGalleryRows(
        masonryItems,
        isAdsEnabled ? GALLERY_AD_ITEM_INTERVAL : 0,
      ),
    [masonryItems],
  );

  const loadingPlaceholderRows = useMemo(() => {
    if (!loadingMore) return [];
    return [
      {key: 'loading_placeholder_1', type: 'skeleton'},
      {key: 'loading_placeholder_2', type: 'skeleton'},
    ];
  }, [loadingMore]);

  const listRows = useMemo(
    () => [...galleryRows, ...loadingPlaceholderRows],
    [galleryRows, loadingPlaceholderRows],
  );

  const getItemLayout = useMemo(
    () => createGalleryGetItemLayout(listRows),
    [listRows],
  );

  const handleImagePress = useCallback(
    async (imageRef, index) => {
      AdEngagementGate.recordEngagement('gallery_image_open');
      const fullImages = await resolveFullImageRefs(
        masonryItems.map(item => item.imageRef),
      );
      const resolvedImage = fullImages[index] || imageRef;
      navigation.navigate('ViewImages', {
        image: getViewerFullUrl(resolvedImage),
        imageRef: resolvedImage,
        categoryName: selectedCategory,
        // The currently loaded page of the gallery travels with the tap so the viewer can
        // swipe through it. This is a snapshot: images loaded by a later loadMore() are not
        // added to an already-open viewer, so a swipe stops at the last image that had been
        // fetched when the user tapped.
        images: fullImages,
        initialIndex: index,
      });
    },
    [masonryItems, navigation, selectedCategory],
  );

  const handleToggleFavorite = useCallback(
    item => {
      const favoriteKey = getFavoriteKey(item.imageRef);
      if (!favoriteKey) {
        return;
      }
      AdEngagementGate.recordEngagement('favorite_toggle');
      toggleFavorite(item.imageRef, selectedCategory);
    },
    [selectedCategory, toggleFavorite],
  );

  const getPinProps = useCallback(
    (item, index) => ({
      cacheKey: item.cacheKey,
      primaryUrl: item.thumbnailUrl,
      height: item.height,
      index,
      skipEntrance: true,
      priority:
        index < 12 ? FastImage.priority.high : FastImage.priority.normal,
      onPress: () => handleImagePress(item.imageRef, index),
      showSave: true,
      // Derived from the live favourites list, so an already-saved design renders as
      // selected the moment the screen mounts.
      saved: favorites.includes(getFavoriteKey(item.imageRef)),
      onSavePress: () => handleToggleFavorite(item),
    }),
    [favorites, handleImagePress, handleToggleFavorite],
  );

  const renderGalleryRow = useCallback(
    ({item: row}) => {
      if (row.type === 'ad') {
        return <BannerAdComponent style={styles.galleryAd} />;
      }

      if (row.type === 'skeleton') {
        return (
          <View style={styles.skeletonListItem}>
            <MasonrySkeleton
              styles={styles}
              layout={skeletonLayout}
              columns={SKELETON_LAYOUTS.footer}
              wrapStyle={styles.skeletonWrap}
            />
          </View>
        );
      }

      return (
        <GalleryRow
          row={row}
          styles={styles}
          startIndex={row.startIndex}
          getPinProps={getPinProps}
        />
      );
    },
    [getPinProps, styles, skeletonLayout],
  );

  const handleLoadMore = useCallback(() => {
    if (!loadingComplete && !loadingMore) {
      loadMore();
    }
  }, [loadMore, loadingComplete, loadingMore]);

  const maybePrefetchNextBatch = useCallback(
    (layoutMeasurement, contentOffset, contentSize) => {
      if (loadingComplete || loadingMore || contentSize.height <= 0) {
        return;
      }

      const now = Date.now();
      if (now - lastPrefetchAtRef.current < SCROLL_PREFETCH_THROTTLE_MS) {
        return;
      }

      const visibleBottom = contentOffset.y + layoutMeasurement.height;
      const distanceFromBottom = contentSize.height - visibleBottom;

      if (distanceFromBottom < SCROLL_END_DISTANCE) {
        lastPrefetchAtRef.current = now;
        loadMore();
      }
    },
    [loadMore, loadingComplete, loadingMore],
  );

  const handleScroll = useCallback(
    event => {
      const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
      maybePrefetchNextBatch(layoutMeasurement, contentOffset, contentSize);
    },
    [maybePrefetchNextBatch],
  );

  const renderFooter = useCallback(() => {
    if (loadingComplete) {
      return <View style={styles.footerSpacer} />;
    }

    if (!loadingMore) {
      return null;
    }

    return (
      <MasonrySkeleton
        styles={styles}
        layout={skeletonLayout}
        columns={SKELETON_LAYOUTS.footer}
        wrapStyle={styles.footerLoader}
      />
    );
  }, [loadingComplete, loadingMore, skeletonLayout, styles]);

  const listExtraData = useMemo(
    () => ({
      count: masonryItems.length,
      loadingMore,
      loadingComplete,
    }),
    [loadingComplete, loadingMore, masonryItems.length],
  );

  return (
    <ScreenContainer edges={[]}>
      <ScreenHeader
        title={categoryTitle}
        subtitle={categoryDescription || undefined}
        onBack={() => navigation.goBack()}
      />

      {masonryItems.length === 0 ? (
        isInitialLoading ? (
          <MasonrySkeleton
            styles={styles}
            layout={skeletonLayout}
            columns={SKELETON_LAYOUTS.initial}
            wrapStyle={styles.skeletonWrap}
          />
        ) : (
          // Rendered inside a scrollable so pull-to-refresh still works with nothing on
          // screen — otherwise an error or empty result would be a dead end.
          <FlatList
            data={[]}
            keyExtractor={() => 'placeholder'}
            renderItem={null}
            contentContainerStyle={styles.emptyScrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor={theme.colors.accent.terracotta}
                colors={[theme.colors.accent.terracotta]}
                progressBackgroundColor={theme.colors.bg.surface}
              />
            }
            ListEmptyComponent={
              hasError ? (
                <EmptyState
                  icon="alert-circle-outline"
                  title={t('categoriesData:errorTitle')}
                  subtitle={t('categoriesData:errorSubtitle')}
                />
              ) : (
                <EmptyState
                  icon="images-outline"
                  title={t('categoriesData:emptyTitle')}
                  subtitle={t('categoriesData:emptySubtitle', {
                    category: categoryTitle,
                  })}
                />
              )
            }
          />
        )
      ) : (
        <View style={styles.contentFill}>
          <FlatList
            style={styles.list}
            data={listRows}
            extraData={listExtraData}
            getItemLayout={getItemLayout}
            keyExtractor={item => item.key}
            renderItem={renderGalleryRow}
            contentContainerStyle={styles.listContent}
            removeClippedSubviews={false}
            initialNumToRender={10}
            maxToRenderPerBatch={8}
            windowSize={21}
            updateCellsBatchingPeriod={30}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor={theme.colors.accent.terracotta}
                colors={[theme.colors.accent.terracotta]}
                progressBackgroundColor={theme.colors.bg.surface}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.2}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onMomentumScrollEnd={handleScroll}
            onScrollEndDrag={handleScroll}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </ScreenContainer>
  );
};

export default CategoriesData;
