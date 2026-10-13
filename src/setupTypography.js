import {Platform, Text, TextInput} from 'react-native';
import {Fonts} from './theme';
import {isRTL} from './utils/rtl';

// Fallback Poppins for any unstyled Text / TextInput.
//
// Deliberately NOT applied in Urdu/Arabic. Poppins has no Arabic-script glyphs, and this
// default reaches every Text and TextInput in the app — including ones the theme tokens
// never touch — so leaving it on would reintroduce the fallback/tofu problem that
// theme/typography.js exists to avoid. Those languages get the same bundled Naskh face
// on both platforms instead.
//
// They also get the base writing direction, for the reason spelled out in
// theme/typography.js: on iOS an unaligned label resolves "natural" alignment against the
// bundle's localization, not the layout direction, and lands on the left of a mirrored
// screen. Text that carries a theme token is handled there; this covers the rest.
const defaultTextStyle = isRTL
  ? {fontFamily: Fonts.arabicRegular, writingDirection: 'rtl'}
  : Platform.select({
      ios: {fontFamily: Fonts.regular},
      android: {fontFamily: Fonts.regular},
      default: {fontFamily: Fonts.regular},
    });

if (Text.defaultProps == null) {
  Text.defaultProps = {};
}
Text.defaultProps.allowFontScaling = false;
Text.defaultProps.style = defaultTextStyle;

if (TextInput.defaultProps == null) {
  TextInput.defaultProps = {};
}
TextInput.defaultProps.allowFontScaling = false;
TextInput.defaultProps.style = defaultTextStyle;
