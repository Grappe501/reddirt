import test from 'node:test';
import assert from 'node:assert/strict';
import { sealAiContestant } from '../src/v5-sealed-ai-contestant.js';
import {
  PRODUCTION_AI_PROVIDER,
  aiSealAllowsFill,
  productionAiSealConfig,
  proveSharedExecutionPath,
  publicAiSeal,
  readCompetitionAiSeal,
  writeCompetitionAiSeal,
} from '../netlify/lib/competition-ai.mjs';
import { runCompetitionAiSealProof, v7AiSealProofInput } from '../netlify/lib/competition-ai-proof.mjs';
import { COMPETITION_PROOF_IDS } from '../netlify/lib/competition-db-proof.mjs';
import { handleRequest as sealHandler } from '../netlify/functions/competition-ai-seal.mjs';
import { handleRequest as proofHandler } from '../netlify/functions/competition-ai-seal-proof.mjs';
import { rejectForbiddenWrite, sanitizePublicCompetition } from '../netlify/lib/competition-http.mjs';
import { writeCompetitionFill } from '../netlify/lib/competition-api.mjs';

function createFakeAiDb() {
  const store = {
    cohorts: new Map([[COMPETITION_PROOF_IDS.cohort, {
      id: COMPETITION_PROOF_IDS.cohort,
      status: 'PROOF',
      ai_seal_fingerprint: 'v7-02-ai-seal-fingerprint',
    }]]),
    portfolios: new Map([[COMPETITION_PROOF_IDS.aiPortfolio, {
      id: COMPETITION_PROOF_IDS.aiPortfolio,
      cohort_id: COMPETITION_PROOF_IDS.cohort,
      owner_id: 'WEALTH_BUILDER_AI',
      owner_type: 'WEALTH_BUILDER_AI',
      starting_cash: 100000,
      cash: 100000,
    }]]),
    seals: new Map(),
    audits: [],
    fills: [],
  };

  const query = async (sql, params = []) => {
    const text = String(sql);
    if (/^begin$/i.test(text.trim()) || /^commit$/i.test(text.trim()) || /^rollback$/i.test(text.trim())) return { rows: [] };
    if (/insert into trading_lab\.competition_cohorts/i.test(text)) {
      const current = store.cohorts.get(params[0]) || {};
      store.cohorts.set(params[0], {
        id: params[0],
        status: params[1],
        ai_seal_fingerprint: current.ai_seal_fingerprint || params[4],
      });
      return { rows: [] };
    }
    if (/insert into trading_lab\.competition_portfolios/i.test(text)) {
      if (!store.portfolios.has(params[0])) {
        store.portfolios.set(params[0], {
          id: params[0],
          cohort_id: params[1],
          owner_id: params[2],
          owner_type: 'WEALTH_BUILDER_AI',
          starting_cash: params[3],
          cash: params[3],
        });
      }
      return { rows: [] };
    }
    if (/from trading_lab\.competition_cohorts where id/i.test(text)) {
      const row = store.cohorts.get(params[0]);
      return { rows: row ? [row] : [] };
    }
    if (/from trading_lab\.competition_ai_seals s/i.test(text) && /join trading_lab\.competition_cohorts/i.test(text)) {
      const seal = store.seals.get(params[0]);
      const cohort = store.cohorts.get(params[0]);
      return { rows: seal && cohort ? [{ ...seal, ai_seal_fingerprint: cohort.ai_seal_fingerprint }] : [] };
    }
    if (/from trading_lab\.competition_ai_seals where cohort_id/i.test(text)) {
      const seal = store.seals.get(params[0]);
      return { rows: seal ? [seal] : [] };
    }
    if (/insert into trading_lab\.competition_ai_seals/i.test(text)) {
      store.seals.set(params[0], {
        cohort_id: params[0],
        fingerprint: params[1],
        seal_record: JSON.parse(params[2]),
        mutation_allowed: false,
        real_money: false,
        sealed_at: params[3],
      });
      return { rows: [] };
    }
    if (/update trading_lab\.competition_cohorts set ai_seal_fingerprint/i.test(text)) {
      const row = store.cohorts.get(params[0]);
      if (row) row.ai_seal_fingerprint = params[1];
      return { rows: [] };
    }
    if (/insert into trading_lab\.competition_audit/i.test(text)) {
      store.audits.push({ id: params[0], action: params[1] });
      return { rows: [] };
    }
    if (/select seal_record from trading_lab\.competition_ai_seals/i.test(text)) {
      const seal = store.seals.get(params[0]);
      return { rows: seal ? [{ seal_record: seal.seal_record }] : [] };
    }
    if (/from trading_lab\.competition_portfolios p/i.test(text) && /where p\.id/i.test(text)) {
      const row = store.portfolios.get(params[0]);
      const cohort = row ? store.cohorts.get(row.cohort_id) : null;
      return { rows: row ? [{ ...row, cohort_status: cohort?.status, ai_seal_fingerprint: cohort?.ai_seal_fingerprint }] : [] };
    }
    if (/select id from trading_lab\.competition_fills where id/i.test(text)) {
      return { rows: store.fills.filter((row) => row.id === params[0]).map((row) => ({ id: row.id })) };
    }
    if (/from trading_lab\.competition_fills/i.test(text) && /where portfolio_id/i.test(text)) {
      return { rows: store.fills.filter((row) => row.portfolio_id === params[0]) };
    }
    if (/insert into trading_lab\.competition_fills/i.test(text)) {
      store.fills.push({ id: params[0], portfolio_id: params[1] });
      return { rows: [] };
    }
    if (/update trading_lab\.competition_portfolios set cash/i.test(text)) {
      const row = store.portfolios.get(params[0]);
      if (row) row.cash = params[1];
      return { rows: [] };
    }
    return { rows: [] };
  };

  return {
    store,
    pool: {
      connect: async () => ({ query, release() {} }),
      query,
    },
  };
}

