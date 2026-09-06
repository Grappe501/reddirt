import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'research/macroscopic-life');
const manuscript = path.join(root, 'manuscript');
const candidates = [
  'book-one-bibliographic-authority-register-v1.0.json',
  'book-one-authority-resolution-batch-1-v1.0.json',
  'book-one-authority-resolution-batch-2-v1.0.json',
  'book-one-final-four-authority-resolution-v1.0.json'
].map(x=>path.join(manuscript,x));

const records = new Map();
for (const file of candidates) {
  if (!fs.existsSync(file)) continue;
  const doc = JSON.parse(fs.readFileSync(file,'utf8'));
  const arrays = [doc.records, doc.resolved, doc.authorities, doc.sources].filter(Array.isArray);
  for (const arr of arrays) for (const r of arr) {
    if (r?.id?.match(/^BIB-\d{3}$/)) records.set(r.id,r);
  }
}
const ids=[...records.keys()].sort();
if (ids.length < 31) {
  console.error(`BLOCKED: expected at least 31 verified bibliography IDs; found ${ids.length}.`);
  process.exit(2);
}
for (let i=1;i<=31;i++) {
  const id=`BIB-${String(i).padStart(3,'0')}`;
  if (!records.has(id)) { console.error(`BLOCKED: missing ${id}.`); process.exit(2); }
  const r=records.get(id);
  if (!r.citation) { console.error(`BLOCKED: ${id} lacks canonical citation text.`); process.exit(2); }
}
const out=['# MACROSCOPIC LIFE','','## Book One — Final Verified Bibliography v1.0','','**Status: GENERATED FROM VERIFIED AUTHORITY RECORDS**','','No bibliographic field may be inferred during generation.',''];
for (const id of ids.filter(x=>Number(x.slice(4))<=31)) out.push(`**${id}** — ${records.get(id).citation}`,'');
const output=path.join(manuscript,'book-one-final-verified-bibliography-v1.0.md');
fs.writeFileSync(output,out.join('\n')+'\n');
console.log(`PASS: consolidated ${ids.filter(x=>Number(x.slice(4))<=31).length} verified bibliography records.`);
console.log(output);
