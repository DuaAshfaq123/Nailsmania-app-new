import {StyleSheet} from 'react-native';

export const createStyles = theme =>
  StyleSheet.create({
    root: {
      overflow: 'hidden',
      position: 'relative',
      width: '100%',
      // Never expose a white/blank frame beneath the layers — the tinted
      // placeholder shows through until the image has actually painted.
      backgroundColor: theme.colors.skeleton.base,
    },
    fill: {
      flex: 1,
      height: '100%',
    },
    layer: {
      ...StyleSheet.absoluteFillObject,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    skeletonOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 3,
      backgroundColor: theme.colors.skeleton.base,
    },
    skeletonFill: {
      width: '100%',
    },
    spinnerOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewLayer: {
      zIndex: 1,
    },
    primaryLayer: {
      zIndex: 2,
    },
    hiddenLayer: {
      opacity: 0,
    },
    errorLayer: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.skeleton.base,
    },
  });
