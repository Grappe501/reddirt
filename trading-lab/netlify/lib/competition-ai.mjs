import { canonicalExecution, compareExecutionParity } from '../../src/v5-canonical-execution.js';
import { applyFill, createCompetitionPortfolio } from '../../src/v5-competition-portfolio.js';
import { assertNoOutcomeAwareMutation, sealAiContestant, verifyAiSeal } from '../../src/v5-sealed-ai-contestant.js';

export const PRODUCTION_AI_PROVIDER = Object.freeze({
  contestantType: 'WEALTH_BUILDER_AI',
  marketProvider: 'alpaca',
  marketFeed: 'iex',
  executionMethod: 'CANONICAL_V5',
  startingCapital: 100000,
  ordersEnabled: false,
  realMoney: false,
  mutationAllowed: false,
  liveBroker: false,
});

export const PRODUCTION_AI_VERSIONS = Object.freeze({
  modelVersion: 'wealth-builder-ai.v1',
  researchPolicyVersion: 'research-policy.v1',
  strategyPolicyVersion: 'strategy-policy.v1',
  universeVersion: 'alpaca-iex-core.v1',
  costModelVersion: 'canonical-v5.v1',
});

export function productionAiSealConfig(input = {}) {
  return {
    cohortId: input.cohortId,
    modelVersion: input.modelVersion || PRODUCTION_AI_VERSIONS.modelVersion,
    researchPolicyVersion: input.researchPolicyVersion || PRODUCTION_AI_VERSIONS.researchPolicyVersion,
    strategyPolicyVersion: input.strategyPolicyVersion || PRODUCTION_AI_VERSIONS.strategyPolicyVersion,
    universeVersion: input.universeVersion || PRODUCTION_AI_VERSIONS.universeVersion,
    costModelVersion: input.costModelVersion || PRODUCTION_AI_VERSIONS.costModelVersion,
    configuration: {
      mode: 'paper',
      riskBudget: 1,
      marketProvider: PRODUCTION_AI_PROVIDER.marketProvider,
      marketFeed: PRODUCTION_AI_PROVIDER.marketFeed,
      executionMethod: PRODUCTION_AI_PROVIDER.executionMethod,
      ordersEnabled: false,
      realMoney: false,
      ...(input.configuration && typeof input.configuration === 'object' ? input.configuration : {}),
      ordersEnabled: false,
      realMoney: false,
    },
    sealedAt: input.sealedAt || new Date().toISOString(),
  };
}

export function publicAiSeal(record = {}) {
  const configuration = record.configuration || {};
  return {
    cohortId: record.cohortId,
    fingerprint: record.fingerprint,
    contestantType: 'WEALTH_BUILDER_AI',
    sealed: Boolean(record.sealed && record.fingerprint),
    mutationAllowed: false,
    realMoney: false,
    modelVersion: record.modelVersion,
    researchPolicyVersion: record.researchPolicyVersion,
    strategyPolicyVersion: record.strategyPolicyVersion,
    universeVersion: record.universeVersion,
    costModelVersion: record.costModelVersion,
    provider: {
      marketProvider: configuration.marketProvider || PRODUCTION_AI_PROVIDER.marketProvider,
      marketFeed: configuration.marketFeed || PRODUCTION_AI_PROVIDER.marketFeed,
      executionMethod: configuration.executionMethod || PRODUCTION_AI_PROVIDER.executionMethod,
    },
    foundingCohort: false,
    simulationOnly: true,
  };
}

export function proveSharedExecutionPath({
  symbol = 'SPY',
  quantity = 1,
  price = 100,
  observedAt = '2026-09-19T13:30:01.000Z',
  submittedAt = '2026-09-19T13:30:00.000Z',
  costModel = { commission: 1, slippageBps: 5 },
} = {}) {
  const market = { price, observedAt, sessionOpen: true };
  const human = canonicalExecution({
    order: {
      orderId: 'v7-06-human',
      ownerType: 'HUMAN',
      symbol,
      side: 'BUY',
      quantity,
      orderType: 'MARKET',
      submittedAt,
    },
    market,
    costModel,
  });
  const ai = canonicalExecution({
    order: {
      orderId: 'v7-06-ai',
      ownerType: 'WEALTH_BUILDER_AI',
      symbol,
      side: 'BUY',
      quantity,
      orderType: 'MARKET',
      submittedAt,
    },
    market,
    costModel,
  });
  const parity = compareExecutionParity(human, ai);
  let humanPortfolio = createCompetitionPortfolio({
    portfolioId: 'parity-human',
    cohortId: 'parity',
    ownerId: 'human',
    ownerType: 'HUMAN',
  });
  let aiPortfolio = createCompetitionPortfolio({
    portfolioId: 'parity-ai',
    cohortId: 'parity',
    ownerId: 'ai',
    ownerType: 'WEALTH_BUILDER_AI',
  });
  const fill = {
    side: 'BUY',
    symbol,
    quantity,
    price: human.executionPrice,
    cost: human.totalCost,
    filledAt: human.filledAt,
  };
  humanPortfolio = applyFill(humanPortfolio, fill);
  aiPortfolio = applyFill(aiPortfolio, fill);
  return {
    parity: parity.parity,
    sameExecutionPrice: human.executionPrice === ai.executionPrice,
    sameCash: humanPortfolio.cash === aiPortfolio.cash,
    executionMethod: human.method,
    realMoney: false,
    humanCash: humanPortfolio.cash,
    aiCash: aiPortfolio.cash,
  };
}

