import knowledgeObjects from '../knowledge/seeds/core-concepts.v1.json' with { type: 'json' };
import depthExtensions from '../knowledge/seeds/core-concepts-depths.v1.json' with { type: 'json' };
import { renderDepthModel } from './knowledge-depth-engine.js';
import { graphContext } from './knowledge-graph.js';

const extensions=new Map(depthExtensions.map(item=>[item.id,item]));
const merged=knowledgeObjects.map(item=>({...item,...(extensions.get(item.id)||{})}));
const objects = new Map(merged.map(item => [item.id, item]));
const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

export function getKnowledgeObject(id) { return objects.get(id) || null; }

export function knowledgeTrigger(id, label) {
  const k=getKnowledgeObject(id);
  if(!k) return esc(label || id);
  return '<span class="knowledge-wrap"><button type="button" class="knowledge-trigger" data-knowledge="'+esc(id)+'" aria-haspopup="dialog" aria-label="Explain '+esc(k.canonicalTerm)+'">'+esc(label || k.canonicalTerm)+'<span class="knowledge-dot" aria-hidden="true">?</span></button><span class="knowledge-peek" role="tooltip"><b>'+esc(k.canonicalTerm)+'</b><span>'+esc(k.glance.definition)+'</span><small>Click or tap to learn more</small></span></span>';
}

function content(k, depth) {
  if(depth==='try') return '<p>Interactive exercises will connect this concept directly to the simulator in V2-06.</p>';
  const model=renderDepthModel(k,depth);
  const notice=model.fallback?'<div class="knowledge-fallback">Requested depth is not authored yet. Showing the deepest available treatment.</div>':'';
  const sections=model.sections.map(s=>'<section><h4>'+esc(s.title)+'</h4>'+(s.body?'<p class="'+(s.kind==='formula'?'knowledge-formula':'')+'">'+esc(s.body)+'</p>':'')+(s.items?.length?'<ul>'+s.items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'')+'</section>').join('');
  return notice+sections;
}

function graphMarkup(k){const g=graphContext(k.id);if(!g)return '';const pre=g.prerequisites.length?'<div class="knowledge-graph-block"><h4>Understand first</h4><div class="knowledge-chips">'+g.prerequisites.map(n=>'<span>'+esc(n.label)+(n.status==='stub'?' · coming soon':'')+'</span>').join('')+'</div></div>':'';const path=g.path?'<div class="knowledge-graph-block"><h4>Learning path</h4><ol>'+g.path.nodes.map(n=>'<li>'+esc(n.label)+(n.status==='stub'?' <small>coming soon</small>':'')+'</li>').join('')+'</ol></div>':'';return pre+path;}

function dialog(k, depth='explain') {
  const tabs=[['glance','Quick'],['explain','Explain'],['learn','Learn'],['advanced','Advanced'],['research','Research'],['try','Try It']];
  const buttons=tabs.map(([d,l])=>'<button type="button" data-knowledge-depth="'+d+'" data-knowledge-id="'+esc(k.id)+'" class="'+(d===depth?'active':'')+'">'+l+'</button>').join('');
  return '<div class="knowledge-backdrop" data-knowledge-close></div><section class="knowledge-dialog" role="dialog" aria-modal="true" aria-labelledby="knowledge-title"><div class="knowledge-dialog-head"><div><small>WEALTH BUILDER UNIVERSITY</small><h2 id="knowledge-title">'+esc(k.canonicalTerm)+'</h2></div><button type="button" class="knowledge-close" data-knowledge-close aria-label="Close explanation">×</button></div><div class="knowledge-depths">'+buttons+'</div><div class="knowledge-body">'+content(k,depth)+'</div><footer class="knowledge-source-state"><b>Source state:</b> '+esc(k.evidence?.sourceState || 'unknown')+' · '+esc(depth)+'</footer></section>';
}

export function installKnowledgeUI(root=document) {
  let host=document.querySelector('#knowledge-layer');
  if(!host){host=document.createElement('div');host.id='knowledge-layer';document.body.appendChild(host);}
  const close=()=>{host.innerHTML='';document.body.classList.remove('knowledge-open');};
  const open=(id,depth='explain')=>{const k=getKnowledgeObject(id);if(!k)return;host.innerHTML=dialog(k,depth);document.body.classList.add('knowledge-open');host.querySelector('.knowledge-close')?.focus();};
  root.querySelectorAll('[data-knowledge]').forEach(el=>el.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();open(el.dataset.knowledge);}));
  host.onclick=event=>{const depth=event.target.closest('[data-knowledge-depth]');if(depth)return open(depth.dataset.knowledgeId,depth.dataset.knowledgeDepth);if(event.target.closest('[data-knowledge-close]'))close();};
  document.onkeydown=event=>{if(event.key==='Escape'&&host.innerHTML)close();};
}
