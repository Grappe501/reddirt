const FORBIDDEN_PUBLIC_KEYS = /connectionstring|password|username|token|secret|database_url|netlify_db_url|^host$|emailhandle|phonehandle|^email$|^phone$/i;

export function sanitizePublicCompetition(body) {
  const safe = {};
  for (const [key, value] of Object.entries(body || {})) {
    if (FORBIDDEN_PUBLIC_KEYS.test(key)) continue;
    safe[key] = value;
  }
  return safe;
}

export function competitionJson(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
    },
    body: JSON.stringify(sanitizePublicCompetition({
      ordersEnabled: false,
      realMoney: false,
      foundingCohortLaunchAuthorized: false,
      ...body,
    })),
  };
}

export function parseCompetitionBody(body, { maxBytes = 20000 } = {}) {
  const text = String(body || '');
  if (new TextEncoder().encode(text).length > maxBytes) {
    return { ok: false, message: 'Payload too large.' };
  }
  try {
    return { ok: true, value: text.trim() ? JSON.parse(text) : {} };
  } catch {
    return { ok: false, message: 'Invalid JSON.' };
  }
}

export function rejectForbiddenWrite(value = {}) {
  if (value.ordersEnabled === true || value.realMoney === true) {
    return 'Live-money and broker-order fields are forbidden.';
  }
  if (value.launch === true || value.activate === true || value.foundingCohortLaunchAuthorized === true) {
    return 'Founding cohort launch cannot be authorized through this API.';
  }
  if (value.realCohortActivated === true || value.activateRealCohort === true) {
    return 'Dress rehearsal cannot activate the real founding cohort.';
  }
  if (value.governmentIdStored === true || value.storeGovernmentId === true) {
    return 'Government ID storage is forbidden.';
  }
  if (value.creditCardRequired === true || value.cardRequired === true) {
    return 'Credit cards are not required and cannot be required through this API.';
  }
  return null;
}
