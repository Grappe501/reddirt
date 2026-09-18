import {buildCopilotContext,buildProfessorContext,responseGuardrail} from '../src/ai-copilot-professor.js';
const c=buildCopilotContext({symbol:'NVDA',premium:{score:78,available:true}});if(c.mode!=='copilot')throw new Error('copilot mode');
const g=responseGuardrail({answer:'This guarantees a return.'},c);if(g.ok)throw new Error('guarantee guardrail');
const p=buildProfessorContext({knowledgeId:'uko-vwap',depth:'research'});if(p.mode!=='professor'||p.depth!=='research'||!p.exercises.length)throw new Error('professor context');
const safe=responseGuardrail({answer:'The supplied Premium score is evidence, not a probability.'},c);if(!safe.ok)throw new Error('safe response blocked');
console.log('ai-copilot-professor contract: PASS');
