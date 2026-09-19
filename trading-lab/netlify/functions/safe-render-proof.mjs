import { asNetlifyFunction } from '../lib/netlify-function.mjs';
import { escapeHtml, safeRenderingProof } from '../../src/v6-production-proof.js';
import { competitionJson } from '../lib/competition-http.mjs';

const SAMPLE = '<img src=x onerror="alert(1)">';

export async function handleRequest(event) {
  if (event.httpMethod && event.httpMethod !== 'GET') {
    return competitionJson(405, { ok: false, message: 'GET required.' });
  }

  const proof = safeRenderingProof();
  const escaped = escapeHtml(SAMPLE);
  return competitionJson(200, {
    ...proof,
    sample: { rawLength: SAMPLE.length, escaped, containsRawTag: escaped.includes('<img') },
    checkedAt: new Date().toISOString(),
  });
}

export default asNetlifyFunction(handleRequest);
