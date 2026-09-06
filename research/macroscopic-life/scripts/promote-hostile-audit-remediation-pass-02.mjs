import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const base = path.join(root, 'research', 'macroscopic-life');
const m = (...p) => path.join(base, 'manuscript', ...p);
const scripts = (...p) => path.join(base, 'scripts', ...p);

const frozen = {
  act1: m('pub-7l-r1-act-i-redundancy-cut-reader-manuscript.md'),
  act2: m('pub-7l-r1-act-ii-redundancy-cut-reader-manuscript.md'),
  act3: m('pub-7l-r1-act-iii-redundancy-cut-reader-manuscript.md'),
  act4: m('pub-7l-r1-act-iv-redundancy-cut-reader-manuscript.md'),
  act5: m('pub-7l-r1-act-v-redundancy-cut-reader-manuscript.md'),
};
const r9 = {
  act2: m('pub-9c-r9-act-ii-reader-manuscript.md'),
  act4: m('pub-9c-r9-act-iv-reader-manuscript.md'),
  act5: m('pub-9c-r9-act-v-reader-manuscript.md'),
};
const outputs = {
  act1: m('pub-9c-ha2-act-i-reader-manuscript.md'),
  act2: m('pub-9c-ha2-act-ii-reader-manuscript.md'),
  act3: m('pub-9c-ha2-act-iii-reader-manuscript.md'),
  act4: m('pub-9c-ha2-act-iv-reader-manuscript.md'),
  act5: m('pub-9c-ha2-act-v-reader-manuscript.md'),
};

for (const p of Object.values(frozen)) if (!fs.existsSync(p)) throw new Error(`Missing frozen source: ${p}`);

const r9Run = spawnSync(process.execPath, [scripts('promote-pub-9c-r9-reader-revisions.mjs')], { cwd: root, encoding: 'utf8' });
if (r9Run.status !== 0) throw new Error(`R9 promotion failed:\n${r9Run.stdout}\n${r9Run.stderr}`);
for (const p of Object.values(r9)) if (!fs.existsSync(p)) throw new Error(`Missing generated R9 derivative: ${p}`);

function count(text, needle) { return text.split(needle).length - 1; }
function requireOnce(text, anchor, label) {
  const n = count(text, anchor);
  if (n !== 1) throw new Error(`${label}: expected exact anchor once, found ${n}: ${anchor}`);
}
function insertAfter(text, anchor, insertion, label) {
  if (text.includes(insertion.trim())) return text;
  requireOnce(text, anchor, label);
  return text.replace(anchor, `${anchor}\n\n${insertion.trim()}`);
}
function insertBefore(text, anchor, insertion, label) {
  if (text.includes(insertion.trim())) return text;
  requireOnce(text, anchor, label);
  return text.replace(anchor, `${insertion.trim()}\n\n${anchor}`);
}
function insertAfterPartialLock(text, anchor, uniqueLock, insertion, label) {
  if (text.includes(uniqueLock)) return text;
  requireOnce(text, anchor, label);
  return text.replace(anchor, `${anchor}\n\n${insertion.trim()}`);
}

let act1 = fs.readFileSync(frozen.act1, 'utf8');
let act2 = fs.readFileSync(r9.act2, 'utf8');
let act3 = fs.readFileSync(frozen.act3, 'utf8');
let act4 = fs.readFileSync(r9.act4, 'utf8');
let act5 = fs.readFileSync(r9.act5, 'utf8');

