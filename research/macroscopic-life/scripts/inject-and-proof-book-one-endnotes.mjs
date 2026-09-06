import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(process.cwd(),'research/macroscopic-life');
const manuscript=path.join(root,'manuscript');
const source=path.join(manuscript,'book-one-master-v1.0-reader-materialized.md');
const anchors=path.join(manuscript,'book-one-exact-endnote-anchor-manifest-v1.0.json');
const bibliography=path.join(manuscript,'book-one-final-verified-bibliography-v1.0.md');
const output=path.join(manuscript,'book-one-master-v1.0-reader-with-endnotes.md');
const reportDir=path.join(root,'recovery','endnote-proof');

function fail(msg){console.error(`BLOCKED: ${msg}`);process.exit(2)}
function sha(s){return crypto.createHash('sha256').update(s,'utf8').digest('hex')}
for (const [label,file] of [['materialized master',source],['exact anchor manifest',anchors],['final bibliography',bibliography]]) if(!fs.existsSync(file)) fail(`${label} missing: ${file}`);

let text=fs.readFileSync(source,'utf8');
const original=text;
const manifest=JSON.parse(fs.readFileSync(anchors,'utf8'));
if(!Array.isArray(manifest.slots)||manifest.slots.length!==45) fail('exact anchor manifest must contain 45 slots');
const notes=[...manifest.slots].sort((a,b)=>a.note-b.note);
for(let i=1;i<=45;i++) if(notes[i-1]?.note!==i) fail(`slot sequence missing or duplicated at ${i}`);

const projectSynthesis=new Set([42,44]);
const recordCallback=new Set([43,45]);
const lockedVerdicts=[
  'ON THE EVIDENCE REVIEWED IN THIS BOOK, CIVILIZATION IS NOT ESTABLISHED AS A HIGHER-ORDER INDIVIDUAL.',
  'MEASURE. PERTURB. COMPARE MODELS. ALLOW FAILURE.',
  'WE ARE THE MICROBE.'
];

const proof=[];
for(const slot of notes){
  if(slot.state!=='EXACT-ANCHOR-VERIFIED') fail(`note ${slot.note} is ${slot.state}; exact-anchor verification required`);
  for(const field of manifest.requiredFieldsWhenResolved||[]) if(slot[field]===undefined||slot[field]===null||slot[field]==='') fail(`note ${slot.note} missing ${field}`);
  if(slot.exactOccurrenceCount!==1) fail(`note ${slot.note} occurrence count must be exactly 1`);
  if(sha(slot.exactAnchor)!==slot.anchorSha256) fail(`note ${slot.note} anchor SHA mismatch`);
  const count=text.split(slot.exactAnchor).length-1;
  if(count!==1) fail(`note ${slot.note} exact anchor occurs ${count} times in current master`);
  if(projectSynthesis.has(slot.note)&&slot.noteClass!=='PROJECT SYNTHESIS') fail(`note ${slot.note} must remain PROJECT SYNTHESIS`);
  if(recordCallback.has(slot.note)&&slot.noteClass!=='RECORD CALLBACK') fail(`note ${slot.note} must remain RECORD CALLBACK`);
  if(!projectSynthesis.has(slot.note)&&!recordCallback.has(slot.note)&&!/^BIB-\d{3}$/.test(slot.authorityIdOrClass||'')) fail(`note ${slot.note} external authority lacks BIB id`);
  for(const verdict of lockedVerdicts) if(slot.exactAnchor.includes(verdict)&&!projectSynthesis.has(slot.note)&&!recordCallback.has(slot.note)) fail(`note ${slot.note} tries to external-cite a locked project verdict`);
  const marker=`[^${slot.note}]`;
  text=text.replace(slot.exactAnchor,`${slot.exactAnchor}${marker}`);
  proof.push({note:slot.note,chapter:slot.chapter,noteClass:slot.noteClass,authorityIdOrClass:slot.authorityIdOrClass,anchorSha256:slot.anchorSha256,marker});
}

const markerMatches=[...text.matchAll(/\[\^(\d+)\]/g)].map(m=>Number(m[1]));
for(let i=1;i<=45;i++) if(markerMatches.filter(n=>n===i).length!==1) fail(`note marker ${i} must occur exactly once`);
if(markerMatches.some(n=>n<1||n>45)) fail('out-of-range note marker detected');
if(/PUB-7L .*IMPLEMENTATION NOTES|EDITORIAL LEDGER/.test(text)) fail('build-only text leaked into endnoted master');
if(original===text) fail('no markers inserted');

fs.writeFileSync(output,text,'utf8');
fs.mkdirSync(reportDir,{recursive:true});
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const report={generatedUtc:new Date().toISOString(),status:'PASS',sourceMasterSha256:sha(original),endnotedMasterSha256:sha(text),slotCount:45,markersVerified:45,proof};
fs.writeFileSync(path.join(reportDir,`endnote-hostile-proof-${stamp}.json`),JSON.stringify(report,null,2)+'\n');
console.log('PUB-8V ENDNOTE INJECTION + HOSTILE PROOF: PASS');
console.log('45 exact anchors / 45 unique markers / synthesis classes preserved.');
console.log(output);
