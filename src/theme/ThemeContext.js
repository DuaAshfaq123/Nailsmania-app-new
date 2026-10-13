import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useColorScheme} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {createTheme} from './createTheme';
import {debugError} from '../utils/debugLog';

export const THEME_PREFERENCE_KEY = 'theme_preference';
export const THEME_OPTIONS = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark',
};

const ThemeContext = createContext(null);

const resolveColorScheme = (preference, systemScheme) => {
  if (preference === THEME_OPTIONS.LIGHT) {
    return 'light';
  }
  if (preference === THEME_OPTIONS.DARK) {
    return 'dark';
  }
  return systemScheme === 'light' ? 'light' : 'dark';
};

export const ThemeProvider = ({children}) => {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState(THEME_OPTIONS.SYSTEM);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadPreference = async () => {
      try {
        const stored = await EncryptedStorage.getItem(THEME_PREFERENCE_KEY);
        if (
          stored === THEME_OPTIONS.SYSTEM ||
          stored === THEME_OPTIONS.LIGHT ||
          stored === THEME_OPTIONS.DARK
        ) {
          setPreferenceState(stored);
        }
      } catch (error) {
        debugError('Theme', 'Failed to load theme preference', error);
      } finally {
        setIsReady(true);
      }
    };
    loadPreference();
  }, []);

  const colorScheme = resolveColorScheme(preference, systemScheme);
  const theme = useMemo(() => createTheme(colorScheme), [colorScheme]);

  const setThemePreference = useCallback(async nextPreference => {
    setPreferenceState(nextPreference);
    try {
      await EncryptedStorage.setItem(THEME_PREFERENCE_KEY, nextPreference);
    } catch (error) {
      debugError('Theme', 'Failed to save theme preference', error);
    }
  }, []);

  const value = useMemo(
    () => ({
      theme,
      preference,
      colorScheme,
      isReady,
      setThemePreference,
    }),
    [theme, preference, colorScheme, isReady, setThemePreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
