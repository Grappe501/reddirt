import { getDatabase, getConnectionString, MissingDatabaseConnectionError } from '@netlify/database';

const USER_MANAGED_URL_KEYS = ['DATABASE_URL', 'DIRECT_URL', 'TRADING_LAB_DATABASE_URL'];
const CONNECTION_FAILURE = /connect|econnrefused|enotfound|etimedout|timeout|ssl|socket/i;

export class TradingLabDatabaseError extends Error {
  constructor(code, message, cause) {
    super(message);
    this.name = 'TradingLabDatabaseError';
    this.code = code;
    this.cause = cause;
  }
}

export function isMissingDatabaseBinding(error) {
  return error instanceof MissingDatabaseConnectionError
    || error?.code === 'DATABASE_ENVIRONMENT_UNAVAILABLE'
    || /environment has not been configured/i.test(String(error?.message || ''));
}

function defaultReadPlatformManagedConnectionString() {
  const value = process.env.NETLIFY_DB_URL;
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function concealSecrets(db) {
  const concealed = {
    driver: db.driver,
    sql: db.sql,
    pool: db.pool,
  };
  if (db.httpClient) concealed.httpClient = db.httpClient;
  return concealed;
}

export function redactDatabaseText(value) {
  return String(value ?? '')
    .replace(/(postgres(?:ql)?:\/\/)\S+/gi, '$1[redacted]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g, '[redacted-identity]');
}

export function inspectDatabaseEnvironment({
  getConnectionStringFn = getConnectionString,
  readPlatformManagedConnectionString = defaultReadPlatformManagedConnectionString,
} = {}) {
  let automaticBindingAvailable = false;
  try {
    automaticBindingAvailable = Boolean(getConnectionStringFn());
  } catch {
    automaticBindingAvailable = false;
  }

  const platformManagedUrlPresent = Boolean(readPlatformManagedConnectionString());
  return {
    databaseEnvironmentAvailable: automaticBindingAvailable || platformManagedUrlPresent,
    automaticBindingAvailable,
    platformManagedUrlPresent,
    netlifyEnvInterfacePresent: Boolean(globalThis.Netlify?.env),
  };
}

export function createTradingLabDatabaseAccess({
  getDatabaseFn = getDatabase,
  getConnectionStringFn = getConnectionString,
  readPlatformManagedConnectionString = defaultReadPlatformManagedConnectionString,
} = {}) {
  return function getTradingLabDatabase() {
    try {
      return concealSecrets(getDatabaseFn());
    } catch (error) {
      if (!isMissingDatabaseBinding(error)) {
        throw new TradingLabDatabaseError('DATABASE_CLIENT_UNAVAILABLE', 'Netlify Database client failed to initialize.', error);
      }
    }

    // getConnectionString() uses the same Netlify.env-first lookup as getDatabase().
    // If that interface is present but empty (Lambda compatibility), read the
    // platform-injected NETLIFY_DB_URL from process.env. Never use user-managed URLs.
    let connectionString = '';
    try {
      connectionString = getConnectionStringFn() || '';
    } catch {
      connectionString = '';
    }
    if (!connectionString) {
      connectionString = readPlatformManagedConnectionString();
    }

    if (!connectionString) {
      throw new TradingLabDatabaseError(
        'DATABASE_ENVIRONMENT_UNAVAILABLE',
        'Netlify Database environment is unavailable. Automatic binding was missing and the platform-managed NETLIFY_DB_URL was not present.',
      );
    }

    try {
      return concealSecrets(getDatabaseFn({ connectionString }));
    } catch (error) {
      throw new TradingLabDatabaseError(
        'DATABASE_CLIENT_UNAVAILABLE',
        'Netlify Database client failed to initialize with the platform-managed connection.',
        error,
      );
    }
  };
}

export const getTradingLabDatabase = createTradingLabDatabaseAccess();

export function classifyDatabaseFailure(error) {
  if (isMissingDatabaseBinding(error)) {
    return {
      failureClass: 'database-environment-unavailable',
      databaseEnvironmentAvailable: false,
      databaseConnectionEstablished: false,
    };
  }

  const message = String(error?.message || error || '');
  if (error?.code === 'DATABASE_CLIENT_UNAVAILABLE' || CONNECTION_FAILURE.test(message)) {
    return {
      failureClass: 'database-connection-unavailable',
      databaseEnvironmentAvailable: true,
      databaseConnectionEstablished: false,
    };
  }

  return {
    failureClass: 'database-query-failed',
    databaseEnvironmentAvailable: true,
    databaseConnectionEstablished: true,
  };
}

export function assertNoUserManagedDatabaseUrl(source) {
  for (const key of USER_MANAGED_URL_KEYS) {
    if (new RegExp(`process\\.env\\.${key}\\b`).test(source)) {
      throw new Error(`${key} is outside the Trading Lab database boundary.`);
    }
  }
}

export const USER_MANAGED_DATABASE_URL_KEYS = USER_MANAGED_URL_KEYS;
