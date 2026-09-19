import {
  COMPETITION_RULES,
  competitionRecord,
  creditEntry,
  fillRecord,
} from '../../src/v6-competition-persistence.js';

export const COMPETITION_PROOF_IDS = Object.freeze({
  cohort: 'v7-02-competition-db-proof',
  human: 'v7-02-proof-human',
  humanPortfolio: 'v7-02-proof-human-portfolio',
  aiPortfolio: 'v7-02-proof-ai-portfolio',
  fill: 'v7-02-proof-fill',
  credit: 'v7-02-proof-credit',
});

export const COMPETITION_PROOF_FINGERPRINTS = Object.freeze({
  rules: 'v7-02-rules-fingerprint',
  scoring: 'v7-02-scoring-fingerprint',
  aiSeal: 'v7-02-ai-seal-fingerprint',
});

const PROOF_TIME = '2026-09-19T00:00:00.000Z';

function proofRecords() {
  const cohort = competitionRecord({
    id: COMPETITION_PROOF_IDS.cohort,
    status: 'PROOF',
    rulesFingerprint: COMPETITION_PROOF_FINGERPRINTS.rules,
    scoringFingerprint: COMPETITION_PROOF_FINGERPRINTS.scoring,
    aiSealFingerprint: COMPETITION_PROOF_FINGERPRINTS.aiSeal,
    startsAt: null,
  });
  const fill = fillRecord({
    id: COMPETITION_PROOF_IDS.fill,
    portfolioId: COMPETITION_PROOF_IDS.humanPortfolio,
    symbol: 'SPY',
    side: 'BUY',
    quantity: 1,
    canonicalPrice: 100,
    commission: 0,
    spreadCost: 0,
    slippageCost: 0,
    decisionSource: 'HUMAN',
    filledAt: PROOF_TIME,
  });
  const credit = creditEntry({
    humanId: COMPETITION_PROOF_IDS.human,
    delta: 1,
    reason: 'V7_02_DATABASE_PROOF',
    referenceId: COMPETITION_PROOF_IDS.cohort,
  });
  return { cohort, fill, credit };
}

async function runStage(stage, work) {
  try {
    return await work();
  } catch (error) {
    error.failedStage = stage;
    throw error;
  }
}

async function persistCompetitionProofRows(client, { cohort, fill, credit }) {
  await client.query(
    `insert into trading_lab.competition_cohorts (
      id, status, rules_fingerprint, scoring_fingerprint, ai_seal_fingerprint, starts_at
    ) values ($1,$2,$3,$4,$5,$6)
    on conflict (id) do update set
      status = excluded.status,
      rules_fingerprint = excluded.rules_fingerprint,
      scoring_fingerprint = excluded.scoring_fingerprint,
      ai_seal_fingerprint = excluded.ai_seal_fingerprint,
      starts_at = excluded.starts_at`,
    [
      cohort.id,
      cohort.status,
      cohort.rulesFingerprint,
      cohort.scoringFingerprint,
      cohort.aiSealFingerprint,
      cohort.startsAt,
    ],
  );

  await client.query(
    `insert into trading_lab.competition_members (cohort_id, human_id, verified)
     values ($1,$2,false)
     on conflict (cohort_id, human_id) do update set verified = excluded.verified`,
    [cohort.id, COMPETITION_PROOF_IDS.human],
  );

  await client.query(
    `insert into trading_lab.competition_portfolios (
      id, cohort_id, owner_id, owner_type, starting_cash, cash
    ) values ($1,$2,$3,'HUMAN',$4,$4)
    on conflict (id) do update set
      cohort_id = excluded.cohort_id,
      owner_id = excluded.owner_id,
      owner_type = excluded.owner_type,
      starting_cash = excluded.starting_cash,
      cash = excluded.cash`,
    [
      COMPETITION_PROOF_IDS.humanPortfolio,
      cohort.id,
      COMPETITION_PROOF_IDS.human,
      COMPETITION_RULES.startingCapital,
    ],
  );

  await client.query(
    `insert into trading_lab.competition_portfolios (
      id, cohort_id, owner_id, owner_type, starting_cash, cash
    ) values ($1,$2,$3,'WEALTH_BUILDER_AI',$4,$4)
    on conflict (id) do update set
      cohort_id = excluded.cohort_id,
      owner_id = excluded.owner_id,
      owner_type = excluded.owner_type,
      starting_cash = excluded.starting_cash,
      cash = excluded.cash`,
    [
      COMPETITION_PROOF_IDS.aiPortfolio,
      cohort.id,
      'WEALTH_BUILDER_AI',
      COMPETITION_RULES.startingCapital,
    ],
  );

  await client.query(
    `insert into trading_lab.competition_fills (
      id, portfolio_id, symbol, side, quantity, canonical_price,
      commission, spread_cost, slippage_cost, filled_at, decision_source
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    on conflict (id) do update set
      portfolio_id = excluded.portfolio_id,
      symbol = excluded.symbol,
      side = excluded.side,
      quantity = excluded.quantity,
      canonical_price = excluded.canonical_price,
      commission = excluded.commission,
      spread_cost = excluded.spread_cost,
      slippage_cost = excluded.slippage_cost,
      filled_at = excluded.filled_at,
      decision_source = excluded.decision_source`,
    [
      fill.id,
      fill.portfolioId,
      fill.symbol,
      fill.side,
      fill.quantity,
      fill.canonicalPrice,
      fill.commission,
      fill.spreadCost,
      fill.slippageCost,
      fill.filledAt,
      fill.decisionSource,
    ],
  );

  await client.query(
    `insert into trading_lab.research_credit_ledger (
      id, human_id, delta, reason, reference_id
    ) values ($1,$2,$3,$4,$5)
    on conflict (id) do update set
      human_id = excluded.human_id,
      delta = excluded.delta,
      reason = excluded.reason,
      reference_id = excluded.reference_id`,
    [
      COMPETITION_PROOF_IDS.credit,
      credit.humanId,
      credit.delta,
      credit.reason,
      credit.referenceId,
    ],
  );
}

