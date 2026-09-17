import { persistLearningCycle } from '../functions/learning-cycle.mjs';
import { persistCalibration } from '../functions/calibration-cycle.mjs';
import { writeMemoryBatch } from '../functions/market-memory-ingest.mjs';

export const WRITE_PROOF_IDS = {
  experiment: 'production-write-proof-run-v1',
  observation: 'production-write-proof-obs-v1',
  learning: 'production-write-proof-learning-v1',
  calibration: 'production-write-proof-calibration-v1',
  strategy: 'PROOF_SYNTHETIC',
};

const PROOF_TIME = '2026-01-02T15:00:00.000Z';

function memoryBatch() {
  return {
    experimentRuns: [{
      id: WRITE_PROOF_IDS.experiment,
      startedAt: PROOF_TIME,
      endedAt: PROOF_TIME,
      mode: 'REPLAY',
      strategyVersion: 'write-proof-v1',
      universeVersion: 'spy-only',
      costModel: {},
      metadata: { proof: true, fictionalOnly: true },
    }],
    observations: [{
      id: WRITE_PROOF_IDS.observation,
      experimentRunId: WRITE_PROOF_IDS.experiment,
      mode: 'REPLAY',
      symbol: 'SPY',
      providerTime: PROOF_TIME,
      ingestedAt: '2026-01-02T15:00:01.000Z',
      price: 100,
      score: 50,
      action: 'HOLD',
      regime: 'RANGE',
      features: { proof: true },
    }],
    regimes: [],
    decisions: [],
    trades: [],
    sourceHealth: [],
  };
}

function learningCycle() {
  return {
    id: WRITE_PROOF_IDS.learning,
    createdAt: PROOF_TIME,
    learningVersion: 'write-proof-v1',
    observationCount: 1,
    costModel: {},
    gates: {},
    ethics: { fictionalOnly: true, noLiveOrders: true, noGuaranteedReturns: true },
    metadata: { proof: true },
    candidates: [{
      strategyId: WRITE_PROOF_IDS.strategy,
      strategyName: 'Synthetic write proof',
      state: 'RESEARCH',
      overall: { expectancy: 0, maxDrawdown: 0 },
      baseline: {},
      excessReturn: 0,
      positiveTestWindows: 0,
      windows: [],
      byRegime: {},
      reasons: ['Synthetic educational write-proof only.'],
    }],
    lessons: [{
      strategyId: WRITE_PROOF_IDS.strategy,
      type: 'NOTE',
      lesson: 'Synthetic educational write-proof. No live order was placed.',
    }],
  };
}

function calibrationCycle() {
  return {
    id: WRITE_PROOF_IDS.calibration,
    createdAt: PROOF_TIME,
    version: 'write-proof-v1',
    horizon: '15m',
    samples: 1,
    brier: 0.25,
    buckets: [],
    regimes: {},
    ablation: [{
      feature: 'proof',
      samples: 1,
      correlation: 0,
      absoluteContribution: 0,
      direction: 'NONE',
    }],
    lessons: [{ type: 'NOTE', text: 'Synthetic educational write-proof. Descriptive research only.' }],
    safety: { noLiveOrders: true, descriptiveResearchOnly: true, noGuaranteedReturns: true },
  };
}

async function exists(db, sql, id) {
  const result = await db.pool.query(sql, [id]);
  return Boolean(result.rows[0]?.present);
}

async function runStage(stage, work) {
  try {
    return await work();
  } catch (error) {
    error.failedStage = stage;
    throw error;
  }
}

export async function runProductionWriteProof(db) {
  await runStage('market-memory', () => writeMemoryBatch(db, memoryBatch()));
  await runStage('learning', () => persistLearningCycle(db, learningCycle()));
  await runStage('calibration', () => persistCalibration(db, calibrationCycle()));

  const marketMemoryWriteVisible = await exists(
    db,
    'select exists(select 1 from trading_lab.market_observations where id=$1) as present',
    WRITE_PROOF_IDS.observation,
  );
  const learningCyclePersisted = await exists(
    db,
    'select exists(select 1 from trading_lab.learning_cycles where id=$1) as present',
    WRITE_PROOF_IDS.learning,
  );
  const calibrationCyclePersisted = await exists(
    db,
    'select exists(select 1 from trading_lab.calibration_cycles where id=$1) as present',
    WRITE_PROOF_IDS.calibration,
  );

  return {
    ok: marketMemoryWriteVisible && learningCyclePersisted && calibrationCyclePersisted,
    proofType: 'production-database-write-readback',
    target: 'netlify-database',
    branchAware: true,
    ordersEnabled: false,
    marketMemoryWriteVisible,
    learningCyclePersisted,
    calibrationCyclePersisted,
    proofIds: {
      observation: WRITE_PROOF_IDS.observation,
      learning: WRITE_PROOF_IDS.learning,
      calibration: WRITE_PROOF_IDS.calibration,
    },
  };
}
