import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(process.cwd(),'research/macroscopic-life');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const files=[
 ['cleanMaster','manuscript/book-one-master-v1.0-reader-materialized.md',true],
 ['endnotedMaster','manuscript/book-one-master-v1.0-reader-endnoted.md',true],
 ['bibliography','manuscript/book-one-final-verified-bibliography-v1.0.md',true],
 ['endnoteMap','manuscript/book-one-endnote-numbering-map-v1.0.md',true],
 ['anchorReconciliation','manuscript/book-one-exact-endnote-anchor-reconciliation-v1.0.json',true],
 ['integrityReport','manuscript/book-one-post-injection-integrity-report-v1.0.json',true],
 ['figureRegistry','visuals/figure-publication-registry-v1.json',false],
 ['figureR3ProofCopy','visuals/figure-r3-proof-copy-v1.json',false]
];
const artifacts={};const blockers=[];
for(const [key,rel,required] of files){const p=path.join(root,rel);if(!fs.existsSync(p)){artifacts[key]={path:rel,status:'MISSING'};if(required)blockers.push(`${key} missing`);continue}const b=fs.readFileSync(p);artifacts[key]={path:rel,status:'PRESENT',bytes:b.length,sha256:sha(b)}}
for(const [key] of [['anchorReconciliation'],['integrityReport']]){const a=artifacts[key];if(a?.status==='PRESENT'){const j=JSON.parse(fs.readFileSync(path.join(root,a.path),'utf8'));if(j.status!=='PASS')blockers.push(`${key} is ${j.status}, not PASS`)}}
// Figure release state is intentionally fail-closed. Design/spec locks do not equal verified R3 binary publication state.
let figureState='UNVERIFIED';
if(artifacts.figureRegistry?.status==='PRESENT'){
 try{const j=JSON.parse(fs.readFileSync(path.join(root,artifacts.figureRegistry.path),'utf8'));const rows=j.figures||j.records||[];const core=rows.filter(r=>{const n=Number(r.figure??r.id??r.number);return n>=2&&n<=16});const ready=core.filter(r=>String(r.publicationState??r.state??r.status).toUpperCase().includes('R3')&&String(r.publicationState??r.state??r.status).toUpperCase().includes('VERIF'));if(core.length===15&&ready.length===15)figureState='VERIFIED_R3_15_OF_15';else blockers.push(`figures not verified R3 15/15 (${ready.length}/${core.length||15})`)}catch{blockers.push('figure registry unreadable')}
}else blockers.push('figure publication registry missing');
const manifest={status:blockers.length?'BLOCKED':'RELEASE_CANDIDATE_READY',release:'MACROSCOPIC-LIFE-BOOK-ONE-RC1',generatedAt:new Date().toISOString(),artifacts,figureState,blockers,doctrine:['Frozen reader prose is immutable.','Production-ready figure designs are recovered; binary verification is a separate gate.','No missing figure binary may be replaced by redesign without explicit approval.','No bibliographic metadata may be fabricated.','Release requires scholarly PASS and verified R3 figures 2–16.']};
const out=path.join(root,'release','book-one-rc1-manifest.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(manifest,null,2)+'\n');console.log(`BOOK ONE RC1: ${manifest.status}`);for(const b of blockers)console.error(`- ${b}`);if(blockers.length)process.exit(2);
