import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Animated, RefreshControl, Text, View} from 'react-native';
// Imported under its own name so RN's Animated (which still drives the existing
// contentOpacity fade) keeps working untouched alongside it.
import Reanimated from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {BannerAdComponent} from '../../components/ads';
import {isAdsEnabled} from '../../config/admobConfig';
import {
  CategoryMasonryCard,
  CatalogDownloadPanel,
  FilterChips,
  MasonryGrid,
  ScreenContainer,
  SearchBar,
  SearchModal,
  SectionHeader,
  ThemeToggleButton,
  TrendingCarousel,
  TrendingPin,
} from '../../components/ui';
import {HOME_BANNER_MIN_SCROLL_Y} from '../../constants/admob';
import useCategoryCatalog from '../../hooks/useCategoryCatalog';
import useCatalogPackProgress from '../../hooks/useCatalogPackProgress';
import useCollapsibleHeader from '../../hooks/useCollapsibleHeader';
import {useFavorites} from '../../hooks';
import useRandomDesigns from '../../hooks/useRandomDesigns';
import useThemedStyles from '../../hooks/useThemedStyles';
import {AdEngagementGate, resolveFullImageRefs} from '../../services';
import {useTheme} from '../../theme/ThemeContext';
import {debugLog} from '../../utils/debugLog';
import {getFavoriteKey, getViewerFullUrl} from '../../utils/imageRef';
import {hideBootSplash} from '../../utils/hideBootSplash';
import {
  ALL_CHIP,
  buildCategoryMasonryItems,
  filterCategoriesByChip,
  filterTrendingByChip,
  pickRandomSearchChips,
} from './constants';
import {createStyles} from './styles';

