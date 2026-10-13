/**
 * Production-safe logging utility.
 * Works in both debug and release builds for diagnostic purposes.
 * Uses console methods that work in all environments.
 *
 * In release APKs, these logs are visible via:
 * - Android Logcat: `adb logcat | grep "ReactNativeJS"`
 * - Sentry/Crash reporting services (when integrated)
 */

const PREFIX = '[AdMob-Diagnostics]';

// Track log history for debugging
const logHistory = {
  logs: [],
  maxSize: 100,
  addLog: (level, scope, message, data) => {
    const entry = {
      timestamp: Date.now(),
      level,
      scope,
      message,
      data,
    };
    logHistory.logs.push(entry);
    if (logHistory.logs.length > logHistory.maxSize) {
      logHistory.logs.shift();
    }
  },
  getHistory: () => [...logHistory.logs],
  clearHistory: () => {
    logHistory.logs = [];
  },
};

/**
 * Production log - always logged, works in release builds
 * Format: [AdMob-Diagnostics] [SCOPE] message {data}
 */
export const productionLog = (scope, message, data) => {
  const logMsg = `${PREFIX} [${scope}] ${message}`;
  
  // NEVER skip production logs
  if (data !== undefined) {
    console.log(logMsg, data);
  } else {
    console.log(logMsg);
  }
  
  logHistory.addLog('LOG', scope, message, data);
};

/**
 * Production warning - always logged, works in release builds
 * Format: [AdMob-Diagnostics] [SCOPE] WARNING: message {data}
 */
export const productionWarn = (scope, message, data) => {
  const logMsg = `${PREFIX} [${scope}] WARNING: ${message}`;
  
  // NEVER skip production warnings
  if (data !== undefined) {
    console.warn(logMsg, data);
  } else {
    console.warn(logMsg);
  }
  
  logHistory.addLog('WARN', scope, message, data);
};

/**
 * Production error - always logged, works in release builds
 * Format: [AdMob-Diagnostics] [SCOPE] ERROR: message {error}
 */
export const productionError = (scope, message, error) => {
  const logMsg = `${PREFIX} [${scope}] ERROR: ${message}`;
  
  // NEVER skip production errors
  console.error(logMsg, error);
  
  logHistory.addLog('ERROR', scope, message, error);
};

/**
 * Get diagnostic log history (for debugging dashboard, if added later)
 */
export const getDiagnosticHistory = () => {
  return {
    captured: logHistory.getHistory(),
    timestamp: Date.now(),
    count: logHistory.logs.length,
  };
};

/**
 * Clear diagnostic history to free memory
 */
export const clearDiagnosticHistory = () => {
  logHistory.clearHistory();
};

export default {
  log: productionLog,
  warn: productionWarn,
  error: productionError,
  getHistory: getDiagnosticHistory,
  clearHistory: clearDiagnosticHistory,
};
