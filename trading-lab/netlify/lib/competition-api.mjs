import { applyFill, createCompetitionPortfolio } from '../../src/v5-competition-portfolio.js';
import { COMPETITION_RULES, fillRecord } from '../../src/v6-competition-persistence.js';
import { aiSealAllowsFill } from './competition-ai.mjs';
import { humanBindingAllowsFill } from './competition-identity.mjs';

const SIMULATION_STATUSES = new Set(['PROOF', 'DRAFT']);

function costOf(fill) {
  return Number(fill.commission || 0) + Number(fill.spreadCost || 0) + Number(fill.slippageCost || 0);
}

export function publicLobbyRow(row) {
  const verified = Math.max(0, Math.min(10, Number(row.verified_humans || row.verifiedHumans || 0)));
  return {
    id: row.id,
    status: row.status,
    verifiedHumans: verified,
    seatsLeft: 10 - verified,
    locked: verified === 10,
    startsAt: row.starts_at || row.startsAt || null,
    aiSealed: Boolean(row.ai_sealed ?? row.aiSealed),
    foundingHumans: Math.max(0, Math.min(10, Number(row.founding_humans ?? row.foundingHumans ?? 0))),
    foundingRosterLocked: Boolean(row.founding_roster_locked ?? row.foundingRosterLocked),
    rehearsalRan: Boolean(row.rehearsal_ran ?? row.rehearsalRan),
    simulationOnly: true,
  };
}

export function replayPortfolio(row, fills = []) {
  let portfolio = createCompetitionPortfolio({
    portfolioId: row.id,
    cohortId: row.cohort_id,
    ownerId: row.owner_id,
    ownerType: row.owner_type,
  });
  for (const fill of fills) {
    portfolio = applyFill(portfolio, {
      side: fill.side,
      symbol: fill.symbol,
      quantity: Number(fill.quantity),
      price: Number(fill.canonical_price ?? fill.canonicalPrice),
      cost: Number(fill.commission || 0) + Number(fill.spread_cost ?? fill.spreadCost ?? 0) + Number(fill.slippage_cost ?? fill.slippageCost ?? 0),
      filledAt: fill.filled_at || fill.filledAt,
    });
  }
  return portfolio;
}

export function publicPortfolio(row, fills = []) {
  const replayed = replayPortfolio(row, fills);
  const marked = {
    cash: replayed.cash,
    positions: replayed.positions,
    realizedPnl: replayed.realizedPnl,
    costs: replayed.costs,
    fillCount: fills.length,
  };
  return {
    id: row.id,
    cohortId: row.cohort_id,
    ownerType: row.owner_type,
    assigned: row.status === 'ACTIVE',
    startingCash: Number(row.starting_cash ?? COMPETITION_RULES.startingCapital),
    cash: marked.cash,
    positions: marked.positions,
    fillCount: marked.fillCount,
    realizedPnl: marked.realizedPnl,
    costs: marked.costs,
    simulationOnly: true,
    realMoney: false,
  };
}

export async function readCompetitionLobby(db) {
  const result = await db.pool.query(`
    select
      c.id,
      c.status,
      c.starts_at,
      count(m.human_id) filter (where m.verified) ::int as verified_humans,
      count(distinct a.identity_id) ::int as founding_humans,
      coalesce(bool_or(r.locked), false) as founding_roster_locked,
      exists(
        select 1 from trading_lab.competition_rehearsals rh
        where rh.cohort_id = c.id
      ) as rehearsal_ran,
      exists(
        select 1 from trading_lab.competition_ai_seals s
        where s.cohort_id = c.id and s.fingerprint = c.ai_seal_fingerprint
      ) as ai_sealed
    from trading_lab.competition_cohorts c
    left join trading_lab.competition_members m on m.cohort_id = c.id
    left join trading_lab.competition_founding_assignments a on a.cohort_id = c.id
    left join trading_lab.competition_founding_rosters r on r.cohort_id = c.id
    group by c.id, c.status, c.starts_at, c.ai_seal_fingerprint
    order by c.created_at desc
  `);
  const cohorts = result.rows.map(publicLobbyRow);
  return {
    ok: true,
    proofType: 'competition-lobby',
    cohorts,
    foundingCohortLaunchAuthorized: false,
    seats: COMPETITION_RULES.humans,
    startingCapital: COMPETITION_RULES.startingCapital,
    durationDays: COMPETITION_RULES.durationDays,
    simulationOnly: true,
  };
}

export async function readCompetitionPortfolio(db, portfolioId) {
  if (!portfolioId) throw Object.assign(new Error('portfolioId is required.'), { statusCode: 400 });
  const portfolio = await db.pool.query(
    `select p.*, c.status as cohort_status
     from trading_lab.competition_portfolios p
     join trading_lab.competition_cohorts c on c.id = p.cohort_id
     where p.id = $1`,
    [portfolioId],
  );
  if (!portfolio.rows[0]) throw Object.assign(new Error('Portfolio not found.'), { statusCode: 404 });
  const fills = await db.pool.query(
    `select id, symbol, side, quantity, canonical_price, commission, spread_cost, slippage_cost, filled_at, decision_source
     from trading_lab.competition_fills
     where portfolio_id = $1
     order by filled_at asc, id asc`,
    [portfolioId],
  );
  return {
    ok: true,
    proofType: 'competition-portfolio',
    portfolio: publicPortfolio({ ...portfolio.rows[0], status: portfolio.rows[0].cohort_status }, fills.rows),
  };
}

