import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {Icons} from '../../../constants';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {useTheme} from '../../../theme/ThemeContext';
import {directionalIconName} from '../../../utils/rtl';
import {createStyles} from './styles';

// The single screen-header implementation for the whole app. Every screen renders its
// title through this component — screens with a back button and screens without (Home,
// Settings and Saved) — so font, size, weight, line height, padding and alignment
// can never drift between them.
//
// - `onBack` renders the back control; omit it for a root/tab screen.
// - `right` renders a trailing action and is the ONLY thing that reserves space on the
//   right. With no right action the title spans the full remaining width.
//
// The header ALWAYS owns its own top spacing (safe-area inset + spacing.xs) and screens
// always mount it inside `ScreenContainer edges={[]}`. There is deliberately no way to
// opt out: when some screens took the inset from the container and suppressed it here,
// they ended up spacing.xs higher than the rest of the app.
const ScreenHeader = ({
  title,
  subtitle,
  onBack,
  right,
  style,
}) => {
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const {t} = useTranslation('common');

  return (
    <View
      style={[
        styles.container,
        {paddingTop: insets.top + theme.spacing.xs},
        style,
      ]}>
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('common:goBack')}>
          {/* Back points toward the start of the reading direction, which is the right
              edge in Urdu/Arabic — RTL flips the button's position but never the glyph. */}
          <Icons.Ionicons
            name={directionalIconName('arrow-back')}
            size={22}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
      ) : null}

      <View
        style={[
          styles.titleWrap,
          onBack && styles.titleWrapWithBack,
          right && styles.titleWrapWithRight,
        ]}>
        {/* Single line by design: at the current title size every screen title in the app
            fits the available width, and a wrapped two-line title made headers jump
            height between screens. */}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {right ? <View style={styles.rightSlot}>{right}</View> : null}
    </View>
  );
};

export default ScreenHeader;
