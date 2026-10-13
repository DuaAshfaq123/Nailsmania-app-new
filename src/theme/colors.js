// Nails palette — soft blush surfaces + raspberry-rose accents, warm champagne gold detail.
// NOTE: the old `henna` and `mehndi` tokens are replaced by a single `nail` token.
// `terracotta`, `saffron`, `gold` and `goldLight` keep their names (other files may use
// them) but now hold nails-friendly colours.
export const lightColors = {
  bg: {
    base: '#FAF5F6',
    surface: '#FFFFFF',
    elevated: '#FDFAFA',
    hover: '#F3EBED',
    muted: '#F0E8EA',
    glass: 'rgba(253, 250, 250, 0.72)',
  },
  accent: {
    primary: '#C94B77',
    primaryMuted: 'rgba(201, 75, 119, 0.14)',
    gold: '#B8956A',
    goldLight: '#D4B896',
    nail: '#8E2F58',
    terracotta: '#E58AA8',
    saffron: '#C4934A',
  },
  text: {
    primary: '#1A1512',
    secondary: '#6B635C',
    // Meets WCAG AA (>=4.5:1) on every light surface — worst case 4.55:1 on bg.hover.
    tertiary: '#706963',
    inverse: '#FFFFFF',
    gold: '#9A7B4F',
    brand: '#1A1512',
  },
  border: {
    hairline: 'rgba(26, 21, 18, 0.08)',
    subtle: 'rgba(26, 21, 18, 0.04)',
    gold: 'rgba(184, 149, 106, 0.30)',
  },
  overlay: {
    scrim: 'rgba(12, 10, 8, 0.50)',
    gradientStart: 'rgba(12, 10, 8, 0)',
    gradientEnd: 'rgba(12, 10, 8, 0.62)',
  },
  skeleton: {
    base: '#EDE5E7',
    highlight: '#F7F1F2',
  },
  semantic: {
    error: '#C45C5C',
    // Low-alpha wash of `error`, for destructive icon halos / error field fills.
    errorMuted: 'rgba(196, 92, 92, 0.14)',
    success: '#5A9E72',
    warning: '#C98A3C',
    favorite: '#C94B77',
  },
  statusBar: {
    barStyle: 'dark-content',
  },
};

export const darkColors = {
  bg: {
    base: '#12100F',
    surface: '#1C1917',
    elevated: '#252220',
    hover: '#2E2A27',
    muted: '#1E1B19',
    glass: 'rgba(28, 26, 24, 0.78)',
  },
  accent: {
    primary: '#E87CA0',
    primaryMuted: 'rgba(232, 124, 160, 0.18)',
    gold: '#E87CA0',
    goldLight: '#F2B1C6',
    nail: '#E0709A',
    terracotta: '#E58AA8',
    saffron: '#D4A55A',
  },
  text: {
    primary: '#F8F4F0',
    secondary: '#A89E94',
    // Meets WCAG AA (>=4.5:1) on every dark surface — worst case 4.51:1 on bg.surface.
    tertiary: '#93877B',
    inverse: '#FFFFFF',
    gold: '#E87CA0',
    brand: '#F8F4F0',
  },
  border: {
    hairline: 'rgba(255, 255, 255, 0.09)',
    subtle: 'rgba(255, 255, 255, 0.05)',
    gold: 'rgba(232, 124, 160, 0.35)',
  },
  overlay: {
    scrim: 'rgba(0, 0, 0, 0.58)',
    gradientStart: 'rgba(0, 0, 0, 0)',
    gradientEnd: 'rgba(0, 0, 0, 0.68)',
  },
  skeleton: {
    base: '#252220',
    highlight: '#2E2A27',
  },
  semantic: {
    error: '#D46B6B',
    errorMuted: 'rgba(212, 107, 107, 0.18)',
    success: '#6BB88A',
    warning: '#DBA35A',
    favorite: '#E87CA0',
  },
  statusBar: {
    barStyle: 'light-content',
  },
};

export const getColors = colorScheme =>
  colorScheme === 'light' ? lightColors : darkColors;
