import React from 'react';
import {Text as RNText} from 'react-native';
import {useTheme} from '../../../theme/ThemeContext';

const AppText = ({variant = 'body', style, children, ...props}) => {
  const {theme} = useTheme();
  const variantStyle = theme.text[variant] || theme.text.body;

  return (
    <RNText style={[variantStyle, style]} {...props}>
      {children}
    </RNText>
  );
};

export default AppText;
