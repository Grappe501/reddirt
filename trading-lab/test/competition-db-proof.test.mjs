import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  COMPETITION_PROOF_IDS,
  runCompetitionDatabaseProof,
} from '../netlify/lib/competition-db-proof.mjs';
import { handleRequest, sanitizePublicProof } from '../netlify/functions/competition-db-proof.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

function createFakeDb() {
  const rows = {
    cohorts: new Map(),
    members: new Map(),
    portfolios: new Map(),
    fills: new Map(),
    credits: new Map(),
  };

  const client = {
    query: async (sql, params = []) => {
      const text = String(sql);
      if (/^begin$/i.test(text.trim()) || /^commit$/i.test(text.trim()) || /^rollback$/i.test(text.trim())) {
        return { rows: [] };
      }
      if (/insert into trading_lab\.competition_cohorts/i.test(text)) {
        rows.cohorts.set(params[0], {
          id: params[0],
          status: params[1],
          rules_fingerprint: params[2],
          scoring_fingerprint: params[3],
          ai_seal_fingerprint: params[4],
        });
        return { rows: [] };
      }
      if (/insert into trading_lab\.competition_members/i.test(text)) {
        rows.members.set(`${params[0]}:${params[1]}`, {
          cohort_id: params[0],
          human_id: params[1],
          verified: false,
        });
        return { rows: [] };
      }
      if (/insert into trading_lab\.competition_portfolios/i.test(text)) {
        rows.portfolios.set(params[0], {
          id: params[0],
          cohort_id: params[1],
          owner_id: params[2],
          owner_type: /WEALTH_BUILDER_AI/.test(text) ? 'WEALTH_BUILDER_AI' : 'HUMAN',
          starting_cash: Number(params[3]),
        });
        return { rows: [] };
      }
      if (/insert into trading_lab\.competition_fills/i.test(text)) {
        rows.fills.set(params[0], {
          id: params[0],
          symbol: params[2],
          side: params[3],
          quantity: Number(params[4]),
          canonical_price: Number(params[5]),
          decision_source: params[10],
        });
        return { rows: [] };
      }
      if (/insert into trading_lab\.research_credit_ledger/i.test(text)) {
        rows.credits.set(params[0], {
          id: params[0],
          human_id: params[1],
          delta: Number(params[2]),
          reason: params[3],
        });
        return { rows: [] };
      }
      if (/from trading_lab\.competition_cohorts where id/i.test(text)) {
        const row = rows.cohorts.get(params[0]);
        return { rows: row ? [row] : [] };
      }
      if (/from trading_lab\.competition_members where/i.test(text)) {
        const row = rows.members.get(`${params[0]}:${params[1]}`);
        return { rows: row ? [row] : [] };
      }
      if (/from trading_lab\.competition_portfolios where cohort_id/i.test(text)) {
        return {
          rows: [...rows.portfolios.values()]
            .filter((row) => row.cohort_id === params[0])
            .sort((a, b) => a.owner_type.localeCompare(b.owner_type)),
        };
      }
      if (/from trading_lab\.competition_fills where id/i.test(text)) {
        const row = rows.fills.get(params[0]);
        return { rows: row ? [row] : [] };
      }
      if (/from trading_lab\.research_credit_ledger where id/i.test(text)) {
        const row = rows.credits.get(params[0]);
        return { rows: row ? [row] : [] };
      }
      return { rows: [] };
    },
    release() {},
  };

  return {
    pool: {
      connect: async () => client,
      query: client.query,
    },
  };
}

test('competition proof is POST-only and never enables orders', async () => {
  const denied = JSON.parse((await handleRequest({ httpMethod: 'GET' })).body);
  assert.equal(denied.ok, false);
  assert.equal(denied.ordersEnabled, false);
  assert.match(denied.message, /POST required/i);
});

test('competition proof persists cohort, member, portfolios, fill, and credit', async () => {
  const proof = await runCompetitionDatabaseProof(createFakeDb());
  assert.equal(proof.ok, true);
  assert.equal(proof.ordersEnabled, false);
  assert.equal(proof.realMoney, false);
  assert.equal(proof.foundingCohortLaunchAuthorized, false);
  assert.equal(proof.cohortVisible, true);
  assert.equal(proof.memberVisible, true);
  assert.equal(proof.portfolioCount, 2);
  assert.equal(proof.fillVisible, true);
  assert.equal(proof.creditVisible, true);
  assert.equal(proof.startingCapitalMatches, true);
  assert.equal(proof.fillUsesCanonicalPrice, true);
  assert.equal(proof.creditAuditable, true);
  assert.equal(proof.proofIds.cohort, COMPETITION_PROOF_IDS.cohort);
  assert.equal(proof.proofIds.human, 'v7-02-proof-human');
});

test('competition proof fails closed when readback is empty', async () => {
  const empty = {
    pool: {
      connect: async () => ({
        query: async (sql) => {
          if (/^begin$/i.test(String(sql).trim()) || /^commit$/i.test(String(sql).trim())) return { rows: [] };
          return { rows: [] };
        },
        release() {},
      }),
      query: async () => ({ rows: [] }),
    },
  };
  const proof = await runCompetitionDatabaseProof(empty);
  assert.equal(proof.ok, false);
  assert.equal(proof.cohortVisible, false);
  assert.equal(proof.foundingCohortLaunchAuthorized, false);
});

test('competition proof response cannot leak connection secrets', () => {
  const leaked = sanitizePublicProof({
    ok: true,
    ordersEnabled: false,
    connectionString: 'postgres://user:pass@host/db',
    password: 'secret',
    host: 'db.internal',
    cohortVisible: true,
  });
  assert.equal('connectionString' in leaked, false);
  assert.equal('password' in leaked, false);
  assert.equal('host' in leaked, false);
  assert.equal(leaked.ordersEnabled, false);
  assert.equal(leaked.cohortVisible, true);
});

test('official migration 007 creates trading_lab competition tables', async () => {
  const sql = await readFile(
    join(root, 'netlify', 'database', 'migrations', '007_competition-persistence', 'migration.sql'),
    'utf8',
  );
  for (const table of [
    'competition_cohorts',
    'competition_members',
    'competition_portfolios',
    'competition_fills',
    'research_credit_ledger',
  ]) {
    assert.match(sql, new RegExp(`trading_lab\\.${table}\\b`));
  }
  const withoutComments = sql.replace(/--[^\n]*/g, '');
  assert.doesNotMatch(withoutComments, /(?<!")\bcurrent_role\b(?!")/i);
  assert.doesNotMatch(withoutComments, /DATABASE_URL|DIRECT_URL|TRADING_LAB_DATABASE_URL/);
});
