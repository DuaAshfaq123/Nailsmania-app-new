import {Text, ScrollView} from 'react-native';
import React, {useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {ScreenHeader, ScreenContainer} from '../../components/ui';
import {Config} from '../../constants';
import useThemedStyles from '../../hooks/useThemedStyles';
import {useTheme} from '../../theme/ThemeContext';
import {createStyles} from './styles';

const AboutUs = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation('legal');
  const scrollBottomInset =
    Math.max(insets.bottom, theme.spacing.sm) + theme.spacing.lg;

  const content = useMemo(() => {
    const aboutUsText = t('legal:aboutUsText', {email: Config.CONTACT_EMAIL});
    const headingsRegex = /^(.*?:)$/gm;
    return aboutUsText.split(headingsRegex).map((section, index) =>
      index % 2 === 0 ? (
        <Text key={index} style={styles.text}>
          {section.trim()}
        </Text>
      ) : (
        <Text key={index} style={[styles.text, styles.boldText]}>
          {section.trim()}
        </Text>
      ),
    );
  }, [styles.boldText, styles.text, t]);

  // Uses the app's own ScreenHeader rather than React Navigation's native header, so this
  // screen's title matches every other screen (theme.text.brand, left-aligned) instead of
  // rendering as a centred sans-serif h2.
  return (
    <ScreenContainer edges={[]}>
      <ScreenHeader
        title={t('legal:aboutUsTitle')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{paddingBottom: scrollBottomInset}}
        showsVerticalScrollIndicator={false}>
        {content}
      </ScrollView>
    </ScreenContainer>
  );
};

export default AboutUs;
