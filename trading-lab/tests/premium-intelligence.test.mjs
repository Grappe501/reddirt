import { computePremium,premiumVelocity } from '../src/premium-intelligence.js';
const full={components:{technical:80,participation:70,relativeStrength:75,regime:65,historicalEvidence:70,strategyConsensus:80,walkForward:72,calibration:60,eventEvidence:50,patternEvidence:68},penalties:{costLiquidity:2,risk:3,dataQuality:0}};
const r=computePremium(full);if(!r.available||r.direction==='UNAVAILABLE')throw new Error('full evidence unavailable');if(r.score<0||r.score>100)throw new Error('score bounds');if(!r.disclaimer.includes('not probability'))throw new Error('probability guardrail missing');
const weak=computePremium({components:{technical:90}});if(weak.available||weak.direction!=='UNAVAILABLE')throw new Error('coverage gate failed');
const stale=computePremium({...full,stale:true});if(stale.available)throw new Error('stale gate failed');
if(premiumVelocity([{score:50},{score:55}]).state!=='RISING')throw new Error('velocity failed');
console.log('premium-intelligence contract: PASS');
