import React, {useCallback, useMemo} from 'react';
import {
  Linking,
  Platform,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {
  ScreenContainer,
  ScreenHeader,
  SectionHeader,
  SettingMenuItem,
} from '../../components/ui';
import {Config, Icons} from '../../constants';
import useThemedStyles from '../../hooks/useThemedStyles';
import {THEME_OPTIONS, useTheme} from '../../theme/ThemeContext';
import {useLanguage} from '../../context/LanguageContext';
import {LANGUAGE_OPTIONS} from '../../i18n/languages';
import {debugError} from '../../utils/debugLog';
import {createStyles} from './styles';

const PreferenceOptionRow = ({option, selected, onSelect, styles, theme}) => (
  <TouchableOpacity
    onPress={() => onSelect(option.value)}
    activeOpacity={0.8}
    style={[styles.themeOption, selected && styles.themeOptionSelected]}>
    <View style={styles.themeOptionIcon}>
      <Icons.Ionicons
        name={option.icon}
        size={20}
        color={theme.colors.accent.primary}
      />
    </View>
    <Text style={styles.themeOptionLabel}>{option.label}</Text>
    {selected ? (
      <Icons.Ionicons
        name="checkmark-circle"
        size={22}
        color={theme.colors.accent.primary}
        style={styles.themeOptionCheck}
      />
    ) : null}
  </TouchableOpacity>
);

const Settings = () => {
  const navigation = useNavigation();
  const {theme, preference, setThemePreference} = useTheme();
  const {language, setLanguage} = useLanguage();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation(['common', 'settings', 'support']);

  const themeSettingOptions = useMemo(
    () => [
      {
        value: THEME_OPTIONS.SYSTEM,
        label: t('settings:themeSystemLabel'),
        icon: 'phone-portrait-outline',
      },
      {
        value: THEME_OPTIONS.LIGHT,
        label: t('settings:themeLightLabel'),
        icon: 'sunny-outline',
      },
      {
        value: THEME_OPTIONS.DARK,
        label: t('settings:themeDarkLabel'),
        icon: 'moon-outline',
      },
    ],
    [t],
  );

  const languageOptions = useMemo(
    () => [
      {
        value: LANGUAGE_OPTIONS.EN,
        label: t('settings:languageEnglishLabel'),
        icon: 'language-outline',
      },
      {
        value: LANGUAGE_OPTIONS.UR,
        label: t('settings:languageUrduLabel'),
        icon: 'language-outline',
      },
      {
        value: LANGUAGE_OPTIONS.AR,
        label: t('settings:languageArabicLabel'),
        icon: 'language-outline',
      },
    ],
    [t],
  );

  const shareApp = useCallback(async () => {
    try {
      await Share.share({message: Config.SHARE_MESSAGE});
    } catch (error) {
      debugError('Settings', 'Error sharing app', error);
    }
  }, []);

  const openFeedback = useCallback(() => {
    Linking.openURL(
      Platform.OS === 'ios'
        ? Config.APP_STORE_URL
        : Config.PLAY_STORE_MARKET_URL,
    );
  }, []);

  return (
    <ScreenContainer edges={[]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title={t('settings:heroTitle')}
          subtitle={t('settings:heroSubtitle')}
        />

        <SectionHeader title={t('settings:appearanceSectionTitle')} />
        <View style={styles.menuGroup}>
          {themeSettingOptions.map(option => (
            <PreferenceOptionRow
              key={option.value}
              option={option}
              selected={preference === option.value}
              onSelect={setThemePreference}
              styles={styles}
              theme={theme}
            />
          ))}
        </View>

        <SectionHeader title={t('settings:languageSectionTitle')} />
        <View style={styles.menuGroup}>
          {languageOptions.map(option => (
            <PreferenceOptionRow
              key={option.value}
              option={option}
              selected={language === option.value}
              onSelect={setLanguage}
              styles={styles}
              theme={theme}
            />
          ))}
        </View>

        <SectionHeader title={t('settings:generalSectionTitle')} />
        <View style={styles.menuGroup}>
          <SettingMenuItem
            iconFamily="Ionicons"
            iconName="information-circle-outline"
            label={t('settings:aboutUsLabel')}
            onPress={() => navigation.navigate('AboutUs')}
          />
          <SettingMenuItem
            iconFamily="FontAwesome"
            iconName="sticky-note-o"
            label={t('settings:termsLabel')}
            onPress={() => navigation.navigate('TermsAndConditions')}
          />
          <SettingMenuItem
            iconFamily="SimpleLineIcons"
            iconName="docs"
            label={t('settings:privacyLabel')}
            onPress={() => navigation.navigate('PrivacyandPolicy')}
          />
        </View>

        <SectionHeader title={t('settings:supportSectionTitle')} />
        <View style={styles.menuGroup}>
          <SettingMenuItem
            iconFamily="Ionicons"
            iconName="help-buoy-outline"
            label={t('support:menuLabel')}
            onPress={() => navigation.navigate('Support')}
          />
          <SettingMenuItem
            iconFamily="MaterialIcons"
            iconName="feedback"
            label={t('settings:feedbackLabel')}
            onPress={openFeedback}
          />
          <SettingMenuItem
            iconFamily="Ionicons"
            iconName="share-social-outline"
            label={t('settings:shareAppLabel')}
            onPress={shareApp}
            showChevron={false}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

export default Settings;
