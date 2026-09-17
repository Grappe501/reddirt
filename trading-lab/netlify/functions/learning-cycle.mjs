import { getTradingLabDatabase } from '../lib/database.mjs';
import { asNetlifyFunction } from '../lib/netlify-function.mjs';
import { validateResearchBody } from './research-validation.mjs';

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  body: JSON.stringify(body)
});
const asJson = (value) => JSON.stringify(value ?? {});
const validState = (state) => ['RESEARCH', 'SHADOW_CANDIDATE', 'REJECT'].includes(state) ? state : 'RESEARCH';

export async function persistLearningCycle(db, cycle) {
  const client = await db.pool.connect();
  try {
    await client.query('begin');
    await client.query(
      `insert into trading_lab.learning_cycles(
        id, created_at, learning_version, observation_count, cost_model, promotion_gates, ethics, metadata
      ) values ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7::jsonb,$8::jsonb)
      on conflict (id) do nothing`,
      [
        cycle.id,
        cycle.createdAt,
        cycle.learningVersion,
        cycle.observationCount,
        asJson(cycle.costModel),
        asJson(cycle.gates),
        asJson(cycle.ethics),
        asJson(cycle.metadata),
      ]
    );
    for (const candidate of cycle.candidates || []) {
      await client.query(
        `insert into trading_lab.strategy_evaluations(
          learning_cycle_id, strategy_id, strategy_name, research_state, overall, baseline,
          excess_return, positive_test_windows, walk_forward, regime_results, reasons
        ) values ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb)
        on conflict (learning_cycle_id, strategy_id) do update set
          research_state=excluded.research_state,
          overall=excluded.overall,
          baseline=excluded.baseline,
          excess_return=excluded.excess_return,
          positive_test_windows=excluded.positive_test_windows,
          walk_forward=excluded.walk_forward,
          regime_results=excluded.regime_results,
          reasons=excluded.reasons`,
        [
          cycle.id,
          candidate.strategyId,
          candidate.strategyName,
          validState(candidate.state),
          asJson(candidate.overall),
          asJson(candidate.baseline),
          candidate.excessReturn,
          candidate.positiveTestWindows || 0,
          asJson(candidate.windows),
          asJson(candidate.byRegime),
          asJson(candidate.reasons),
        ]
      );
    }
    await client.query('delete from trading_lab.learning_lessons where learning_cycle_id=$1', [cycle.id]);
    for (const lesson of cycle.lessons || []) {
      await client.query(
        `insert into trading_lab.learning_lessons(learning_cycle_id, strategy_id, lesson_type, lesson)
         values ($1,$2,$3,$4)`,
        [cycle.id, lesson.strategyId || null, lesson.type || 'NOTE', lesson.lesson]
      );
    }
    await client.query('commit');
    return {
      cycleId: cycle.id,
      candidates: (cycle.candidates || []).length,
      lessons: (cycle.lessons || []).length,
    };
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

export async function handleRequest(event) {
  if (event.httpMethod && event.httpMethod !== 'POST') return json(405, { ok: false, message: 'POST required.' });
  const checked = validateResearchBody(event.body || '{}');
  if (!checked.ok) return json(400, { ok: false, message: checked.message });
  const cycle = checked.value;
  if (!cycle?.id || !cycle?.learningVersion) return json(400, { ok: false, message: 'Learning cycle id and version required.' });
  if (cycle.ethics?.fictionalOnly !== true || cycle.ethics?.noLiveOrders !== true) {
    return json(400, { ok: false, message: 'Learning cycle safety contract missing.' });
  }
  try {
    const result = await persistLearningCycle(getTradingLabDatabase(), cycle);
    return json(200, { ok: true, target: 'netlify-database', ordersEnabled: false, ...result });
  } catch (error) {
    console.error('Learning cycle persistence failed:', error?.message || error);
    return json(500, { ok: false, ordersEnabled: false, message: 'Learning cycle persistence failed.' });
  }
}

export default asNetlifyFunction(handleRequest);
