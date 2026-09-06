import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const m = (...p) => path.join(root, 'research', 'macroscopic-life', ...p);

const files = {
  act2: m('manuscript','pub-7l-r1-act-ii-redundancy-cut-reader-manuscript.md'),
  act4: m('manuscript','pub-7l-r1-act-iv-redundancy-cut-reader-manuscript.md'),
  act5: m('manuscript','pub-7l-r1-act-v-redundancy-cut-reader-manuscript.md')
};
const outputs = {
  act2: m('manuscript','pub-9c-r9-act-ii-reader-manuscript.md'),
  act4: m('manuscript','pub-9c-r9-act-iv-reader-manuscript.md'),
  act5: m('manuscript','pub-9c-r9-act-v-reader-manuscript.md')
};

for (const [k,p] of Object.entries(files)) if (!fs.existsSync(p)) throw new Error(`Missing ${k}: ${p}`);

function exactlyOnce(text, anchor, label) {
  const n = text.split(anchor).length - 1;
  if (n !== 1) throw new Error(`${label}: expected exactly one anchor, found ${n}: ${anchor}`);
}
function insertBefore(text, anchor, insertion, label) {
  exactlyOnce(text, anchor, label);
  return text.replace(anchor, `${insertion.trim()}\n\n${anchor}`);
}
function replaceBetween(text, start, end, replacement, label) {
  exactlyOnce(text,start,label+' start'); exactlyOnce(text,end,label+' end');
  const a=text.indexOf(start), b=text.indexOf(end,a+start.length);
  if (b<=a) throw new Error(`${label}: invalid anchor order`);
  return text.slice(0,a)+replacement.trim()+`\n\n`+text.slice(b);
}

let act2=fs.readFileSync(files.act2,'utf8');
let act4=fs.readFileSync(files.act4,'utf8');
let act5=fs.readFileSync(files.act5,'utf8');

const ladder5=`### Four Evidence Barriers\n\nIt helps to separate four claims that are easy to collapse into one another.\n\nA **macroscopic pattern** is a large-scale regularity we can detect. A **macroscopic organization** exists, for this project, when relationships among components help sustain reproducible system-level states or functions. **Integration** is a stronger claim: changing important relationships among components should measurably change what the larger system can preserve, regulate, predict, repair, or do beyond an appropriate component-loss baseline. **Higher-order individuality** is stronger still. It asks whether the larger organization has earned enough boundary, integration, persistence, conflict-control, causal, evolutionary, and other relevant evidence to justify treating the proposed whole as an individual rather than merely as a useful higher-level description.\n\n> **MACROSCOPIC PATTERN → MACROSCOPIC ORGANIZATION → INTEGRATION → HIGHER-ORDER INDIVIDUALITY**\n\nEach arrow is an evidentiary burden, not a change of vocabulary.\n\nEvolutionary biology gives us real precedents in which previously more autonomous units became parts of more integrated higher-level individuals. No single mechanism is a universal magic switch.\n\n> **BECOMING ONE IS SOMETHING EVOLUTION CAN BUILD. RESEMBLING ONE IS NOT ENOUGH.**\n\nThe question above the human scale will therefore not be whether a system looks organism-like. It will be whether evidence crosses the barriers.`;
act2=insertBefore(act2,'### Civilization Meets Reproduction',ladder5,'Ch5 ladder');

const ch6=`A useful higher-level variable is not automatically a new individual. Science can gain explanatory power from higher-level descriptions without establishing a new biological individual at every useful level.\n\n> **DETECT THE PATTERN. PROVE THE ORGANIZATION. PERTURB THE INTEGRATION. MAKE INDIVIDUALITY COMPETE.**\n\nWe will carry that rule upward.`;
act2=insertBefore(act2,'> **BOUNDARIES CAN BE PERMEABLE WITHOUT BEING MEANINGLESS.**',ch6,'Ch6 rule');

const consciousness=`## Information Is Not One Thing\n\nThe word *information* can hide several different claims. A physical signal can carry information without being consciously understood. Biological and artificial systems can preserve state from the past without that fact alone establishing phenomenal experience. Systems can integrate information and perform intelligently without intelligence itself settling whether the system is conscious.\n\n> **SIGNAL ≠ INFORMATION ≠ INTEGRATION ≠ INTELLIGENCE ≠ AGENCY ≠ CONSCIOUSNESS**\n\nThe categories can interact. They are not synonyms.\n\n### The Consciousness Question\n\nConsciousness creates a separate problem from intelligence and a separate problem from individuality. Contemporary consciousness science contains competing theories emphasizing different mechanisms or signatures, and this book does not infer subjective experience merely from complexity, information processing, intelligence, self-regulation, or organismhood.[12.4]\n\n> **HIGHER-ORDER INDIVIDUALITY ≠ HIGHER-ORDER CONSCIOUSNESS.**\n\nA component can participate in a conscious system without containing a representation of the whole system's experience. A neuron need not know the person is conscious. Carrying that observation upward establishes only a possible epistemic asymmetry.\n\n> **A COMPONENT'S INABILITY TO ACCESS THE WHOLE'S EXPERIENCE IS NOT EVIDENCE THAT A LARGER EXPERIENCE EXISTS.**\n\nIf a candidate higher-order individual were ever established independently, it would then become legitimate to ask a second question: whether that whole shows evidence that discriminates among serious theories of consciousness.\n\nBook One does not answer that question. It protects it from being answered too early.\n\n> **DO NOT ASK WHETHER THE WHOLE IS CONSCIOUS UNTIL YOU HAVE FIRST EARNED THE RIGHT TO CALL IT A WHOLE.**`;
act4=insertBefore(act4,'## Who Owns the Capability?',consciousness,'Ch12 consciousness');

