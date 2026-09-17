import { normalizeProviderTime } from './data/historical.js';

export const MIN_LIVE_SHADOW_OBSERVATIONS = 8;

export function liveObservations(observations = []) {
  return (observations || []).filter((row) => {
    if (row?.mode !== 'LIVE' || !(Number(row.price) > 0)) return false;
    const time = normalizeProviderTime(row.providerTime);
    return Boolean(time) && Number.isFinite(Date.parse(time));
  });
}

export function liveShadowEvidence({ health = null, observations = [] } = {}) {
  const live = liveObservations(observations);
  if (health?.ordersEnabled === true) {
    return { ok: false, observationCount: live.length, configured: health.configured === true, detail: 'Live-money orders are enabled; shadow session is blocked.' };
  }
  if (health && health.configured !== true) {
    return { ok: false, observationCount: live.length, configured: false, detail: 'Market-data credentials are not configured.' };
  }
  if (health?.providerReachable === false) {
    return { ok: false, observationCount: live.length, configured: true, detail: 'Live provider probe failed.' };
  }
  if (live.length < MIN_LIVE_SHADOW_OBSERVATIONS) {
    return {
      ok: false,
      observationCount: live.length,
      configured: health?.configured === true,
      detail: live.length
        ? `Only ${live.length} LIVE observations recorded; need ${MIN_LIVE_SHADOW_OBSERVATIONS} from a live snapshot.`
        : 'No LIVE market observations have been recorded.',
    };
  }
  return {
    ok: true,
    observationCount: live.length,
    configured: health?.configured !== false,
    ordersEnabled: false,
    detail: `Live shadow recorded ${live.length} LIVE observations. Fictional trading only.`,
  };
}
