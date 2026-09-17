import { getTradingLabDatabase } from '../lib/database.mjs';
import { asNetlifyFunction } from '../lib/netlify-function.mjs';

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  body: JSON.stringify(body)
});

export async function readCalibrationHistory(db) {
  const cycles = (await db.pool.query(`
    select id, created_at, version, horizon, samples, brier_score
    from trading_lab.calibration_cycles
    order by created_at desc
    limit 20
  `)).rows;
  const lessons = (await db.pool.query(`
    select lesson_type, lesson, created_at
    from trading_lab.calibration_lessons
    order by id desc
    limit 30
  `)).rows;
  return { cycles, lessons };
}

export async function handleRequest(event) {
  if (event.httpMethod && event.httpMethod !== 'GET') {
    return json(405, { ok: false, ordersEnabled: false, message: 'GET required.' });
  }
  try {
    return json(200, {
      ok: true,
      ordersEnabled: false,
      target: 'netlify-database',
      ...(await readCalibrationHistory(getTradingLabDatabase())),
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Calibration history failed:', error?.message || error);
    return json(500, { ok: false, ordersEnabled: false, message: 'Calibration history read failed.' });
  }
}

export default asNetlifyFunction(handleRequest);
