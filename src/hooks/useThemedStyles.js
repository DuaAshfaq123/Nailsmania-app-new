import {useMemo} from 'react';
import {useTheme} from '../theme/ThemeContext';

const useThemedStyles = styleFactory => {
  const {theme} = useTheme();
  return useMemo(() => styleFactory(theme), [theme, styleFactory]);
};

export default useThemedStyles;
