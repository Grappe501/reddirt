import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root=path.resolve(process.cwd(),'research/macroscopic-life');
const visuals=path.join(root,'visuals');
const proofPath=path.join(visuals,'figure-r3-proof-copy-v1.json');
const outJson=path.join(visuals,'figure-r3-recovery-inventory-v1.json');
const outMd=path.join(visuals,'figure-r3-recovery-control.md');
const exts=new Set(['.png','.svg','.jpg','.jpeg','.webp','.pdf','.tif','.tiff']);
const run=(args)=>spawnSync('git',args,{cwd:process.cwd(),encoding:'utf8'});
const isAsset=p=>exts.has(path.extname(p).toLowerCase());
const tokenVariants=n=>[String(n),String(n).padStart(2,'0')];
const figureMatch=(p,n)=>{
  const q=p.toLowerCase().replaceAll('\\','/');
  return tokenVariants(n).some(t=>new RegExp(`(?:figure|fig)[-_ .]*0*${Number(t)}(?:[^0-9]|$)`,'i').test(q));
};
if(!fs.existsSync(proofPath)) throw new Error('BLOCKED: missing figure-r3-proof-copy-v1.json');
const proof=JSON.parse(fs.readFileSync(proofPath,'utf8'));
const source=Array.isArray(proof.figures)?proof.figures:(Array.isArray(proof.records)?proof.records:[]);
if(!source.length) throw new Error('BLOCKED: proof copy has no figure records.');

const walk=(dir,base='')=>{const rows=[];for(const e of fs.readdirSync(dir,{withFileTypes:true})){const rel=path.posix.join(base,e.name);const abs=path.join(dir,e.name);if(e.isDirectory())rows.push(...walk(abs,rel));else rows.push(rel);}return rows;};
const currentFiles=walk(root).filter(isAsset).map(p=>`research/macroscopic-life/${p}`);
const results=[];
for(const rec of source){
  const n=Number(rec.figure??rec.figureNumber??rec.number);
  if(!(n>=2&&n<=16)) continue;
  const version=rec.frozenVersion??rec.version??rec.approvedVersion??null;
  const lockCommit=rec.lockCommit??rec.commit??rec.lock_commit??null;
  const currentCandidates=currentFiles.filter(p=>figureMatch(p,n));
  let commitExists=false,historicalCandidates=[],changedAtLock=[];
  if(lockCommit){
    commitExists=run(['cat-file','-e',`${lockCommit}^{commit}`]).status===0;
    if(commitExists){
      const tree=run(['ls-tree','-r','--full-tree',lockCommit]);
      if(tree.status===0){
        historicalCandidates=tree.stdout.split(/\r?\n/).filter(Boolean).map(line=>{const m=line.match(/^(\d+)\s+(\w+)\s+([0-9a-f]+)\t(.+)$/);return m?{mode:m[1],type:m[2],blobSha:m[3],path:m[4]}:null;}).filter(Boolean).filter(x=>isAsset(x.path)&&figureMatch(x.path,n));
      }
      const diff=run(['diff-tree','--no-commit-id','--name-status','-r',lockCommit]);
      if(diff.status===0) changedAtLock=diff.stdout.split(/\r?\n/).filter(Boolean).map(line=>line.split(/\t/).at(-1)).filter(p=>p&&isAsset(p)&&figureMatch(p,n));
    }
  }
  const status=currentCandidates.length===1?'CURRENT_CANDIDATE_UNVERIFIED':historicalCandidates.length?'HISTORICAL_CANDIDATE':'MISSING_OR_UNVERIFIED';
  results.push({figure:n,version,lockCommit,lockCommitExists:commitExists,status,currentCandidates,historicalCandidates,changedAtLock});
}
results.sort((a,b)=>a.figure-b.figure);
if(results.length!==15) throw new Error(`BLOCKED: expected 15 proof records for Figures 2-16, found ${results.length}`);
const counts={currentCandidateUnverified:results.filter(r=>r.status==='CURRENT_CANDIDATE_UNVERIFIED').length,historicalCandidate:results.filter(r=>r.status==='HISTORICAL_CANDIDATE').length,missingOrUnverified:results.filter(r=>r.status==='MISSING_OR_UNVERIFIED').length,lockCommitsFound:results.filter(r=>r.lockCommitExists).length};
const inventory={status:'R15_FIGURE_RECOVERY_INVENTORY_ONLY',policy:'RECOVER THE APPROVED PRODUCTION BINARY. DO NOT REDESIGN AN APPROVED FIGURE TO SATISFY A FILE GATE.',figuresExpected:15,figuresInventoried:results.length,counts,publicationRegistryExists:fs.existsSync(path.join(visuals,'figure-publication-registry-v1.json')),results};
fs.writeFileSync(outJson,JSON.stringify(inventory,null,2)+'\n');
const rows=results.map(r=>`| ${r.figure} | ${r.version??'UNKNOWN'} | \`${r.lockCommit??'NONE'}\` | ${r.lockCommitExists?'YES':'NO'} | ${r.currentCandidates.length} | ${r.historicalCandidates.length} | ${r.status} |`).join('\n');
const md=`# Figure R3 Recovery Control — R15\n\n**Status:** INVENTORY COMPLETE; PRODUCTION CLOSURE NOT IMPLIED\n\n**Rule:** RECOVER THE APPROVED PRODUCTION BINARY. DO NOT REDESIGN AN APPROVED FIGURE TO SATISFY A FILE GATE.\n\n| Gate | Result |\n|---|---:|\n| Figures inventoried | ${results.length}/15 |\n| Lock commits found | ${counts.lockCommitsFound}/15 |\n| Current candidate assets | ${counts.currentCandidateUnverified}/15 |\n| Historical candidate assets | ${counts.historicalCandidate}/15 |\n| Missing/unverified | ${counts.missingOrUnverified}/15 |\n| Publication registry physically present before recovery | ${inventory.publicationRegistryExists?'YES':'NO'} |\n| Figure R3 closure | NOT YET AUTHORIZED |\n| R15 full PASS | NOT YET AUTHORIZED |\n\n## Per-figure inventory\n\n| Figure | Approved version | Lock commit | Commit found | Current candidates | Historical candidates | Status |\n|---:|---|---|---:|---:|---:|---|\n${rows}\n\n## Interpretation\n\nA current or historical candidate is not automatically the approved production binary. Blob/path evidence must be reconciled with the approved lock record before recovery. No image is generated, modified, substituted, or redesigned by this inventory.\n`;
fs.writeFileSync(outMd,md);
console.log(`R15 figure inventory: ${counts.lockCommitsFound}/15 lock commits; ${counts.currentCandidateUnverified} current candidates; ${counts.historicalCandidate} historical candidates; ${counts.missingOrUnverified} missing/unverified.`);
process.exitCode=counts.missingOrUnverified===0&&counts.currentCandidateUnverified===15?0:3;
