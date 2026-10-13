import React from 'react';
import {Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Icons} from '../../../constants';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {useTheme} from '../../../theme/ThemeContext';
import AnimatedPressable from '../AnimatedPressable';
import GlassSurface from '../GlassSurface';
import {createStyles} from './styles';

const SearchBar = ({onPress, placeholder}) => {
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation('common');
  const resolvedPlaceholder = placeholder || t('common:searchPlaceholder');

  return (
    <AnimatedPressable onPress={onPress} style={styles.container}>
      <GlassSurface
        style={styles.inner}
        borderRadius={theme.radius.lg}
        blurAmount={22}
        shadow="card"
        contentStyle={styles.innerContent}>
        <View style={styles.iconCircle}>
          <Icons.Ionicons
            name="search-outline"
            size={17}
            color={theme.colors.accent.terracotta}
          />
        </View>
        <Text style={styles.placeholder} numberOfLines={1}>
          {resolvedPlaceholder}
        </Text>
      </GlassSurface>
    </AnimatedPressable>
  );
};

export default SearchBar;
