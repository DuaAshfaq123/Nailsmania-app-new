import {createTheme} from '../theme/createTheme';
import {lightColors, darkColors, getColors} from '../theme/colors';

export {lightColors, darkColors, getColors};

const legacyTheme = createTheme('dark');

// Legacy-compatible color tokens mapped to the theme system
export const Colors = {
  primary: {
    black: legacyTheme.colors.bg.base,
    white: legacyTheme.colors.text.primary,
    whiteHard: legacyTheme.colors.text.primary,
  },
  secondary: {
    theme: legacyTheme.colors.accent.primary,
    transparentBg: legacyTheme.colors.overlay.scrim,
    statusBar: legacyTheme.colors.bg.base,
  },
  semantic: {
    error: legacyTheme.colors.semantic.error,
    success: legacyTheme.colors.semantic.success,
    favorite: legacyTheme.colors.accent.nail,
    iconDefault: legacyTheme.colors.text.primary,
  },
  surface: {
    background: legacyTheme.colors.bg.base,
    elevated: legacyTheme.colors.bg.surface,
    overlay: legacyTheme.colors.overlay.scrim,
  },
};
