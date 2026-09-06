import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(process.cwd(),'research/macroscopic-life');
const mdir=path.join(root,'manuscript');
const masterPath=path.join(mdir,'book-one-master-v1.0-reader-materialized.md');
const anchorPath=path.join(mdir,'book-one-exact-endnote-anchor-manifest-v1.0.json');
const outPath=path.join(mdir,'book-one-exact-endnote-anchor-reconciliation-v1.0.json');

if(!fs.existsSync(masterPath)){console.error('BLOCKED: materialized physical master is missing. Run materialize-book-one-master.mjs first.');process.exit(2)}
if(!fs.existsSync(anchorPath)){console.error('BLOCKED: exact-anchor manifest is missing.');process.exit(2)}
const master=fs.readFileSync(masterPath,'utf8');
const manifest=JSON.parse(fs.readFileSync(anchorPath,'utf8'));
const slots=manifest.slots||manifest.anchors||[];
if(slots.length!==45){console.error(`BLOCKED: expected 45 anchor records, found ${slots.length}.`);process.exit(2)}
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const results=[]; let pass=0;
for(const rec of slots){
 const note=rec.note??rec.slot;
 const anchor=(rec.exactAnchor??rec.anchor??'').trim();
 const state=rec.state??rec.classification??'UNSPECIFIED';
 if(!anchor){results.push({note,state,status:'BLOCKED-NO-EXACT-ANCHOR'});continue}
 let count=0,pos=0,idx;
 while((idx=master.indexOf(anchor,pos))!==-1){count++;pos=idx+anchor.length}
 const status=count===1?'PASS-UNIQUE':count===0?'BLOCKED-NOT-FOUND':'BLOCKED-AMBIGUOUS';
 if(status==='PASS-UNIQUE')pass++;
 results.push({note,state,status,matchCount:count,anchorSha256:sha(anchor),anchor});
}
const report={status:pass===45?'PASS':'BLOCKED',master:'book-one-master-v1.0-reader-materialized.md',masterSha256:sha(master),slotCount:45,uniqueExactAnchors:pass,results};
fs.writeFileSync(outPath,JSON.stringify(report,null,2)+'\n');
console.log(`EXACT-ANCHOR RECONCILIATION: ${report.status} (${pass}/45 unique exact matches)`);
if(report.status!=='PASS')process.exit(2);
