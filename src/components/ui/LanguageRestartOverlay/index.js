import React, {useEffect, useRef} from 'react';
import {ActivityIndicator, Animated, Modal, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {Icons} from '../../../constants';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {useTheme} from '../../../theme/ThemeContext';
import {useLanguage} from '../../../context/LanguageContext';
import {createStyles} from './styles';

// Module scope so SafeAreaView is not handed a new array identity on every render. Only
// the bottom edge matters: the sheet is anchored there and the ground above it is opaque
// all the way to the top of the screen.
const SAFE_AREA_EDGES = ['bottom'];

// Stable identity for the Modal's back-press handler. Returning nothing (rather than
// omitting the prop) is what makes the Android back button a no-op for the fraction of a
// second the sheet is up: there is nothing to go back TO mid-reload, and dismissing would
// only reveal the screen this is deliberately covering. Normal back behaviour is
// unaffected, because the Modal is unmounted the instant the reload lands.
const noop = () => {};

/**
 * Bottom sheet shown for the moment between committing a language change and the app
 * reloading to apply the new layout direction.
 *
 * Rendered through a Modal, and that is load-bearing rather than stylistic. This component
 * is a SIBLING of the navigator in App.js so it can cover the app from any screen, and a
 * plain absolutely-positioned View in that position does not reliably paint above the
 * navigator: device QA showed the Settings rows and the floating tab bar still visible
 * behind it, with `position: absolute` + `zIndex: 1000` + `elevation: 1000` all set and
 * losing to react-native-screens' native screen containers. A Modal sidesteps the fight
 * entirely by rendering into its OWN Android window, which is always above the app's.
 *
 * Two supporting details:
 *
 *  - `transparent` with an opaque View inside, rather than `transparent={false}`. A
 *    non-transparent Modal window paints its own platform-default background before React
 *    renders, which flashes white in dark mode. Owning the fill ourselves keeps it on
 *    theme.colors.bg.base, correct in both themes.
 *  - Safe area comes from SafeAreaView, NOT useSafeAreaInsets. This app has no
 *    SafeAreaProvider of its own; every hook call site works only because
 *    NavigationContainer renders SafeAreaProviderCompat internally, and this component sits
 *    outside it. The hook throws NO_INSETS_ERROR here — it shipped that way once and red-
 *    screened the app. SafeAreaView is a native view that needs no JS context.
 *
 * There is deliberately no dismiss affordance. The sheet's only exit is the reload itself.
 */
const LanguageRestartOverlay = () => {
  const {isRestarting} = useLanguage();
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation('settings');
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRestarting) {
      Animated.spring(slideAnim, {
        toValue: 1,
        ...theme.motion.spring.sheet,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [isRestarting, slideAnim, theme.motion.spring.sheet]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  return (
    <Modal
      visible={isRestarting}
      animationType="none"
      transparent
      // Extends the Modal window under the status bar and navigation bar, so the opaque
      // fill below reaches the true screen edges instead of leaving strips of the app
      // showing top and bottom.
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={noop}>
      <View style={styles.overlay}>
        <SafeAreaView edges={SAFE_AREA_EDGES}>
          <Animated.View
            style={[styles.sheetWrapper, {transform: [{translateY}]}]}>
            <View style={styles.sheet} accessibilityViewIsModal>
              <View style={styles.grabber} />

              <View style={styles.iconWrap}>
                <Icons.Ionicons
                  name="language-outline"
                  size={26}
                  color={theme.colors.accent.primary}
                />
              </View>

              <Text style={styles.title}>
                {t('settings:languageRestartTitle')}
              </Text>
              <Text style={styles.message}>
                {t('settings:languageRestartMessage')}
              </Text>

              <ActivityIndicator
                size="small"
                color={theme.colors.accent.terracotta}
                style={styles.spinner}
              />
            </View>
          </Animated.View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default LanguageRestartOverlay;
