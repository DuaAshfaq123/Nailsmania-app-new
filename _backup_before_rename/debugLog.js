const PREFIX = '[Mehandi Debug]';

export const debugLog = (scope, message, data) => {
  if (!__DEV__) {
    return;
  }

  if (data !== undefined) {
    console.log(`${PREFIX} [${scope}] ${message}`, data);
    return;
  }

  console.log(`${PREFIX} [${scope}] ${message}`);
};

export const debugWarn = (scope, message, data) => {
  if (!__DEV__) {
    return;
  }

  if (data !== undefined) {
    console.warn(`${PREFIX} [${scope}] ${message}`, data);
    return;
  }

  console.warn(`${PREFIX} [${scope}] ${message}`);
};

export const debugError = (scope, message, error) => {
  if (!__DEV__) {
    return;
  }

  console.error(`${PREFIX} [${scope}] ${message}`, error);
};
