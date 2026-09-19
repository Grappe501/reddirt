import test from 'node:test';
import assert from 'node:assert/strict';
import { publicLobbyRow, publicPortfolio, replayPortfolio, writeCompetitionFill } from '../netlify/lib/competition-api.mjs';
import { handleRequest as lobby } from '../netlify/functions/competition-lobby.mjs';
import { handleRequest as portfolio } from '../netlify/functions/competition-portfolio.mjs';
import { handleRequest as fill } from '../netlify/functions/competition-fill.mjs';
import { rejectForbiddenWrite, sanitizePublicCompetition } from '../netlify/lib/competition-http.mjs';

function createFakeDb({ status = 'PROOF', cash = 99900, fills = [{
  id: 'v7-02-proof-fill',
  symbol: 'SPY',
  side: 'BUY',
  quantity: 1,
  canonical_price: 100,
  commission: 0,
  spread_cost: 0,
  slippage_cost: 0,
  filled_at: '2026-09-19T00:00:00.000Z',
  decision_source: 'HUMAN',
}] } = {}) {
  const store = {
    cohort: { id: 'v7-02-competition-db-proof', status, starts_at: null, created_at: '2026-09-19T00:00:00.000Z' },
    portfolio: {
      id: 'v7-02-proof-human-portfolio',
      cohort_id: 'v7-02-competition-db-proof',
      owner_id: 'v7-02-proof-human',
      owner_type: 'HUMAN',
      starting_cash: 100000,
      cash,
    },
    fills: [...fills],
    audits: [],
    identities: [],
    seals: [],
  };

  const query = async (sql, params = []) => {
    const text = String(sql);
    if (/^begin$/i.test(text.trim()) || /^commit$/i.test(text.trim()) || /^rollback$/i.test(text.trim())) return { rows: [] };
    if (/from trading_lab\.competition_cohorts c/i.test(text)) {
      return { rows: [{ id: store.cohort.id, status: store.cohort.status, starts_at: null, verified_humans: 0, ai_sealed: store.seals.length > 0 }] };
    }
    if (/from trading_lab\.competition_ai_seals/i.test(text)) {
      return { rows: store.seals.filter((row) => !params[0] || row.cohort_id === params[0]) };
    }
    if (/from trading_lab\.competition_identities i/i.test(text)) {
      return { rows: store.identities.filter((row) => row.identity_id === params[0]) };
    }
    if (/from trading_lab\.competition_portfolios p/i.test(text) && /where p\.id/i.test(text)) {
      return params[0] === store.portfolio.id
        ? { rows: [{ ...store.portfolio, cohort_status: store.cohort.status }] }
        : { rows: [] };
    }
    if (/select id from trading_lab\.competition_fills where id/i.test(text)) {
      return { rows: store.fills.filter((row) => row.id === params[0]).map((row) => ({ id: row.id })) };
    }
    if (/from trading_lab\.competition_fills/i.test(text)) {
      return { rows: store.fills.filter((row) => !params[0] || row.id === params[0] || true).filter((row) => row) };
    }
    if (/insert into trading_lab\.competition_fills/i.test(text)) {
      store.fills.push({
        id: params[0],
        portfolio_id: params[1],
        symbol: params[2],
        side: params[3],
        quantity: params[4],
        canonical_price: params[5],
        commission: params[6],
        spread_cost: params[7],
        slippage_cost: params[8],
        filled_at: params[9],
        decision_source: params[10],
      });
      return { rows: [] };
    }
    if (/update trading_lab\.competition_portfolios set cash/i.test(text)) {
      store.portfolio.cash = params[1];
      return { rows: [] };
    }
    if (/insert into trading_lab\.competition_audit/i.test(text)) {
      store.audits.push({ id: params[0], action: params[1] });
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

test('lobby rows never expose human identities', () => {
  const row = publicLobbyRow({ id: 'c1', status: 'PROOF', verified_humans: 1, human_id: 'secret-person' });
  assert.equal(row.verifiedHumans, 1);
  assert.equal(row.aiSealed, false);
  assert.equal('human_id' in row, false);
  assert.equal(row.simulationOnly, true);
});

test('portfolio replay keeps simulated cash honest', () => {
  const replayed = replayPortfolio({
    id: 'p1',
    cohort_id: 'c1',
    owner_id: 'h1',
    owner_type: 'HUMAN',
  }, [{ side: 'BUY', symbol: 'SPY', quantity: 1, canonical_price: 100, commission: 0, spread_cost: 0, slippage_cost: 0, filled_at: 't' }]);
  assert.equal(replayed.cash, 99900);
  const pub = publicPortfolio({ id: 'p1', cohort_id: 'c1', owner_id: 'h1', owner_type: 'HUMAN', starting_cash: 100000, status: 'PROOF' }, []);
  assert.equal(pub.assigned, false);
  assert.equal(pub.realMoney, false);
});

test('fill API is POST-only and rejects launch or live-money writes', async () => {
  const denied = JSON.parse((await fill({ httpMethod: 'GET' })).body);
  assert.equal(denied.ok, false);
  assert.equal(denied.ordersEnabled, false);
  assert.match(denied.message, /POST required/i);
  assert.match(rejectForbiddenWrite({ launch: true }) || '', /launch/i);
  assert.match(rejectForbiddenWrite({ realMoney: true }) || '', /Live-money/i);
});

test('simulated fill persists, updates cash, and writes an audit row', async () => {
  const db = createFakeDb({ fills: [] });
  const result = await writeCompetitionFill(db, {
    id: 'fill-2',
    portfolioId: 'v7-02-proof-human-portfolio',
    symbol: 'qqq',
    side: 'buy',
    quantity: 2,
    canonicalPrice: 50,
    decisionSource: 'human',
    filledAt: '2026-09-19T01:00:00.000Z',
  });
  assert.equal(result.ok, true);
  assert.equal(result.ordersEnabled, undefined);
  assert.equal(result.simulationOnly, true);
  assert.equal(result.fill.symbol, 'QQQ');
  assert.equal(result.cash, 99900);
  assert.equal(db.store.fills.length, 1);
  assert.equal(db.store.audits[0].action, 'FILL_SIMULATED');
});

test('active human portfolios can take simulated fills after verified binding', async () => {
  const db = createFakeDb({ status: 'ACTIVE', fills: [] });
  db.store.identities.push({
    identity_id: 'v7-02-proof-human',
    invite_id: 'v7-04-proof-invite',
    username: 'wb-proof-human',
    email_verified: true,
    phone_verified: true,
    rules_accepted: true,
    review_required: false,
    active_competition_identity: true,
    session_live: true,
  });
  const result = await writeCompetitionFill(db, {
    id: 'fill-bound',
    portfolioId: 'v7-02-proof-human-portfolio',
    symbol: 'SPY',
    side: 'BUY',
    quantity: 1,
    canonicalPrice: 100,
    decisionSource: 'HUMAN',
    filledAt: '2026-09-19T01:00:00.000Z',
  });
  assert.equal(result.ok, true);
  assert.equal(result.simulationOnly, true);
  assert.equal(db.store.fills.length, 1);
});

test('active AI portfolios cannot take fills before a valid seal', async () => {
  const db = createFakeDb({ status: 'ACTIVE', fills: [] });
  db.store.portfolio.id = 'v7-02-proof-ai-portfolio';
  db.store.portfolio.owner_id = 'WEALTH_BUILDER_AI';
  db.store.portfolio.owner_type = 'WEALTH_BUILDER_AI';
  await assert.rejects(
    () => writeCompetitionFill(db, {
      id: 'fill-ai-locked',
      portfolioId: 'v7-02-proof-ai-portfolio',
      symbol: 'SPY',
      side: 'BUY',
      quantity: 1,
      canonicalPrice: 100,
      decisionSource: 'WEALTH_BUILDER_AI',
      filledAt: '2026-09-19T01:00:00.000Z',
    }),
    /sealed contestant/,
  );
});

test('active founding cohorts cannot take API fills before human binding', async () => {
  const db = createFakeDb({ status: 'ACTIVE', fills: [] });
  await assert.rejects(
    () => writeCompetitionFill(db, {
      id: 'fill-locked',
      portfolioId: 'v7-02-proof-human-portfolio',
      symbol: 'SPY',
      side: 'BUY',
      quantity: 1,
      canonicalPrice: 100,
      decisionSource: 'HUMAN',
      filledAt: '2026-09-19T01:00:00.000Z',
    }),
    /verified-human binding/,
  );
});

test('lobby and portfolio handlers stay GET-only', async () => {
  const lobbyDenied = JSON.parse((await lobby({ httpMethod: 'POST' })).body);
  const portfolioDenied = JSON.parse((await portfolio({ httpMethod: 'POST' })).body);
  assert.equal(lobbyDenied.ok, false);
  assert.equal(portfolioDenied.ok, false);
  assert.equal(lobbyDenied.foundingCohortLaunchAuthorized, false);
});

test('competition responses cannot leak connection secrets', () => {
  const leaked = sanitizePublicCompetition({
    ok: true,
    connectionString: 'postgres://user:pass@host/db',
    password: 'secret',
    host: 'db.internal',
    cohorts: [],
  });
  assert.equal('connectionString' in leaked, false);
  assert.equal('password' in leaked, false);
  assert.equal('host' in leaked, false);
});
