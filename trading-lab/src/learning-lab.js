import exercises from '../knowledge/exercises/core-exercises.v1.json' with { type: 'json' };
const byKnowledge=id=>exercises.filter(x=>x.knowledgeId===id);
export function exercisesForKnowledge(id){return byKnowledge(id)}
export function evaluateExercise(exerciseId,answer){const x=exercises.find(e=>e.exerciseId===exerciseId);if(!x)return{ok:false,error:'Exercise not found.'};let correct=false;if(Array.isArray(x.choices))correct=Number(answer)===Number(x.expectedAnswer);else{const n=Number(answer);correct=Number.isFinite(n)&&Math.abs(n-Number(x.expectedAnswer))<=Number(x.tolerance||0)}return{ok:true,correct,exercise:x,explanation:x.explanation}}
export function labReadiness(){const types=[...new Set(exercises.map(x=>x.type))],knowledge=[...new Set(exercises.map(x=>x.knowledgeId))];return{exercises:exercises.length,types,knowledgeObjects:knowledge.length,simulatorLinked:exercises.filter(x=>x.simulatorConfig).length}}
