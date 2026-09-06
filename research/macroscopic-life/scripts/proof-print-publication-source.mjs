import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.cwd(),'research/macroscopic-life');
const pub=path.join(root,'publication');const m=path.join(root,'manuscript');
const bundlePath=path.join(pub,'book-one-publication-source-bundle-v1.0.json');const layoutPath=path.join(pub,'book-one-print-layout-contract-v1.0.json');
const masterPath=path.join(m,'book-one-master-v1.0-reader-endnoted.md');
const failures=[];for(const p of [bundlePath,layoutPath,masterPath])if(!fs.existsSync(p))failures.push(`missing ${path.relative(root,p)}`);
if(failures.length){console.error('PRINT SOURCE PROOF: BLOCKED');for(const f of failures)console.error(`- ${f}`);process.exit(2)}
const bundle=JSON.parse(fs.readFileSync(bundlePath,'utf8'));if(bundle.status!=='READY')failures.push(`publication bundle status=${bundle.status}`);
const text=fs.readFileSync(masterPath,'utf8');
const chapters=text.match(/^##? Chapter \d+ —/gm)||[];if(chapters.length!==16)failures.push(`chapter count ${chapters.length}/16`);
for(let n=1;n<=45;n++){const marker=(text.match(new RegExp(`\\[\\^${n}\\]`,'g'))||[]).length;if(marker!==2)failures.push(`note ${n} token count ${marker}, expected 2`)}
const tests=['Boundary Perturbation','Integration Ablation','Conflict Suppression','Energetic Organization','Memory Turnover','Prediction Advantage','Repair Autonomy','Whole-Only Information','Higher-Level Intervention','Reproduction/Heredity','Model Competition'];for(const t of tests)if(!text.includes(t))failures.push(`missing canonical test name: ${t}`);
for(const lock of ['ON THE EVIDENCE REVIEWED IN THIS BOOK, CIVILIZATION IS NOT ESTABLISHED AS A HIGHER-ORDER INDIVIDUAL.','MEASURE. PERTURB. COMPARE MODELS. ALLOW FAILURE.','WE ARE THE MICROBE.'])if(!text.includes(lock))failures.push(`missing verdict lock: ${lock}`);
if(/PUB-7L .*IMPLEMENTATION NOTES|EDITORIAL LEDGER/.test(text))failures.push('editorial/build leakage detected');
console.log(`PRINT SOURCE PROOF: ${failures.length?'BLOCKED':'PASS'}`);for(const f of failures)console.error(`- ${f}`);if(failures.length)process.exit(2);console.log('16 chapters / 45 notes / Eleven Tests / verdict locks PASS. Ready for fixed-layout adapter.');
