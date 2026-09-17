import { getTradingLabDatabase } from '../lib/database.mjs';
import { asNetlifyFunction } from '../lib/netlify-function.mjs';
import { validateResearchBody } from './research-validation.mjs';

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  body: JSON.stringify(body)
});
const asJson = (value) => JSON.stringify(value ?? {});

export async function persistCalibration(db, cycle) {
  const client = await db.pool.connect();
  try {
    await client.query('begin');
    await client.query(
      `insert into trading_lab.calibration_cycles(
        id, created_at, version, horizon, samples, brier_score, buckets, regime_calibration, safety
      ) values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9::jsonb)
      on conflict (id) do nothing`,
      [
        cycle.id,
        cycle.createdAt,
        cycle.version,
        cycle.horizon,
        cycle.samples,
        cycle.brier,
        asJson(cycle.buckets),
        asJson(cycle.regimes),
        asJson(cycle.safety),
      ]
    );
    for (const feature of cycle.ablation || []) {
      await client.query(
        `insert into trading_lab.feature_evidence(
          calibration_cycle_id, feature, samples, correlation, absolute_contribution, direction
        ) values ($1,$2,$3,$4,$5,$6)
        on conflict (calibration_cycle_id, feature) do update set
          samples=excluded.samples,
          correlation=excluded.correlation,
          absolute_contribution=excluded.absolute_contribution,
          direction=excluded.direction`,
        [
          cycle.id,
          feature.feature,
          feature.samples,
          feature.correlation,
          feature.absoluteContribution,
          feature.direction,
        ]
      );
    }
    await client.query('delete from trading_lab.calibration_lessons where calibration_cycle_id=$1', [cycle.id]);
    for (const lesson of cycle.lessons || []) {
      await client.query(
        `insert into trading_lab.calibration_lessons(calibration_cycle_id, lesson_type, lesson)
         values ($1,$2,$3)`,
        [cycle.id, lesson.type, lesson.text]
      );
    }
    await client.query('commit');
    return {
      cycleId: cycle.id,
      features: (cycle.ablation || []).length,
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
  if (!cycle?.id || cycle.safety?.noLiveOrders !== true || cycle.safety?.descriptiveResearchOnly !== true) {
    return json(400, { ok: false, message: 'Calibration safety contract missing.' });
  }
  try {
    return json(200, {
      ok: true,
      target: 'netlify-database',
      ordersEnabled: false,
      ...await persistCalibration(getTradingLabDatabase(), cycle)
    });
  } catch (error) {
    console.error('Calibration persistence failed:', error?.message || error);
    return json(500, { ok: false, ordersEnabled: false, message: 'Calibration persistence failed.' });
  }
}

export default asNetlifyFunction(handleRequest);
