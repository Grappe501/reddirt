import contract from '../ai/copilot-professor.v1.json' with {type:'json'};
import { securityIdentity } from './security-master.js';
import { graphContext } from './knowledge-graph.js';
import { exercisesForKnowledge } from './learning-lab.js';

const clean=v=>v==null?null:v;
export function buildCopilotContext({symbol=null,premium=null,marketBrain=null,marketMemory=null,strategyEvidence=null,fundamentals=null,screen=null}={}){
 return{mode:'copilot',security:symbol?securityIdentity(symbol):null,premium:clean(premium),marketBrain:clean(marketBrain),marketMemory:clean(marketMemory),strategyEvidence:clean(strategyEvidence),fundamentals:clean(fundamentals),screen:clean(screen),rules:contract.modes.copilot};
}
export function buildProfessorContext({knowledgeId,depth='explain',screen=null,liveContext=null}={}){
 const graph=knowledgeId?graphContext(knowledgeId):null;
 return{mode:'professor',knowledgeId,depth:contract.modes.professor.depths.includes(depth)?depth:'explain',graph,exercises:knowledgeId?exercisesForKnowledge(knowledgeId):[],screen,liveContext,rules:contract.modes.professor};
}
export function evidenceEnvelope(context={}){
 const refs=[],missing=[];for(const [key,value] of Object.entries(context)){if(['mode','rules','screen'].includes(key))continue;if(value==null)missing.push(key);else if(value?.provenance)refs.push({key,provenance:value.provenance});}
 return{evidenceState:missing.length?'PARTIAL':'AVAILABLE',sourceRefs:refs,missingEvidence:missing};
}
export function responseGuardrail(response={},context={}){
 const env=evidenceEnvelope(context),text=String(response.answer||'');const violations=[];
 if(/\bguarantee(d)?\b|risk[- ]?free/i.test(text))violations.push('GUARANTEE_LANGUAGE');
 if(/\b\d+(\.\d+)?% (chance|probability) of (profit|winning|success)/i.test(text)&&context?.premium)violations.push('UNSUPPORTED_PROBABILITY');
 return{ok:violations.length===0,violations,response:{mode:context.mode||response.mode||'copilot',answer:text,evidenceState:env.evidenceState,sourceRefs:response.sourceRefs||env.sourceRefs,uncertainties:[...(response.uncertainties||[]),...env.missingEvidence.map(x=>'Missing evidence: '+x)],nextActions:response.nextActions||[]}};
}
export function copilotPromptPacket(context,userQuestion){return{system:'Use only supplied evidence for current factual claims. Separate observation from interpretation. Name missing evidence. Premium scores are evidence scores, not probabilities. Do not promise returns or execute real-money trades.',context,userQuestion}}
export function professorPromptPacket(context,userQuestion){return{system:'Teach at the requested depth. Distinguish canonical concept teaching from live contextual facts. State limitations and uncertainty. Never invent citations. Offer an exercise when useful.',context,userQuestion}}
