import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.cwd(),'research/macroscopic-life');
const m=path.join(root,'manuscript');
const req={master:'book-one-master-v1.0-reader-materialized.md',bibliography:'book-one-final-verified-bibliography-v1.0.md',numbering:'book-one-endnote-numbering-map-v1.0.md',insertion:'book-one-endnote-insertion-manifest-v1.0.json',anchors:'book-one-exact-endnote-anchor-manifest-v1.0.json',reconciliation:'book-one-exact-endnote-anchor-reconciliation-v1.0.json'};
const failures=[]; const docs={};
for(const [k,f] of Object.entries(req)){const p=path.join(m,f);if(!fs.existsSync(p))failures.push(`${k} missing: ${f}`);else docs[k]=fs.readFileSync(p,'utf8')}
if(docs.reconciliation){const r=JSON.parse(docs.reconciliation);if(r.status!=='PASS'||r.uniqueExactAnchors!==45)failures.push(`exact-anchor reconciliation not PASS 45/45`)}
if(docs.bibliography){for(let i=1;i<=31;i++){const id=`BIB-${String(i).padStart(3,'0')}`;if(!docs.bibliography.includes(id))failures.push(`final bibliography missing ${id}`)}}
if(docs.master){
 const chapterMatches=docs.master.match(/^##? Chapter \d+ —/gm)||[]; if(chapterMatches.length!==16)failures.push(`master chapter count ${chapterMatches.length}, expected 16`);
 const locks=['ON THE EVIDENCE REVIEWED IN THIS BOOK, CIVILIZATION IS NOT ESTABLISHED AS A HIGHER-ORDER INDIVIDUAL.','MEASURE. PERTURB. COMPARE MODELS. ALLOW FAILURE.','WE ARE THE MICROBE.'];
 for(const lock of locks)if(!docs.master.includes(lock))failures.push(`master missing locked verdict: ${lock}`);
}
const result=failures.length?'BLOCKED':'PASS';
console.log(`FINAL SCHOLARLY APPARATUS PROOF: ${result}`);for(const f of failures)console.error(`- ${f}`);if(failures.length)process.exit(2);
console.log('16 chapters / BIB-001..031 / 45 exact unique anchors / synthesis locks preserved.');
