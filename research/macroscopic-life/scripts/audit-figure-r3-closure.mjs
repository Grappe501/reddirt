import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(process.cwd(),'research/macroscopic-life');
const visuals=path.join(root,'visuals');
const release=path.join(root,'release');fs.mkdirSync(release,{recursive:true});
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const registryPath=path.join(visuals,'figure-publication-registry-v1.json');
const proofPath=path.join(visuals,'figure-r3-proof-copy-v1.json');
const rows=[];const blockers=[];
let registry=null,proof=null;
for(const [label,p] of [['registry',registryPath],['proof-copy',proofPath]]){if(!fs.existsSync(p))blockers.push(`${label} missing`);else try{const j=JSON.parse(fs.readFileSync(p,'utf8'));if(label==='registry')registry=j;else proof=j}catch{blockers.push(`${label} unreadable`)}}
const getRows=j=>j?(j.figures||j.records||j.items||[]):[];
const rr=getRows(registry),pr=getRows(proof);
for(let n=2;n<=16;n++){
 const r=rr.find(x=>Number(x.figure??x.number??x.id)===n)||{};const p=pr.find(x=>Number(x.figure??x.number??x.id)===n)||{};
 const candidates=[r.publicationPath,r.assetPath,r.path,p.publicationPath,p.assetPath,p.path].filter(Boolean);
 let asset=null;for(const rel of candidates){const abs=path.isAbsolute(rel)?rel:path.join(root,rel);if(fs.existsSync(abs)&&fs.statSync(abs).isFile()){asset=abs;break}}
 const state=String(r.publicationState??r.state??r.status??p.publicationState??p.state??p.status??'UNVERIFIED').toUpperCase();
 const r3=/R3/.test(state);const verified=/VERIF|PASS|LOCKED_FOR_PUBLICATION/.test(state);
 const status=asset&&r3&&verified?'PASS':'BLOCKED';
 const rec={figure:n,status,registryState:state,assetPath:asset?path.relative(root,asset).replaceAll('\\','/'):null,sha256:asset?sha(asset):null};rows.push(rec);
 if(status!=='PASS')blockers.push(`Figure ${n}: asset=${asset?'present':'missing'}, state=${state}`);
}
const report={status:blockers.length?'BLOCKED':'PASS',figuresRequired:15,figuresVerifiedR3:rows.filter(x=>x.status==='PASS').length,rows,blockers,rule:'Recover and verify approved production binaries. Do not redesign approved figures to satisfy this gate.'};
fs.writeFileSync(path.join(release,'book-one-figure-r3-closure-audit.json'),JSON.stringify(report,null,2)+'\n');console.log(`FIGURE R3 CLOSURE: ${report.status} (${report.figuresVerifiedR3}/15)`);for(const b of blockers)console.error(`- ${b}`);if(blockers.length)process.exit(2);
