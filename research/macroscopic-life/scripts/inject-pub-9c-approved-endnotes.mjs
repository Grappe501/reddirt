import fs from'node:fs';import path from'node:path';import crypto from'node:crypto';
const root=path.resolve(process.cwd(),'research/macroscopic-life'),m=path.join(root,'manuscript');
const masterPath=path.join(m,'book-one-master-pub-9c-reader-materialized.md'),approvedPath=path.join(m,'book-one-exact-endnote-anchor-manifest-pub-9c-approved-v1.0.json'),insertPath=path.join(m,'book-one-endnote-insertion-manifest-pub-9c-v1.0.json'),bibPath=path.join(m,'book-one-final-verified-bibliography-pub-9c.md'),outPath=path.join(m,'book-one-master-pub-9c-reader-endnoted.md');
for(const p of[masterPath,approvedPath,insertPath,bibPath])if(!fs.existsSync(p))throw new Error(`BLOCKED: missing ${path.basename(p)}`);
let text=fs.readFileSync(masterPath,'utf8');const clean=text,a=JSON.parse(fs.readFileSync(approvedPath,'utf8')),ins=JSON.parse(fs.readFileSync(insertPath,'utf8')),bib=fs.readFileSync(bibPath,'utf8');
if(a.status!=='PASS'||a.slots?.length!==46||ins.slotCount!==46)throw new Error('BLOCKED: invalid 46-slot inputs.');
const citation=new Map();for(const match of bib.matchAll(/^\*\*(BIB-\d{3})\*\* — (.+)$/gm))citation.set(match[1],match[2]);
const amendment=ins.amendment||{};const slots=[...a.slots].sort((x,y)=>text.indexOf(y.exactAnchor)-text.indexOf(x.exactAnchor));
for(const r of slots){const marker=`[^${r.note}]`;const idx=text.indexOf(r.exactAnchor);if(idx<0)throw new Error(`Anchor vanished for note ${r.note}`);text=text.slice(0,idx+r.exactAnchor.length)+marker+text.slice(idx+r.exactAnchor.length);}
text=text.replace(/\s*\[12\.4\]\s*/g,' ');if(text.includes('[12.4]'))throw new Error('Staged [12.4] token remains.');
const defs=[];for(let n=1;n<=46;n++){const r=a.slots.find(x=>x.note===n);let ids=r.authorityIds||[];if(n===46)ids=amendment.authorityIds||['BIB-032','BIB-033'];let body;if(ids.length){const missing=ids.filter(id=>!citation.has(id));if(missing.length)throw new Error(`Note ${n} missing bibliography citations: ${missing.join(', ')}`);body=ids.map(id=>`${id}: ${citation.get(id)}`).join(' ');}else{body=`${r.noteClass||'PROJECT/RECORD'} — controlled scholarly note; see insertion manifest and earlier cited record.`;}defs.push(`[^${n}]: ${body}`);}
text=text.trimEnd()+'\n\n---\n\n## Endnotes\n\n'+defs.join('\n\n')+'\n\n---\n\n'+bib.trim()+'\n';
fs.writeFileSync(outPath,text,'utf8');
const markerCount=(text.match(/\[\^\d+\]/g)||[]).length;if(markerCount!==92)throw new Error(`Expected 92 note tokens, found ${markerCount}`);
console.log('PASS: injected 46 markers + 46 definitions with multi-authority support.');console.log(outPath);
