import React, {useEffect, useRef} from 'react';
import {Animated, Modal, Text, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Icons} from '../../../constants';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {useTheme} from '../../../theme/ThemeContext';
import PrimaryButton from '../PrimaryButton';
import {createStyles} from './styles';

// Presentational confirmation dialog — the in-app replacement for React Native's
// Alert.alert, which renders an OS-styled box that ignores the app's theme entirely
// (wrong fonts, wrong colours, no dark-mode control). Visibility and the confirm/cancel
// callbacks are owned by ConfirmContext; this component only renders and animates.
const ConfirmModal = ({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  loading = false,
  icon,
  onConfirm,
  onCancel,
}) => {
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation('common');
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Scale + fade entrance. Reset (rather than animate out) on close: the Modal unmounts
  // its content immediately, so an exit animation would never be seen, and leaving the
  // values at their end state would make the next open pop in with no animation.
  useEffect(() => {
    if (!visible) {
      scaleAnim.setValue(0.92);
      opacityAnim.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...theme.motion.spring.sheet,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: theme.motion.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, scaleAnim, opacityAnim, theme.motion]);

  const resolvedIcon = icon || (destructive ? 'alert-circle-outline' : 'help-circle-outline');
  const iconColor = destructive
    ? theme.colors.semantic.error
    : theme.colors.accent.primary;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      // Android hardware back must behave like Cancel, never like Confirm — a stray back
      // press can't be allowed to delete an account.
      onRequestClose={loading ? undefined : onCancel}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          // Backdrop taps are inert while the confirmed action is in flight, so the user
          // can't dismiss the dialog mid-deletion and lose the progress indicator.
          onPress={loading ? undefined : onCancel}
          accessibilityLabel={cancelLabel || t('common:cancel')}
        />
        <Animated.View
          style={[
            styles.card,
            {opacity: opacityAnim, transform: [{scale: scaleAnim}]},
          ]}
          accessibilityViewIsModal
          accessibilityRole="alert">
          <View
            style={[styles.iconWrap, destructive && styles.iconWrapDestructive]}>
            <Icons.Ionicons name={resolvedIcon} size={28} color={iconColor} />
          </View>

          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.actions}>
            <PrimaryButton
              label={confirmLabel || t('common:ok')}
              onPress={onConfirm}
              loading={loading}
              variant={destructive ? 'destructive' : 'primary'}
              style={styles.confirmButton}
            />
            {onCancel ? (
              <TouchableOpacity
                onPress={onCancel}
                disabled={loading}
                style={styles.cancelButton}
                accessibilityRole="button">
                <Text style={styles.cancelText}>
                  {cancelLabel || t('common:cancel')}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;