test('public AI seal never exposes secrets or permits mutation', () => {
  const sealed = sealAiContestant(v7AiSealProofInput());
  const view = publicAiSeal(sealed);
  assert.equal(view.contestantType, 'WEALTH_BUILDER_AI');
  assert.equal(view.mutationAllowed, false);
  assert.equal(view.realMoney, false);
  assert.equal(view.foundingCohort, false);
  assert.equal(view.provider.marketProvider, 'alpaca');
  assert.equal(view.provider.executionMethod, 'CANONICAL_V5');
  assert.equal('key' in view, false);
  assert.equal('secret' in view, false);
});

test('human and AI share the same canonical market and accounting path', () => {
  const proof = proveSharedExecutionPath();
  assert.equal(proof.parity, true);
  assert.equal(proof.sameExecutionPrice, true);
  assert.equal(proof.sameCash, true);
  assert.equal(proof.executionMethod, 'CANONICAL_V5');
  assert.equal(proof.realMoney, false);
  assert.equal(PRODUCTION_AI_PROVIDER.liveBroker, false);
});

test('seal write persists, verifies, and blocks mid-cohort mutation', async () => {
  const db = createFakeAiDb();
  const proof = await runCompetitionAiSealProof(db);
  assert.equal(proof.ok, true);
  assert.equal(proof.sealValid, true);
  assert.equal(proof.mutationBlocked, true);
  assert.equal(proof.sharedExecutionPath.parity, true);
  assert.equal(proof.foundingCohortLaunchAuthorized, false);
  assert.equal(db.store.audits[0].id, `audit:ai-seal:${COMPETITION_PROOF_IDS.cohort}`);
  const stored = db.store.seals.get(COMPETITION_PROOF_IDS.cohort);
  assert.equal(aiSealAllowsFill(stored, db.store.cohorts.get(COMPETITION_PROOF_IDS.cohort).ai_seal_fingerprint), true);
  await assert.rejects(
    () => writeCompetitionAiSeal(db, v7AiSealProofInput({ modelVersion: 'mutated-after-outcome' })),
    /cannot change/,
  );
});

test('idempotent reseal keeps the same fingerprint', async () => {
  const db = createFakeAiDb();
  const first = await writeCompetitionAiSeal(db, v7AiSealProofInput());
  const second = await writeCompetitionAiSeal(db, v7AiSealProofInput());
  assert.equal(second.idempotent, true);
  assert.equal(first.seal.fingerprint, second.seal.fingerprint);
});

test('GET without a cohort returns the provider boundary only', async () => {
  const result = await readCompetitionAiSeal(createFakeAiDb(), '');
  assert.equal(result.seal, null);
  assert.equal(result.provider.marketProvider, 'alpaca');
  assert.equal(result.mutationAllowed, false);
});

test('active sealed AI can take a simulated fill on the shared path', async () => {
  const db = createFakeAiDb();
  await writeCompetitionAiSeal(db, v7AiSealProofInput());
  db.store.cohorts.get(COMPETITION_PROOF_IDS.cohort).status = 'ACTIVE';
  const result = await writeCompetitionFill(db, {
    id: 'v7-06-ai-fill',
    portfolioId: COMPETITION_PROOF_IDS.aiPortfolio,
    symbol: 'SPY',
    side: 'BUY',
    quantity: 1,
    canonicalPrice: 100,
    decisionSource: 'WEALTH_BUILDER_AI',
    filledAt: '2026-09-19T13:30:01.000Z',
  });
  assert.equal(result.ok, true);
  assert.equal(result.simulationOnly, true);
  assert.equal(result.fill.decisionSource, 'WEALTH_BUILDER_AI');
});

test('AI seal handlers reject launch, live money, and mutation flags', async () => {
  const launch = JSON.parse((await sealHandler({ httpMethod: 'POST', body: JSON.stringify({ launch: true }) })).body);
  const money = rejectForbiddenWrite({ realMoney: true });
  const mutated = JSON.parse((await sealHandler({ httpMethod: 'POST', body: JSON.stringify({ mutationAllowed: true, cohortId: 'c1' }) })).body);
  const method = JSON.parse((await proofHandler({ httpMethod: 'GET' })).body);
  assert.equal(launch.ok, false);
  assert.match(launch.message, /launch/i);
  assert.match(money || '', /Live-money/i);
  assert.equal(mutated.ok, false);
  assert.match(mutated.message, /mutat/i);
  assert.equal(method.ok, false);
});

test('AI seal responses cannot leak connection secrets', () => {
  const leaked = sanitizePublicCompetition({
    ok: true,
    connectionString: 'postgres://user:pass@host/db',
    secret: 'alpaca-secret',
    seal: publicAiSeal(sealAiContestant(productionAiSealConfig({ cohortId: 'c1', sealedAt: 't' }))),
  });
  assert.equal('connectionString' in leaked, false);
  assert.equal('secret' in leaked, false);
  assert.equal(leaked.seal.mutationAllowed, false);
});
