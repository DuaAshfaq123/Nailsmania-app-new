import {I18nManager} from 'react-native';

/**
 * The app's live layout direction.
 *
 * Read once, as a module constant, on purpose. I18nManager captures its native constants
 * a single time when React Native imports it, so `I18nManager.isRTL` cannot change within
 * a JS context — and LanguageContext restarts the process whenever the selected language
 * would change it. Direction is therefore fixed for the lifetime of the bundle, which is
 * what lets every call site below be a plain synchronous value instead of a hook, a
 * context read, or a re-render trigger.
 *
 * Nothing else in the app should reach for I18nManager directly; import from here.
 */
export const isRTL = I18nManager.isRTL;

/**
 * With native RTL on, React Native already mirrors nearly all layout for us:
 *
 *  - `flexDirection: 'row'` lays out right-to-left (Yoga).
 *  - `left`/`right`, `marginLeft`/`marginRight`, `paddingLeft`/`paddingRight` and the
 *    matching border properties are swapped (Fabric's swapLeftAndRightInRTL, on by
 *    default — see YogaLayoutableShadowNode::swapLeftAndRightInViewProps).
 *  - `textAlign: 'left'` resolves to Gravity.RIGHT and vice versa
 *    (TextAttributeProps.getTextAlignment).
 *  - TextInput text/cursor/placeholder alignment follows the paragraph direction.
 *  - Horizontal ScrollViews and FlatLists start from the right.
 *
 * This module exists for the two things it does NOT mirror, both of which appear below.
 */

/**
 * Icons are glyphs, not layout: nothing mirrors them, so a "back" arrow keeps pointing
 * left in an RTL tree, where back is to the right. Only icons whose meaning is
 * directional belong in this map — a search or heart icon must stay exactly as drawn.
 */
const MIRRORED_ICON_NAMES = {
  'arrow-back': 'arrow-forward',
  'arrow-forward': 'arrow-back',
  'arrow-back-outline': 'arrow-forward-outline',
  'arrow-forward-outline': 'arrow-back-outline',
  'chevron-back': 'chevron-forward',
  'chevron-forward': 'chevron-back',
  'chevron-back-outline': 'chevron-forward-outline',
  'chevron-forward-outline': 'chevron-back-outline',
  'arrow-back-circle': 'arrow-forward-circle',
  'arrow-forward-circle': 'arrow-back-circle',
};

/**
 * Returns the icon that points the same *semantic* way in the current direction.
 * Safe to wrap any icon name in: names outside the map are returned untouched.
 */
export const directionalIconName = name =>
  (isRTL && MIRRORED_ICON_NAMES[name]) || name;

/**
 * Mirrors a horizontal offset used inside a `transform`.
 *
 * Transforms are raw pixel translations applied after layout, so — unlike the style
 * properties listed above — RTL never touches them. A tab indicator that slides
 * `+index * tabWidth` still slides right in an RTL bar, away from the tab it is meant to
 * follow, because Yoga has already flipped the tabs underneath it. Negating the offset is
 * what keeps the two in step.
 */
export const directionalOffset = value => (isRTL ? -value : value);

/**
 * The same mirroring for an Animated interpolation output range whose INPUT is
 * direction-agnostic — a tab index, a 0→1 toggle progress, a looping shimmer clock.
 * Only the output axis needs flipping, so every value is negated in place.
 */
export const mirrorTransformRange = range =>
  isRTL ? range.map(value => -value) : range;

/**
 * Mirroring for an output range driven by a horizontal `contentOffset.x`.
 *
 * These need more than a negation, because RTL reverses the input axis as well. Android
 * reports the raw `View.getScrollX()` and React Native forwards it untouched (see
 * ReactScrollViewHelper.emitScrollEvent), and that value is always measured from the
 * physical left edge. An RTL list therefore RESTS at its maximum offset and counts DOWN to
 * zero as the user moves through it — the exact opposite of LTR.
 *
 * So the range is negated (output axis flipped) and reversed (input axis flipped), which
 * turns an LTR `[0, distance]` into `[-distance, 0]`.
 */
export const mirrorScrollDrivenRange = range =>
  isRTL ? range.map(value => -value).reverse() : range;

// U+2066 LEFT-TO-RIGHT ISOLATE / U+2069 POP DIRECTIONAL ISOLATE.
const LTR_ISOLATE = '⁦';
const POP_DIRECTIONAL_ISOLATE = '⁩';

/**
 * Forces a string to render left-to-right and in its original character order, whatever
 * direction the surrounding text runs in.
 *
 * This is for values that are not prose — phone numbers above all. Digits are only WEAKLY
 * directional under the Unicode bidirectional algorithm, and the characters around them in
 * a phone number ('+', spaces, dashes, parentheses) are NEUTRAL, so in an Arabic or Urdu
 * paragraph the algorithm resolves them against the paragraph direction: "+92 300 1234567"
 * renders as "92 300 1234567+", with the country-code prefix thrown to the far end. The
 * number is then wrong to read and wrong to copy.
 *
 * An isolate is the correct instrument rather than a plain LTR MARK: it makes the wrapped
 * run opaque to the bidi algorithm in BOTH directions, so the number cannot reorder
 * internally and cannot disturb the ordering of whatever sits next to it either.
 *
 * Note this governs character ORDER only. Where the value sits on screen is still layout's
 * business, so an RTL screen keeps its right-aligned (or centred) placement as designed.
 */
export const toLtrIsolate = value => {
  const text = value == null ? '' : String(value);
  if (!text) {
    return text;
  }
  return `${LTR_ISOLATE}${text}${POP_DIRECTIONAL_ISOLATE}`;
};