act1 = insertAfter(act1, '> **A SIGNAL\'S ABSENCE FROM UNAIDED PERCEPTION IS A REASON TO MEASURE — NOT EVIDENCE THAT AN UNSUPPORTED HIDDEN PHENOMENON EXISTS.**', '> **EPISTEMIC HUMILITY IS NOT POSITIVE EVIDENCE.**', 'P1-11 sensory brake');
act1 = insertBefore(act1, 'Strange questions are welcome.', '> **FREQUENCY IS A MEASUREMENT, NOT AN EXPLANATION.**\n\n> **SYNCHRONY IS A RELATIONSHIP, NOT AN IDENTITY CLAIM.**', 'P1-11 resonance brake');
act1 = insertAfter(act1, 'From this point forward, the argument must come from known organization and discriminating evidence, not invisibility.', 'Before the formal framework arrives, keep four questions separate: **Is there a macroscopic pattern? Is there macroscopic organization? Is that organization causally integrated? Has it earned higher-order individuality?** A yes at one level is not a yes at the next.\n\n> **PATTERN ≠ ORGANIZATION ≠ INTEGRATION ≠ HIGHER-ORDER INDIVIDUALITY.**', 'P1-14 early ladder');

act2 = insertAfterPartialLock(act2, 'Each arrow is an evidentiary burden, not a change of vocabulary.', 'CONNECTED IS NOT INTEGRATED.', 'Consider two networks with the same number of components and links. One is redundant: remove a particular relationship and the larger function is preserved through alternate routes. The other depends on a specific organization of relationships: perturbing those relationships sharply reduces whole-system performance beyond an appropriate component-loss baseline. Equal connectivity did not imply equal integration; the causal perturbation separated them.\n\n> **CONNECTED IS NOT INTEGRATED. INTEGRATION HAS TO SURVIVE PERTURBATION AS A CAUSAL CLAIM.**', 'P1-07 integration example');

act3 = insertAfter(act3, '> **Electricity in the body is ordinary physics organized by living systems.**', '> **ORDINARY BIOPHYSICS CAN IMPLEMENT EXTRAORDINARY ORGANIZATION; ELECTRICITY IS NOT A MYSTICAL EXPLANATION.**', 'P1-11 bioelectric brake');
act3 = insertAfter(act3, '> **FREQUENCY IS A MEASUREMENT, NOT AN EXPLANATION.**', '> **SYNCHRONY IS A RELATIONSHIP, NOT AN IDENTITY CLAIM.**', 'P1-11 synchrony brake');
act3 = insertAfter(act3, 'That definition describes behavior, not awareness.', '> **TARGET-STATE LANGUAGE DOES NOT REQUIRE CONSCIOUS REPRESENTATION OF A TARGET.**', 'P1-11 target-state brake');
act3 = insertAfterPartialLock(act3, 'This is a comparative analytical definition, not a universal definition for every discipline.', 'INFORMATION IS NOT A SUBSTANCE.', 'Throughout this book, *information* must name a relationship or function, not a substance. Statistical information, a physically stored state, information functionally available to later causal processing, semantic information for an interpreting system, and the later test called **Whole-Only Information** are different claims. Evidence for one does not automatically establish the others.\n\n> **INFORMATION IS NOT A SUBSTANCE. NAME THE RELATIONSHIP OR FUNCTION YOU MEAN.**', 'P1-04 information specificity');
act3 = insertAfterPartialLock(act3, 'Retrospective storytelling is cheap. Prospective error gives prediction scientific teeth.', 'NO PROSPECTIVE TARGET + NO ERROR METRIC + NO BASELINE = NO PREDICTION ADVANTAGE.', 'For a **Prediction Advantage** claim, name four things before looking at the result: the physical predictor or measured macro-state, the prospective target, the error measure, and the strongest fair lower-level, null, or simpler baseline. Hindsight fit is not foresight.\n\n> **NO PROSPECTIVE TARGET + NO ERROR METRIC + NO BASELINE = NO PREDICTION ADVANTAGE.**', 'P1-03 prediction gate');

