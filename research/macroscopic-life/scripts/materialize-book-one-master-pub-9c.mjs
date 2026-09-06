import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'research/macroscopic-life');
const manuscriptDir = path.join(root, 'manuscript');
const output = path.join(manuscriptDir, 'book-one-master-pub-9c-reader-materialized.md');

const sources = [
  'pub-7l-r1-act-i-redundancy-cut-reader-manuscript.md',
  'pub-9c-r9-act-ii-reader-manuscript.md',
  'pub-7l-r1-act-iii-redundancy-cut-reader-manuscript.md',
  'pub-9c-r9-act-iv-reader-manuscript.md',
  'pub-9c-r9-act-v-reader-manuscript.md',
];

function readerLayer(text) {
  const actIndex = text.search(/^# ACT [IVX]+\s+—/m);
  if (actIndex < 0) throw new Error('Missing ACT heading in reader source');
  text = text.slice(actIndex);
  const ledger = text.search(/^# PUB-7L .*IMPLEMENTATION NOTES/m);
  if (ledger >= 0) text = text.slice(0, ledger);
  return text.trim();
}

const parts = sources.map((file) => {
  const full = path.join(manuscriptDir, file);
  if (!fs.existsSync(full)) throw new Error(`Missing revised reader source: ${file}. Run promote-pub-9c-r9-reader-revisions.mjs first.`);
  return readerLayer(fs.readFileSync(full, 'utf8'));
});

const front = `# MACROSCOPIC LIFE\n\n## What If We Are the Microbe?\n\n### Book One — PUB-9C Revised Reader Master\n\n> **THE MICROBE IS A PERSPECTIVE, NOT A DIAGNOSIS.**\n\nThis book does not assume that a larger organism exists. It asks what evidence could distinguish higher-order individuality from an extraordinarily complex organized world.\n\n\`Macroscopic Life\` is the umbrella question. The experimentally tractable core is narrower: **can individuality emerge at organizational scales above familiar organisms, and what evidence would distinguish that transition from complex organization without a new individual?**\n\nBiology does not provide one universally sufficient definition of individuality for every research question. In this book, *organism*, *biological individual*, *evolutionary individual*, and *higher-order individual* overlap in some contexts but are not automatic synonyms. *Macroscopic organization* is broader: a system can possess real higher-scale organization without qualifying as one biological individual.\n\nThe question is not whether the world can be made to resemble a body.\n\nThe question is whether a stronger explanation can survive measurement, perturbation, comparison, and failure.`;

let materialized = [front, ...parts].join('\n\n---\n\n');

const forbidden = [/PUB-7L .*IMPLEMENTATION NOTES/,/EDITORIAL LEDGER/,/Status:\s*READER-LAYER/,/## Pattern, Organization, Individual\b/];
for (const pattern of forbidden) if (pattern.test(materialized)) throw new Error(`Build-only/obsolete material leaked into revised master: ${pattern}`);

const chapters = [...materialized.matchAll(/^#(?:#)? Chapter (\d+)\s+—/gm)].map((m) => Number(m[1]));
const expected = Array.from({length:16},(_,i)=>i+1);
if (JSON.stringify(chapters)!==JSON.stringify(expected)) throw new Error(`Chapter sequence mismatch: ${chapters.join(', ')}`);

const tests=['Boundary Perturbation','Integration Ablation','Conflict Suppression','Energetic Organization','Memory Turnover','Prediction Advantage','Repair Autonomy','Whole-Only Information','Higher-Level Intervention','Reproduction/Heredity','Model Competition'];
for (const test of tests) if (!materialized.includes(test)) throw new Error(`Missing Eleven-Test lock: ${test}`);

const revisionLocks=[
  'MACROSCOPIC PATTERN → MACROSCOPIC ORGANIZATION → INTEGRATION → HIGHER-ORDER INDIVIDUALITY',
  'DETECT THE PATTERN. PROVE THE ORGANIZATION. PERTURB THE INTEGRATION. MAKE INDIVIDUALITY COMPETE.',
  'SIGNAL ≠ INFORMATION ≠ INTEGRATION ≠ INTELLIGENCE ≠ AGENCY ≠ CONSCIOUSNESS',
  'HIGHER-ORDER INDIVIDUALITY ≠ HIGHER-ORDER CONSCIOUSNESS.',
  'DO NOT ASK WHETHER THE WHOLE IS CONSCIOUS UNTIL YOU HAVE FIRST EARNED THE RIGHT TO CALL IT A WHOLE.',
  'RESEMBLANCE GENERATES HYPOTHESES. MECHANISM GENERATES EVIDENCE. PREDICTION SEPARATES MODELS.',
  'THE GOAL IS NOT TO MAKE MACROSCOPIC LIFE WIN. THE GOAL IS TO MAKE THE BETTER MODEL WIN.',
  'The Research Program Is Larger Than Civilization'
];
for (const lock of revisionLocks) if (!materialized.includes(lock)) throw new Error(`Missing PUB-9C revision lock: ${lock}`);

const finalLocks=['ON THE EVIDENCE REVIEWED IN THIS BOOK, CIVILIZATION IS NOT ESTABLISHED AS A HIGHER-ORDER INDIVIDUAL.','CURRENT WINNER: MODEL C.','MEASURE. PERTURB. COMPARE MODELS. ALLOW FAILURE.','WE ARE THE MICROBE.'];
for (const lock of finalLocks) if (!materialized.includes(lock)) throw new Error(`Missing final lock: ${lock}`);

if (!materialized.includes('[12.4]')) throw new Error('Missing staged consciousness endnote marker [12.4].');

fs.writeFileSync(output, materialized.trimEnd()+'\n','utf8');
console.log(`PASS: materialized revised reader master: ${output}`);
console.log(`Acts: ${sources.length}; Chapters: ${chapters.length}; Eleven Tests: ${tests.length}; consciousness slot marker: 1`);
