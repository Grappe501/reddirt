import { COMPETITION_PROOF_FINGERPRINTS, COMPETITION_PROOF_IDS } from './competition-db-proof.mjs';
import { COMPETITION_RULES, competitionRecord } from '../../src/v6-competition-persistence.js';
import { assertNoOutcomeAwareMutation } from '../../src/v5-sealed-ai-contestant.js';
import {
  PRODUCTION_AI_PROVIDER,
  productionAiSealConfig,
  proveSharedExecutionPath,
  readCompetitionAiSeal,
  writeCompetitionAiSeal,
} from './competition-ai.mjs';

export const AI_SEAL_PROOF_TIME = '2026-09-19T00:00:00.000Z';

export function v7AiSealProofInput(overrides = {}) {
  return productionAiSealConfig({
    cohortId: COMPETITION_PROOF_IDS.cohort,
    sealedAt: AI_SEAL_PROOF_TIME,
    ...overrides,
  });
}

async function ensureProofCohort(db) {
  const cohort = competitionRecord({
    id: COMPETITION_PROOF_IDS.cohort,
    status: 'PROOF',
    rulesFingerprint: COMPETITION_PROOF_FINGERPRINTS.rules,
    scoringFingerprint: COMPETITION_PROOF_FINGERPRINTS.scoring,
    aiSealFingerprint: COMPETITION_PROOF_FINGERPRINTS.aiSeal,
    startsAt: null,
  });
  await db.pool.query(
    `insert into trading_lab.competition_cohorts (
      id, status, rules_fingerprint, scoring_fingerprint, ai_seal_fingerprint, starts_at
    ) values ($1,$2,$3,$4,$5,$6)
    on conflict (id) do update set status = excluded.status`,
    [cohort.id, cohort.status, cohort.rulesFingerprint, cohort.scoringFingerprint, cohort.aiSealFingerprint, cohort.startsAt],
  );
  await db.pool.query(
    `insert into trading_lab.competition_portfolios (
      id, cohort_id, owner_id, owner_type, starting_cash, cash
    ) values ($1,$2,$3,'WEALTH_BUILDER_AI',$4,$4)
    on conflict (id) do nothing`,
    [COMPETITION_PROOF_IDS.aiPortfolio, cohort.id, 'WEALTH_BUILDER_AI', COMPETITION_RULES.startingCapital],
  );
}

export async function runCompetitionAiSealProof(db) {
  await ensureProofCohort(db);
  const written = await writeCompetitionAiSeal(db, v7AiSealProofInput());
  const readback = await readCompetitionAiSeal(db, COMPETITION_PROOF_IDS.cohort);
  const stored = await db.pool.query(
    'select seal_record from trading_lab.competition_ai_seals where cohort_id = $1',
    [COMPETITION_PROOF_IDS.cohort],
  );
  const execution = proveSharedExecutionPath();
  let mutationBlocked = false;
  try {
    assertNoOutcomeAwareMutation(stored.rows[0]?.seal_record, v7AiSealProofInput({ modelVersion: 'mutated-after-outcome' }));
  } catch {
    mutationBlocked = true;
  }
  try {
    await writeCompetitionAiSeal(db, v7AiSealProofInput({ modelVersion: 'mutated-after-outcome' }));
  } catch {
    mutationBlocked = true;
  }
  return {
    ok: Boolean(
      written.ok
      && readback.valid
      && readback.seal?.fingerprint
      && readback.seal.fingerprint === written.seal.fingerprint
      && execution.parity
      && execution.sameCash
      && mutationBlocked,
    ),
    proofType: 'competition-ai-seal-write-readback',
    target: 'netlify-database',
    sealVisible: Boolean(readback.seal?.fingerprint),
    sealValid: Boolean(readback.valid),
    fingerprint: written.seal.fingerprint,
    sharedExecutionPath: execution,
    mutationBlocked,
    provider: PRODUCTION_AI_PROVIDER,
    foundingCohort: false,
    foundingCohortLaunchAuthorized: false,
    ordersEnabled: false,
    realMoney: false,
    simulationOnly: true,
    seal: written.seal,
  };
}
