import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  EmptyState,
  MasonryGrid,
  MasonryPin,
  ScreenContainer,
  ScreenHeader,
  SkeletonBlock,
} from '../../components/ui';
import { useFavorites } from '../../hooks';
import useThemedStyles from '../../hooks/useThemedStyles';
import useToast from '../../hooks/useToast';
import {
  AdEngagementGate,
  InterstitialAdManager,
  SESSION_AD_TRIGGERS,
  resolveFullImageRefs,
} from '../../services';
import { useTheme } from '../../theme/ThemeContext';
import { getGalleryUrl, getViewerFullUrl } from '../../utils/imageRef';
import { createStyles, getPinHeights, getSkeletonLayout } from './styles';

const Favorites = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation(['favorites', 'common']);
  const skeletonLayout = useMemo(() => getSkeletonLayout(theme), [theme]);
  const { favoriteImages, loading, loadFavorites, removeFavorite, toggleFavorite } =
    useFavorites();
  const toast = useToast();
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadFavorites();
    }
  }, [isFocused, loadFavorites]);

  // One interstitial the first time Saved is opened in an app session.
  //
  // The ref latch is what makes this once per session rather than once per focus: this tab
  // is re-focused constantly, and SessionAdGate alone would not stop a second attempt
  // firing before the first ad's consume() has landed. The latch is set to the RESULT of
  // the attempt, so a blocked one (engagement gate not satisfied yet on a fast launch)
  // leaves both the trigger pending and the latch unset, and the next visit tries again
  // rather than losing the ad for the whole session.
  const didAttemptSavedAdRef = useRef(false);
  useEffect(() => {
    if (!isFocused || didAttemptSavedAdRef.current) {
      return;
    }
    didAttemptSavedAdRef.current = InterstitialAdManager.showSessionAd([
      SESSION_AD_TRIGGERS.FIRST_SAVED_VISIT,
    ]);
  }, [isFocused]);

  useEffect(() => {
    if (!loading) {
      setInitialLoading(false);
    }
  }, [loading]);

  const pinHeights = useMemo(() => getPinHeights(theme), [theme]);

  const masonryItems = useMemo(
    () =>
      favoriteImages.map((imageRef, index) => ({
        id: `fav_${getViewerFullUrl(imageRef) || index}`,
        imageRef,
        imageUrl: getGalleryUrl(imageRef),
        favoriteKey: getViewerFullUrl(imageRef),
        height: pinHeights[index % pinHeights.length],
      })),
    [favoriteImages, pinHeights],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, [loadFavorites]);

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor={theme.colors.accent.terracotta}
      colors={[theme.colors.accent.terracotta]}
      progressBackgroundColor={theme.colors.bg.surface}
    />
  );

  const handleImagePress = useCallback(
    async (imageUrl, index) => {
      AdEngagementGate.recordEngagement('favorite_image_open');
      const fullImages = await resolveFullImageRefs(
        masonryItems.map(item => item.imageRef),
      );
      navigation.navigate('ViewImages', {
        image: getViewerFullUrl(fullImages[index]),
        // The saved collection travels with the tap so the viewer can swipe through it.
        images: fullImages,
        initialIndex: index,
      });
    },
    [masonryItems, navigation],
  );

  const handleRemove = useCallback(
    async item => {
      await removeFavorite(item.imageRef);
      toast.show(t('favorites:removedToast'), {
        type: 'info',
        action: {
          label: t('common:undo'),
          // Re-likes the exact key that was removed. toggleFavorite is a no-op for a
          // signed-out user, and this screen is only reachable when signed in.
          onPress: () => toggleFavorite(item.imageRef, item.categoryName),
        },
      });
    },
    [removeFavorite, t, toast, toggleFavorite],
  );

  const renderItem = useCallback(
    ({ item, index }) => (
      <MasonryPin
        imageUrl={item.imageUrl}
        height={item.height}
        index={index}
        showSave
        saved
        onPress={() => handleImagePress(item.favoriteKey, index)}
        onSavePress={() => handleRemove(item)}
      />
    ),
    [handleImagePress, handleRemove],
  );

  return (
    <ScreenContainer edges={[]}>
      {/* ScreenHeader, not SectionHeader: this is a SCREEN title and shares the app-wide
          header implementation, whereas SectionHeader styles in-page sections
          ("Collections", "Trending") that stay at their smaller size. */}
      <ScreenHeader
        title={t('favorites:sectionTitle')}
        subtitle={t('favorites:sectionSubtitle')}
      />

      {initialLoading && loading ? (
        <View style={styles.skeletonWrap}>
          <View style={styles.skeletonMasonryRow}>
            <View style={styles.skeletonColumn}>
              <SkeletonBlock
                width={skeletonLayout.columnWidth}
                height={skeletonLayout.heights.tall}
                borderRadius={skeletonLayout.radius}
              />
              <SkeletonBlock
                width={skeletonLayout.columnWidth}
                height={skeletonLayout.heights.short}
                borderRadius={skeletonLayout.radius}
                style={styles.skeletonGap}
              />
            </View>
            <View style={styles.skeletonColumn}>
              <SkeletonBlock
                width={skeletonLayout.columnWidth}
                height={skeletonLayout.heights.medium}
                borderRadius={skeletonLayout.radius}
              />
              <SkeletonBlock
                width={skeletonLayout.columnWidth}
                height={skeletonLayout.heights.tall}
                borderRadius={skeletonLayout.radius}
                style={styles.skeletonGap}
              />
            </View>
          </View>
        </View>
      ) : favoriteImages.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}>
          <EmptyState
            icon="heart-outline"
            title={t('favorites:emptyTitle')}
            subtitle={t('favorites:emptySubtitle')}
          />
          {/* Without a CTA this screen is a dead end — the user has nothing saved and no
              obvious next step. This sends them straight to the gallery. */}
          {/*
<View style={styles.emptyCtaWrap}>
  <PrimaryButton
    label={t('favorites:emptyExploreCta')}
    onPress={handleExplore}
  />
</View>
*/}
        </ScrollView>
      ) : (
        <FlatList
          data={[1]}
          keyExtractor={() => 'favorites_masonry'}
          renderItem={() => (
            <MasonryGrid
              items={masonryItems}
              renderItem={renderItem}
              keyExtractor={item => item.id}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        />
      )}
    </ScreenContainer>
  );
};

export default Favorites;
