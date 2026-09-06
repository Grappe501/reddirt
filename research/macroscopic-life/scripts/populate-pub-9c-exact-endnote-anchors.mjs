import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(process.cwd(),'research/macroscopic-life');
const m=path.join(root,'manuscript');
const masterPath=path.join(m,'book-one-master-pub-9c-reader-materialized.md');
const templatePath=path.join(m,'book-one-exact-endnote-anchor-manifest-pub-9c-v1.0.json');
const insertionPath=path.join(m,'book-one-endnote-insertion-manifest-pub-9c-v1.0.json');
const outPath=path.join(m,'book-one-exact-endnote-anchor-manifest-pub-9c-resolved-v1.0.json');
const reviewPath=path.join(m,'book-one-exact-endnote-anchor-review-pub-9c-v1.0.md');

for(const p of [masterPath,templatePath,insertionPath]) if(!fs.existsSync(p)) throw new Error(`BLOCKED: missing ${path.basename(p)}`);
const master=fs.readFileSync(masterPath,'utf8');
const template=JSON.parse(fs.readFileSync(templatePath,'utf8'));
const insertion=JSON.parse(fs.readFileSync(insertionPath,'utf8'));
if(template.slotCount!==46||template.slots?.length!==46||insertion.slotCount!==46) throw new Error('BLOCKED: expected coherent 46-slot architecture.');

const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const normalize=s=>s.replace(/\s+/g,' ').trim();
const chapterMatches=[...master.matchAll(/^#{1,2} Chapter (\d+)\s+—.*$/gm)];
if(chapterMatches.length!==16) throw new Error(`BLOCKED: expected 16 chapter headings, found ${chapterMatches.length}`);
const chapters=new Map();
for(let i=0;i<chapterMatches.length;i++){
 const n=Number(chapterMatches[i][1]);
 const start=chapterMatches[i].index;
 const end=i+1<chapterMatches.length?chapterMatches[i+1].index:master.length;
 chapters.set(n,{start,end,text:master.slice(start,end)});
}

// Stable claim seeds from the established numbering architecture. These are search concepts, not fabricated exact anchors.
const seeds={
1:['major transition','individuality'],2:['ultraviolet','polarization'],3:['infrared'],4:['echolocation'],5:['electroreception'],6:['magnet'],7:['time','sampling'],8:['scal','duration'],9:['endosymbios','multicell'],10:['cooperation','conflict'],11:['symbios','microbiome'],12:['transition','individuality'],13:['conflict'],14:['cooperation','individual'],15:['individuality'],16:['boundary','individual'],17:['immune','symbio'],18:['bioelectric'],19:['membrane','voltage'],20:['wound','electric'],21:['mechanical','force'],22:['reaction','diffusion'],23:['robust'],24:['regener'],25:['regener'],26:['regener'],27:['trained immunity'],28:['immune','memory'],29:['plant','memory'],30:['circadian'],31:['entrain'],32:['prediction','error'],33:['collective intelligence'],34:['distributed','cognition'],35:['information'],36:['distributed','cognition'],37:['network'],38:['individuality'],39:['conflict'],40:['information'],41:['intervention'],42:['Eleven Tests'],43:['Model C','organization'],44:['Macroscopic Life Hypothesis'],45:['WE ARE THE MICROBE'],46:['Contemporary consciousness science contains competing theories']
};

function sentences(text){
 const clean=text.replace(/^#{1,6} .*$/gm,' ').replace(/^>\s?/gm,'').replace(/\n+/g,' ');
 return clean.split(/(?<=[.!?])\s+(?=[A-Z0-9*])/).map(normalize).filter(s=>s.length>=35&&s.length<=700);
}
function occurrences(hay,needle){let c=0,p=0,i;while((i=hay.indexOf(needle,p))!==-1){c++;p=i+needle.length}return c}
function score(sentence,terms){const low=sentence.toLowerCase();return terms.reduce((n,t)=>n+(low.includes(t.toLowerCase())?1:0),0)}

const results=[];
for(const rec of template.slots){
 const note=rec.note, chapter=rec.chapter;
 const region=chapters.get(chapter); if(!region) throw new Error(`BLOCKED: chapter ${chapter} missing for note ${note}`);
 const terms=seeds[note]||[];
 const candidates=sentences(region.text).map(s=>({s,score:score(s,terms)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.s.length-b.s.length);
 const best=candidates[0];
 let state='REVIEW-REQUIRED', exactAnchor=null, count=0;
 if(best){
   count=occurrences(master,best.s);
   const tied=candidates.filter(x=>x.score===best.score).length;
   if(count===1&&tied===1){state='CANDIDATE-UNIQUE';exactAnchor=best.s}
 }
 if(note===46){
   const preferred=rec.preferredAnchorSeed||terms[0];
   const hits=sentences(region.text).filter(s=>s.includes(preferred));
   if(hits.length===1&&occurrences(master,hits[0])===1){exactAnchor=hits[0];count=1;state='CANDIDATE-UNIQUE'}
 }
 results.push({...rec,state,searchTerms:terms,exactAnchor,exactOccurrenceCount:count,anchorSha256:exactAnchor?sha(exactAnchor):null,candidateAlternatives:candidates.slice(0,3).map(x=>({score:x.score,text:x.s}))});
}

const unique=results.filter(r=>r.state==='CANDIDATE-UNIQUE').length;
const resolved={status:unique===46?'CANDIDATES-READY-FOR-HUMAN-APPROVAL':'REVIEW-REQUIRED',sourceMaster:path.basename(masterPath),masterSha256:sha(master),slotCount:46,uniqueCandidateCount:unique,policy:'Candidate generation is deterministic but does not constitute scholarly approval. Human/operator review must promote each accepted record to EXACT-ANCHOR-VERIFIED before injection.',slots:results};
fs.writeFileSync(outPath,JSON.stringify(resolved,null,2)+'\n');

const lines=['# Book One — PUB-9C Exact-Anchor Review','','**Generated candidate report — not publication approval.**','',`Master SHA256: \`${resolved.masterSha256}\``,`Unique automatic candidates: **${unique}/46**`,''];
for(const r of results){lines.push(`## Note ${r.note} — Chapter ${r.chapter}`,`**State:** ${r.state}`,'',r.exactAnchor?`> ${r.exactAnchor}`:'> NO UNIQUE CANDIDATE — manual exact sentence selection required.','',`Search concepts: ${r.searchTerms.join(' / ')}`,'')}
fs.writeFileSync(reviewPath,lines.join('\n')+'\n');
console.log(`PUB-9C EXACT-ANCHOR CANDIDATES: ${unique}/46 unique; ${46-unique} require manual review.`);
console.log(outPath); console.log(reviewPath);
if(unique<46) process.exitCode=3;