act4 = insertAfterPartialLock(act4, '> **THE WHOLE CAN SOLVE A PROBLEM THAT NO SINGLE COMPONENT SOLVES ALONE.**', 'THAT DOES NOT BY ITSELF ESTABLISH ONE AGENT.', '> **THE WHOLE CAN SOLVE A PROBLEM NO COMPONENT SOLVES ALONE; THAT DOES NOT BY ITSELF ESTABLISH ONE AGENT.**', 'P1-11 collective intelligence brake');
act4 = insertAfterPartialLock(act4, 'The categories can interact. They are not synonyms.', 'INFORMATION IS NOT A SUBSTANCE.', '> **INFORMATION IS NOT A SUBSTANCE. NAME THE RELATIONSHIP OR FUNCTION YOU MEAN.**', 'P1-04 Act IV information brake');
act4 = insertBefore(act4, '## Who Owns the Capability?', '## Agency Is an Operational Claim\n\nFor this project, **operational agency** means that a system persistently regulates or selects actions relative to defined state variables, constraints, or goals in a way that can be tested against alternatives. A candidate claim must specify the regulated state variables or goal condition, the available action space, persistence through time, the feedback linking outcomes to later action, and the strongest lower-level explanation. This is weaker than conscious or intentional agency.\n\n> **GOAL-DIRECTED REGULATION ≠ CONSCIOUS INTENTION.**', 'P1-05 operational agency');
act4 = insertBefore(act4, '## Functions Move Outside Bodies', '> **A FUNCTION CAN EXIST INSIDE A SYSTEM BEFORE THE SYSTEM OWNS THE FUNCTION.**\n\nThe sections below therefore use *contains*, *supports*, *distributes*, or *exhibits at system scale* unless a stronger ownership claim has been separately earned.', 'P1-01 ownership grammar');
act4 = insertAfterPartialLock(act4, 'They are not eleven independent votes.', 'TESTS ARE QUESTIONS. EVIDENCE UNITS ARE OBSERVATIONS.', '> **TESTS ARE QUESTIONS. EVIDENCE UNITS ARE OBSERVATIONS. DEPENDENCE MUST BE DISCLOSED.**\n\nA single perturbation experiment might inform **Integration Ablation**, **Prediction Advantage**, and **Higher-Level Intervention**. That does not turn one experiment into three independent confirmations. It remains substantially one evidence unit whose consequences bear on several questions. Strong support for Model D would require diagnostic evidence that survives sufficiently different perturbations, timescales, substrates, datasets, or mechanism families.\n\nA pass count is therefore forbidden: `7/11` is not a probability that the candidate is an individual.', 'P1-06/P1-08 evidence dependence');
act4 = insertBefore(act4, '**State: STRONG FOR MANY BOUNDED SUBSYSTEMS; MODERATE FOR CIVILIZATION-SCALE ORGANIZATION; INSUFFICIENT FOR INDIVIDUALITY.**', '> **CONNECTED IS NOT INTEGRATED. INTEGRATION HAS TO SURVIVE PERTURBATION AS A CAUSAL CLAIM.**', 'P1-07 Test 2 brake');
act4 = insertBefore(act4, '**State: STRONG FOR BOUNDED SYSTEMS / CIVILIZATION-SCALE OWNERSHIP UNRESOLVED.**', '> **NO PROSPECTIVE TARGET + NO ERROR METRIC + NO BASELINE = NO PREDICTION ADVANTAGE.**', 'P1-03 Test 6 brake');
act4 = insertBefore(act4, '**State: STRONG FOR HUMAN/INSTITUTIONAL REPAIR CAPACITY / HIGHER-ORDER REPAIR AUTONOMY NOT ESTABLISHED.**', '> **MAINTENANCE INSIDE A SYSTEM ≠ REPAIR AUTONOMY OF THE SYSTEM AS A WHOLE.**', 'P1-02 repair autonomy brake');
act4 = insertAfterPartialLock(act4, 'Policies, prices, standards, network states, and institutional variables can have causal explanatory value, but higher-level causation does not automatically establish one higher-order individual.', 'HIGHER-LEVEL CAUSAL EFFICACY ≠ A NEW FORCE.', 'A thermostat gives the nonmystical pattern. Room temperature is a macro-variable generated by molecular interactions. The thermostat measures that macro-variable; changing its setpoint changes furnace behavior and produces reproducible downstream temperature changes. Nothing supernatural or physically additional was inserted from above. The higher-level variable is useful because an implemented control relation makes interventions on it predict consequences. The civilization-scale question is analogous but harder: do candidate whole-level variables add reproducible intervention, explanatory, or predictive power beyond strong lower-level alternatives?\n\n> **HIGHER-LEVEL CAUSAL EFFICACY ≠ A NEW FORCE.**', 'P1-09 higher-level intervention');
act4 = insertAfterPartialLock(act4, '> **MACROSCOPIC ORGANIZATION CAN BE REAL WITHOUT MACROSCOPIC INDIVIDUALITY.**', 'MODEL C IS A DISCOVERY, NOT A CONSOLATION PRIZE.', '> **MODEL C IS A DISCOVERY, NOT A CONSOLATION PRIZE.**\n\n> **REAL MACROSCOPIC ORGANIZATION CAN EXIST WITHOUT A NEW HIGHER-ORDER INDIVIDUAL.**', 'P1-10 Model C elevation');

