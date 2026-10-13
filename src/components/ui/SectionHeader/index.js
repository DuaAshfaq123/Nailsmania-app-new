import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {Icons} from '../../../constants';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {useTheme} from '../../../theme/ThemeContext';
import {directionalIconName} from '../../../utils/rtl';
import {createStyles} from './styles';

const SectionHeader = ({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  serif = true,
}) => {
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, serif ? styles.titleSerif : null]}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onActionPress ? (
        <TouchableOpacity
          onPress={onActionPress}
          activeOpacity={0.7}
          style={styles.actionButton}>
          <Text style={styles.action}>{actionLabel}</Text>
          {/* "Continue in the reading direction" — so it has to point left in RTL. */}
          <Icons.Ionicons
            name={directionalIconName('arrow-forward')}
            size={14}
            color={theme.colors.accent.terracotta}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default SectionHeader;
