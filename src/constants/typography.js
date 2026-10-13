export {
  Fonts,
  FontSizes,
  LineHeights,
  createTextStyles,
} from '../theme/typography';
import {createTheme} from '../theme/createTheme';

const legacyTheme = createTheme('dark');

export const Typography = legacyTheme.typography;
export const TextStyles = legacyTheme.text;
