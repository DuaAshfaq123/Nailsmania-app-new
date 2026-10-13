export const getShadows = colorScheme => {
  const isLight = colorScheme === 'light';

  return {
    card: {
      shadowColor: isLight ? '#1A1512' : '#000000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: isLight ? 0.06 : 0.22,
      shadowRadius: isLight ? 8 : 12,
      elevation: isLight ? 2 : 4,
    },
    elevated: {
      shadowColor: isLight ? '#1A1512' : '#000000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: isLight ? 0.08 : 0.28,
      shadowRadius: isLight ? 12 : 16,
      elevation: isLight ? 4 : 6,
    },
    float: {
      shadowColor: '#000000',
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: isLight ? 0.10 : 0.36,
      shadowRadius: isLight ? 14 : 18,
      elevation: isLight ? 6 : 10,
    },
    gold: {
      shadowColor: isLight ? '#B8956A' : '#C9A86C',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: isLight ? 0.18 : 0.24,
      shadowRadius: 8,
      elevation: 3,
    },
  };
};
