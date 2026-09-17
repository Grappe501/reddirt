import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MissingDatabaseConnectionError } from '@netlify/database';
import {
  classifyDatabaseFailure,
  createTradingLabDatabaseAccess,
  inspectDatabaseEnvironment,
  redactDatabaseText,
} from '../netlify/lib/database.mjs';
import {
  REQUIRED_TABLES,
  handleRequest,
  readProductionDatabaseProof,
  sanitizePublicProof,
} from '../netlify/functions/production-db-proof.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

test('source tree never contains a database credential', async () => {
  const skip = new Set(['node_modules', 'dist', 'test']);
  const files = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (skip.has(entry.name) || entry.name.startsWith('.env')) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
        continue;
      }
      if (!/\.(mjs|js|toml|md|sql|html|css|yml|yaml|example)$/i.test(entry.name)) continue;
      files.push(path);
    }
  }
  await walk(root);

  for (const path of files) {
    const source = await readFile(path, 'utf8');
    assert.doesNotMatch(source, /postgres(?:ql)?:\/\/[^\s"'`]+/i, `${path} contains a Postgres URL`);
    assert.doesNotMatch(source, /process\.env\.(?:DATABASE_URL|DIRECT_URL|TRADING_LAB_DATABASE_URL)/, `${path} reads a user-managed database URL`);
  }
});

test('no real-money order path is enabled', async () => {
  const files = [
    join(root, 'netlify', 'functions', 'production-db-proof.mjs'),
    join(root, 'netlify', 'functions', 'market-health.mjs'),
    join(root, 'src', 'learning-engine.js'),
    join(root, 'src', 'calibration-lab.js'),
  ];
  for (const path of files) {
    const source = await readFile(path, 'utf8');
    assert.doesNotMatch(source, /ordersEnabled\s*:\s*true/, `${path} must keep ordersEnabled false`);
  }
  const functions = (await readdir(join(root, 'netlify', 'functions'))).filter((name) => name.endsWith('.mjs'));
  for (const name of functions) {
    const source = await readFile(join(root, 'netlify', 'functions', name), 'utf8');
    assert.doesNotMatch(source, /broker[-_]?order|live[-_]?money|submitOrder|placeOrder/i, `${name} must not introduce a real-money order path`);
  }
});

test('adapter prefers automatic binding and never reads user-managed URLs', () => {
  const getTradingLabDatabase = createTradingLabDatabaseAccess({
    getDatabaseFn: () => ({ driver: 'server', sql: {}, pool: { query() {} }, connectionString: 'postgres://secret' }),
    getConnectionStringFn: () => 'postgres://should-not-use',
    readPlatformManagedConnectionString: () => 'postgres://also-not-used',
  });
  const db = getTradingLabDatabase();
  assert.equal(db.driver, 'server');
  assert.equal('connectionString' in db, false);
});

test('adapter uses platform-managed NETLIFY_DB_URL only after automatic binding fails', () => {
  const calls = [];
  const getTradingLabDatabase = createTradingLabDatabaseAccess({
    getDatabaseFn: (options) => {
      calls.push(options);
      if (!options?.connectionString) throw new MissingDatabaseConnectionError();
      return { driver: 'server', sql: {}, pool: {}, connectionString: options.connectionString };
    },
    getConnectionStringFn: () => { throw new MissingDatabaseConnectionError(); },
    readPlatformManagedConnectionString: () => 'postgres://platform-managed',
  });
  const db = getTradingLabDatabase();
  assert.equal(db.driver, 'server');
  assert.equal(calls.at(-1).connectionString, 'postgres://platform-managed');
  assert.equal('connectionString' in db, false);
});

