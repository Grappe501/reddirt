import { securityBySymbol } from './security-master.js';
import pageSpec from '../security/intelligence/symbol-page-spec.v1.json' with { type: 'json' };

const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
export function symbolIntelligenceModel(symbol,context={}){
 const security=securityBySymbol(symbol);if(!security)return null;
 return {security,context,chapters:pageSpec.chapters.map(ch=>({...ch,state:['company','technical-market','research-lab'].includes(ch.id)?'available':'awaiting-data'})),provenance:security.provenance};
}
export function symbolIntelligenceMarkup(symbol,context={}){
 const m=symbolIntelligenceModel(symbol,context);if(!m)return '<div class="symbol-intelligence-empty">Security intelligence profile not available yet.</div>';
 const s=m.security,p=context.price;
 return '<section class="symbol-intelligence"><header><div><small>SECURITY INTELLIGENCE</small><h2>'+esc(s.symbol)+' · '+esc(s.displayName)+'</h2><p>'+esc(s.assetClass.toUpperCase())+' · '+esc(s.listing.exchangeCode)+' · '+esc(s.listing.currency)+(s.classification?.sector?' · '+esc(s.classification.sector):'')+'</p></div><div class="symbol-intelligence-price">'+(p!=null?esc(p):'--')+'<small>live/replay context</small></div></header><div class="symbol-intelligence-trust">Identity status: <b>'+esc(s.status)+'</b> · source state: <b>'+esc(s.provenance.sourceState)+'</b>. Unknown fundamentals are shown as unavailable, never as zero.</div><nav class="symbol-chapters" aria-label="'+esc(s.symbol)+' intelligence chapters">'+m.chapters.map(ch=>'<button type="button" data-symbol-chapter="'+esc(ch.id)+'" class="'+(ch.state==='available'?'available':'pending')+'"><b>'+esc(ch.label)+'</b><small>'+esc(ch.state==='available'?ch.question:'Data/research pipeline pending')+'</small></button>').join('')+'</nav><div class="symbol-chapter-stage" data-symbol-stage><h3>Company</h3><p>'+esc(s.issuer.description||'A verified plain-English company description has not been ingested yet.')+'</p><p><b>Industry:</b> '+esc(s.classification?.industry||'Not yet verified')+'</p><p><b>Research posture:</b> Identity and current market context are available. Fundamental and filing chapters remain gated until V2-09 supplies sourced data.</p></div></section>';
}
export function installSymbolIntelligence(root=document){
 root.querySelectorAll('[data-symbol-chapter]').forEach(btn=>btn.onclick=()=>{const stage=root.querySelector('[data-symbol-stage]');if(!stage)return;const id=btn.dataset.symbolChapter,ch=pageSpec.chapters.find(x=>x.id===id);const pending=!['company','technical-market','research-lab'].includes(id);stage.innerHTML='<h3>'+esc(ch?.label||id)+'</h3><p>'+esc(ch?.question||'')+'</p><p>'+(pending?'This chapter is structurally ready but intentionally unavailable until its sourced data contract is populated.':'This chapter is available to the current V2 foundation and will deepen as later intelligence phases connect.')+'</p>';});
}
