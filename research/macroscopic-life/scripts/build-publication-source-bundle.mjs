import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(process.cwd(),'research/macroscopic-life');const release=path.join(root,'release');const pub=path.join(root,'publication');
const freezePath=path.join(release,'book-one-rc1-freeze-record.json');if(!fs.existsSync(freezePath)){console.error('BLOCKED: RC1 freeze record missing.');process.exit(2)}
const freeze=JSON.parse(fs.readFileSync(freezePath,'utf8'));if(freeze.status!=='FROZEN'){console.error(`BLOCKED: RC1 status=${freeze.status}`);process.exit(2)}
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');const items=[];const blockers=[];
for(const [key,a] of Object.entries(freeze.artifacts||{})){if(!a.path)continue;const src=path.join(root,a.path);if(!fs.existsSync(src)){blockers.push(`missing frozen artifact ${a.path}`);continue}const actual=sha(src);if(a.sha256&&a.sha256!==actual){blockers.push(`frozen artifact drift ${a.path}`);continue}items.push({key,path:a.path,sha256:actual})}
if(blockers.length){console.error('PUBLICATION BUNDLE: BLOCKED');for(const b of blockers)console.error(`- ${b}`);process.exit(2)}
const bundle={status:'READY',release:'MACROSCOPIC-LIFE-BOOK-ONE-RC1',sourceFreezeSha256:sha(freezePath),createdAt:new Date().toISOString(),items,openMetadata:{isbn:'OPEN',publisherOrImprint:'OPEN',copyrightOwner:'OPEN',publicationDate:'OPEN',retailPrice:'OPEN',distributorIdentifiers:'OPEN'},rule:'Adapters may change presentation, never scientific content.'};fs.mkdirSync(pub,{recursive:true});fs.writeFileSync(path.join(pub,'book-one-publication-source-bundle-v1.0.json'),JSON.stringify(bundle,null,2)+'\n');console.log(`PUBLICATION BUNDLE: READY (${items.length} frozen artifacts)`);
