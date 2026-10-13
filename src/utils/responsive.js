import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const GUIDELINE_BASE_WIDTH = 375;
const GUIDELINE_BASE_HEIGHT = 812;

// Scale value proportionally to screen width
export const scale = size => (width / GUIDELINE_BASE_WIDTH) * size;

// Scale value proportionally to screen height
export const verticalScale = size =>
  (height / GUIDELINE_BASE_HEIGHT) * size;

// Balanced scaling — less aggressive than pure scale()
export const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export const screenWidth = width;
export const screenHeight = height;