act5 = insertAfterPartialLock(act5, 'This is Model C.', 'MODEL C IS A DISCOVERY, NOT A CONSOLATION PRIZE.', '> **MODEL C IS A DISCOVERY, NOT A CONSOLATION PRIZE.**\n\n> **REAL MACROSCOPIC ORGANIZATION CAN EXIST WITHOUT A NEW HIGHER-ORDER INDIVIDUAL.**', 'P1-10 Act V Model C');
act5 = insertAfterPartialLock(act5, 'Bioelectricity remains ordinary biophysics, not evidence of a universal hidden life force.', 'CONVERGENCE IS A HYPOTHESIS TO EXPLAIN, NOT EVIDENCE OF A HIDDEN GENOME.', 'If similar large-scale forms or solutions recur independently, that convergence can motivate hypotheses about shared constraints, selection pressures, or repeated engineering problems. It does not establish a hidden civilizational genome or heredity mechanism.\n\n> **CONVERGENCE IS A HYPOTHESIS TO EXPLAIN, NOT EVIDENCE OF A HIDDEN GENOME.**', 'P1-11 recurrence brake');
act5 = insertAfterPartialLock(act5, 'Unseen forces, auras, spiritual realities, simulation arguments, and other metaphysical possibilities do not enter the scientific evidence ledger merely because human senses are limited.', 'HIGHER-LEVEL CAUSAL EFFICACY ≠ SUPERNATURAL CAUSATION.', '> **HIGHER-LEVEL CAUSAL EFFICACY ≠ SUPERNATURAL CAUSATION.**', 'P1-11 theology brake');
act5 = insertBefore(act5, '## The Hypothesis Without the Imagery', '## What Macroscopic Life Claims as Its Contribution\n\nMacroscopic Life does **not** claim to have invented emergence, evolutionary transitions in individuality, superorganisms, distributed cognition, collective intelligence, information theory, causal emergence, synchronization, or the observation that very large collectives can resemble organisms. Those are established intellectual ancestries with their own literatures. Priority for any narrower subclaim would require a dedicated prior-art review.\n\nThe proposed contribution here is narrower and testable: **Macroscopic Life assembles ideas from those traditions into an explicit, dependence-aware evidentiary hierarchy and adversarial research program for distinguishing macroscopic pattern, organization, integration, and candidate higher-order individuality.**', 'P1-12 originality statement');
act5 = insertAfterPartialLock(act5, '> **CURRENT WINNER: MODEL C.**', 'REAL MACROSCOPIC ORGANIZATION CAN EXIST WITHOUT A NEW HIGHER-ORDER INDIVIDUAL.', '> **REAL MACROSCOPIC ORGANIZATION CAN EXIST WITHOUT A NEW HIGHER-ORDER INDIVIDUAL.**', 'P1-10 final verdict');

