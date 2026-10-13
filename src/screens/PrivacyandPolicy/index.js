import React, {useCallback} from 'react';
import {View, ScrollView, Text, Linking, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {ScreenHeader, ScreenContainer} from '../../components/ui';
import useThemedStyles from '../../hooks/useThemedStyles';
import {useTheme} from '../../theme/ThemeContext';
import {createStyles} from './styles';

const PrivacyandPolicy = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation('legal');
  const scrollBottomInset =
    Math.max(insets.bottom, theme.spacing.sm) + theme.spacing.lg;

  const openUrl = useCallback(async url => {
    await Linking.openURL(url);
  }, []);

  // Uses the app's own ScreenHeader so this screen's title matches every other
  // screen (theme.text.brand, left-aligned) instead of a centred sans-serif h2.
  return (
    <ScreenContainer edges={[]}>
      <ScreenHeader
        title={t('legal:privacyTitle')}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={{paddingBottom: scrollBottomInset}}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.privacyText}>{t('legal:privacyIntro1')}</Text>
          <Text style={styles.privacyText}>{t('legal:privacyIntro2')}</Text>
          <Text style={styles.headertext}>
            {t('legal:privacyInfoCollectionHeading')}
          </Text>
          <Text style={styles.privacyText}>
            {t('legal:privacyInfoCollectionBody')}
          </Text>
          <Text style={styles.headertext}>
            {t('legal:privacyLogDataHeading')}
          </Text>
          <Text style={styles.privacyText}>
            {t('legal:privacyLogDataBody')}
          </Text>
          <Text style={styles.headertext}>
            {t('legal:privacyCookiesHeading')}
          </Text>
          <Text style={styles.privacyText}>
            {t('legal:privacyCookiesBody')}
          </Text>
          <Text style={styles.headertext}>
            {t('legal:privacyServiceProvidersHeading')}
          </Text>
          <Text style={styles.privacyText}>
            {t('legal:privacyServiceProvidersIntro')}
          </Text>
          <Text style={styles.privacyText}>
            {'•'} {t('legal:privacyServiceProvidersBullet1')}
          </Text>
          <Text style={styles.privacyText}>
            {'•'} {t('legal:privacyServiceProvidersBullet2')}
          </Text>
          <Text style={styles.privacyText}>
            {'•'} {t('legal:privacyServiceProvidersBullet3')}
          </Text>
          <Text style={styles.privacyText}>
            {'•'} {t('legal:privacyServiceProvidersBullet4')}
          </Text>
          <Text style={styles.privacyText}>
            {t('legal:privacyServiceProvidersBody')}
          </Text>
          <Text style={styles.headertext}>
            {t('legal:privacySecurityHeading')}
          </Text>
          <Text style={styles.privacyText}>
            {t('legal:privacySecurityBody')}
          </Text>
          <Text style={styles.headertext}>
            {t('legal:privacyLinksHeading')}
          </Text>
          <Text style={styles.privacyText}>{t('legal:privacyLinksBody')}</Text>
          <Text style={styles.headertext}>
            {t('legal:privacyChildrenHeading')}
          </Text>
          <Text style={styles.privacyText}>
            {t('legal:privacyChildrenBody')}
          </Text>
          <Text style={styles.headertext}>
            {t('legal:privacyChangesHeading')}
          </Text>
          <Text style={styles.privacyText}>
            {t('legal:privacyChangesBody')}
          </Text>
          <Text style={styles.headertext}>
            {t('legal:privacyContactHeading')}
          </Text>
          <Text style={styles.privacyText}>
            {t('legal:privacyContactBody')}
          </Text>
          <TouchableOpacity
            onPress={() => openUrl('https://www.privacypolicytemplate.net/')}>
            <Text style={styles.linkText}>{t('legal:privacyLinkLabel1')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              openUrl('https://app-privacy-policy-generator.nisrulz.com/')
            }>
            <Text style={styles.linkTextSpaced}>
              {t('legal:privacyLinkLabel2')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
};

export default PrivacyandPolicy;