export function aiSealAllowsFill(row, cohortFingerprint) {
  const record = row?.seal_record || row;
  if (!record || row?.mutation_allowed === true) return false;
  return verifyAiSeal(record)
    && record.fingerprint === (row.fingerprint || record.fingerprint)
    && record.fingerprint === cohortFingerprint;
}

export async function readCompetitionAiSeal(db, cohortId) {
  if (!cohortId) {
    return {
      ok: true,
      proofType: 'competition-ai-seal',
      provider: PRODUCTION_AI_PROVIDER,
      seal: null,
      mutationAllowed: false,
      foundingCohortLaunchAuthorized: false,
      simulationOnly: true,
    };
  }
  const result = await db.pool.query(
    `select s.cohort_id, s.fingerprint, s.seal_record, s.mutation_allowed, s.real_money, c.ai_seal_fingerprint
     from trading_lab.competition_ai_seals s
     join trading_lab.competition_cohorts c on c.id = s.cohort_id
     where s.cohort_id = $1`,
    [cohortId],
  );
  const row = result.rows[0];
  if (!row) throw Object.assign(new Error('AI seal not found.'), { statusCode: 404 });
  const record = row.seal_record;
  const valid = aiSealAllowsFill(row, row.ai_seal_fingerprint);
  return {
    ok: true,
    proofType: 'competition-ai-seal',
    provider: PRODUCTION_AI_PROVIDER,
    seal: publicAiSeal(record),
    valid,
    mutationAllowed: false,
    foundingCohortLaunchAuthorized: false,
    simulationOnly: true,
  };
}

export async function writeCompetitionAiSeal(db, input = {}) {
  if (!input.cohortId) throw Object.assign(new Error('cohortId is required.'), { statusCode: 400 });
  const client = await db.pool.connect();
  try {
    await client.query('begin');
    const cohort = await client.query(
      'select id, status, ai_seal_fingerprint from trading_lab.competition_cohorts where id = $1 for update',
      [input.cohortId],
    );
    if (!cohort.rows[0]) throw Object.assign(new Error('Cohort not found.'), { statusCode: 404 });
    if (cohort.rows[0].status === 'LOCKED') {
      throw Object.assign(new Error('Sealed AI configuration cannot change during a locked cohort.'), { statusCode: 409 });
    }
    const existing = await client.query(
      'select fingerprint, seal_record from trading_lab.competition_ai_seals where cohort_id = $1 for update',
      [input.cohortId],
    );
    const sealedAt = existing.rows[0]?.seal_record?.sealedAt || input.sealedAt || new Date().toISOString();
    const sealed = sealAiContestant(productionAiSealConfig({ ...input, sealedAt }));
    if (existing.rows[0] && existing.rows[0].fingerprint !== sealed.fingerprint) {
      try {
        assertNoOutcomeAwareMutation(existing.rows[0].seal_record, productionAiSealConfig({ ...input, sealedAt: existing.rows[0].seal_record.sealedAt }));
      } catch (error) {
        throw Object.assign(new Error(error.message), { statusCode: 409 });
      }
      throw Object.assign(new Error('Sealed AI configuration cannot change during cohort.'), { statusCode: 409 });
    }
    await client.query(
      `insert into trading_lab.competition_ai_seals (
        cohort_id, fingerprint, seal_record, mutation_allowed, real_money, sealed_at
      ) values ($1,$2,$3::jsonb,false,false,$4)
      on conflict (cohort_id) do update set
        fingerprint = excluded.fingerprint,
        seal_record = excluded.seal_record,
        sealed_at = excluded.sealed_at`,
      [sealed.cohortId, sealed.fingerprint, JSON.stringify(sealed), sealed.sealedAt],
    );
    await client.query(
      'update trading_lab.competition_cohorts set ai_seal_fingerprint = $2 where id = $1',
      [sealed.cohortId, sealed.fingerprint],
    );
    await client.query(
      `insert into trading_lab.competition_audit (
        id, action, actor_type, cohort_id, portfolio_id, detail, orders_enabled, real_money
      ) values ($1,'AI_SEALED','WEALTH_BUILDER_AI',$2,null,$3::jsonb,false,false)
      on conflict (id) do nothing`,
      [
        `audit:ai-seal:${sealed.cohortId}`,
        sealed.cohortId,
        JSON.stringify({
          fingerprint: sealed.fingerprint,
          modelVersion: sealed.modelVersion,
          mutationAllowed: false,
        }),
      ],
    );
    await client.query('commit');
    return {
      ok: true,
      proofType: 'competition-ai-seal',
      idempotent: Boolean(existing.rows[0]),
      seal: publicAiSeal(sealed),
      provider: PRODUCTION_AI_PROVIDER,
      mutationAllowed: false,
      foundingCohortLaunchAuthorized: false,
      simulationOnly: true,
    };
  } catch (error) {
    try {
      await client.query('rollback');
    } catch {
      // Preserve the original seal/validation error.
    }
    throw error;
  } finally {
    client.release();
  }
}
