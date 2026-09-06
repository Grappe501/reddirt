import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(process.cwd(),'research/macroscopic-life');
const m=path.join(root,'manuscript');
const masterPath=path.join(m,'book-one-master-pub-9c-reader-materialized.md');
const manifestPath=path.join(m,'book-one-exact-endnote-anchor-manifest-pub-9c-v1.0.json');
const outPath=path.join(m,'book-one-exact-endnote-anchor-reconciliation-pub-9c-v1.0.json');

for(const p of [masterPath,manifestPath]) if(!fs.existsSync(p)) throw new Error(`Missing required file: ${path.basename(p)}`);
const master=fs.readFileSync(masterPath,'utf8');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const slots=manifest.slots||[];
if(slots.length!==46) throw new Error(`Expected 46 anchor records, found ${slots.length}`);
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');

const results=[];let pass=0;
for(const rec of slots){
  const note=rec.note;
  const anchor=(rec.exactAnchor||'').trim();
  if(!anchor){results.push({note,chapter:rec.chapter,status:'BLOCKED-NO-EXACT-ANCHOR'});continue;}
  let count=0,pos=0,idx;
  while((idx=master.indexOf(anchor,pos))!==-1){count++;pos=idx+anchor.length;}
  const status=count===1?'PASS-UNIQUE':count===0?'BLOCKED-NOT-FOUND':'BLOCKED-AMBIGUOUS';
  if(status==='PASS-UNIQUE') pass++;
  results.push({note,chapter:rec.chapter,status,matchCount:count,anchorSha256:sha(anchor),exactAnchor:anchor,authorityIdsOrClass:rec.authorityIds??rec.authorityIdsOrClass??rec.authorityIdOrClass??rec.noteClass??null});
}

const report={status:pass===46?'PASS':'BLOCKED',master:'book-one-master-pub-9c-reader-materialized.md',masterSha256:sha(master),slotCount:46,uniqueExactAnchors:pass,results};
fs.writeFileSync(outPath,JSON.stringify(report,null,2)+'\n');
console.log(`PUB-9C EXACT-ANCHOR RECONCILIATION: ${report.status} (${pass}/46)`);
if(report.status!=='PASS') process.exit(2);
