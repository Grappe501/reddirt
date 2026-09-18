import fs from 'node:fs';
const r=JSON.parse(fs.readFileSync(new URL('../agents/agent-registry.v1.json',import.meta.url)));
if(r.version!=='1.0.0'||r.agents.length!==46) throw new Error('registry count/version');
const ids=new Set(r.agents.map(a=>a.id)); if(ids.size!==46) throw new Error('duplicate agent id');
for(const a of r.agents){if(a.permissions.mayExecuteTrade!==false||a.permissions.mayHideDissent!==false||a.permissions.mayInventEvidence!==false)throw new Error('unsafe permission '+a.id);if(!a.mandate||!a.implementation)throw new Error('incomplete mandate '+a.id);}
for(const id of ['bull','bear','red-team','data-quality','overfitting','cost','risk'])if(!ids.has(id))throw new Error('missing control '+id);
console.log('V2.5 agent registry contract: PASS');
