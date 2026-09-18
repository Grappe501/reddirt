import securities from '../security/master/security-master.seed.v1.json' with { type: 'json' };
const bySymbol=new Map(securities.map(s=>[s.symbol.toUpperCase(),s]));
const byId=new Map(securities.map(s=>[s.securityId,s]));
export function securityBySymbol(symbol){return bySymbol.get(String(symbol||'').toUpperCase())||null}
export function securityById(id){return byId.get(id)||null}
export function securityIdentity(symbol){const s=securityBySymbol(symbol);return s?{securityId:s.securityId,symbol:s.symbol,name:s.displayName,assetClass:s.assetClass,exchange:s.listing.exchangeCode,currency:s.listing.currency,sector:s.classification?.sector||null,industry:s.classification?.industry||null,sourceState:s.provenance.sourceState,status:s.status}:null}
export function securityHoverCard(symbol,{price=null,changePct=null}={}){const s=securityBySymbol(symbol);if(!s)return null;return{...securityIdentity(symbol),price,changePct,description:s.issuer.description||null,verified:s.status==='verified'&&s.provenance.sourceState==='sourced'}}
export function securityMasterStats(){return{securities:securities.length,equities:securities.filter(s=>s.assetClass==='equity').length,etfs:securities.filter(s=>s.assetClass==='etf').length,verified:securities.filter(s=>s.status==='verified').length,draft:securities.filter(s=>s.status==='draft').length}}