const nullModel=`## Carry the Simpler Explanation With Us\n\nThere is a simpler explanation we should refuse to lose sight of. Perhaps civilization is exactly what it appears to be: billions of organisms, already capable of sensing, remembering, planning, cooperating, competing, and inventing, building increasingly complicated institutions and machines together.\n\nOn that account, planetary communication, archives, infrastructure, markets, governments, scientific institutions, and computation can create genuine macroscopic organization without producing another individual above the organisms involved.\n\nThis is not a straw man. It is the explanation the stronger hypothesis must beat.\n\n> **A HIGHER-ORDER INDIVIDUAL MUST EXPLAIN OR PREDICT SOMETHING THE STRONGEST LOWER-LEVEL MODEL DOES NOT EXPLAIN AS WELL.**\n\nEvery analogy from here forward must survive that rival.`;
act4=insertBefore(act4,'## Functions Move Outside Bodies',nullModel,'Ch13 null model');

const ladder14=`## Pattern, Organization, Integration, Individual\n\n**MACROSCOPIC PATTERN**  \nA large-scale regularity exists.\n\n↓ evidence barrier\n\n**MACROSCOPIC ORGANIZATION**  \nRelationships among components causally sustain reproducible system-level functions or states.\n\n↓ stronger evidence barrier\n\n**INTEGRATION**  \nThe proposed relationships are not merely descriptive: perturbing or ablating important organization changes whole-level capability beyond appropriate lower-level baselines.\n\n↓ stronger evidence barrier\n\n**HIGHER-ORDER INDIVIDUALITY**  \nThe proposed whole earns sufficiently strong boundary, integration, persistence, conflict control, causal organization, evolutionary, and other relevant evidence to justify treating it as an individual.\n\nBiology gives us reason to take upward transitions in individuality seriously. It does not give this project permission to skip an evidentiary barrier.\n\nMacroscopic organization is deliberately broader than individuality. A system can possess real higher-scale organization without qualifying as one biological individual.`;
act4=replaceBetween(act4,'## Pattern, Organization, Individual','## Four Models Enter',ladder14,'Ch14 ladder replacement');

const kill=`We can now state the discipline more sharply than we could at the beginning:\n\n> **RESEMBLANCE GENERATES HYPOTHESES. MECHANISM GENERATES EVIDENCE. PREDICTION SEPARATES MODELS.**\n\nIf two competing models predict the same observation, that observation does not distinguish them. The stronger claim must expose itself to outcomes on which the models disagree.\n\n## Now Try to Kill It\n\nUp to this point, I have asked you to entertain a possibility. Your job changes here.\n\nAssume Model D is wrong. Assume civilization is an extraordinary technical-social organization built by intelligent organisms but is not itself a new higher-order individual.\n\nAsk what observation would force us to reconsider that simpler explanation. Then reverse the pressure: ask what observations should make us abandon Model D even if its analogies remain beautiful.\n\nA scientific hypothesis does not become stronger because every outcome can be redescribed as support. It becomes informative when it risks failure and when its predictions can be compared with serious alternatives.\n\nThe following tests are therefore not a checklist of organism-like traits. They are attempts to make models compete.\n\n> **THE GOAL IS NOT TO MAKE MACROSCOPIC LIFE WIN. THE GOAL IS TO MAKE THE BETTER MODEL WIN.**`;
act4=insertBefore(act4,'## The Eleven Tests',kill,'Ch14 kill transition');

const program=`## The Research Program Is Larger Than Civilization\n\nMacroscopic Life is not a verdict about contemporary civilization.\n\nThe broader research question is whether higher-order individuality can emerge at scales above familiar organisms and how such a transition could be distinguished from ordinary complex organization.\n\nCivilization is one candidate because it contains large-scale sensing, communication, persistent records, prediction, energetic organization, conflict-control mechanisms, repair, computation, and distributed problem solving. Those capabilities make it interesting to test. They do not make the answer yes.\n\nCivilization may fail the stronger model.\n\nIf it does, the failure would still tell us which forms of macroscopic organization are insufficient for higher-order individuality and sharpen what future candidate systems would need to demonstrate.\n\n> **A RESEARCH PROGRAM THAT CANNOT SURVIVE A FAVORED CANDIDATE'S FAILURE IS TOO CLOSE TO A BELIEF.**\n\nThe question must be allowed to outlive the answer we hoped to find.`;
act5=insertBefore(act5,'## The Hypothesis Without the Imagery',program,'Ch16 research program');

for (const [k,text] of Object.entries({act2,act4,act5})) {
  if (!text.includes('INTEGRATION → HIGHER-ORDER INDIVIDUALITY') && k!=='act5') throw new Error(`${k}: four-stage ladder missing`);
  fs.writeFileSync(outputs[k], text);
}

console.log('PUB-9C-R9 promotion derivatives written:');
for (const p of Object.values(outputs)) console.log(path.relative(root,p));
console.log('Historical PUB-7L R1 files were not overwritten.');