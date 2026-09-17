import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { runReleaseSmoke } from '../src/release-smoke.js';
import { methodologyPanel } from '../src/methodology.js';
import { learningCommandCenter } from '../src/learning-command-center.js';
import { readinessPanel } from '../src/release-readiness.js';
import { costModelPanel } from '../src/production-integration.js';
import { phase3BPanel } from '../src/phase3b-runtime.js';

const root = dirname(fileURLToPath(new URL('.', import.meta.url)));
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

async function readCss() {
  const files = ['src/styles.css', 'src/phase3.css', 'src/phase3b.css', 'src/production-integration.css', 'src/learning-command-center.css'];
  const parts = await Promise.all(files.map((file) => readFile(join(root, file), 'utf8')));
  return parts.join('\n');
}

export async function collectShippedSmoke() {
  const [indexHtml, appSource, css] = await Promise.all([
    readFile(join(root, 'index.html'), 'utf8'),
    readFile(join(root, 'src/phase3-main.js'), 'utf8'),
    readCss(),
  ]);
  const panelsHtml = [
    methodologyPanel(),
    learningCommandCenter({}),
    readinessPanel({}),
    costModelPanel({ commissionPerOrder: 0, secFeePerMillionOnSales: 20.6, tafPerShareOnSales: 0.000195, spreadBps: 4, slippageBps: 2 }),
    phase3BPanel({ status: () => ({ observations: 0, symbols: 0, decisions: 0, trades: 0, regime: 'INSUFFICIENT_DATA', breadth: {} }) }),
  ].join('\n');
  return runReleaseSmoke({ indexHtml, appSource, css, panelsHtml });
}

export function checkProofPayload(smoke = { ok: false, mobile: { ok: false }, accessibility: { ok: false } }) {
  return {
    ok: Boolean(smoke.ok),
    command: 'npm run check',
    ordersEnabled: false,
    mobile: Boolean(smoke.mobile?.ok),
    accessibility: Boolean(smoke.accessibility?.ok),
    packageName: pkg.name,
    version: pkg.version,
  };
}

export async function writeCheckProof(directory = join(root, 'dist')) {
  const smoke = await collectShippedSmoke();
  const payload = checkProofPayload(smoke);
  await mkdir(directory, { recursive: true });
  const file = join(directory, 'check-proof.json');
  await writeFile(file, `${JSON.stringify(payload, null, 2)}\n`);
  if (!smoke.ok) {
    const details = [...(smoke.mobile?.failures || []), ...(smoke.accessibility?.failures || [])];
    throw new Error(`Release smoke failed: ${details.join(' ')}`);
  }
  return { file, payload, smoke };
}

if (process.argv[1]?.includes('write-check-proof')) {
  writeCheckProof().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
