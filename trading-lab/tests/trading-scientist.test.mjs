import h from '../scientist/examples/gap-vwap-rvol.v1.json' with {type:'json'};import {validateHypothesis,leakageAudit,evaluateRows,researchProtocol} from '../src/trading-scientist.js';
if(!validateHypothesis(h).ok)throw new Error('valid hypothesis rejected');if(!leakageAudit(h).pass)throw new Error('clean hypothesis leakage blocked');
const bad={...h,entryRules:[{feature:'futureClose',operator:'>',value:1,knownAt:'next_bar'}]};if(leakageAudit(bad).pass)throw new Error('lookahead not blocked');
const e=evaluateRows(h,[{gapPct:4,priceVsVwap:1,relativeVolume:3},{gapPct:2,priceVsVwap:1,relativeVolume:3}]);if(e.matches!==1)throw new Error('rule evaluation');
if(!researchProtocol(h).checks.includes('walk-forward stability'))throw new Error('protocol incomplete');console.log('trading-scientist contract: PASS');
