import React, {useCallback} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Linking} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {ScreenHeader, ScreenContainer} from '../../components/ui';
import useThemedStyles from '../../hooks/useThemedStyles';
import {useTheme} from '../../theme/ThemeContext';
import {createStyles} from './styles';

const TermsAndConditions = () => {
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
        title={t('legal:termsTitle')}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={{paddingBottom: scrollBottomInset}}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.privacyText}>{t('legal:termsBody1')}</Text>
          <Text style={styles.privacyText}>{t('legal:termsBody2')}</Text>
          <Text style={styles.privacyText}>{t('legal:termsBody3')}</Text>
          <Text style={styles.privacyText}>{t('legal:termsBody4')}</Text>
          <Text style={[styles.privacyText, styles.highlightText]}>
            {'•'} {t('legal:termsBullet1')}
          </Text>
          <Text style={[styles.privacyText, styles.highlightText]}>
            {'•'} {t('legal:termsBullet2')}
          </Text>
          <Text style={styles.privacyText}>{t('legal:termsBody5')}</Text>
          <Text style={styles.privacyText}>{t('legal:termsBody6')}</Text>
          <Text style={styles.privacyText}>{t('legal:termsBody7')}</Text>
          <Text style={styles.privacyText}>{t('legal:termsBody8')}</Text>
          <Text style={styles.privacyText}>{t('legal:termsBody9')}</Text>
          <Text style={styles.headertext}>
            {t('legal:termsChangesHeading')}
          </Text>
          <Text style={styles.privacyText}>{t('legal:termsChangesBody')}</Text>
          <Text style={styles.headertext}>
            {t('legal:termsContactHeading')}
          </Text>
          <Text style={styles.privacyText}>{t('legal:termsContactBody')}</Text>
          <TouchableOpacity
            onPress={() =>
              openUrl('https://app-privacy-policy-generator.nisrulz.com/')
            }>
            <Text style={styles.linkTextSpaced}>
              {t('legal:termsLinkLabel')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
};

export default TermsAndConditions;