test('adapter ignores user-managed DATABASE_URL when Netlify Database is unbound', () => {
  const previous = process.env.DATABASE_URL;
  process.env.DATABASE_URL = 'postgres://user:pass@example.invalid/db';
  try {
    const getTradingLabDatabase = createTradingLabDatabaseAccess({
      getDatabaseFn: () => { throw new MissingDatabaseConnectionError(); },
      getConnectionStringFn: () => { throw new MissingDatabaseConnectionError(); },
      readPlatformManagedConnectionString: () => '',
    });
    assert.throws(
      () => getTradingLabDatabase(),
      (error) => error.code === 'DATABASE_ENVIRONMENT_UNAVAILABLE',
    );
  } finally {
    if (previous === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previous;
  }
});

test('inspectDatabaseEnvironment reports safe booleans only', () => {
  const env = inspectDatabaseEnvironment({
    getConnectionStringFn: () => { throw new MissingDatabaseConnectionError(); },
    readPlatformManagedConnectionString: () => '',
  });
  assert.equal(env.databaseEnvironmentAvailable, false);
  assert.equal(env.automaticBindingAvailable, false);
  assert.equal(env.platformManagedUrlPresent, false);
  assert.equal(JSON.stringify(env).includes('postgres'), false);
});

test('production proof distinguishes environment, schema, and table failures', async () => {
  const previous = process.env.NETLIFY_DB_URL;
  delete process.env.NETLIFY_DB_URL;
  let missingEnv;
  try {
    missingEnv = JSON.parse((await handleRequest({ httpMethod: 'GET' })).body);
  } finally {
    if (previous === undefined) delete process.env.NETLIFY_DB_URL;
    else process.env.NETLIFY_DB_URL = previous;
  }
  assert.equal(missingEnv.ok, false);
  assert.equal(missingEnv.ordersEnabled, false);
  assert.equal(missingEnv.databaseEnvironmentAvailable, false);
  assert.equal(missingEnv.databaseConnectionEstablished, false);
  assert.equal(missingEnv.failureClass, 'database-environment-unavailable');
  assert.equal('connectionString' in missingEnv, false);
  assert.equal('password' in missingEnv, false);
  assert.equal('host' in missingEnv, false);

  const complete = await readProductionDatabaseProof({
    pool: {
      query: async (sql) => {
        if (sql.includes('schemata')) return { rows: [{ schema_exists: true }] };
        if (sql.includes('information_schema.tables')) {
          return { rows: REQUIRED_TABLES.map((table_name) => ({ table_name })) };
        }
        return { rows: [{ observations: 2, learning_cycles: 1, calibration_cycles: 1, strategy_versions: 0 }] };
      },
    },
  });
  assert.equal(complete.schemaExists, true);
  assert.equal(complete.requiredTableCount, REQUIRED_TABLES.length);
  assert.equal(complete.presentRequiredTableCount, REQUIRED_TABLES.length);
  assert.deepEqual(complete.missingTables, []);

  const absentSchema = await readProductionDatabaseProof({
    pool: {
      query: async (sql) => {
        if (sql.includes('schemata')) return { rows: [{ schema_exists: false }] };
        return { rows: [] };
      },
    },
  });
  assert.equal(absentSchema.schemaExists, false);
  assert.equal(absentSchema.presentRequiredTableCount, 0);
  assert.deepEqual(absentSchema.missingTables, REQUIRED_TABLES);

  const missingTables = await readProductionDatabaseProof({
    pool: {
      query: async (sql) => {
        if (sql.includes('schemata')) return { rows: [{ schema_exists: true }] };
        return { rows: [{ table_name: 'market_observations' }] };
      },
    },
  });
  assert.equal(missingTables.schemaExists, true);
  assert.ok(missingTables.missingTables.includes('paper_trades'));
  assert.ok(missingTables.presentRequiredTableCount < missingTables.requiredTableCount);
});

test('production proof never returns connection secrets', () => {
  const leaked = sanitizePublicProof({
    ok: false,
    ordersEnabled: false,
    connectionString: 'postgres://user:pass@host/db',
    password: 'secret',
    username: 'trading',
    token: 'abc',
    host: 'db.internal',
    databaseEnvironmentAvailable: false,
  });
  assert.equal('connectionString' in leaked, false);
  assert.equal('password' in leaked, false);
  assert.equal('username' in leaked, false);
  assert.equal('token' in leaked, false);
  assert.equal('host' in leaked, false);
  assert.equal(leaked.ordersEnabled, false);
  assert.equal(leaked.databaseEnvironmentAvailable, false);
  assert.equal(redactDatabaseText('failed postgres://user:pass@host/db').includes('pass'), false);
  assert.equal(classifyDatabaseFailure(new MissingDatabaseConnectionError()).failureClass, 'database-environment-unavailable');
});

test('learning and calibration safety gates remain intact', async () => {
  const { handleRequest: persistLearning } = await import('../netlify/functions/learning-cycle.mjs');
  const { handleRequest: persistCalibration } = await import('../netlify/functions/calibration-cycle.mjs');

  const learning = JSON.parse((await persistLearning({
    httpMethod: 'POST',
    body: JSON.stringify({ id: 'cycle-1', learningVersion: 'v1', ethics: { fictionalOnly: true } }),
  })).body);
  assert.equal(learning.ok, false);
  assert.match(learning.message, /safety contract/i);

  const calibration = JSON.parse((await persistCalibration({
    httpMethod: 'POST',
    body: JSON.stringify({ id: 'cal-1', safety: { noLiveOrders: true } }),
  })).body);
  assert.equal(calibration.ok, false);
  assert.match(calibration.message, /safety contract/i);
});
