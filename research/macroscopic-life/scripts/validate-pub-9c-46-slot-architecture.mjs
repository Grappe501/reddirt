import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(process.cwd(),'research/macroscopic-life');
const m=path.join(root,'manuscript');
const insertionPath=path.join(m,'book-one-endnote-insertion-manifest-pub-9c-v1.0.json');
const anchorsPath=path.join(m,'book-one-exact-endnote-anchor-manifest-pub-9c-v1.0.json');
const authorityPath=path.join(m,'pub-9c-r8-consciousness-authority-amendment-v1.0.json');

for(const p of [insertionPath,anchorsPath,authorityPath]) if(!fs.existsSync(p)) throw new Error(`Missing required file: ${path.basename(p)}`);
const insertion=JSON.parse(fs.readFileSync(insertionPath,'utf8'));
const anchors=JSON.parse(fs.readFileSync(anchorsPath,'utf8'));
const authority=JSON.parse(fs.readFileSync(authorityPath,'utf8'));

if(insertion.slotCount!==46) throw new Error(`Insertion manifest slotCount ${insertion.slotCount} != 46`);
if(anchors.slotCount!==46) throw new Error(`Anchor manifest slotCount ${anchors.slotCount} != 46`);
if(!Array.isArray(anchors.slots)||anchors.slots.length!==46) throw new Error(`Anchor record count ${anchors.slots?.length} != 46`);

const notes=anchors.slots.map(x=>x.note);
const unique=new Set(notes);
if(unique.size!==46) throw new Error('Duplicate note IDs in anchor manifest');
for(let i=1;i<=46;i++) if(!unique.has(i)) throw new Error(`Missing note ${i}`);

const flattened=Object.values(insertion.chapterSlots).flat();
if(flattened.length!==46||new Set(flattened).size!==46) throw new Error('chapterSlots do not contain 46 unique notes');
for(let i=1;i<=46;i++) if(!flattened.includes(i)) throw new Error(`chapterSlots missing note ${i}`);
if(!insertion.chapterSlots['12'].includes(46)) throw new Error('Note 46 must belong to Chapter 12');

const a46=anchors.slots.find(x=>x.note===46);
if(a46.chapter!==12) throw new Error('Anchor note 46 chapter mismatch');
if(JSON.stringify(a46.authorityIds)!==JSON.stringify(['BIB-032','BIB-033'])) throw new Error('Anchor note 46 authority IDs mismatch');
const ids=new Set((authority.records||[]).map(x=>x.id));
for(const id of ['BIB-032','BIB-033']) if(!ids.has(id)) throw new Error(`Consciousness authority amendment missing ${id}`);

const legacy=path.join(m,'book-one-exact-endnote-anchor-manifest-v1.0.json');
if(fs.existsSync(legacy)){
  const old=JSON.parse(fs.readFileSync(legacy,'utf8'));
  if(old.slotCount!==45) throw new Error('Legacy manifest no longer identifies itself as 45-slot historical architecture');
}

console.log('PASS: PUB-9C scholarly architecture is statically coherent at 46 slots.');
console.log('PASS: Note 46 belongs to Chapter 12 and maps to BIB-032 + BIB-033.');
console.log('NOTE: exact anchors remain OPEN until the physical revised master is materialized and reconciled.');
