import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(process.cwd(),'research/macroscopic-life');
const m=path.join(root,'manuscript');
const masterPath=path.join(m,'book-one-master-v1.0-reader-materialized.md');
const anchorPath=path.join(m,'book-one-exact-endnote-anchor-manifest-v1.0.json');
const reconPath=path.join(m,'book-one-exact-endnote-anchor-reconciliation-v1.0.json');
const bibPath=path.join(m,'book-one-final-verified-bibliography-v1.0.md');
const outPath=path.join(m,'book-one-master-v1.0-reader-endnoted.md');
for(const p of [masterPath,anchorPath,reconPath,bibPath]) if(!fs.existsSync(p)){console.error(`BLOCKED: missing ${p}`);process.exit(2)}
const recon=JSON.parse(fs.readFileSync(reconPath,'utf8'));if(recon.status!=='PASS'||recon.uniqueExactAnchors!==45){console.error('BLOCKED: PUB-8W reconciliation is not PASS 45/45.');process.exit(2)}
const clean=fs.readFileSync(masterPath,'utf8');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
if(recon.masterSha256 && recon.masterSha256!==sha(clean)){console.error('BLOCKED: physical master changed after anchor reconciliation.');process.exit(2)}
const manifest=JSON.parse(fs.readFileSync(anchorPath,'utf8'));const slots=manifest.slots||manifest.anchors||[];if(slots.length!==45){console.error('BLOCKED: expected 45 anchors.');process.exit(2)}
let body=clean;const ordered=[...slots].sort((a,b)=>(b.note??b.slot)-(a.note??a.slot));
for(const r of ordered){const n=r.note??r.slot;const a=(r.exactAnchor??r.anchor??'').trim();if(!a){console.error(`BLOCKED: note ${n} lacks exact anchor.`);process.exit(2)}const parts=body.split(a);if(parts.length!==2){console.error(`BLOCKED: note ${n} anchor is not unique at injection.`);process.exit(2)}body=parts[0]+a+`[^${n}]`+parts[1]}
const notes=['','---','','# Endnotes',''];
for(const r of [...slots].sort((a,b)=>(a.note??a.slot)-(b.note??b.slot))){const n=r.note??r.slot;const state=r.state??r.classification??'UNSPECIFIED';const refs=r.bibIds??r.bibliographyIds??r.bibId??null;const label=Array.isArray(refs)?refs.join(', '):(refs||state);notes.push(`[^${n}]: ${label}`)}
const bib=fs.readFileSync(bibPath,'utf8');
body=body.trimEnd()+'\n'+notes.join('\n')+'\n\n---\n\n# Bibliography\n\n'+bib.replace(/^# MACROSCOPIC LIFE\s*\n+/,'').trim()+'\n';
fs.writeFileSync(outPath,body);
console.log('PASS: derivative endnoted master created with 45 controlled markers.');
console.log(outPath);
