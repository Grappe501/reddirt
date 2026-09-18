import {createCompetition,scoreParticipant,leaderboard,experienceForMode,classroomDashboard} from '../src/professional-classroom-competition.js';
const c=createCompetition({competitionId:'c1'});if(c.startingCapital!==1000||c.durationDays!==42)throw new Error('defaults');
const s=scoreParticipant({returnScore:80,drawdownScore:70,riskAdjustedScore:60,ruleAdherenceScore:90,researchQualityScore:80,learningScore:100});if(s.total!==77||!s.disclaimer.includes('not a prediction'))throw new Error('balanced score');
const l=leaderboard([{id:'a',metrics:{returnScore:50}},{id:'b',metrics:{returnScore:90}}],'pnl');if(l[0].id!=='b'||l[0].rank!==1)throw new Error('leaderboard');
if(!experienceForMode('professional').universalExplainAvailable)throw new Error('education removed');if(classroomDashboard({competition:c,participants:[1,2]}).participantCount!==2)throw new Error('classroom');console.log('professional-classroom-competition contract: PASS');
