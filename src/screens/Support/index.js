import React, {useCallback} from 'react';
import {Linking, ScrollView, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {
  ScreenHeader,
  PrimaryButton,
  ScreenContainer,
} from '../../components/ui';
import {Config, Icons} from '../../constants';
import useThemedStyles from '../../hooks/useThemedStyles';
import useToast from '../../hooks/useToast';
import {useTheme} from '../../theme/ThemeContext';
import {debugError} from '../../utils/debugLog';
import {toLtrIsolate} from '../../utils/rtl';
import {createStyles} from './styles';

// Email + phone support. Both channels are always shown as selectable plain text — a
// guaranteed fallback on devices with no mail client or dialer — in addition to the
// one-tap button.
//
// Neither action is gated on Linking.canOpenURL. That call builds an Intent and asks
// PackageManager.resolveActivity, which under Android 11+ package visibility returns null
// for any intent the app has not declared in <queries> — so it reported false, and this
// screen showed "No email app found", on devices with Gmail installed. The manifest now
// declares the mailto and tel intents, but the check stays removed regardless: attempting
// the open IS the authoritative test. openURL rejects when no activity can handle the
// intent, so each catch below is a true "nothing installed" signal rather than a guess made
// before trying, and the screen keeps working even where an OEM or a future policy change
// hides the app list again.
const Support = () => {
  const navigation = useNavigation();
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation(['support', 'common']);
  const toast = useToast();

  // Empty is a supported configuration (SUPPORT_PHONE unset in .env) — the whole call
  // card is omitted rather than rendering a button that dials nothing.
  const phoneNumber = Config.CONTACT_PHONE;

  const handleContactPress = useCallback(async () => {
    const subject = encodeURIComponent(t('support:emailSubject'));
    const mailtoUrl = `mailto:${Config.CONTACT_EMAIL}?subject=${subject}`;
    try {
      await Linking.openURL(mailtoUrl);
    } catch (error) {
      debugError('Support', 'Failed to open mail client', error);
      toast.show(t('support:noEmailApp'), {type: 'error'});
    }
  }, [t, toast]);

  // ACTION_DIAL (what tel: resolves to) opens the dialer PRE-FILLED rather than placing
  // the call, so this needs no CALL_PHONE permission and the user still confirms.
  const handleCallPress = useCallback(async () => {
    try {
      await Linking.openURL(`tel:${phoneNumber}`);
    } catch (error) {
      debugError('Support', 'Failed to open dialer', error);
      toast.show(t('support:noPhoneApp'), {type: 'error'});
    }
  }, [phoneNumber, t, toast]);

  return (
    <ScreenContainer edges={[]}>
      <ScreenHeader
        title={t('support:title')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.introTitle}>{t('support:introTitle')}</Text>
        <Text style={styles.introBody}>{t('support:introBody')}</Text>

        <Text style={styles.tipsTitle}>{t('support:introTipsTitle')}</Text>
        <View style={styles.tipRow}>
          <Text style={styles.tipBullet}>{'•'}</Text>
          <Text style={styles.tipText}>{t('support:introTip1')}</Text>
        </View>
        <View style={styles.tipRow}>
          <Text style={styles.tipBullet}>{'•'}</Text>
          <Text style={styles.tipText}>{t('support:introTip2')}</Text>
        </View>
        <View style={styles.tipRow}>
          <Text style={styles.tipBullet}>{'•'}</Text>
          <Text style={styles.tipText}>{t('support:introTip3')}</Text>
        </View>

        <View style={styles.contactCard}>
          <View style={styles.contactIconWrap}>
            <Icons.Ionicons
              name="mail-outline"
              size={26}
              color={theme.colors.accent.primary}
            />
          </View>
          <Text style={styles.contactLabel}>{t('support:emailLabel')}</Text>
          <Text style={styles.contactValue} selectable>
            {Config.CONTACT_EMAIL}
          </Text>
          <PrimaryButton
            label={t('support:contactButton')}
            onPress={handleContactPress}
            style={styles.contactButton}
          />
        </View>

        {phoneNumber ? (
          <View style={styles.contactCard}>
            <View style={styles.contactIconWrap}>
              <Icons.Ionicons
                name="call-outline"
                size={26}
                color={theme.colors.accent.primary}
              />
            </View>
            <Text style={styles.contactLabel}>{t('support:phoneLabel')}</Text>
            {/* Isolated so the number reads left-to-right in every language. Its digits
                are only weakly directional and its '+', spaces and dashes are neutral, so
                in Urdu or Arabic the bidi algorithm would otherwise swing the country-code
                prefix to the opposite end of the string. The dialled value is unaffected —
                handleCallPress uses the raw phoneNumber. */}
            <Text style={styles.contactValue} selectable>
              {toLtrIsolate(phoneNumber)}
            </Text>
            <PrimaryButton
              label={t('support:callButton')}
              onPress={handleCallPress}
              style={styles.contactButton}
            />
          </View>
        ) : null}

        <Text style={styles.responseNote}>{t('support:responseNote')}</Text>
      </ScrollView>
    </ScreenContainer>
  );
};

export default Support;