export async function writeCompetitionFill(db, input = {}) {
  const record = fillRecord(input);
  const client = await db.pool.connect();
  try {
    await client.query('begin');
    const portfolio = await client.query(
      `select p.*, c.status as cohort_status, c.ai_seal_fingerprint
       from trading_lab.competition_portfolios p
       join trading_lab.competition_cohorts c on c.id = p.cohort_id
       where p.id = $1
       for update`,
      [record.portfolioId],
    );
    const row = portfolio.rows[0];
    if (!row) {
      const error = Object.assign(new Error('Portfolio not found.'), { statusCode: 404 });
      throw error;
    }
    if (!SIMULATION_STATUSES.has(row.cohort_status)) {
      if (row.cohort_status === 'LOCKED') {
        throw Object.assign(new Error('Fills are closed on locked founding cohorts.'), { statusCode: 409 });
      }
      if (row.cohort_status === 'ACTIVE' && row.owner_type === 'HUMAN') {
        const binding = await client.query(
          `select i.*, exists(
             select 1 from trading_lab.competition_sessions s
             where s.identity_id = i.identity_id and s.revoked_at is null
           ) as session_live
           from trading_lab.competition_identities i
           where i.identity_id = $1`,
          [row.owner_id],
        );
        const identity = binding.rows[0];
        if (!humanBindingAllowsFill(identity, Boolean(identity?.session_live))) {
          throw Object.assign(new Error('Fills are closed on launched or locked founding cohorts until verified-human binding exists.'), { statusCode: 409 });
        }
      } else if (row.cohort_status === 'ACTIVE' && row.owner_type === 'WEALTH_BUILDER_AI') {
        const seal = await client.query(
          'select fingerprint, seal_record, mutation_allowed from trading_lab.competition_ai_seals where cohort_id = $1',
          [row.cohort_id],
        );
        if (!aiSealAllowsFill(seal.rows[0], row.ai_seal_fingerprint) || record.decisionSource !== 'WEALTH_BUILDER_AI') {
          throw Object.assign(new Error('AI fills are closed until a verified sealed contestant exists.'), { statusCode: 409 });
        }
      } else {
        throw Object.assign(new Error('Fills are closed on launched or locked founding cohorts until verified-human binding exists.'), { statusCode: 409 });
      }
    }
    const existing = await client.query(
      'select id from trading_lab.competition_fills where id = $1',
      [record.id],
    );
    const fills = await client.query(
      `select symbol, side, quantity, canonical_price, commission, spread_cost, slippage_cost, filled_at
       from trading_lab.competition_fills
       where portfolio_id = $1
       order by filled_at asc, id asc`,
      [record.portfolioId],
    );
    const replayed = replayPortfolio(row, fills.rows);
    const next = existing.rows[0]
      ? replayed
      : applyFill(replayed, {
        side: record.side,
        symbol: record.symbol,
        quantity: record.quantity,
        price: record.canonicalPrice,
        cost: costOf(record),
        filledAt: record.filledAt,
      });
    if (!existing.rows[0]) {
      await client.query(
        `insert into trading_lab.competition_fills (
          id, portfolio_id, symbol, side, quantity, canonical_price,
          commission, spread_cost, slippage_cost, filled_at, decision_source
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          record.id,
          record.portfolioId,
          record.symbol,
          record.side,
          record.quantity,
          record.canonicalPrice,
          record.commission,
          record.spreadCost,
          record.slippageCost,
          record.filledAt,
          record.decisionSource,
        ],
      );
    }
    await client.query(
      'update trading_lab.competition_portfolios set cash = $2 where id = $1',
      [record.portfolioId, next.cash],
    );
    await client.query(
      `insert into trading_lab.competition_audit (
        id, action, actor_type, cohort_id, portfolio_id, detail, orders_enabled, real_money
      ) values ($1,$2,$3,$4,$5,$6::jsonb,false,false)
      on conflict (id) do nothing`,
      [
        `audit:fill:${record.id}`,
        existing.rows[0] ? 'FILL_IDEMPOTENT' : 'FILL_SIMULATED',
        record.decisionSource,
        row.cohort_id,
        record.portfolioId,
        JSON.stringify({
          fillId: record.id,
          symbol: record.symbol,
          side: record.side,
          quantity: record.quantity,
          canonicalPrice: record.canonicalPrice,
          cashAfter: next.cash,
        }),
      ],
    );
    await client.query('commit');
    return {
      ok: true,
      proofType: 'competition-fill',
      idempotent: Boolean(existing.rows[0]),
      fill: record,
      cash: next.cash,
      simulationOnly: true,
    };
  } catch (error) {
    try {
      await client.query('rollback');
    } catch {
      // Preserve the original fill/validation error.
    }
    throw error;
  } finally {
    client.release();
  }
}
