/**
 * Universal plain-language depth for debate week — merged into guides and drill-downs.
 */

import type { DebateEncounterDepth } from "@/lib/intelligence/v4/debateEncounterDepthTypes";
import type { OperatorGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import type { SosDebateQuestionCategory } from "@/lib/intelligence/v4/sosDebateQuestionTypes";

export const UNIVERSAL_IF_STUCK: string[] = [
  "Pause two seconds — breathe — look at the moderator, not Hammer.",
  "Say: 'Let me answer directly.' Then give one sentence you know is safe: non-partisan SOS serves all 75 counties.",
  "If you forgot a bill number: 'I want to cite the statute correctly — the pattern is repeated election-law changes that shift burden to county clerks.'",
  "If interrupted: 'I want to finish this point for voters.' One sentence, then stop.",
  "Signal staff with pre-arranged hand gesture if you need water or a reset — never ask the opponent for help.",
  "After the segment: do not argue in the spin room about what you should have said — run claims check with staff only.",
];

export const UNIVERSAL_ADVERSITY: string[] = [
  "You are not on trial — you are applying for a service job. Voters reward steadiness more than wit.",
  "If the crowd cheers an attack on you: do not match their energy — lower your voice slightly and pivot to counties.",
  "If Hammer and Packo pile on: agree only on narrow shared facts, then add one fresh line Packo did not say.",
  "If the moderator is sharp: thank them for the question, answer the question asked, not the trap inside it.",
  "If you lose a exchange: win the next one with a shorter answer — long answers look defensive.",
  "Adversity is not personal — it is the job. Clerks watch whether you stay fair under pressure.",
];

export const UNIVERSAL_CULTURE_WAR: string[] = [
  "Culture-war questions are designed to make you defend your identity instead of your plan for the office.",
  "Do not take the bait: no 60-second biography defense, no church debate, no 'always attacking' tone.",
  "Boundary line: 'I am running to run the Secretary of State's office for every voter — let's talk about the acts and the clerks.'",
  "Pivot within 10 seconds to a bill, county burden, or transparency pledge — voters remember the pivot, not the insult.",
  "Never sound partisan while rejecting partisanship — contrast office behavior (rules, education, equal treatment), not voter tribes.",
  "If Hammer uses hot-button words: repeat none of them back — substitute 'election rules' and 'county implementation.'",
  "Packo may amplify culture-war framing to distinguish himself — do not ask him to vote for you; add your own county line.",
];

export const UNIVERSAL_ATTACK_PATTERNS: string[] = [
  "Check my record — he lists bill numbers fast to sound authoritative; you answer with one act + county impact.",
  "Experience equals SOS-ready — he conflates writing law with running 75 counties; you separate service from sponsorship.",
  "Integrity without participation — false choice; you hold both prosecution of fraud and lawful access.",
  "2021 vs 2025 fresh start — continuity trap; pattern of packages, not one bill.",
  "Fraud data dare — ask for statute and conviction context; do not invent numbers.",
  "County champion — he may claim clerk partnership; you ask who funds training and hotlines.",
];

const SURFACE_DEPTH: Record<string, Partial<DebateEncounterDepth>> = {
  hub: {
    whatToExpectPlain:
      "Tonight Hammer will sound confident on bill numbers and 'election security.' He wants you to react emotionally or speak in vague integrity language while he cites acts. Expect a moderator who asks broad SOS questions and may let him interrupt. Your job: stay calm, answer the question asked, add unity and county detail, never end on 'I agree' alone.",
    howHeWillAttack: UNIVERSAL_ATTACK_PATTERNS,
    howToHandleIt: [
      "Open with service frame: SOS is a desk for every county, not a culture-war pulpit.",
      "Pick two anchor bills from the hub drill queue — rehearse act numbers in Claims first.",
      "When he generalizes, use argument-map agree → contrast on implementation → bridge to transparency.",
      "Lean into field-tested themes: accountability, cross-aisle work, non-partisan administration, public education.",
    ],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
    cultureWarDefense: UNIVERSAL_CULTURE_WAR,
  },
  debatePrepPage: {
    whatToExpectPlain:
      "The 28-section packet is your textbook — Hammer has debated for decades; you are building muscle memory. Expect to feel overwhelmed first pass; second pass you own sections 4, 6–8, 19, 27, 28. Each drill-down explains what he will do and what you say standing up.",
    howHeWillAttack: [
      "Rapid bill citations in rebuttal segments",
      "Framing you as inexperienced without naming what SOS actually does",
      "Inviting you to attack Packo or defend biography",
    ],
    howToHandleIt: [
      "Work top-to-bottom once, then only revisit HIGH-risk sections and trap lane for your lead theme.",
      "Use speak-order drills from SOS bank even for bill questions — add fresh line after any agreement.",
      "Staff plays Hammer for one rebuttal per section — timer on 30s answers.",
    ],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
  },
  debateCommand: {
    whatToExpectPlain:
      "Debate command scores tell you what research is ready — not what to say word-for-word. Low scores mean narrow your claims; trap warnings mean open the matching trap lane drill-down before stage.",
    howHeWillAttack: ["Surprise lines from media intake not yet in your packet", "Cross-exam questions on funding gaps"],
    howToHandleIt: [
      "If a lane is BLOCKED on command center: do not use that message on TV.",
      "Use cross-exam bank questions only when you have a verified act anchor.",
      "Pair command center review with film room pivots — clips are staff-only on stage.",
    ],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
  },
  debateWarRoomP4: {
    whatToExpectPlain:
      "Film room is rehearsal, not live playback. You practice pivots from transcripts and clips; Kelly does not play video on stage unless production plans it. Expect Hammer lines from KATV/THV11 to repeat — rehearse your one-sentence pivot.",
    howHeWillAttack: ["Out-of-context clip quotes in opponent ads — not necessarily on stage", "Transcript lines that sound harsher than live delivery"],
    howToHandleIt: [
      "Pick three cross-exam questions and two argument-library bridges — memorize structure, not paragraph.",
      "Staff tracks timestamps; Kelly uses spoken pivot only.",
      "After mock debate, mark which clips need Claims gate before social use.",
    ],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
  },
  "trap-lanes-index": {
    whatToExpectPlain:
      "Trap lanes are chess, not insults. You ask a fair question; he answers into a record voters can check. If he does not bite, take your pivot in one sentence and move on. Six lanes cover record fights, participation, counties, fraud dare, experience, and culture war.",
    howHeWillAttack: [
      "2025 'fresh start' on election law",
      "Integrity vs participation false choice",
      "Clerk partnership claims without funding detail",
      "Fraud statistics without context",
      "Senate experience equals SOS qualification",
      "Biography or partisan bait",
    ],
    howToHandleIt: [
      "Pick 1–2 lanes for tonight's theme — do not run all six in one answer.",
      "Rehearse 45s sample script standing for each chosen lane.",
      "Open full drill-down for culture war even if you hope it does not come up.",
    ],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
    cultureWarDefense: UNIVERSAL_CULTURE_WAR,
  },
  "sos-debate-questions-index": {
    whatToExpectPlain:
      "Moderators ask about the Secretary of State job — access, education, counties, cybersecurity, non-partisan role — not your favorite bill only. Expect three candidates; speak order changes. You must add something new when others agree.",
    howHeWillAttack: [
      "Hammer cites security bills; Packo may sound reform-minded; you may be third with less time",
      "Questions on Civic Index or turnout — verify before citing rank",
    ],
    howToHandleIt: [
      "Rehearse position 2 and 3 even if you expect to speak first.",
      "HIGH probability questions first — unity spine on every answer.",
      "Link to trap lane when question is a record fight disguised as policy.",
    ],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
  },
  "agent-tooling-index": {
    whatToExpectPlain:
      "AI tools give internal drafts only — never read them on stage. Use them night-before to refresh do-not-say and trap warnings; staff verifies every fact in Claims.",
    howHeWillAttack: ["N/A — tooling is prep, not live opponent"],
    howToHandleIt: [
      "Run Kelly pre-stage sequence on iPad: do-not-say → traps → 30/60/90 → rebuttal skeleton.",
      "Discard any line that is not export-ready in Claims.",
    ],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: ["If tool errors on venue Wi‑Fi: use printed SOS bank and trap lane summaries."],
  },
  claims: {
    whatToExpectPlain:
      "Claims ledger is your legal firewall. If a line is not export-ready, treat it as radioactive on stage and on social. Hammer may say things you cannot verify — you do not match unsourced intensity.",
    howHeWillAttack: ["Bold statistics and motive claims without citation"],
    howToHandleIt: [
      "Before stage: staff reads top NEEDS_RESEARCH rows aloud.",
      "On stage: 'I want to cite that correctly' beats guessing.",
      "After stage: log what he said that needs retrieval for rapid response.",
    ],
    ifYouGetHungUp: ["Default safe line: service SOS, 75 counties, published rules, non-partisan administration."],
    handlingAdversity: UNIVERSAL_ADVERSITY,
  },
  kellyDebateCoaching: {
    whatToExpectPlain:
      "Coaching is performance, not policy. Expect nerves — opening and closing are memorized; the middle is modular from the SOS bank. Hammer may talk over your opening; do not speed up to match him.",
    howHeWillAttack: [
      "Talking over your opening",
      "Personal closing bait",
      "Packo alignment to isolate you",
    ],
    howToHandleIt: [
      "Finish opening line even if interrupted — moderator usually restores time.",
      "Check My Record: one bait question, one pivot to implementation.",
      "Closing: unity spine, no new unsourced facts.",
      "Never ask Packo to vote for you on stage.",
    ],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
    cultureWarDefense: UNIVERSAL_CULTURE_WAR,
  },
  "debate-depth-index": {
    whatToExpectPlain:
      "This library is the plain-English layer for debate week. Hammer debates often; you rehearse structure. These pages explain attacks, adversity, culture war, and brain-freeze recovery without jargon.",
    howHeWillAttack: UNIVERSAL_ATTACK_PATTERNS,
    howToHandleIt: [
      "Read topics in order: hammer-attacks → culture-war → if-stuck → adversity → three-way.",
      "Then open trap lane matching your lead theme.",
    ],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
    cultureWarDefense: UNIVERSAL_CULTURE_WAR,
  },
  opponents: {
    whatToExpectPlain:
      "Opponents hub routes you to Hammer research and Packo scaffold. Debate night Kelly stays on hub/prep/SOS bank — staff dives modules here.",
    howHeWillAttack: ["Packo may change emphasis night-of — watch for agreement traps"],
    howToHandleIt: ["Staff monitors Packo lines in spin room", "Kelly uses pre-briefed Packo add-ons from SOS questions only"],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
  },
};

const CATEGORY_SOS_DEPTH: Record<SosDebateQuestionCategory, Partial<DebateEncounterDepth>> = {
  "elections-integrity": {
    whatToExpectPlain: "Moderator wants reassurance on fraud and security without sounding anti-voter. Hammer leads with enforcement bills.",
    howHeWillAttack: ["Stack multiple acts", "Imply opposition is soft on fraud"],
    howToHandleIt: ["Agree on prosecuting real fraud", "Contrast rules that burden lawful participation", "County clerks implement — fund them"],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
  },
  "voter-access": {
    whatToExpectPlain: "Access questions win persuadable voters. Hammer may frame restrictions as 'integrity.'",
    howHeWillAttack: ["Petition and registration friction as minor paperwork"],
    howToHandleIt: ["Name one concrete barrier", "Clerk workload", "Transparency in plain English"],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
  },
  "county-administration": {
    whatToExpectPlain: "Clerks are your validators in the room. Hammer may claim partnership; you ask about unfunded mandates.",
    howHeWillAttack: ["Unfunded mandate minimization"],
    howToHandleIt: ["Who trains", "Who pays hotline", "Equal treatment 75 counties"],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
  },
  "direct-democracy": {
    whatToExpectPlain: "Petition rights are emotional for advocates. Stay factual — bill pattern, not personality.",
    howHeWillAttack: ["'Led the charge' on restrictions — verify before air"],
    howToHandleIt: ["Pattern argument", "One example bill", "Voter participation + integrity together"],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
  },
  "business-services": {
    whatToExpectPlain: "Business filings sound dry — voters still hear competence. Keep SOS as service desk.",
    howHeWillAttack: ["Bureaucracy efficiency boasts"],
    howToHandleIt: ["Online transparency", "Equal service", "Non-partisan administration"],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
  },
  "office-role": {
    whatToExpectPlain: "Role questions separate SOS from legislator. This is your home turf — educate, do not attack.",
    howHeWillAttack: ["Culture-war pulpit framing"],
    howToHandleIt: ["Non-partisan arbiter", "Educate public on rules", "Unity spine"],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
    cultureWarDefense: UNIVERSAL_CULTURE_WAR,
  },
  "experience-readiness": {
    whatToExpectPlain: "Experience trap is likely HIGH probability. He says he wrote the laws; you say who runs them for clerks.",
    howHeWillAttack: ["Check my record", "Years in Senate", "Specialization claims"],
    howToHandleIt: ["Credit Senate service briefly", "Contrast implementation", "Kelly service plan"],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
  },
  "security-cyber": {
    whatToExpectPlain: "Cyber questions sound technical — answer in voter trust language, cite verified status only.",
    howHeWillAttack: ["Fear-forward framing"],
    howToHandleIt: ["Verified protocols", "Clerk support", "No unsourced breach claims"],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
  },
  "three-way-race": {
    whatToExpectPlain: "Three-way means split time and agreement traps. Packo may align with Hammer on access or security.",
    howHeWillAttack: ["Pile-on when you are third", "Packo steals reform lane"],
    howToHandleIt: ["Agree narrow fact", "Fresh county or unity add", "Never ask for Packo vote"],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
  },
  "current-record": {
    whatToExpectPlain: "Your record questions test composure. Answer with service examples, not biography defense.",
    howHeWillAttack: ["Imply inexperience", "2026 runoff margin subtext"],
    howToHandleIt: ["Service frame", "Transparency pledge", "County partnership"],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
    cultureWarDefense: UNIVERSAL_CULTURE_WAR,
  },
};

const TRAP_LANE_DEPTH: Record<string, Partial<DebateEncounterDepth>> = {
  "2021-vs-2025-pivot": {
    whatToExpectPlain:
      "Hammer will say 2025 bills are a fresh start. Voters hear 'new' and assume change. Your job is to show continuity — 2021 six-bill package plus 2025 stack — without listing six acts in one breath if time is short.",
    howHeWillAttack: ["'I fixed it in 2025'", "Imply you do not understand recent law"],
    howToHandleIt: ["Ask what changed for clerks between packages", "One 2021 package label + one 2025 example", "Pivot to funding and training"],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
  },
  "integrity-without-participation": {
    whatToExpectPlain:
      "He sets up a false choice: security OR participation. Most Arkansans want both. You break the binary in one sentence, then county detail.",
    howHeWillAttack: ["'You cannot be soft on fraud'", "Stack enforcement bills without access context"],
    howToHandleIt: ["Agree on prosecuting real fraud", "Name lawful access and clerk burden", "Transparency pledge"],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
  },
  "county-champion": {
    whatToExpectPlain:
      "He may claim clerk partnership. Clerks in the room know unfunded mandates. You ask who pays for training and hotlines — implementation, not slogans.",
    howHeWillAttack: ["Clerk endorsements or anecdotes without funding", "Minimize county costs"],
    howToHandleIt: ["75 counties equal treatment", "Published SOS guidance", "Fund training before new rules"],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
  },
  "fraud-data-dare": {
    whatToExpectPlain:
      "He dares you on fraud numbers or convictions. Do not invent statistics. Ask for statute and verified context; pivot to what SOS does for clerks daily.",
    howHeWillAttack: ["Bold fraud claims", "Challenge your toughness"],
    howToHandleIt: ["Verify in Claims before citing counts", "Prosecute real fraud + lawful access", "Service frame"],
    ifYouGetHungUp: ["Say you will not guess numbers on stage — pattern and clerk support instead"],
    handlingAdversity: UNIVERSAL_ADVERSITY,
  },
  "experience-equals-sos-ready": {
    whatToExpectPlain:
      "Check my record — he lists bills to sound like the only adult in the room. Writing law is not running SOS for 75 counties. Credit Senate service briefly; contrast implementation.",
    howHeWillAttack: ["Years in Senate", "Election specialization claims", "Imply you are not ready"],
    howToHandleIt: ["SOS as service desk", "Kelly plan for clerks and public education", "One act anchor if verified"],
    ifYouGetHungUp: UNIVERSAL_IF_STUCK,
    handlingAdversity: UNIVERSAL_ADVERSITY,
  },
  "culture-war-escalation": {
    whatToExpectPlain:
      "This segment is not about policy — it is about making you angry on camera. Hammer or the moderator may use biography, church, gender, or partisan war words. The audience is watching whether you can lead a statewide office, not win a Twitter fight.",
    howHeWillAttack: [
      "Personal dig disguised as a question",
      "Provocative framing about opponents or faith",
      "Loud tone to bait interruption",
      "Asking you to condemn a group of voters",
    ],
    howToHandleIt: [
      "Finish your current thought if mid-answer — then boundary sentence.",
      "Eyes on moderator when declining bait — not Hammer.",
      "Pivot to acts and clerks within 10 seconds.",
      "Lower voice slightly when he raises his — contrast composure.",
    ],
    ifYouGetHungUp: [
      "Memorized 15s decline script: office for every voter, acts and clerks.",
      "If emotion rises: pause, breathe, one sentence only.",
      "Do not apologize for being a woman or outsider — pivot to service.",
    ],
    handlingAdversity: [
      "Crowd noise is not a scorecard — moderators and undecided voters watch tone.",
      "If he insults: 'I am here to discuss the Secretary of State's office' — repeat max twice, then pivot.",
      "Spin room: do not relitigate biography — stay on substance clips staff verified.",
    ],
    cultureWarDefense: UNIVERSAL_CULTURE_WAR,
  },
};

export function mergeEncounterDepth(
  base: Partial<DebateEncounterDepth> | undefined,
  extra: Partial<DebateEncounterDepth> | undefined,
): DebateEncounterDepth | undefined {
  if (!base && !extra) return undefined;
  return {
    whatToExpectPlain: extra?.whatToExpectPlain ?? base?.whatToExpectPlain ?? "",
    howHeWillAttack: [...(base?.howHeWillAttack ?? []), ...(extra?.howHeWillAttack ?? [])],
    howToHandleIt: [...(base?.howToHandleIt ?? []), ...(extra?.howToHandleIt ?? [])],
    ifYouGetHungUp: [...(base?.ifYouGetHungUp ?? []), ...(extra?.ifYouGetHungUp ?? [])],
    handlingAdversity: [...(base?.handlingAdversity ?? []), ...(extra?.handlingAdversity ?? [])],
    cultureWarDefense: extra?.cultureWarDefense ?? base?.cultureWarDefense,
  };
}

export function getSurfaceEncounterDepth(key: string): Partial<DebateEncounterDepth> | undefined {
  return SURFACE_DEPTH[key];
}

export function getSosCategoryEncounterDepth(category: SosDebateQuestionCategory): Partial<DebateEncounterDepth> {
  return CATEGORY_SOS_DEPTH[category] ?? {};
}

export function getTrapLaneEncounterDepth(laneId: string): Partial<DebateEncounterDepth> | undefined {
  return TRAP_LANE_DEPTH[laneId];
}

const DEFAULT_PREP_DEPTH: Partial<DebateEncounterDepth> = {
  whatToExpectPlain:
    "Hammer will try to pull this section into a bill-number duel or a culture-war detour. Stay in the section's job: educate voters on what this part of prep is for.",
  howHeWillAttack: ["Fast citations", "False either/or", "Implied motive without source"],
  howToHandleIt: ["Direct answer first", "One verified anchor if citing record", "Unity bridge last"],
  ifYouGetHungUp: UNIVERSAL_IF_STUCK,
  handlingAdversity: UNIVERSAL_ADVERSITY,
};

const PREP_SECTION_ENCOUNTER_DEPTH: Record<string, Partial<DebateEncounterDepth>> = {
  strategy: {
    whatToExpectPlain:
      "Hammer opens with confidence on election security and bill authorship. This section orients your whole night — service desk for 75 counties, not a partisan war. Expect interruptions on your opening theme.",
    howHeWillAttack: ["Experience equals SOS", "2025 fresh start framing"],
    howToHandleIt: ["Memorize unity spine", "Pick two anchor bills from question bank", "Link to trap lane if record fight starts"],
  },
  "core-frame": {
    whatToExpectPlain:
      "Your core frame is non-partisan SOS administration — Hammer will test whether you sound like a candidate or a clerk's ally. Stay concrete: phones answered, rules published, counties funded.",
    howHeWillAttack: ["Culture-war bait into biography", "Partisan labels"],
    howToHandleIt: ["Repeat service job frame", "Decline theater within 10 seconds", "Bridge to county example"],
    cultureWarDefense: UNIVERSAL_CULTURE_WAR,
  },
  pillars: {
    whatToExpectPlain:
      "Three pillars hold every answer: accountability, access, education. Hammer may agree on one pillar then attack another — add a fresh implementation line Packo did not use.",
    howHeWillAttack: ["False choice integrity vs participation"],
    howToHandleIt: ["Hold both prosecution and access", "One county detail per pillar"],
  },
  "likely-hammer": {
    whatToExpectPlain:
      "Hammer's likely lines are bill-number fastballs — he sounds authoritative because he cites acts. You answer with one verified anchor plus county impact, not a stack of numbers from memory.",
    howHeWillAttack: UNIVERSAL_ATTACK_PATTERNS,
    howToHandleIt: ["Pre-mark top five acts in Claims", "Agree on narrow fact then contrast implementation"],
  },
  "question-bank": {
    whatToExpectPlain:
      "Moderators pull from SOS job questions — access, cybersecurity, clerks, non-partisan role. Hammer pivots every question toward his sponsorship record; you pivot back to running the office.",
    howHeWillAttack: ["Security bill citations on non-security questions"],
    howToHandleIt: ["Answer the question asked first", "Use speak-order drills from SOS bank"],
  },
  "answer-builder": {
    whatToExpectPlain:
      "Answer builder trains 30-second direct answers — Hammer will talk over your first sentence. Finish the direct answer anyway; moderators usually restore time.",
    howHeWillAttack: ["Interruption during direct answer"],
    howToHandleIt: ["First sentence under 15 words", "Contrast in sentence two", "Bridge in sentence three"],
  },
  rebuttal: {
    whatToExpectPlain:
      "Rebuttal segments feel personal — they are not. Use agree → contrast → bridge; never end on agree alone when Hammer or Packo spoke before you.",
    howHeWillAttack: ["Motive attacks", "Rapid bill list in rebuttal time"],
    howToHandleIt: ["Timer 30s answers", "Staff plays Hammer once per block"],
  },
  drill: {
    whatToExpectPlain:
      "Mock drill is where first-timer nerves peak — better here than on stage. Expect to forget a bill number; practice the safe pivot without inventing stats.",
    howHeWillAttack: ["Surprise lines not in packet"],
    howToHandleIt: ["Run drill with timer and claims gate", "Log surprise lines for retrieval queue"],
  },
  opening: {
    whatToExpectPlain:
      "Opening is memorized — Hammer may interrupt line two. Do not speed up; finish the unity spine. Crowd noise is not a scoreboard.",
    howHeWillAttack: ["Talking over opening", "Personal dig before you finish"],
    howToHandleIt: ["Memorize first and last 20 seconds", "Eye contact with moderator not opponent"],
    handlingAdversity: UNIVERSAL_ADVERSITY,
  },
  closing: {
    whatToExpectPlain:
      "Closing is unity spine only — no new unsourced facts. Hammer may throw a last-second personal attack; do not take the bait in the final 15 seconds.",
    howHeWillAttack: ["Personal closing bait", "Culture-war word in final segment"],
    howToHandleIt: ["Pre-write closing without bill numbers unless verified", "Thank moderator and voters"],
    cultureWarDefense: UNIVERSAL_CULTURE_WAR,
  },
  risk: {
    whatToExpectPlain:
      "Risk meter flags HIGH sections — culture war, fraud dare, experience fight. If risk is HIGH tonight, open that trap lane drill-down even if you hope it does not come up.",
    howHeWillAttack: ["Highest-risk topics clustered late debate"],
    howToHandleIt: ["Review BLOCKED lanes on debate command", "Staff confirms claims tier before HIGH sections"],
  },
  reporter: {
    whatToExpectPlain:
      "Reporter questions are shorter and sharper than moderator questions — answer in one sentence, offer one county detail, stop. Hammer may not get rebuttal time; you still add fresh line if third.",
    howHeWillAttack: ["Gotcha framing on petition or funding gaps"],
    howToHandleIt: ["Research-question framing for CVSGF totals", "No invented statistics"],
  },
  county: {
    whatToExpectPlain:
      "County clerk angle wins clerks in the room — Hammer may claim partnership without funding detail. Ask who pays for training, hotlines, and grant transparency.",
    howHeWillAttack: ["Clerk champion rhetoric without ledger"],
    howToHandleIt: ["Name a county implementation burden", "Clerk-first vocabulary not debate slang"],
  },
  "direct-democracy": {
    whatToExpectPlain:
      "Direct democracy questions invite fraud narratives — move to documented process and lawful access. Do not defend every petition on stage; defend fair rules.",
    howHeWillAttack: ["National fraud anecdotes", "2025 petition cluster citations"],
    howToHandleIt: ["Pair with fraud-data-dare trap lane", "Arkansas convictions context only if verified"],
  },
  "executive-tonight": {
    whatToExpectPlain:
      "Tonight focus narrows prep to three moves — ignore the other 25 sections until after stage. Hammer will broaden every answer; you narrow back to tonight's theme.",
    howHeWillAttack: ["Scope creep into biography or national news"],
    howToHandleIt: ["Three moves on index card", "Staff redirects if Kelly drifts in mock"],
  },
  "argument-map": {
    whatToExpectPlain:
      "Argument map is chess notation for agree-contrast-bridge — Hammer argues from authority; you argue from service outcomes. Map each Hammer theme to one trap lane or SOS question.",
    howHeWillAttack: ["Theme stacking in one answer"],
    howToHandleIt: ["One theme per 30s block", "Cross-link to rebuttal prep scripts"],
  },
  "strengths-ack": {
    whatToExpectPlain:
      "Acknowledging Hammer strengths disarms voters expecting pure attack — keep acknowledgment to one sentence, then contrast on SOS implementation.",
    howHeWillAttack: ["He may demand you list his failures"],
    howToHandleIt: ["Fair strength then county burden contrast", "Never sound sarcastic acknowledging tenure"],
  },
  vulnerabilities: {
    whatToExpectPlain:
      "Vulnerability framing is defensive prep — know what NOT to say aloud. Hammer hunts for contradiction between early interviews and tonight's lines.",
    howHeWillAttack: ["Quote mining from old media"],
    howToHandleIt: ["Run do-not-say list from debate command", "Counsel frame if diligence incomplete"],
  },
  "integrity-2021": {
    whatToExpectPlain:
      "2021 package is Hammer's anchor — he will cite six bills as proof of integrity. You welcome the record then contrast 2025 petition cluster burden on clerks.",
    howHeWillAttack: ["2021 vs 2025 continuity trap"],
    howToHandleIt: ["Open 2021-vs-2025-pivot trap lane", "Verified act numbers only"],
  },
  timeline: {
    whatToExpectPlain:
      "Timeline section stops bill-number duels — show pattern across years instead of one-upping citations. Hammer lists; you narrate county impact over time.",
    howHeWillAttack: ["Chronology speed as dominance"],
    howToHandleIt: ["Two-year pattern max on stage", "Film room for deep chronology staff-side"],
  },
  "theme-matrix": {
    whatToExpectPlain:
      "Theme matrix maps Hammer messages to Kelly responses — if he shifts theme mid-debate, pick the row and deliver the rehearsed pivot.",
    howHeWillAttack: ["Rapid theme switching"],
    howToHandleIt: ["Staff holds matrix print", "Kelly uses one row per answer"],
  },
  "rapid-response": {
    whatToExpectPlain:
      "Rapid response is staff export lane — Kelly does not read locker lines on stage unless VERIFIED in Claims. Expect Hammer surprises not yet in locker.",
    howHeWillAttack: ["Novel statistics in spin room"],
    howToHandleIt: ["Log post-debate for retrieval", "Default to safe service line on stage"],
  },
  "retrieval-queue": {
    whatToExpectPlain:
      "Retrieval queue is staff-only — never read queue items into a mic. Hammer may cite something you cannot verify live; say you will verify rather than guess.",
    howHeWillAttack: ["Dares for immediate numeric answers"],
    howToHandleIt: ["Research-question framing", "Post-debate retrieval within 24h"],
  },
  "citation-discipline": {
    whatToExpectPlain:
      "Citation discipline prevents stage errors — one act, one source, one county example. Hammer stacks acts; you hold one verified anchor per answer.",
    howHeWillAttack: ["Citation volume as intimidation"],
    howToHandleIt: ["Claims gate before every act number", "Plain language if citation forgotten"],
  },
  "media-followup": {
    whatToExpectPlain:
      "Post-debate media is where unsourced lines become headlines — stay on approved internal claims only. Hammer may spin faster; you verify before any clip goes social.",
    howHeWillAttack: ["Spin room pile-on with Packo"],
    howToHandleIt: ["Staff filters media questions", "No new facts in spin room"],
  },
  "county-deep": {
    whatToExpectPlain:
      "County deep dive wins implementation credibility — name clerks' real costs: training, grants, hotlines. Hammer stays abstract on security; you stay specific on service.",
    howHeWillAttack: ["Generic security without county math"],
    howToHandleIt: ["One county example prepared", "CVSGF research-question if totals unknown"],
  },
  "petition-cluster": {
    whatToExpectPlain:
      "2025 petition cluster is Hammer offensive ground — connect questions to Acts 241/768 with verified framing. Do not minimize clerk burden; propose transparent process.",
    howHeWillAttack: ["Fraud justification for every petition bill"],
    howToHandleIt: ["fraud-data-dare trap lane", "Lawful access + prosecute real fraud"],
  },
  "closing-checklist": {
    whatToExpectPlain:
      "Five minutes before stage: checklist only — no new cramming. Hammer's team will be calm; your job is steady breath and first sentence under fifteen words.",
    howHeWillAttack: ["Last-second provocation in green room area"],
    howToHandleIt: ["Verbal checklist with staff", "Water and bathroom before mic"],
    ifYouGetHungUp: ["Default line: service SOS, 75 counties, published rules."],
  },
};

export function getPrepSectionEncounterDepth(sectionId: string): Partial<DebateEncounterDepth> {
  return PREP_SECTION_ENCOUNTER_DEPTH[sectionId] ?? DEFAULT_PREP_DEPTH;
}

/** Merge plain-language depth into operator guides at read time. */
export function applyOperatorGuideDepth(guide: OperatorGuide, key: string): OperatorGuide {
  const depth = getSurfaceEncounterDepth(key);
  if (!depth) return guide;
  const merged = mergeEncounterDepth(
    {
      whatToExpectPlain: guide.whatToExpectPlain,
      howHeWillAttack: guide.howHeWillAttack,
      howToHandleIt: guide.howToHandleIt,
      ifYouGetHungUp: guide.ifYouGetHungUp,
      handlingAdversity: guide.handlingAdversity,
      cultureWarDefense: guide.cultureWarDefense,
    },
    depth,
  );
  if (!merged) return guide;
  return { ...guide, ...merged };
}
