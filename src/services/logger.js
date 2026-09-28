import AsyncStorage from '@react-native-async-storage/async-storage';

const LOG_KEY = 'disasterbuddy.diagnostic.logs.v1';
const MAX_LOGS = 100;
const sensitiveKeys = /password|token|apikey|authorization|coordinates|latitude|longitude/i;

function sanitizeContext(context = {}) {
  const safeContext = {};

  for (const key of Object.keys(context)) {
    if (sensitiveKeys.test(key)) {
      continue;
    }

    const value = context[key];
    safeContext[key] = typeof value === 'string' ? value.slice(0, 240) : value;
  }

  return safeContext;
}

async function persist(entry) {
  try {
    const existing = JSON.parse(await AsyncStorage.getItem(LOG_KEY)) ?? [];
    await AsyncStorage.setItem(LOG_KEY, JSON.stringify([entry, ...existing].slice(0, MAX_LOGS)));
  } catch { /* Logging must never interrupt the application. */ }
}

function write(level, event, error, context) {
  const entry = {
    level,
    event,
    message: error instanceof Error ? error.message : typeof error === 'string' ? error : undefined,
    code: error?.code,
    context: sanitizeContext(context),
    timestamp: new Date().toISOString(),
  };
  if (__DEV__) {
    const method = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info;
    method(`[DisasterBuddy] ${event}`, entry.message ?? '', entry.context);
  }
  persist(entry);
}

const logger = {
  info: (event, context = {}) => write('info', event, null, context),
  warn: (event, error, context = {}) => write('warn', event, error, context),
  error: (event, error, context = {}) => write('error', event, error, context),
  async getRecentLogs() { try { return JSON.parse(await AsyncStorage.getItem(LOG_KEY)) ?? []; } catch { return []; } },
  async clearLogs() { await AsyncStorage.removeItem(LOG_KEY); },
};

export default logger;
