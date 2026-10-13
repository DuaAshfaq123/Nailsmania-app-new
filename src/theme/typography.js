import {Platform} from 'react-native';
import {moderateScale} from '../utils/responsive';
import {isRTL} from '../utils/rtl';

export const Fonts = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semibold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
  serif: Platform.select({ios: 'NotoSerif-Regular', android: 'serif'}),
  serifBold: Platform.select({ios: 'NotoSerif-Regular', android: 'serif'}),
  arabicRegular: 'NotoNaskhArabic-Regular',
  arabicMedium: 'NotoNaskhArabic-Medium',
  arabicSemibold: 'NotoNaskhArabic-SemiBold',
  arabicBold: 'NotoNaskhArabic-Bold',
};

export const FontSizes = {
  display: moderateScale(36),
  h1: moderateScale(28),
  h2: moderateScale(22),
  h3: moderateScale(18),
  title: moderateScale(17),
  // Slightly smaller than body, for inputs that share their row with an adjacent control
  // (the search field sits next to Cancel) and would otherwise clip their placeholder.
  inputCompact: moderateScale(14),
  subtitle: moderateScale(15),
  body: moderateScale(15),
  caption: moderateScale(13),
  button: moderateScale(13),
  tabLabel: moderateScale(10),
  overline: moderateScale(11),
  // The single screen-title size, used by every screen header app-wide (and by the Home
  // wordmark). Reduced from 32: at 32 the longer titles ("Terms and Conditions",
  // "Add Your Design") crowded or wrapped the header on a 720px-wide device.
  brand: moderateScale(28),
};


const RTL_LINE_HEIGHT_FLOOR = 1.7;

const lineHeightFor = (ltrValue, fontSize) => {
  const designed = moderateScale(ltrValue);
  return isRTL
    ? Math.max(designed, Math.round(fontSize * RTL_LINE_HEIGHT_FLOOR))
    : designed;
};

export const LineHeights = {
  display: lineHeightFor(42, FontSizes.display),
  h1: lineHeightFor(34, FontSizes.h1),
  h2: lineHeightFor(28, FontSizes.h2),
  h3: lineHeightFor(26, FontSizes.h3),
  title: lineHeightFor(24, FontSizes.title),
  inputCompact: lineHeightFor(20, FontSizes.inputCompact),
  subtitle: lineHeightFor(22, FontSizes.subtitle),
  body: lineHeightFor(22, FontSizes.body),
  caption: lineHeightFor(18, FontSizes.caption),
  button: lineHeightFor(18, FontSizes.button),
  tabLabel: lineHeightFor(13, FontSizes.tabLabel),
  input: lineHeightFor(22, FontSizes.body),
  overline: lineHeightFor(15, FontSizes.overline),
  brand: lineHeightFor(34, FontSizes.brand),
};

/**
 * Match each Latin role to an explicit Noto Naskh file. Explicit files avoid platform
 * font synthesis and keep weight selection identical on iOS and Android.
 */
const ARABIC_FONTS = {
  [Fonts.regular]: Fonts.arabicRegular,
  [Fonts.medium]: Fonts.arabicMedium,
  [Fonts.semibold]: Fonts.arabicSemibold,
  [Fonts.bold]: Fonts.arabicBold,
  [Fonts.serif]: Fonts.arabicRegular,
  [Fonts.serifBold]: Fonts.arabicBold,
};

/**
 * Every text token in the app is built here, which makes it the one place that can keep
 * Urdu and Arabic legible without touching a single screen.
 *
 * Two properties that are correct for English are actively wrong for Arabic script, and
 * both are stripped when the app is in an RTL language (which, in this app, is exactly the
 * set of Arabic-script languages — see i18n/languages.js):
 *
 *  - fontFamily. Poppins ships no Arabic or Urdu glyphs and Georgia has none either, so
 *    naming them forces the platform into per-character fallback — inconsistent faces
 *    between runs of text at best, tofu boxes on stricter Android OEMs at worst. It is
 *    replaced by the same bundled Arabic Naskh family on both platforms. Each role maps
 *    to an explicit font file, so the visual hierarchy survives without synthesized weight.
 *  - letterSpacing. Arabic script is cursive: its letters join. Prising them apart by
 *    2.8pt — which is what the overline token does to "INSPIRATION GALLERY" — severs those
 *    joins and renders the word as loose disconnected shapes. Negative tracking is just as
 *    damaging in the other direction, so the whole property is zeroed rather than clamped.
 *
 * One property is ADDED for the same set of languages:
 *
 *  - writingDirection. Text with no explicit textAlign gets the platform's "natural"
 *    alignment, and the two platforms resolve that word differently. Android resolves it
 *    against the view's layout direction, so an RTL tree right-aligns everything for free.
 *    iOS resolves NSTextAlignmentNatural against the paragraph's base writing direction,
 *    which — left unset — comes from the bundle's own localization. That is English here
 *    and stays English in Urdu and Arabic, so every untouched label kept sitting on the
 *    left of a fully mirrored screen. Naming the base direction is what makes "natural"
 *    mean right, and it fixes bidi ordering in mixed runs at the same time. Alignment
 *    itself is left alone, so a token spread into a style that sets textAlign (Support's
 *    centred copy, the justified legal screens) still does exactly what it asks for.
 *
 * English is untouched: with isRTL false this returns exactly what it always did.
 */
