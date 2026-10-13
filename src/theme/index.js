export {lightColors, darkColors, getColors} from './colors';
export {Spacing, Layout} from './spacing';
export {Radius} from './radius';
export {getShadows} from './shadows';
export {Motion} from './motion';
export {
  Fonts,
  FontSizes,
  LineHeights,
  createTextStyles,
  scriptSafeTracking,
} from './typography';
export {createTheme} from './createTheme';
export {
  ThemeProvider,
  useTheme,
  THEME_PREFERENCE_KEY,
  THEME_OPTIONS,
} from './ThemeContext';

import {createTheme} from './createTheme';

// Static fallback for modules that initialize before ThemeProvider (use useTheme in components)
export const Theme = createTheme('dark');
