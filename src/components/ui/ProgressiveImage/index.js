import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Animated, View} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import {Icons} from '../../../constants';
import {useProgressiveImage} from '../../../hooks/useProgressiveImage';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {useTheme} from '../../../theme/ThemeContext';
import SkeletonBlock from '../SkeletonBlock';
import {createStyles} from './styles';

const CROSSFADE_MS = 220;

const ProgressiveImage = ({
  mode = 'gallery',
  cacheKey,
  primaryUrl,
  previewUrl,
  height,
  fill = false,
  priority = FastImage.priority.normal,
  borderRadius,
  resizeMode = FastImage.resizeMode.cover,
  onVisible,
}) => {
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [fadeComplete, setFadeComplete] = useState(false);
  const primaryOpacity = useRef(new Animated.Value(0)).current;
  const didReportVisibleRef = useRef(false);

  const {
    resolvedPrimaryUri,
    resolvedPreviewUri,
    hasError,
    showSkeleton,
    showPreview,
    showPrimaryUpgrade,
    hasVisibleContent,
    isPrimaryReady,
    isPreviewReady,
    handlePreviewLoadEnd,
    handlePrimaryLoadEnd,
    handleError,
  } = useProgressiveImage({mode, cacheKey, primaryUrl, previewUrl});

  const radius = borderRadius ?? theme.radius.xl;
  const isViewer = mode === 'viewer';
  const hasDistinctPreview =
    Boolean(previewUrl?.trim()) &&
    previewUrl.trim() !== primaryUrl?.trim();

  const hidePrimaryUntilReady =
    isViewer && hasDistinctPreview && !isPrimaryReady;

  useEffect(() => {
    didReportVisibleRef.current = false;
    setFadeComplete(false);
    primaryOpacity.setValue(0);
  }, [cacheKey, primaryOpacity, primaryUrl, previewUrl]);

  useEffect(() => {
    if (!isViewer || !hasDistinctPreview || !isPrimaryReady) {
      primaryOpacity.setValue(0);
      if (!isPrimaryReady) {
        setFadeComplete(false);
      }
      return;
    }

    Animated.timing(primaryOpacity, {
      toValue: 1,
      duration: CROSSFADE_MS,
      useNativeDriver: true,
    }).start(({finished}) => {
      if (finished) {
        setFadeComplete(true);
      }
    });
  }, [hasDistinctPreview, isPrimaryReady, isViewer, primaryOpacity]);

  const retainPreviewDuringFade =
    isViewer &&
    hasDistinctPreview &&
    isPreviewReady &&
    isPrimaryReady &&
    !fadeComplete;

  const showPreviewLayer =
    Boolean(resolvedPreviewUri) &&
    isPreviewReady &&
    (showPreview || retainPreviewDuringFade);

  useEffect(() => {
    if (hasVisibleContent && !didReportVisibleRef.current && onVisible) {
      didReportVisibleRef.current = true;
      onVisible();
    }
  }, [hasVisibleContent, onVisible]);

  const rootStyle = [
    styles.root,
    fill ? styles.fill : null,
    !fill && typeof height === 'number' ? {height} : null,
    borderRadius != null ? {borderRadius} : null,
  ];

  const primaryImageStyle = [
    styles.image,
    hidePrimaryUntilReady ? styles.hiddenLayer : null,
  ];

  return (
    <View
      style={rootStyle}
      onLayout={event => {
        const nextWidth = Math.round(event.nativeEvent.layout.width);
        if (nextWidth > 0 && nextWidth !== layoutWidth) {
          setLayoutWidth(nextWidth);
        }
      }}>
      {showPreviewLayer ? (
        <View style={[styles.layer, styles.previewLayer]}>
          <FastImage
            source={{
              uri: resolvedPreviewUri,
              priority: FastImage.priority.high,
              cache: FastImage.cacheControl.immutable,
            }}
            style={styles.image}
            resizeMode={resizeMode}
            onLoadEnd={handlePreviewLoadEnd}
            onError={handlePreviewLoadEnd}
          />
        </View>
      ) : null}

      {resolvedPrimaryUri && !hasError ? (
        <Animated.View
          style={[
            styles.layer,
            styles.primaryLayer,
            isViewer && hasDistinctPreview && showPrimaryUpgrade
              ? {opacity: primaryOpacity}
              : null,
          ]}>
          <FastImage
            key={`${cacheKey}_${resolvedPrimaryUri}`}
            source={{
              uri: resolvedPrimaryUri,
              priority,
              cache: FastImage.cacheControl.immutable,
            }}
            style={primaryImageStyle}
            resizeMode={resizeMode}
            onLoadEnd={handlePrimaryLoadEnd}
            onError={handleError}
          />
        </Animated.View>
      ) : null}

      {hasError ? (
        <View style={[styles.errorLayer, borderRadius != null ? {borderRadius} : null]}>
          <Icons.Ionicons
            name="image-outline"
            size={28}
            color={theme.colors.text.tertiary}
          />
        </View>
      ) : null}

      {showSkeleton ? (
        <View
          style={[styles.skeletonOverlay, borderRadius != null ? {borderRadius} : null]}
          pointerEvents="none">
          <SkeletonBlock
            width={layoutWidth > 0 ? layoutWidth : '100%'}
            height={fill ? '100%' : height}
            borderRadius={radius}
            style={layoutWidth > 0 && !fill ? undefined : styles.skeletonFill}
          />
          <View style={styles.spinnerOverlay}>
            <ActivityIndicator
              size="small"
              color={theme.colors.accent.primary}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default React.memo(ProgressiveImage);
