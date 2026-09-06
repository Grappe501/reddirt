import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=path.resolve(process.cwd(),'research/macroscopic-life'),m=path.join(root,'manuscript');
const masterPath=path.join(m,'book-one-master-pub-9c-reader-materialized.md'),approvedPath=path.join(m,'book-one-exact-endnote-anchor-manifest-pub-9c-approved-v1.0.json');
for(const p of [masterPath,approvedPath])if(!fs.existsSync(p))throw new Error(`BLOCKED: missing ${path.basename(p)}`);
const master=fs.readFileSync(masterPath,'utf8'),a=JSON.parse(fs.readFileSync(approvedPath,'utf8')),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
if(a.status!=='PASS'||a.slotCount!==46||a.verifiedExactAnchors!==46||a.slots?.length!==46)throw new Error('BLOCKED: approved manifest is not a 46/46 PASS.');
if(a.masterSha256!==sha(master))throw new Error('BLOCKED: revised master SHA differs from approved-anchor master. Rerun R13 review.');
const ids=new Set();for(const r of a.slots){if(ids.has(r.note))throw new Error(`Duplicate note ${r.note}`);ids.add(r.note);if(r.state!=='EXACT-ANCHOR-VERIFIED')throw new Error(`Note ${r.note} not verified`);if(sha(r.exactAnchor)!==r.anchorSha256)throw new Error(`Note ${r.note} anchor SHA mismatch`);let c=0,p=0,i;while((i=master.indexOf(r.exactAnchor,p))!==-1){c++;p=i+r.exactAnchor.length}if(c!==1)throw new Error(`Note ${r.note} anchor occurrence ${c}, expected 1`);}for(let i=1;i<=46;i++)if(!ids.has(i))throw new Error(`Missing note ${i}`);
console.log('PASS: approved 46-anchor manifest matches exact rebuilt PUB-9C master.');
