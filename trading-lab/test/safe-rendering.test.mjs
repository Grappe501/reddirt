import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { escapeHtml, safeRenderingProof, V7_SAFE_SURFACES } from '../src/v6-production-proof.js';
import { dashboardFirstFrame, marketsMarkup, v6ShellMarkup } from '../src/v6-product-shell.js';
import { lobbyMarkup } from '../src/v6-competition-lobby.js';
import { researchFloorMarkup, symbolResearchMarkup } from '../src/v6-research-floor.js';
import { tapeDrawerMarkup } from '../src/v6-intelligence-tape.js';
import { coachMarkup, universityMarkup } from '../src/v6-university-coach.js';
import { simulationMarkup } from '../src/v6-portfolio-lab.js';
import { liveLeagueMarkup, leagueStandings } from '../src/v6-live-league.js';
import { compareDecisions, freezeDecision, humanAiMarkup } from '../src/v6-human-ai-lab.js';
import { investorReport, investorReportMarkup } from '../src/v6-investor-report-alumni.js';
import { handleRequest as proof } from '../netlify/functions/safe-render-proof.mjs';

const XSS = '<img src=x onerror="alert(1)">';
const root = dirname(dirname(fileURLToPath(import.meta.url)));

function assertEscaped(html) {
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.doesNotMatch(html, /<img\s/i);
  assert.doesNotMatch(html, /onerror="alert/i);
}

test('V7-05 proof lists every V6 surface and does not authorize launch', () => {
  const result = safeRenderingProof();
  assert.equal(result.ok, true);
  assert.equal(result.interpolationClosed, true);
  assert.equal(result.foundingCohortLaunchAuthorized, false);
  assert.deepEqual(result.surfaces, [...V7_SAFE_SURFACES]);
});

test('V7-05 shell, dashboard, and markets escape provider and API strings', () => {
  assertEscaped(v6ShellMarkup({ tape: XSS, status: XSS, content: '<p>ok</p>' }));
  assertEscaped(dashboardFirstFrame({
    quotes: [{ symbol: XSS, price: 1 }],
    attention: [XSS],
    research: [{ title: XSS, summary: XSS }],
    learning: XSS,
    competition: XSS,
  }));
  assertEscaped(marketsMarkup([{ symbol: XSS, price: 10, time: XSS }]));
});

test('V7-05 research, tape, university, and coach escape live strings', () => {
  assertEscaped(researchFloorMarkup({
    investigations: [{ posture: XSS, symbol: XSS, title: XSS, summary: XSS }],
    activeCount: 1,
    sourcesExamined: 1,
    disagreementCount: 0,
    cost: 0,
  }));
  assertEscaped(symbolResearchMarkup(XSS, { posture: XSS, bull: [XSS], bear: [XSS], invalidation: XSS }));
  assertEscaped(tapeDrawerMarkup({ posture: XSS, symbol: XSS, title: XSS, summary: XSS, freshness: XSS, evidenceScore: null }));
  assertEscaped(universityMarkup({ term: XSS, depths: [XSS], depth: XSS, content: XSS }));
  assertEscaped(coachMarkup({ title: XSS, body: XSS, concept: XSS }));
});

test('V7-05 competition and lab surfaces escape external names and reasons', () => {
  assertEscaped(lobbyMarkup([{ id: XSS, verifiedHumans: 1, status: XSS, startAt: XSS, locked: true, seatsLeft: 9 }]));
  assertEscaped(simulationMarkup({ ok: false, reason: XSS }));
  assertEscaped(simulationMarkup({
    ok: true,
    symbol: XSS,
    scenarios: [{ exitPrice: 1, net: 1, returnPct: 1, costs: 1 }],
  }));
  assertEscaped(liveLeagueMarkup(leagueStandings({
    currentHumanId: 'h',
    players: [{ id: 'h', name: XSS, value: 100000 }],
  })));
  const human = freezeDecision({ actor: 'HUMAN', symbol: 'SPY', asOf: 't', thesis: 'a', posture: XSS, action: XSS });
  const ai = freezeDecision({ actor: 'WEALTH_BUILDER_AI', symbol: 'SPY', asOf: 't', thesis: 'b', posture: 'WATCH', action: 'HOLD' });
  assertEscaped(humanAiMarkup(compareDecisions(human, ai, { summary: XSS })));
  assertEscaped(investorReportMarkup(investorReport({ strengths: [XSS], growthAreas: [XSS] })));
});

test('V7-05 markup files import the shared escape primitive', async () => {
  const src = join(root, 'src');
  const names = (await readdir(src)).filter((name) => name.startsWith('v6-') && name.endsWith('.js'));
  const markupFiles = [];
  for (const name of names) {
    const source = await readFile(join(src, name), 'utf8');
    if (name !== 'v6-production-proof.js' && /export function \w+Markup\b/.test(source)) markupFiles.push({ name, source });
  }
  assert.ok(markupFiles.length >= 10);
  for (const file of markupFiles) {
    assert.match(file.source, /from ['"]\.\/v6-production-proof\.js['"]/, `${file.name} must import escapeHtml`);
    assert.match(file.source, /escapeHtml/, `${file.name} must use escapeHtml`);
  }
});

test('V7-05 production proof handler is GET-only and never echoes raw markup', async () => {
  const denied = JSON.parse((await proof({ httpMethod: 'POST' })).body);
  assert.equal(denied.ok, false);
  const body = JSON.parse((await proof({ httpMethod: 'GET' })).body);
  assert.equal(body.ok, true);
  assert.equal(body.interpolationClosed, true);
  assert.equal(body.foundingCohortLaunchAuthorized, false);
  assert.equal(body.sample.containsRawTag, false);
  assert.equal(body.sample.escaped, escapeHtml(XSS));
  assert.doesNotMatch(JSON.stringify(body), /<img\s/i);
});
