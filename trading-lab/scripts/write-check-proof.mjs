import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = dirname(fileURLToPath(new URL('.', import.meta.url)));
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

export function checkProofPayload() {
  return {
    ok: true,
    command: 'npm run check',
    ordersEnabled: false,
    packageName: pkg.name,
    version: pkg.version,
  };
}

export async function writeCheckProof(directory = join(root, 'dist')) {
  const payload = checkProofPayload();
  await mkdir(directory, { recursive: true });
  const file = join(directory, 'check-proof.json');
  await writeFile(file, `${JSON.stringify(payload, null, 2)}\n`);
  return { file, payload };
}

if (process.argv[1]?.includes('write-check-proof')) {
  writeCheckProof().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
