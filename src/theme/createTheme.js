import {getColors} from './colors';
import {Spacing, Layout} from './spacing';
import {Radius} from './radius';
import {getShadows} from './shadows';
import {Motion} from './motion';
import {
  Fonts,
  FontSizes,
  LineHeights,
  createTextStyles,
} from './typography';

export const createTheme = colorScheme => {
  const scheme = colorScheme === 'light' ? 'light' : 'dark';

  return {
    colorScheme: scheme,
    isDark: scheme === 'dark',
    colors: getColors(scheme),
    spacing: Spacing,
    radius: Radius,
    layout: Layout,
    fonts: Fonts,
    typography: FontSizes,
    lineHeights: LineHeights,
    text: createTextStyles(),
    shadows: getShadows(scheme),
    motion: Motion,
  };
};
