import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(process.cwd(),'research/macroscopic-life');
const m=path.join(root,'manuscript');
const masterPath=path.join(m,'book-one-master-pub-9c-reader-materialized.md');
const manifestPath=path.join(m,'book-one-exact-endnote-anchor-manifest-pub-9c-v1.0.json');
const reconPath=path.join(m,'book-one-exact-endnote-anchor-reconciliation-pub-9c-v1.0.json');
const bibPath=path.join(m,'book-one-final-verified-bibliography-pub-9c.md');
const outPath=path.join(m,'book-one-master-pub-9c-reader-endnoted.md');

for(const p of [masterPath,manifestPath,reconPath,bibPath]) if(!fs.existsSync(p)) throw new Error(`Missing required file: ${path.basename(p)}`);
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const clean=fs.readFileSync(masterPath,'utf8');
const recon=JSON.parse(fs.readFileSync(reconPath,'utf8'));
if(recon.status!=='PASS'||recon.uniqueExactAnchors!==46) throw new Error('Anchor reconciliation must PASS 46/46 before injection');
if(recon.masterSha256!==sha(clean)) throw new Error('Physical revised master changed after anchor reconciliation');

const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const slots=manifest.slots||[];
if(slots.length!==46) throw new Error(`Expected 46 anchors, found ${slots.length}`);

let body=clean.replaceAll('[12.4]','');
if(body.includes('[12.4]')) throw new Error('Temporary [12.4] marker survived normalization');

const ordered=[...slots].sort((a,b)=>b.note-a.note);
for(const r of ordered){
  const n=r.note; const anchor=(r.exactAnchor||'').trim();
  if(!anchor) throw new Error(`Note ${n} lacks exact anchor`);
  const parts=body.split(anchor);
  if(parts.length!==2) throw new Error(`Note ${n} anchor not unique at injection (${parts.length-1} matches)`);
  body=parts[0]+anchor+`[^${n}]`+parts[1];
}

const definitionFor=(r)=>{
  const ids=r.authorityIds??r.authorityIdsOrClass??r.authorityIdOrClass??null;
  if(Array.isArray(ids)&&ids.length) return ids.join('; ');
  if(typeof ids==='string'&&ids.trim()) return ids.trim();
  if(r.noteClass==='projectSynthesis') return 'PROJECT SYNTHESIS';
  if(r.noteClass==='recordCallback') return 'RECORD CALLBACK';
  throw new Error(`Note ${r.note} lacks authority/class mapping`);
};

const notes=['','---','','# Endnotes',''];
for(const r of [...slots].sort((a,b)=>a.note-b.note)) notes.push(`[^${r.note}]: ${definitionFor(r)}`);
const bib=fs.readFileSync(bibPath,'utf8');
body=body.trimEnd()+'\n'+notes.join('\n')+'\n\n---\n\n# Bibliography\n\n'+bib.replace(/^# MACROSCOPIC LIFE\s*\n+/,'').trim()+'\n';

fs.writeFileSync(outPath,body,'utf8');
console.log('PASS: PUB-9C derivative endnoted master created with 46 controlled notes.');
console.log(outPath);
