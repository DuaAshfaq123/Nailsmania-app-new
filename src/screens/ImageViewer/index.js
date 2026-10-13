import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  BackHandler,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FastImage from '@d11/react-native-fast-image';
import ImageViewing from 'react-native-image-viewing';
import {useTranslation} from 'react-i18next';
import {GlassSurface, ToastHost} from '../../components/ui';
import {Icons} from '../../constants';
import {useFavorites, useImageDownload, useImageShare} from '../../hooks';
import useThemedStyles from '../../hooks/useThemedStyles';
import {
  AdEngagementGate,
  CACHE_TIER,
  InterstitialAdManager,
  SESSION_AD_TRIGGERS,
  cacheImage,
} from '../../services';
import {useTheme} from '../../theme/ThemeContext';
import {
  getFavoriteKey,
  getViewerProgressiveSources,
  resolveRouteImageIndex,
  resolveRouteImageList,
} from '../../utils/imageRef';
import {directionalIconName} from '../../utils/rtl';
import {createStyles} from './styles';

const ROTATION_STEP = 90;

const ViewImages = ({route}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation('imageViewer');
  const [contentVisible, setContentVisible] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(true);
  const [viewerMountKey, setViewerMountKey] = useState(0);
  const controlsOpacity = useRef(new Animated.Value(0)).current;
  const didReportVisibleRef = useRef(false);
  const didAttemptSessionAdRef = useRef(false);
  const prevRotationRef = useRef(0);
  const {categoryName = 'Featured', adSource} = route.params ?? {};

  const imagesRef = useRef(null);
  if (imagesRef.current === null) {
    imagesRef.current = resolveRouteImageList(route.params);
  }
  const images = imagesRef.current;

  const [activeIndex, setActiveIndex] = useState(() =>
    resolveRouteImageIndex(route.params, images),
  );
  // Stable for the lifetime of one ImageViewing mount. The library remounts when
  // `imageIndex` changes (key={imageIndex}), so we only refresh this when returning
  // from the rotated FastImage fallback.
  const viewerStartIndexRef = useRef(activeIndex);

  const imageRef = images[activeIndex] ?? null;
  const viewerSources = useMemo(
    () => getViewerProgressiveSources(imageRef),
    [imageRef],
  );
  const fullUrl = viewerSources?.primaryUrl || imageRef?.fullUrl || '';
  const favoriteKey = getFavoriteKey(imageRef) || fullUrl;

  const {favorites, toggleFavorite} = useFavorites();
  const {downloadProgress, downloading, downloadComplete, startDownload} =
    useImageDownload();
  const {isSharing, shareImage} = useImageShare();
  const favorited = favorites.includes(favoriteKey);

  const viewingImages = useMemo(
    () =>
      images
        .map(item => item?.fullUrl)
        .filter(Boolean)
        .map(uri => ({uri})),
    [images],
  );

  useEffect(() => {
    if (!fullUrl) {
      return undefined;
    }
    InterstitialAdManager.beginImageView();
    return () => {
      InterstitialAdManager.endImageView();
    };
  }, [fullUrl]);

  useEffect(() => {
    if (fullUrl) {
      cacheImage(fullUrl, CACHE_TIER.FULL).catch(() => {});
    }
  }, [fullUrl]);

  // Warm FastImage's native cache for the active image and its neighbours so
  // swipes land on already-decoded frames.
  useEffect(() => {
    if (!viewingImages.length) {
      return;
    }
    const start = Math.max(0, activeIndex - 1);
    const end = Math.min(viewingImages.length, activeIndex + 2);
    const window = viewingImages.slice(start, end);
    FastImage.preload(
      window.map(image => ({
        ...image,
        priority: FastImage.priority.high,
        cache: FastImage.cacheControl.immutable,
      })),
    );
  }, [activeIndex, viewingImages]);

  useEffect(() => {
    didReportVisibleRef.current = false;
    setRotation(0);
  }, [fullUrl, viewerSources?.previewUrl]);

  // Re-enter ImageViewing on the same page after the user finishes a 360° rotate
  // cycle (or lands back on 0°). Without remounting at activeIndex, the library
  // would reopen on the original playlist index.
  useEffect(() => {
    if (prevRotationRef.current !== 0 && rotation === 0) {
      viewerStartIndexRef.current = activeIndex;
      setViewerMountKey(key => key + 1);
    }
    prevRotationRef.current = rotation;
  }, [activeIndex, rotation]);

  useEffect(() => {
    if (!downloadComplete) {
      return undefined;
    }
    InterstitialAdManager.tryShowAtNaturalBreak('post_download');
  }, [downloadComplete]);

  useEffect(() => {
    if (contentVisible) {
      Animated.timing(controlsOpacity, {
        toValue: 1,
        duration: theme.motion.duration.normal,
        useNativeDriver: true,
      }).start();
    }
  }, [contentVisible, controlsOpacity, theme.motion.duration.normal]);

  const handleGoBack = useCallback(() => {
    setViewerVisible(false);
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleGoBack();
        return true;
      },
    );
    return () => subscription.remove();
  }, [handleGoBack]);

  const handleFavoritePress = useCallback(() => {
    AdEngagementGate.recordEngagement('favorite_toggle');
    toggleFavorite(imageRef, categoryName);
  }, [categoryName, imageRef, toggleFavorite]);

  const handleDownloadPress = useCallback(() => {
    startDownload(fullUrl);
  }, [fullUrl, startDownload]);

  const handleRotatePress = useCallback(() => {
    AdEngagementGate.recordEngagement('rotate_image');
    setRotation(current => (current + ROTATION_STEP) % 360);
  }, []);

  const handleSharePress = useCallback(() => {
    shareImage(fullUrl);
  }, [fullUrl, shareImage]);

  const handleContentVisible = useCallback(() => {
    if (didReportVisibleRef.current) {
      return;
    }
    didReportVisibleRef.current = true;
    setContentVisible(true);
    AdEngagementGate.recordEngagement('image_viewed');

    if (didAttemptSessionAdRef.current) {
      return;
    }

    const triggers = [SESSION_AD_TRIGGERS.FIRST_FULL_VIEW];
    if (adSource === 'home') {
      triggers.push(SESSION_AD_TRIGGERS.HOME_DESIGN_FULL_VIEW);
    }
    didAttemptSessionAdRef.current =
      InterstitialAdManager.showSessionAd(triggers);
  }, [adSource]);

  const handleIndexChange = useCallback(
    index => {
      setActiveIndex(index);
      handleContentVisible();
    },
    [handleContentVisible],
  );

  useEffect(() => {
    // First paint: image-viewing does not expose onLoad to the screen, so mark
    // the open image visible once the modal is up and the uri is known.
    if (fullUrl && viewerVisible) {
      const timer = setTimeout(handleContentVisible, 120);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [fullUrl, handleContentVisible, viewerVisible]);

  const safeBottom = Math.max(insets.bottom, theme.spacing.sm);
  const bottomBarBottom = safeBottom + theme.spacing.lg;

  const actionColors = useMemo(
    () => ({
      save: favorited
        ? theme.colors.semantic.favorite
        : theme.colors.accent.nail,
      download: theme.colors.accent.gold,
      rotate: theme.colors.accent.saffron,
      share: theme.colors.accent.terracotta,
      disabled: theme.colors.text.tertiary,
    }),
    [favorited, theme.colors],
  );

  const renderHeader = useCallback(
    ({imageIndex} = {}) => {
      const currentIndex =
        typeof imageIndex === 'number' ? imageIndex : activeIndex;

      return (
        <View style={[styles.topBar, {top: insets.top + theme.spacing.sm}]}>
          <GlassSurface
            borderRadius={theme.radius.pill}
            blurAmount={24}
            shadow="none"
            intensity="strong"
            style={styles.iconButton}>
            <TouchableOpacity
              onPress={handleGoBack}
              style={styles.iconButtonInner}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('imageViewer:goBackLabel')}>
              <Icons.Ionicons
                name={directionalIconName('arrow-back')}
                size={22}
                color={theme.colors.accent.gold}
              />
            </TouchableOpacity>
          </GlassSurface>

          <View style={styles.counterSlot} pointerEvents="none">
            {images.length > 1 ? (
              <GlassSurface
                borderRadius={theme.radius.pill}
                blurAmount={24}
                shadow="none"
                intensity="strong"
                style={styles.counterPill}>
                <Text style={styles.counterLabel}>
                  {t('imageViewer:pagerCounter', {
                    current: currentIndex + 1,
                    total: images.length,
                  })}
                </Text>
              </GlassSurface>
            ) : null}
          </View>

          <View style={styles.counterSpacer} />
        </View>
      );
    },
    [
      activeIndex,
      handleGoBack,
      images.length,
      insets.top,
      styles,
      t,
      theme.colors.accent.gold,
      theme.radius.pill,
      theme.spacing.sm,
    ],
  );

 
  const renderModalHeader = useCallback(
    headerProps => (
      <>
        {renderHeader(headerProps)}
        <ToastHost />
      </>
    ),
    [renderHeader],
  );

  const renderFooter = useCallback(() => {
    if (!contentVisible) {
      return null;
    }

    return (
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.bottomBarWrap,
          {opacity: controlsOpacity, bottom: bottomBarBottom},
        ]}>
        <GlassSurface
          borderRadius={theme.radius.xl}
          blurAmount={30}
          intensity="strong"
          shadow="float"
          style={styles.bottomBarSurface}
          contentStyle={styles.bottomBar}>
          <TouchableOpacity
            onPress={handleFavoritePress}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel={
              favorited
                ? t('imageViewer:removeFromSavedLabel')
                : t('imageViewer:saveImageLabel')
            }>
            <Icons.Ionicons
              name={favorited ? 'heart' : 'heart-outline'}
              size={22}
              color={actionColors.save}
            />
            <Text style={[styles.actionLabel, {color: actionColors.save}]}>
              {favorited
                ? t('imageViewer:savedLabel')
                : t('imageViewer:saveLabel')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDownloadPress}
            style={styles.actionButton}
            disabled={downloading}
            accessibilityRole="button"
            accessibilityLabel={
              downloading
                ? t('imageViewer:downloadingPercentLabel', {
                    percent: downloadProgress,
                  })
                : t('imageViewer:downloadImageLabel')
            }>
            <Icons.MaterialCommunityIcons
              name="download-outline"
              size={22}
              color={
                downloading ? actionColors.disabled : actionColors.download
              }
            />
            <Text
              style={[
                styles.actionLabel,
                {
                  color: downloading
                    ? actionColors.disabled
                    : actionColors.download,
                },
              ]}>
              {downloading
                ? `${downloadProgress}%`
                : t('imageViewer:downloadLabel')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRotatePress}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel={t('imageViewer:rotateImageLabel')}>
            <Icons.MaterialIcons
              name="rotate-right"
              size={22}
              color={actionColors.rotate}
            />
            <Text style={[styles.actionLabel, {color: actionColors.rotate}]}>
              {rotation ? `${rotation}°` : t('imageViewer:rotateLabel')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSharePress}
            style={styles.actionButton}
            disabled={isSharing}
            accessibilityRole="button"
            accessibilityLabel={
              isSharing
                ? t('imageViewer:sharingImageLabel')
                : t('imageViewer:shareImageLabel')
            }>
            <Icons.Ionicons
              name="share-social-outline"
              size={22}
              color={isSharing ? actionColors.disabled : actionColors.share}
            />
            <Text
              style={[
                styles.actionLabel,
                {
                  color: isSharing ? actionColors.disabled : actionColors.share,
                },
              ]}>
              {isSharing
                ? t('imageViewer:sharingLabel')
                : t('imageViewer:shareLabel')}
            </Text>
          </TouchableOpacity>

        </GlassSurface>

      
        {downloadComplete ? (
          <View style={styles.doneBadge} pointerEvents="none">
            <Icons.MaterialIcons
              name="done"
              size={18}
              color={theme.colors.semantic.success}
            />
          </View>
        ) : null}
      </Animated.View>
    );
  }, [
    actionColors,
    bottomBarBottom,
    contentVisible,
    controlsOpacity,
    downloadComplete,
    downloadProgress,
    downloading,
    favorited,
    handleDownloadPress,
    handleFavoritePress,
    handleRotatePress,
    handleSharePress,
    isSharing,
    rotation,
    styles,
    t,
    theme.colors.semantic.success,
    theme.radius.xl,
  ]);

  if (!fullUrl || !viewingImages.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/*
        When the user rotates, ImageViewing cannot apply a CSS rotate to its
        internal pager without breaking horizontal swipe. Fall back to a single
        FastImage frame for the active design; swipe resumes after rotation resets
        on the next image change.
      */}
      {rotation !== 0 ? (
        <>
          <View style={styles.imageStage}>
            <FastImage
              source={{
                uri: fullUrl,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
              }}
              style={[
                styles.imageFill,
                {transform: [{rotate: `${rotation}deg`}]},
              ]}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
          {renderHeader()}
          {renderFooter()}
        </>
      ) : (
        <ImageViewing
          key={viewerMountKey}
          images={viewingImages}
          imageIndex={viewerStartIndexRef.current}
          visible={viewerVisible}
          onRequestClose={handleGoBack}
          onImageIndexChange={handleIndexChange}
          animationType="none"
          presentationStyle="overFullScreen"
          backgroundColor={theme.colors.bg.base}
          swipeToCloseEnabled={false}
          doubleTapToZoomEnabled
          HeaderComponent={renderModalHeader}
          FooterComponent={renderFooter}
        />
      )}
    </View>
  );
};

export default ViewImages;
