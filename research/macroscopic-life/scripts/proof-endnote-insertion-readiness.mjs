import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.cwd(),'research/macroscopic-life');
const master=path.join(root,'manuscript','book-one-master-v1.0-reader-materialized.md');
const bib=path.join(root,'manuscript','book-one-final-verified-bibliography-v1.0.md');
const manifest=path.join(root,'manuscript','book-one-endnote-insertion-manifest-v1.0.json');
const map=path.join(root,'manuscript','book-one-endnote-numbering-map-v1.0.md');
const failures=[];
for (const [label,file] of [['materialized master',master],['final bibliography',bib],['insertion manifest',manifest],['numbering map',map]]) if(!fs.existsSync(file)) failures.push(`${label} missing: ${file}`);
if (fs.existsSync(manifest)) {
  const m=JSON.parse(fs.readFileSync(manifest,'utf8'));
  const slots=Object.values(m.chapterSlots||{}).flat();
  if(slots.length!==45) failures.push(`manifest contains ${slots.length} slots, expected 45`);
  const uniq=new Set(slots);
  if(uniq.size!==45 || Math.min(...slots)!==1 || Math.max(...slots)!==45) failures.push('slot sequence must be exactly 1–45');
}
if(fs.existsSync(master)) {
  const text=fs.readFileSync(master,'utf8');
  const chapters=(text.match(/^##? Chapter \d+ —/gm)||[]).length;
  if(chapters!==16) failures.push(`physical master contains ${chapters} chapter headings, expected 16`);
  if(/PUB-7L .*IMPLEMENTATION NOTES|EDITORIAL LEDGER/.test(text)) failures.push('build-only material detected in physical master');
}
if(failures.length){console.error('ENDNOTE INSERTION READINESS: BLOCKED'); for(const f of failures) console.error(`- ${f}`); process.exit(2);}
console.log('ENDNOTE INSERTION READINESS: PASS');
console.log('16 chapters / 45 controlled slots / verified bibliography present.');
