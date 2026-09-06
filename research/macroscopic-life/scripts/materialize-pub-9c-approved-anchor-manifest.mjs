import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(process.cwd(),'research/macroscopic-life'),m=path.join(root,'manuscript');
const masterPath=path.join(m,'book-one-master-pub-9c-reader-materialized.md');
const approvalsPath=path.join(m,'book-one-exact-endnote-anchor-approvals-pub-9c-v1.0.json');
const outPath=path.join(m,'book-one-exact-endnote-anchor-manifest-pub-9c-approved-v1.0.json');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
for(const p of [masterPath,approvalsPath]) if(!fs.existsSync(p)) throw new Error(`BLOCKED: missing ${path.basename(p)}`);
const master=fs.readFileSync(masterPath,'utf8'), masterSha=sha(master), approvals=JSON.parse(fs.readFileSync(approvalsPath,'utf8'));
if(approvals.lockedMasterSha256!==masterSha) throw new Error('BLOCKED: approval manifest master SHA mismatch.');
if(!String(approvals.status||'').includes('46/46 APPROVED')) throw new Error('BLOCKED: approvals status is not 46/46 APPROVED.');
if(!Array.isArray(approvals.approvals)||approvals.approvals.length!==46) throw new Error('BLOCKED: expected 46 approval decisions.');
const countOccurrences=(text,needle)=>{let count=0,pos=0,i;while((i=text.indexOf(needle,pos))!==-1){count++;pos=i+needle.length;}return count;};
const seen=new Set(),slots=[];
for(const a of approvals.approvals){
  if(a.decision!=='APPROVE') throw new Error(`BLOCKED: note ${a.note} is not APPROVE.`);
  if(seen.has(a.note)) throw new Error(`BLOCKED: duplicate note ${a.note}.`); seen.add(a.note);
  if(typeof a.exactAnchor!=='string'||!a.exactAnchor.length) throw new Error(`BLOCKED: note ${a.note} lacks exact anchor.`);
  let exactAnchor=a.exactAnchor, normalization=null, count=countOccurrences(master,exactAnchor);
  if(count===0 && a.note===44){
    const formatted=a.exactAnchor.replace('MACROSCOPIC LIFE HYPOTHESIS: Some','MACROSCOPIC LIFE HYPOTHESIS:** Some');
    const formattedCount=countOccurrences(master,formatted);
    if(formattedCount===1){exactAnchor=formatted;count=1;normalization='MARKDOWN_CLOSE_BOLD_TOKEN_ONLY';}
  }
  if(count!==1) throw new Error(`BLOCKED: note ${a.note} anchor occurrence ${count}, expected 1.`);
  slots.push({note:a.note,state:'EXACT-ANCHOR-VERIFIED',approvedAnchor:a.exactAnchor,exactAnchor,exactOccurrenceCount:1,anchorSha256:sha(exactAnchor),reviewBatch:a.reviewBatch,authorityIds:a.authorityIds||[],...(normalization?{normalization}:{})});
}
for(let n=1;n<=46;n++) if(!seen.has(n)) throw new Error(`BLOCKED: missing note ${n}.`);
slots.sort((a,b)=>a.note-b.note);
const out={status:'PASS',generation:'PUB-9C-R14-READY',masterPath:'research/macroscopic-life/manuscript/book-one-master-pub-9c-reader-materialized.md',masterSha256:masterSha,slotCount:46,verifiedExactAnchors:46,sourceApprovalsPath:'research/macroscopic-life/manuscript/book-one-exact-endnote-anchor-approvals-pub-9c-v1.0.json',sourceApprovalStatus:approvals.status,formattingNormalizations:slots.filter(s=>s.normalization).length,slots};
fs.writeFileSync(outPath,JSON.stringify(out,null,2)+'\n');
console.log(`PASS: materialized approved 46-anchor manifest for master ${masterSha}; formatting-only normalizations ${out.formattingNormalizations}.`);
