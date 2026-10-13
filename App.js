/*
 * This project is created and maintained by:
 * React Native Team
 * 724.One
 *
 * Project Description:
 * A cross-platform mobile application developed using React Native,
 *
 * For support and inquiries, please contact:
 * - Email: contact@724.one
 *
 * @format
 */

import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import 'react-native-gesture-handler';
import './src/setupTypography';
import './src/i18n';

import Routing from './src/navigation/routing';
import {isAdsEnabled} from './src/config/admobConfig';
import {
  LanguageRestartOverlay,
  CatalogPackStatusHost,
} from './src/components/ui';
import {
  AdMobService,
  AdEngagementGate,
  IAPService,
  SessionAdGate,
} from './src/services';
import useDailyNotifications from './src/hooks/useDailyNotifications';
import useDownloadNotifications from './src/hooks/useDownloadNotifications';
import {ThemeProvider, useTheme} from './src/theme/ThemeContext';
import {LanguageProvider} from './src/context/LanguageContext';
import {ToastProvider} from './src/context/ToastContext';
import {ConfirmProvider} from './src/context/ConfirmContext';
import {hideBootSplash} from './src/utils/hideBootSplash';
import appStyles from './src/styles';

// If Home never reports ready (offline edge case, etc.), still dismiss splash.
const BOOT_SPLASH_FAILSAFE_MS = 10000;

const AppContent = () => {
  const {theme} = useTheme();

  // Mounted once, at the root, so the daily 6 PM reminder is (re)scheduled on launch and
  // on every return to the foreground.
  useDailyNotifications();

  useDownloadNotifications();

  useEffect(() => {
    AdEngagementGate.markSessionStarted();
    SessionAdGate.reset();
    if (isAdsEnabled) {
      AdMobService.initialize();
    }
    IAPService.initialize();

    const failsafe = setTimeout(() => {
      hideBootSplash();
    }, BOOT_SPLASH_FAILSAFE_MS);

    return () => clearTimeout(failsafe);
  }, []);

  return (
    <View style={[appStyles.root, {backgroundColor: theme.colors.bg.base}]}>
      <Routing />
      {/* Renders a Modal, so it sits above the navigator wherever the user happens to be:
          a language change that flips the layout direction can only take effect after a
          process restart, and this covers the in-between frames rather than letting a
          half-flipped screen show. Self-gating on LanguageContext — nothing to wire up. */}
      <LanguageRestartOverlay />
      <CatalogPackStatusHost />
    </View>
  );
};

const App = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <ConfirmProvider>
              <AppContent />
            </ConfirmProvider>
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
