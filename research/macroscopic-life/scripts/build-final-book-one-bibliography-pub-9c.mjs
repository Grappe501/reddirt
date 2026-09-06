import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(process.cwd(),'research/macroscopic-life');
const manuscript=path.join(root,'manuscript');

const files=[
  'book-one-bibliographic-authority-register-v1.0.json',
  'book-one-bibliographic-authority-register-batch-1-v1.0.json',
  'book-one-bibliographic-authority-register-batch-2-v1.0.json',
  'pub-8t-final-four-authority-resolution-v1.0.json',
  'pub-9c-r8-consciousness-authority-amendment-v1.0.json'
].map(x=>path.join(manuscript,x));

const records=new Map();
for(const file of files){
  if(!fs.existsSync(file)) throw new Error(`Missing required authority file: ${path.basename(file)}`);
  const doc=JSON.parse(fs.readFileSync(file,'utf8'));
  const arrays=[doc.records,doc.resolved,doc.authorities,doc.sources].filter(Array.isArray);
  if(!arrays.length) throw new Error(`No recognized authority array in ${path.basename(file)}`);
  for(const arr of arrays) for(const r of arr){
    if(!r?.id?.match(/^BIB-\d{3}$/)) continue;
    if(records.has(r.id)){
      const old=records.get(r.id);
      const oldDoi=(old.doi||'').toLowerCase(), newDoi=(r.doi||'').toLowerCase();
      const oldCitation=old.citation||'', newCitation=r.citation||'';
      if((oldDoi&&newDoi&&oldDoi!==newDoi)||(oldCitation&&newCitation&&oldCitation!==newCitation)) throw new Error(`Conflicting duplicate authority ${r.id}`);
    }
    records.set(r.id,{...records.get(r.id),...r});
  }
}

for(let i=1;i<=33;i++){
  const id=`BIB-${String(i).padStart(3,'0')}`;
  const r=records.get(id);
  if(!r) throw new Error(`Missing ${id}`);
  if(!r.citation) throw new Error(`${id} lacks canonical citation text`);
  if(String(r.status||'').toLowerCase().includes('unverified')) throw new Error(`${id} is unverified`);
}

const extras=[...records.keys()].filter(id=>Number(id.slice(4))>33);
if(extras.length) console.warn(`NOTE: authorities beyond BIB-033 exist but are not included: ${extras.join(', ')}`);

const out=['# MACROSCOPIC LIFE','','## Book One — PUB-9C Verified Bibliography','','**Status: GENERATED FROM VERIFIED AUTHORITY RECORDS — BIB-001 THROUGH BIB-033**','','No bibliographic field is inferred during generation.',''];
for(let i=1;i<=33;i++){
  const id=`BIB-${String(i).padStart(3,'0')}`;
  out.push(`**${id}** — ${records.get(id).citation}`,'');
}
const output=path.join(manuscript,'book-one-final-verified-bibliography-pub-9c.md');
fs.writeFileSync(output,out.join('\n')+'\n','utf8');
console.log(`PASS: consolidated 33 verified bibliography records.`);
console.log(output);
