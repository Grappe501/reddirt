import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(process.cwd(),'research/macroscopic-life');
const release=path.join(root,'release');
const rcPath=path.join(release,'book-one-rc1-manifest.json');
const figPath=path.join(release,'book-one-figure-r3-closure-audit.json');
const integrityPath=path.join(root,'manuscript','book-one-post-injection-integrity-report-v1.0.json');
const anchorPath=path.join(root,'manuscript','book-one-exact-endnote-anchor-reconciliation-v1.0.json');
const req=[rcPath,figPath,integrityPath,anchorPath];const blockers=[];
for(const p of req)if(!fs.existsSync(p))blockers.push(`missing ${path.relative(root,p)}`);
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
let rc,fig,integrity,anchors;
if(!blockers.length){rc=read(rcPath);fig=read(figPath);integrity=read(integrityPath);anchors=read(anchorPath);
 if(rc.status!=='RELEASE_CANDIDATE_READY')blockers.push(`RC1 manifest status=${rc.status}`);
 if(fig.status!=='PASS'||fig.figuresVerifiedR3!==15)blockers.push(`figure closure=${fig.status} ${fig.figuresVerifiedR3}/15`);
 if(integrity.status!=='PASS')blockers.push(`post-injection integrity=${integrity.status}`);
 if(anchors.status!=='PASS'||anchors.uniqueExactAnchors!==45)blockers.push(`anchor reconciliation=${anchors.status} ${anchors.uniqueExactAnchors}/45`);
}
if(blockers.length){console.error('BOOK ONE RC1 FREEZE: BLOCKED');for(const b of blockers)console.error(`- ${b}`);process.exit(2)}
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const artifacts={};for(const [k,a] of Object.entries(rc.artifacts||{})){if(a.status!=='PRESENT'||!a.path)continue;const p=path.join(root,a.path);if(!fs.existsSync(p)){blockers.push(`RC artifact disappeared: ${a.path}`);continue}const actual=sha(p);if(a.sha256&&a.sha256!==actual)blockers.push(`RC artifact drift: ${a.path}`);artifacts[k]={path:a.path,sha256:actual}}
if(blockers.length){console.error('BOOK ONE RC1 FREEZE: BLOCKED');for(const b of blockers)console.error(`- ${b}`);process.exit(2)}
const freeze={status:'FROZEN',release:'MACROSCOPIC-LIFE-BOOK-ONE-RC1',frozenAt:new Date().toISOString(),rcManifestSha256:sha(rcPath),figureClosureSha256:sha(figPath),artifacts,scientificState:'FROZEN — no architecture or prose reopening without explicit version increment',figureState:'Figures 2–16 verified R3 15/15',scholarlyState:'45/45 exact anchors; post-injection integrity PASS',nextPhase:'export-layout-distribution'};
const out=path.join(release,'book-one-rc1-freeze-record.json');fs.writeFileSync(out,JSON.stringify(freeze,null,2)+'\n');console.log('BOOK ONE RC1 FREEZE: PASS');console.log(out);