async function readCompetitionProofRows(db) {
  const cohort = await db.pool.query(
    'select id, status, rules_fingerprint, scoring_fingerprint, ai_seal_fingerprint from trading_lab.competition_cohorts where id = $1',
    [COMPETITION_PROOF_IDS.cohort],
  );
  const member = await db.pool.query(
    'select cohort_id, human_id, verified from trading_lab.competition_members where cohort_id = $1 and human_id = $2',
    [COMPETITION_PROOF_IDS.cohort, COMPETITION_PROOF_IDS.human],
  );
  const portfolios = await db.pool.query(
    'select id, owner_type, starting_cash::float8 as starting_cash from trading_lab.competition_portfolios where cohort_id = $1 order by owner_type',
    [COMPETITION_PROOF_IDS.cohort],
  );
  const fill = await db.pool.query(
    'select id, symbol, side, quantity::float8 as quantity, canonical_price::float8 as canonical_price, decision_source from trading_lab.competition_fills where id = $1',
    [COMPETITION_PROOF_IDS.fill],
  );
  const credit = await db.pool.query(
    'select id, human_id, delta, reason from trading_lab.research_credit_ledger where id = $1',
    [COMPETITION_PROOF_IDS.credit],
  );

  return {
    cohortVisible: Boolean(cohort.rows[0]),
    memberVisible: Boolean(member.rows[0]),
    portfolioCount: portfolios.rows.length,
    fillVisible: Boolean(fill.rows[0]),
    creditVisible: Boolean(credit.rows[0]),
    startingCapitalMatches: portfolios.rows.every((row) => Number(row.starting_cash) === COMPETITION_RULES.startingCapital),
    fillUsesCanonicalPrice: fill.rows[0]?.canonical_price === 100 && fill.rows[0]?.decision_source === 'HUMAN',
    creditAuditable: credit.rows[0]?.delta === 1 && credit.rows[0]?.reason === 'V7_02_DATABASE_PROOF',
  };
}

export async function runCompetitionDatabaseProof(db) {
  const records = proofRecords();
  const client = await db.pool.connect();
  try {
    await runStage('transaction', () => client.query('begin'));
    await runStage('persist', () => persistCompetitionProofRows(client, records));
    await runStage('commit', () => client.query('commit'));
  } catch (error) {
    try {
      await client.query('rollback');
    } catch {
      // The original persist/commit failure is the evidence.
    }
    throw error;
  } finally {
    client.release();
  }

  const readback = await runStage('readback', () => readCompetitionProofRows(db));
  const ok = Boolean(
    readback.cohortVisible
    && readback.memberVisible
    && readback.portfolioCount === 2
    && readback.fillVisible
    && readback.creditVisible
    && readback.startingCapitalMatches
    && readback.fillUsesCanonicalPrice
    && readback.creditAuditable,
  );

  return {
    ok,
    proofType: 'competition-database-write-readback',
    target: 'netlify-database',
    branchAware: true,
    ordersEnabled: false,
    realMoney: false,
    foundingCohortLaunchAuthorized: false,
    ...readback,
    proofIds: { ...COMPETITION_PROOF_IDS },
  };
}