const Home = () => {
  const navigation = useNavigation();
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const {t} = useTranslation(['common', 'home']);
  const [searchVisible, setSearchVisible] = useState(false);
  const [trendingSearchChips, setTrendingSearchChips] = useState([]);
  const [selectedChip, setSelectedChip] = useState(ALL_CHIP);
  const [refreshing, setRefreshing] = useState(false);
  const [hasScrolledForAds, setHasScrolledForAds] = useState(false);
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const {
    items: randomItems,
    isLoading: randomLoading,
    refresh: refreshRandom,
  } = useRandomDesigns();

  // Shared device-local favorites; the stable design id is used on every screen.
  const {favorites, toggleFavorite} = useFavorites();

  const isTrendingItemSaved = useCallback(
    item => favorites.includes(getFavoriteKey(item.imageRef || item.imageUrl)),
    [favorites],
  );

  const handleTrendingSavePress = useCallback(
    item => {
      const favoriteKey = getFavoriteKey(item.imageRef || item.imageUrl);
      if (!favoriteKey) {
        return;
      }
      AdEngagementGate.recordEngagement('favorite_toggle');
      toggleFavorite(item.imageRef || item.imageUrl, item.categoryName);
    },
    [toggleFavorite],
  );

  // Categories come from the packaged catalog.
  const {
    categories,
    filterChips,
    isLoading: catalogLoading,
    hasError: catalogError,
    refresh: refreshCatalog,
  } = useCategoryCatalog();
  const {thumbs, thumbsActive, thumbsFailed, thumbsFraction} =
    useCatalogPackProgress();

  // Chrome is usable without the thumbs pack; keep the splash from hiding the
  // download progress on first launch after a store install.
  useEffect(() => {
    hideBootSplash();
  }, []);

  const allCategoryItems = useMemo(
    () => buildCategoryMasonryItems(categories),
    [categories],
  );

  const filteredCategories = useMemo(
    () => filterCategoriesByChip(allCategoryItems, selectedChip),
    [allCategoryItems, selectedChip],
  );

  const filteredTrendingItems = useMemo(
    () =>
      filterTrendingByChip(randomItems, selectedChip).map(item => ({
        ...item,
        displayCategoryName:
          categories.find(category => category.name === item.categoryName)
            ?.displayName || item.categoryName,
      })),
    [categories, randomItems, selectedChip],
  );

  const showTrending = randomLoading || filteredTrendingItems.length > 0;

  useEffect(() => {
    if (!searchVisible) {
      return;
    }
    setTrendingSearchChips(pickRandomSearchChips(filterChips));
  }, [filterChips, searchVisible]);

  useEffect(() => {
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: theme.motion.duration.normal,
      useNativeDriver: true,
    }).start();
  }, [contentOpacity, theme.motion.duration.normal]);

  const navigateToCategory = useCallback(
    categoryName => {
      if (categoryName === ALL_CHIP) {
        return;
      }
      AdEngagementGate.recordEngagement('category_open');
      debugLog('Home', `Navigating to category "${categoryName}"`);
      navigation.navigate('CategoriesData', {selectedCategory: categoryName});
    },
    [navigation],
  );

  const handleTrendingPress = useCallback(
    async (item, index) => {
      AdEngagementGate.recordEngagement('trending_image_open');
      const fullImages = await resolveFullImageRefs(
        filteredTrendingItems.map(entry => entry.imageRef || entry.imageUrl),
      );
      const resolvedImage = fullImages[index] || item.imageRef || item.imageUrl;
      navigation.navigate('ViewImages', {
        image: getViewerFullUrl(resolvedImage),
        imageRef: resolvedImage,
        categoryName: item.categoryName,
        // The whole trending row travels with the tap so the viewer can swipe through it.
        // `image`/`imageRef` above still identify the tapped design and are what the viewer
        // resolves its opening page from — initialIndex is only a fallback hint.
        images: fullImages,
        initialIndex: index,
        // Marks this as the Home -> design flow, which owns its own once-per-session ad.
        adSource: 'home',
      });
    },
    [filteredTrendingItems, navigation],
  );

  // The scroll ad latch. Scroll now runs through a Reanimated worklet on the UI thread, so
  // this crosses to JS AT MOST ONCE per screen mount — the hook's own shared-value latch
  // guarantees it. That preserves the property the previous hand-written handler existed to
  // protect: this used to call recordEngagement() and setState on every frame past the
  // threshold, which put a console.log bridge crossing plus a React state update per
  // mounted banner on every single scroll frame, and since the JS thread is also what RN
  // dispatches touches on, the whole screen stopped responding while the user scrolled.
  // The ref is belt-and-braces in case React remounts the callback identity.
  const hasRecordedScrollRef = useRef(false);
  const handleScrolledPastThreshold = useCallback(() => {
    if (hasRecordedScrollRef.current) {
      return;
    }
    hasRecordedScrollRef.current = true;
    AdEngagementGate.recordEngagement('home_scroll');
    setHasScrolledForAds(true);
  }, []);

  const {
    scrollHandler,
    animatedStyle: chipsAnimatedStyle,
    onContentLayout: onChipsLayout,
    isMeasured: chipsMeasured,
    expand: expandChips,
    syncScrollable,
  } = useCollapsibleHeader({
    oneShotOffset: HOME_BANNER_MIN_SCROLL_Y,
    oneShotCallback: handleScrolledPastThreshold,
  });

  const handleChipSelect = useCallback(
    chip => {
      AdEngagementGate.recordEngagement('filter_chip');
      setSelectedChip(chip);
      // Switching category replaces everything below, and the collection can be short
      // enough not to scroll — bring the bar back so it can never be stranded hidden.
      expandChips();
    },
    [expandChips],
  );

  const handleRefresh = useCallback(async () => {
    expandChips();
    setRefreshing(true);
    await refreshRandom();
    setRefreshing(false);
  }, [expandChips, refreshRandom]);

  // Content shorter than the viewport (empty or heavily filtered results) cannot be
  // scrolled back up, so the bar is forced open in that case.
  const viewportHeightRef = useRef(0);
  const handleScrollViewLayout = useCallback(event => {
    viewportHeightRef.current = event.nativeEvent.layout.height;
  }, []);
  const handleContentSizeChange = useCallback(
    (_width, height) => {
      syncScrollable(height, viewportHeightRef.current);
    },
    [syncScrollable],
  );

  const renderCategoryCard = useCallback(
    ({item, index}) => (
      <CategoryMasonryCard
        title={item.displayName || item.name}
        subtitle={item.description}
        thumbnail={item.thumbnail}
        height={item.height}
        index={index}
        onPress={() => navigateToCategory(item.name)}
      />
    ),
    [navigateToCategory],
  );

  // With a real category picked, the collection below the chips is that one category, and
  // the two-column masonry is the wrong frame for a single tile. It renders as a Trending
  // card instead — the actual TrendingPin, in its full-width variant, so the card design,
  // image treatment, radius, label typography and entrance animation are the Trending
  // section's by construction rather than by copied values.
  //
  // "All" is unchanged: it still gets the masonry grid it has always had. Nothing here
  // touches which categories are shown — filteredCategories is the same list either way.
  const showCollectionAsTrendingCards = selectedChip !== ALL_CHIP;

  // Deliberately keyed off catalogLoading and NOT off a native progress event having
  // arrived. A store install can leave the catalog loading for minutes with no event to
  // show for it — the pack's state may not change while Play queues it, and any event
  // emitted before this screen subscribed is gone (device events are not buffered). That
  // combination used to render as an empty Home: no panel, no error, no collections.
  const showCatalogPanel =
    thumbsActive || thumbsFailed || catalogError || catalogLoading;
  const catalogPanelStatus = (() => {
    if (catalogError || thumbsFailed) {
      return 'failed';
    }
    if (thumbs?.status && thumbs.status !== 'completed') {
      return thumbs.status;
    }
    // Pack is on disk but the catalog is still being read, so this is no longer a
    // download. Without any pack news at all, treat it as a download not yet reporting.
    return thumbs?.status === 'completed' ? 'transferring' : 'pending';
  })();

  return (
    <ScreenContainer edges={[]}>
      {/*
        Rendered as a sibling ABOVE the ScrollView rather than as its first child with
        stickyHeaderIndices={[0]}.

        Visually this is identical: a sticky header at index 0 is pinned from the very
        first pixel of scroll, so it never scrolled away to begin with. What changes is
        that it is no longer wrapped in RN's ScrollViewStickyHeader, and that wrapper was
        the bug. It pins the header with a native-driven Animated translateY that updates
        every frame, but under Fabric (newArchEnabled=true) it only feeds that offset into
        the ShadowTree through a debounced setState — 15ms on Android, see
        animatedValueListener in ScrollViewStickyHeader.js. Android resolves these taps
        against the ShadowTree, so it hit-tested the header at its stale/untranslated
        position — off-screen above once scrolled — and every tap on the search bar and
        the filter chips fell through. Scroll offset 0 meant translateY 0 and no desync,
        which is why pull-to-refresh appeared to "fix" it until the next scroll.

        The category cards were never affected because they live outside the sticky
        wrapper and carry no transform.
      */}
      <View
        style={[styles.header, {paddingTop: insets.top + theme.spacing.xs}]}>
        <View style={styles.brandHeader}>
          <View style={styles.brandTextWrap}>
            <Text style={styles.brandTitle}>{t('home:brandTitle')}</Text>
            <Text style={styles.brandEyebrow}>{t('home:brandEyebrow')}</Text>
          </View>
          <ThemeToggleButton style={styles.themeToggleWrap} />
        </View>

        <SearchBar onPress={() => setSearchVisible(true)} />

        {/*
          Instagram-style collapse: hidden while scrolling down, restored on scroll up.

          The outer Animated.View owns the animated HEIGHT (never a transform — see
          useCollapsibleHeader for why a transform is unsafe on this exact row) and clips
          with overflow:hidden. The inner View is what gets measured, and it keeps its
          natural size throughout, so the chips are never re-laid-out mid-animation and
          their hit boxes always match what is painted.

          The search bar and the brand block above are deliberately NOT collapsed: only the
          category bar was asked for, and keeping search permanently reachable is the point
          of it being outside the scroll view.
        */}
        <Reanimated.View
          style={[
            styles.chipsCollapsible,
            // The animated height is applied only once the row's natural height has been
            // measured. Applying it on the first frame would clamp the height to 0 (the
            // initial measuredHeight) and the chips would never be measurable at all.
            chipsMeasured ? chipsAnimatedStyle : null,
          ]}>
          <View onLayout={onChipsLayout}>
            <FilterChips
              chips={filterChips}
              selectedChip={selectedChip}
              onChipSelect={handleChipSelect}
            />
          </View>
        </Reanimated.View>
      </View>

      <Reanimated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        // Reanimated worklet: runs on the UI thread, so the ~60Hz scroll stream never
        // reaches JS. The one-shot ad latch inside it crosses to JS exactly once.
        onScroll={scrollHandler}
        onLayout={handleScrollViewLayout}
        onContentSizeChange={handleContentSizeChange}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.accent.terracotta}
            colors={[theme.colors.accent.terracotta]}
            progressBackgroundColor={theme.colors.bg.surface}
          />
        }>
        <Animated.View style={{opacity: contentOpacity}}>
          {showCatalogPanel ? (
            <CatalogDownloadPanel
              packName="thumbs"
              status={catalogPanelStatus}
              fraction={thumbsFraction}
              onRetry={refreshCatalog}
            />
          ) : null}

          {showTrending ? (
            <TrendingCarousel
              items={filteredTrendingItems}
              title={t('home:randomSectionTitle', {
                defaultValue: 'Discover designs',
              })}
              showSave
              isItemSaved={isTrendingItemSaved}
              onItemSavePress={handleTrendingSavePress}
              isLoading={randomLoading}
              onItemPress={handleTrendingPress}
            />
          ) : null}

          <SectionHeader title={t('home:collectionsSectionTitle')} />
          {showCollectionAsTrendingCards ? (
            <View style={styles.collectionList}>
              {filteredCategories.map((item, index) => (
                <TrendingPin
                  key={item.id}
                  fullWidth
                  imageUrl={item.thumbnail?.uri}
                  categoryName={item.displayName || item.name}
                  index={index}
                  onPress={() => navigateToCategory(item.name)}
                />
              ))}
            </View>
          ) : (
            <MasonryGrid
              items={filteredCategories}
              renderItem={renderCategoryCard}
              keyExtractor={item => item.id}
            />
          )}

          {isAdsEnabled && hasScrolledForAds ? (
            <BannerAdComponent style={styles.adBannerBottom} />
          ) : null}
        </Animated.View>
      </Reanimated.ScrollView>

      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        categories={filterChips}
        trendingSearches={trendingSearchChips}
        onCategorySelect={navigateToCategory}
      />
    </ScreenContainer>
  );
};

export default Home;
