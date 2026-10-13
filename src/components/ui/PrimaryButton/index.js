import React from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {useTheme} from '../../../theme/ThemeContext';
import AnimatedPressable from '../AnimatedPressable';
import {createStyles} from './styles';

// Shared CTA button for auth/profile/upload/account-deletion flows — the app had no
// dedicated button component before V2 (buttons were ad hoc TouchableOpacity/GlassSurface
// compositions per screen); this centralizes variant/loading/disabled behavior once.
const PrimaryButton = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  accessibilityLabel,
}) => {
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const isDisabled = disabled || loading;

  const variantStyle = styles[`variant_${variant}`] || styles.variant_primary;
  const labelStyle = styles[`label_${variant}`] || styles.label_primary;
  const spinnerColor =
    variant === 'secondary' ? theme.colors.accent.primary : theme.colors.text.inverse;

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        variantStyle,
        isDisabled && styles.disabled,
        style,
      ]}>
      <View
        style={styles.content}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityState={{disabled: isDisabled, busy: loading}}>
        {loading ? (
          <ActivityIndicator color={spinnerColor} size="small" />
        ) : (
          <>
            {icon}
            <Text style={[labelStyle, icon && styles.labelWithIcon]}>{label}</Text>
          </>
        )}
      </View>
    </AnimatedPressable>
  );
};

export default PrimaryButton;
