import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {Icons} from '../../../constants';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {useTheme} from '../../../theme/ThemeContext';
import {directionalIconName} from '../../../utils/rtl';
import {createStyles} from './styles';

const SettingMenuItem = ({
  iconName,
  iconFamily = 'Ionicons',
  label,
  onPress,
  showChevron = true,
}) => {
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const IconComponent = Icons[iconFamily];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <IconComponent
            name={iconName}
            size={20}
            color={theme.colors.accent.primary}
          />
        </View>
        <Text style={styles.label}>{label}</Text>
        {/* Disclosure chevron: points at the trailing edge, which RTL moves to the left.
            Row order flips on its own; the glyph does not. */}
        {showChevron ? (
          <Icons.Ionicons
            name={directionalIconName('chevron-forward')}
            size={18}
            color={theme.colors.text.tertiary}
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default SettingMenuItem;