const result = { act1, act2, act3, act4, act5 };
for (const [key, text] of Object.entries(result)) fs.writeFileSync(outputs[key], text.trimEnd() + '\n', 'utf8');

const locks = [
  'A FUNCTION CAN EXIST INSIDE A SYSTEM BEFORE THE SYSTEM OWNS THE FUNCTION.',
  'MAINTENANCE INSIDE A SYSTEM ≠ REPAIR AUTONOMY OF THE SYSTEM AS A WHOLE.',
  'NO PROSPECTIVE TARGET + NO ERROR METRIC + NO BASELINE = NO PREDICTION ADVANTAGE.',
  'INFORMATION IS NOT A SUBSTANCE. NAME THE RELATIONSHIP OR FUNCTION YOU MEAN.',
  'GOAL-DIRECTED REGULATION ≠ CONSCIOUS INTENTION.',
  'TESTS ARE QUESTIONS. EVIDENCE UNITS ARE OBSERVATIONS. DEPENDENCE MUST BE DISCLOSED.',
  'CONNECTED IS NOT INTEGRATED. INTEGRATION HAS TO SURVIVE PERTURBATION AS A CAUSAL CLAIM.',
  'HIGHER-LEVEL CAUSAL EFFICACY ≠ A NEW FORCE.',
  'MODEL C IS A DISCOVERY, NOT A CONSOLATION PRIZE.',
  'REAL MACROSCOPIC ORGANIZATION CAN EXIST WITHOUT A NEW HIGHER-ORDER INDIVIDUAL.',
  'EPISTEMIC HUMILITY IS NOT POSITIVE EVIDENCE.',
  'ORDINARY BIOPHYSICS CAN IMPLEMENT EXTRAORDINARY ORGANIZATION; ELECTRICITY IS NOT A MYSTICAL EXPLANATION.',
  'TARGET-STATE LANGUAGE DOES NOT REQUIRE CONSCIOUS REPRESENTATION OF A TARGET.',
  'FREQUENCY IS A MEASUREMENT, NOT AN EXPLANATION.',
  'SYNCHRONY IS A RELATIONSHIP, NOT AN IDENTITY CLAIM.',
  'THE WHOLE CAN SOLVE A PROBLEM NO COMPONENT SOLVES ALONE; THAT DOES NOT BY ITSELF ESTABLISH ONE AGENT.',
  'HIGHER-ORDER INDIVIDUALITY ≠ HIGHER-ORDER CONSCIOUSNESS.',
  'CONVERGENCE IS A HYPOTHESIS TO EXPLAIN, NOT EVIDENCE OF A HIDDEN GENOME.',
  'HIGHER-LEVEL CAUSAL EFFICACY ≠ SUPERNATURAL CAUSATION.',
  'THE MICROBE IS A PERSPECTIVE, NOT A DIAGNOSIS.',
  'PATTERN ≠ ORGANIZATION ≠ INTEGRATION ≠ HIGHER-ORDER INDIVIDUALITY.',
  'Macroscopic Life assembles ideas from those traditions into an explicit, dependence-aware evidentiary hierarchy and adversarial research program for distinguishing macroscopic pattern, organization, integration, and candidate higher-order individuality.'
];
const joined = Object.values(result).join('\n');
for (const lock of locks) if (!joined.includes(lock)) throw new Error(`Pass-02 promotion lock missing: ${lock}`);

console.log('PASS: hostile-audit remediation Pass 02 derivatives generated.');
for (const p of Object.values(outputs)) console.log(path.relative(root, p));
console.log(`Closure locks present: ${locks.length}/${locks.length}`);
console.log('Historical PUB-7L sources were read only; no PUB-7L write path exists in this script.');
