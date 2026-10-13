export const NAME_MIN_LENGTH = 3;
export const NAME_MAX_LENGTH = 18;

// Distinct codes rather than raw strings so the caller resolves the message through i18n.
export const NAME_ERROR = {
  REQUIRED: 'required',
  TOO_SHORT: 'tooShort',
  TOO_LONG: 'tooLong',
  LEADING_SPACE: 'leadingSpace',
  TRAILING_SPACE: 'trailingSpace',
  DOUBLE_SPACE: 'doubleSpace',
  INVALID_CHARS: 'invalidChars',
};

// Letters only, single spaces between words. Unicode-aware (\p{L}) so non-Latin names
// like "أحمد" or "Zoë" are accepted — restricting to A-Z would wrongly reject real users
// of an app with a South-Asian / Middle-Eastern audience.
const VALID_NAME_PATTERN = /^\p{L}+(?: \p{L}+)*$/u;

/**
 * Validates a profile display name.
 *
 * Checks run in the order a user would naturally fix them (whitespace problems before
 * character problems) so the first message shown is the most actionable one.
 * Returns null when valid, otherwise a NAME_ERROR code.
 *
 * Note: length is measured on the TRIMMED value, so " Jo " fails as too short rather
 * than passing on the strength of its padding.
 */
export const validateName = rawName => {
  if (typeof rawName !== 'string' || rawName.length === 0) {
    return NAME_ERROR.REQUIRED;
  }

  if (rawName !== rawName.trimStart()) {
    return NAME_ERROR.LEADING_SPACE;
  }

  if (rawName !== rawName.trimEnd()) {
    return NAME_ERROR.TRAILING_SPACE;
  }

  const name = rawName.trim();

  if (name.length === 0) {
    return NAME_ERROR.REQUIRED;
  }

  if (/ {2,}/.test(name)) {
    return NAME_ERROR.DOUBLE_SPACE;
  }

  if (name.length < NAME_MIN_LENGTH) {
    return NAME_ERROR.TOO_SHORT;
  }

  if (name.length > NAME_MAX_LENGTH) {
    return NAME_ERROR.TOO_LONG;
  }

  // Catches digits, punctuation, emoji, symbols — anything that isn't a letter or the
  // single separating spaces already validated above.
  if (!VALID_NAME_PATTERN.test(name)) {
    return NAME_ERROR.INVALID_CHARS;
  }

  return null;
};

export const isNameValid = rawName => validateName(rawName) === null;
