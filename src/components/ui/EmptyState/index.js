import React from 'react';
import {Text, View} from 'react-native';
import {Icons} from '../../../constants';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {useTheme} from '../../../theme/ThemeContext';
import {createStyles} from './styles';

// `style` is additive and optional: the container below is flex:1 so the state fills its
// screen (what the Favorites and My Designs empty screens want). A caller that needs it to
// size to its content instead — e.g. PermissionDeniedState, which pairs it with a button
// and centres the two together — can override the flex through this prop. Omitting it
// leaves the original behaviour exactly as it was.
const EmptyState = ({icon = 'images-outline', title, subtitle, style}) => {
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrap}>
        <Icons.Ionicons
          name={icon}
          size={30}
          color={theme.colors.text.tertiary}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

export default EmptyState;
