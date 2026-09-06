import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(process.cwd(),'research/macroscopic-life'); const m=path.join(root,'manuscript');
const masterPath=path.join(m,'book-one-master-pub-9c-reader-materialized.md');
const candidatePath=path.join(m,'book-one-exact-endnote-anchor-manifest-pub-9c-resolved-v1.0.json');
const approvalPath=path.join(m,'book-one-exact-endnote-anchor-approvals-pub-9c-v1.0.json');
const finalPath=path.join(m,'book-one-exact-endnote-anchor-manifest-pub-9c-approved-v1.0.json');
for(const p of [masterPath,candidatePath,approvalPath]) if(!fs.existsSync(p)) throw new Error(`BLOCKED: missing ${path.basename(p)}`);
const master=fs.readFileSync(masterPath,'utf8'); const candidates=JSON.parse(fs.readFileSync(candidatePath,'utf8')); const approvals=JSON.parse(fs.readFileSync(approvalPath,'utf8'));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'); if(candidates.masterSha256!==sha(master)) throw new Error('BLOCKED: master changed after candidate generation.');
if(!Array.isArray(approvals.approvals)||approvals.approvals.length!==46) throw new Error('BLOCKED: approvals file must contain exactly 46 records.');
const amap=new Map(approvals.approvals.map(x=>[x.note,x])); const final=[];
for(const c of candidates.slots){const a=amap.get(c.note);if(!a)throw new Error(`BLOCKED: no approval for note ${c.note}`);if(a.decision!=='APPROVE')throw new Error(`BLOCKED: note ${c.note} decision is ${a.decision||'missing'}, not APPROVE`);const anchor=(a.exactAnchor||c.exactAnchor||'').trim();if(!anchor)throw new Error(`BLOCKED: note ${c.note} has no approved exact anchor`);let count=0,p=0,i;while((i=master.indexOf(anchor,p))!==-1){count++;p=i+anchor.length}if(count!==1)throw new Error(`BLOCKED: note ${c.note} approved anchor occurrence count ${count}, expected 1`);final.push({...c,state:'EXACT-ANCHOR-VERIFIED',exactAnchor:anchor,exactOccurrenceCount:1,anchorSha256:sha(anchor),approvedBy:a.approvedBy||'OPERATOR',approvalNote:a.note||null,candidateAlternatives:undefined});}
const doc={status:'PASS',sourceMaster:path.basename(masterPath),masterSha256:sha(master),slotCount:46,verifiedExactAnchors:46,policy:'All 46 anchors explicitly approved and reverified unique against the unchanged physical PUB-9C master.',slots:final};
fs.writeFileSync(finalPath,JSON.stringify(doc,null,2)+'\n'); console.log('PASS: 46/46 exact anchors approved and uniquely verified.'); console.log(finalPath);
