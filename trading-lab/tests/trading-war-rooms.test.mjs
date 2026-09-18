import {buildMorningWarRoom,buildLiveWarRoom,buildClosingWarRoom,warRoomHealth,warRoomBrief} from '../src/trading-war-rooms.js';
const m=buildMorningWarRoom({asOf:'2026-01-01T08:00:00Z',marketBrain:{sourceState:'available'},opportunities:{sourceState:'available'}});if(m.room!=='morning'||m.panels.length!==7)throw new Error('morning');
const h=warRoomHealth(m);if(h.status!=='DEGRADED'||!h.missingPanels.includes('catalysts'))throw new Error('health');
const l=buildLiveWarRoom({marketBrain:{sourceState:'available'}});if(l.panels.length!==8)throw new Error('live');
const c=buildClosingWarRoom({journal:{sourceState:'available'}});if(c.panels.length!==7)throw new Error('closing');if(!warRoomBrief(l).guardrails.some(x=>x.includes('not a probability')))throw new Error('guardrail');console.log('trading-war-rooms contract: PASS');
