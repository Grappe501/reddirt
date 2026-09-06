import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const m=path.resolve(process.cwd(),'research/macroscopic-life/manuscript');
const cleanPath=path.join(m,'book-one-master-v1.0-reader-materialized.md');
const endPath=path.join(m,'book-one-master-v1.0-reader-endnoted.md');
if(!fs.existsSync(cleanPath)||!fs.existsSync(endPath)){console.error('BLOCKED: clean or endnoted master missing.');process.exit(2)}
const clean=fs.readFileSync(cleanPath,'utf8');const end=fs.readFileSync(endPath,'utf8');const failures=[];
for(let i=1;i<=45;i++){const re=new RegExp(`\\[\\^${i}\\]`,'g');const count=(end.match(re)||[]).length;if(count!==2)failures.push(`note ${i}: expected marker + definition = 2 occurrences; found ${count}`)}
const markerCount=(end.match(/\[\^\d+\]/g)||[]).length;if(markerCount!==90)failures.push(`expected 90 total note tokens, found ${markerCount}`);
const cut=end.indexOf('\n---\n\n# Endnotes\n');if(cut<0)failures.push('endnote apparatus delimiter missing');
else {const reader=end.slice(0,cut).replace(/\[\^\d+\]/g,'').trimEnd()+'\n';if(reader!==clean.trimEnd()+'\n')failures.push('reader prose differs after removing inserted markers')}
for(const lock of ['ON THE EVIDENCE REVIEWED IN THIS BOOK, CIVILIZATION IS NOT ESTABLISHED AS A HIGHER-ORDER INDIVIDUAL.','MEASURE. PERTURB. COMPARE MODELS. ALLOW FAILURE.','WE ARE THE MICROBE.'])if(!end.includes(lock))failures.push(`locked verdict missing: ${lock}`);
if(/PUB-7L .*IMPLEMENTATION NOTES|EDITORIAL LEDGER/.test(end))failures.push('build/editorial leakage detected');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const report={status:failures.length?'BLOCKED':'PASS',cleanMasterSha256:sha(clean),endnotedMasterSha256:sha(end),noteSlots:45,totalNoteTokens:markerCount,readerTextRoundTrip:failures.every(x=>!x.includes('reader prose differs')),failures};
fs.writeFileSync(path.join(m,'book-one-post-injection-integrity-report-v1.0.json'),JSON.stringify(report,null,2)+'\n');
console.log(`POST-INJECTION INTEGRITY: ${report.status}`);for(const f of failures)console.error(`- ${f}`);if(failures.length)process.exit(2);
console.log('45 markers + 45 definitions / clean-reader round trip PASS / verdict locks preserved.');
