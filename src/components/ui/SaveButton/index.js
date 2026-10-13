import React from 'react';
import {Pressable} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Icons} from '../../../constants';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {useTheme} from '../../../theme/ThemeContext';
import {createStyles} from './styles';

// The one save/unsave control in the app. Rendered by MasonryPin (Saved + category
// gallery) and TrendingPin, so the icon, its size, its corner inset, its scrim and its
// filled/outline states are defined once and identical everywhere.
//
// Purely presentational: the owning screen decides whether the design is saved and what
// tapping does, which is what keeps a single favourites source of truth behind it.
const SaveButton = ({saved = false, onPress, style}) => {
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation('imageViewer');

  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, style]}
      hitSlop={theme.spacing.xs}
      accessibilityRole="button"
      accessibilityState={{selected: saved}}
      accessibilityLabel={
        saved
          ? t('imageViewer:removeFromSavedLabel')
          : t('imageViewer:saveImageLabel')
      }>
      <Icons.Ionicons
        name={saved ? 'heart' : 'heart-outline'}
        size={17}
        color={saved ? theme.colors.semantic.favorite : theme.colors.text.inverse}
      />
    </Pressable>
  );
};

export default SaveButton;
