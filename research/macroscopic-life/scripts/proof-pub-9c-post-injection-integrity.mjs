import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(process.cwd(),'research/macroscopic-life');
const m=path.join(root,'manuscript');
const cleanPath=path.join(m,'book-one-master-pub-9c-reader-materialized.md');
const endnotedPath=path.join(m,'book-one-master-pub-9c-reader-endnoted.md');
const outPath=path.join(m,'book-one-post-injection-integrity-report-pub-9c-v1.0.json');
for(const p of [cleanPath,endnotedPath]) if(!fs.existsSync(p)) throw new Error(`Missing required file: ${path.basename(p)}`);

const clean=fs.readFileSync(cleanPath,'utf8').trimEnd();
const full=fs.readFileSync(endnotedPath,'utf8');
const failures=[];
const markerMatches=full.match(/\[\^(\d+)\]/g)||[];
if(markerMatches.length!==92) failures.push(`note token count ${markerMatches.length}, expected 92 (46 markers + 46 definitions)`);
for(let n=1;n<=46;n++){
  const count=(full.match(new RegExp(`\\[\\^${n}\\]`,'g'))||[]).length;
  if(count!==2) failures.push(`note ${n} token count ${count}, expected 2`);
}
if(full.includes('[12.4]')) failures.push('temporary [12.4] marker remains');

const apparatusIndex=full.indexOf('\n---\n\n# Endnotes\n');
if(apparatusIndex<0) failures.push('endnote apparatus delimiter missing');
let reader=apparatusIndex>=0?full.slice(0,apparatusIndex):full;
reader=reader.replace(/\[\^\d+\]/g,'').trimEnd();
if(reader!==clean) failures.push('reader prose round-trip mismatch after stripping note markers');

for(const lock of [
 'MACROSCOPIC PATTERN → MACROSCOPIC ORGANIZATION → INTEGRATION → HIGHER-ORDER INDIVIDUALITY',
 'HIGHER-ORDER INDIVIDUALITY ≠ HIGHER-ORDER CONSCIOUSNESS.',
 'ON THE EVIDENCE REVIEWED IN THIS BOOK, CIVILIZATION IS NOT ESTABLISHED AS A HIGHER-ORDER INDIVIDUAL.',
 'MEASURE. PERTURB. COMPARE MODELS. ALLOW FAILURE.',
 'WE ARE THE MICROBE.'
]) if(!full.includes(lock)) failures.push(`missing lock: ${lock}`);

if(/PUB-7L .*IMPLEMENTATION NOTES|EDITORIAL LEDGER/.test(reader)) failures.push('editorial/build leakage detected');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const report={status:failures.length?'BLOCKED':'PASS',cleanMasterSha256:sha(clean),endnotedMasterSha256:sha(full),slotCount:46,noteTokenCount:markerMatches.length,readerRoundTrip:reader===clean?'PASS':'FAIL',failures};
fs.writeFileSync(outPath,JSON.stringify(report,null,2)+'\n');
console.log(`PUB-9C POST-INJECTION INTEGRITY: ${report.status}`);
if(failures.length){for(const f of failures) console.error(`- ${f}`);process.exit(2)}
