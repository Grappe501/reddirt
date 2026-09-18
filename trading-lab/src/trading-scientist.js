const ops={'>':(a,b)=>a>b,'>=':(a,b)=>a>=b,'<':(a,b)=>a<b,'<=':(a,b)=>a<=b,'==':(a,b)=>a===b};
export function validateHypothesis(h={}){
 const errors=[];if(!h.hypothesisId)errors.push('hypothesisId required');if(!h.statement)errors.push('statement required');if(!h.entryRules?.length)errors.push('entryRules required');if(!h.outcome?.metric||!h.outcome?.horizon)errors.push('outcome metric/horizon required');
 for(const r of h.entryRules||[]){if(!r.knownAt)errors.push('Every entry feature must declare when it was knowable: '+r.feature);if(!ops[r.operator]&&!['crosses_above','crosses_below'].includes(r.operator))errors.push('Unsupported operator: '+r.operator)}
 if(h.costModel==null)errors.push('costModel required');if(!h.validationPlan?.test)errors.push('held-out test plan required');
 return{ok:errors.length===0,errors};
}
export function leakageAudit(h={}){
 const issues=[];for(const r of h.entryRules||[]){if(r.knownAt==='next_bar')issues.push({feature:r.feature,severity:'BLOCK',reason:'Entry condition uses information unavailable at decision time.'});}
 if(!h.validationPlan?.test)issues.push({severity:'BLOCK',reason:'No held-out test set.'});
 if(h.validationPlan?.parameterSensitivity===false)issues.push({severity:'WARN',reason:'Parameter sensitivity disabled.'});
 return{pass:!issues.some(x=>x.severity==='BLOCK'),issues};
}
export function compileRule(rule){if(!ops[rule.operator])return null;return row=>ops[rule.operator](Number(row[rule.feature]),Number(rule.value))}
export function evaluateRows(h,rows=[]){
 const audit=leakageAudit(h);if(!audit.pass)return{status:'BLOCKED',audit,trades:[]};
 const compiled=(h.entryRules||[]).map(compileRule);if(compiled.some(x=>!x))return{status:'UNSUPPORTED_RULE',audit,trades:[]};
 const matches=rows.filter(row=>compiled.every(fn=>fn(row)));return{status:'READY_FOR_EXISTING_BACKTEST_ENGINE',audit,matches:matches.length,matchedRows:matches};
}
export function researchProtocol(h){return{question:h.statement,nullHypothesis:h.nullHypothesis||'No persistent edge after costs and validation.',requiredData:[...(h.entryRules||[]).map(x=>x.feature),h.outcome?.metric].filter(Boolean),costs:h.costModel,validation:h.validationPlan,checks:['decision-time availability','transaction costs','held-out evidence','walk-forward stability','regime stability','parameter sensitivity','multiple-testing risk']}}