/**
 * For the handful of styles that deliberately override a token's tracking. Wrapping the
 * value keeps them from re-introducing the letter-joining problem createTextStyle just
 * removed, without each of them having to know what RTL is.
 */
export const scriptSafeTracking = value => (isRTL ? 0 : value);

const createTextStyle = (
  fontFamily,
  fontSize,
  lineHeight,
  letterSpacing = 0,
) => {
  if (isRTL) {
    return {
      fontFamily: ARABIC_FONTS[fontFamily] || Fonts.arabicRegular,
      fontSize,
      lineHeight,
      letterSpacing: 0,
      writingDirection: 'rtl',
    };
  }

  return {
    fontFamily,
    fontSize,
    lineHeight,
    letterSpacing,
  };
};

export const createTextStyles = () => ({
  display: createTextStyle(
    Fonts.bold,
    FontSizes.display,
    LineHeights.display,
    -1.2,
  ),
  brand: createTextStyle(
    Fonts.serifBold,
    FontSizes.brand,
    LineHeights.brand,
    0.3,
  ),
  h1: createTextStyle(Fonts.bold, FontSizes.h1, LineHeights.h1, -0.8),
  h2: createTextStyle(Fonts.semibold, FontSizes.h2, LineHeights.h2, -0.5),
  h3: createTextStyle(Fonts.semibold, FontSizes.h3, LineHeights.h3, -0.3),
  title: createTextStyle(Fonts.semibold, FontSizes.title, LineHeights.title, -0.3),
  sectionSerif: createTextStyle(
    Fonts.serifBold,
    FontSizes.h2,
    LineHeights.h2,
    0.2,
  ),
  subtitle: createTextStyle(
    Fonts.regular,
    FontSizes.subtitle,
    LineHeights.subtitle,
    -0.1,
  ),
  body: createTextStyle(Fonts.regular, FontSizes.body, LineHeights.body),
  caption: createTextStyle(
    Fonts.regular,
    FontSizes.caption,
    LineHeights.caption,
    0.1,
  ),
  button: createTextStyle(
    Fonts.medium,
    FontSizes.button,
    LineHeights.button,
    0.4,
  ),
  tabLabel: createTextStyle(
    Fonts.medium,
    FontSizes.tabLabel,
    LineHeights.tabLabel,
    0.3,
  ),
  input: createTextStyle(Fonts.regular, FontSizes.body, LineHeights.input),
  inputCompact: createTextStyle(
    Fonts.regular,
    FontSizes.inputCompact,
    LineHeights.inputCompact,
  ),
  link: createTextStyle(Fonts.semibold, FontSizes.body, LineHeights.body),
  label: createTextStyle(
    Fonts.medium,
    FontSizes.caption,
    LineHeights.caption,
    0.2,
  ),
  overline: createTextStyle(
    Fonts.medium,
    FontSizes.overline,
    LineHeights.overline,
    2.8,
  ),
  sectionTitle: createTextStyle(
    Fonts.bold,
    FontSizes.h2,
    LineHeights.h2,
    -0.5,
  ),
  cardTitle: createTextStyle(
    Fonts.semibold,
    FontSizes.subtitle,
    LineHeights.subtitle,
    0.6,
  ),
  cardOverlay: createTextStyle(
    Fonts.medium,
    FontSizes.caption,
    LineHeights.caption,
    1.4,
  ),
  cardMeta: createTextStyle(
    Fonts.semibold,
    FontSizes.subtitle,
    LineHeights.subtitle,
    0.4,
  ),
  navLabel: createTextStyle(
    Fonts.medium,
    FontSizes.tabLabel,
    LineHeights.tabLabel,
    0.3,
  ),
});
