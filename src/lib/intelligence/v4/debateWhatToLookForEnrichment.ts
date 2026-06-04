/**
 * Staff "What to look for" enrichment — substantive findings from record data.
 * Merged into operator guides at read time. OFFENSIVE = Kelly attack lanes; DEFENSIVE = protect Kelly.
 */

import type { OperatorGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";

export type StaffFinding = {
  text: string;
  mode: "offensive" | "defensive" | "verify";
  source?: string;
};

export type WhatToLookForEnrichment = {
  offensive: string[];
  defensive: string[];
  verify: string[];
  debateUse?: string;
};

function f(mode: StaffFinding["mode"], text: string, source?: string): StaffFinding {
  return { mode, text, source };
}

/** Loaded findings keyed by guide id (surface, prep section, workflow href slug). */
export const WHAT_TO_LOOK_FOR_ENRICHMENT: Record<string, WhatToLookForEnrichment> = {
  hub: {
    offensive: [
      "Top theme: petition_gathering + direct_democracy (7 bills in matrix) — pattern argument ready",
      "2021 integrity package (Acts 727–729, 973–974, 1051) vs 2025 stack (Acts 218, 240, 274, 241, 768) — continuity trap",
      "Mock debate drill bills from executive brief — rehearse before any other section",
      "Hammer TBP Jan 2025: clerk partnership pledge — contrast with unfunded 2025 mandates (INTERPRETATION until cited)",
      "THV11 framing: 'led the charge' on petition restrictions — pair with acts, NEEDS_REVIEW on stage",
    ],
    defensive: [
      "Claims needing research count on hub — cut those lines from opening",
      "Archive confidence score — if low, narrow to 2 act anchors only tonight",
      "Do-not-say list alignment with risk section 11",
      "Do not imply video proof — film room clip count may be thin",
    ],
    verify: [
      "Verify each act number on Arkleg before citing on stage",
      "County names in road stories before using on stage",
    ],
    debateUse: "OFFENSIVE: open pattern + 2021/2025 pivot. DEFENSIVE: claims gate + no fake certainty on clips.",
  },
  debatePrepPage: {
    offensive: [
      "Section 19 (2021 package) + section 27 (petition cluster) — debate anchors",
      "Section 4 likely-Hammer + section 16 argument map — rebuttal bridges",
      "SOS expected questions (/admin/intelligence/sos-debate-questions) — 22 speak-order drill-downs",
      "Trap lanes index (/admin/intelligence/trap-lanes) — six full drill-downs",
      "Rebuttal playbook agree/contrast/bridge — use verbatim structure, your voice",
    ],
    defensive: [
      "Sections with empty bullets — do not improvise; use county service frame",
      "Section 11 risk + section 24 citation discipline before stage",
      "Section 28 closing checklist — run 5 min before walk-on",
    ],
    verify: ["Drill-down per section links to claims ledger rows"],
    debateUse: "90 min: sections 4, 6–8, 13, 19, 27, 28 + trap lane for your lead theme.",
  },
  executiveBrief: {
    offensive: [
      "Tonight focus: SOS service desk vs Hammer authorship — three moves memorized",
      "Lead bills: SB584/Act 768 (local initiative), SB207/Act 218, HB1457/Act 444 — pick 2 max on stage",
      "Implementation dare: funding + training + hotline — Hammer has no SOS tenure answer",
    ],
    defensive: [
      "Readiness dimension under 70 — avoid that message lane publicly",
      "If archive confidence low — no quote cards from opposition media without retrieval",
    ],
    verify: ["Three moves screenshot — staff prints if venue blocks devices"],
  },
  debateCommand: {
    offensive: [
      "Cross-exam bank: bill-anchored questions on funding and fraud data (debate command P4)",
      "Argument library: agree integrity goal → contrast implementation → Kelly bridge",
      "Trap warnings in scenario prep — match to trap lane drill-down",
    ],
    defensive: [
      "BLOCKED message lanes — use county partnership frame instead",
      "Empty film room — do not say 'we have video of you saying'",
      "Debate prep brief score under 70 — soften act-heavy attacks",
    ],
    verify: ["Staff headset: confirm act numbers Kelly cites match locker"],
  },
  debateWarRoomP4: {
    offensive: [
      "Cross-exam: 'Which county got funding the month Act 768 passed?'",
      "Cross-exam: 'How many fraud convictions justified Act 241?'",
      "Argument library rows — Hammer line → Kelly bridge pre-written",
      "Social snippets — post-debate only after claims gate",
    ],
    defensive: [
      "Direct clip count zero — reference-only debate clips, not Hammer quotes",
      "Speaker UNKNOWN on legislative chunks — no on-stage attribution",
      "NON_PUBLISHABLE on all P4 outputs",
    ],
    verify: ["One opposition clip quote verbatim before debate if using media line"],
  },
  crossExamBank: {
    offensive: [
      "Ask when Hammer cites bill without county detail — calm tone",
      "Bill anchors: SB584, SB207, HB1457, SB486 (2021 package entry)",
      "Kelly pivot: SOS publishes rules, funds training, answers clerk phone",
    ],
    defensive: [
      "HIGH risk tags — do not ask three questions in one answer",
      "Not prosecutorial tone — voters punish attacking newcomer",
    ],
    verify: ["Press may use adapted questions — Kelly does not ask opponent on stage"],
  },
  argumentMap: {
    offensive: [
      "Integrity lane: agree prosecute fraud → contrast unfunded county implementation",
      "Experience lane: agree Senate years → contrast SOS administers 75 counties",
      "Uniformity lane: agree rules matter → contrast readable rules + clerk partnership",
      "Petition lane: agree security → contrast volunteer burden + Acts 218–768 pattern",
    ],
    defensive: [
      "Never skip agree line — sounds unfair and clip-worthy",
      "Do not invent evidence he may cite — use listed bullets only",
    ],
    verify: ["Write one personal sentence per bridge in Kelly voice"],
  },
  themeMatrix: {
    offensive: [
      "petition_gathering: HB1222, SB207, SB208, SB210, SB211, SB551, SB584 (7 bills)",
      "county_election_administration: HB1457, SB487, SB582, SB294… — clerk burden theme",
      "Say: 'pattern in one session, not one bill' — then name 2 acts",
    ],
    defensive: [
      "Do not read all 7 petition bills aloud — max 3 act numbers per answer",
      "ballot_access overlaps petition — do not double-count as separate attack",
    ],
    verify: ["Click bill from matrix → drill-down before citing provision"],
  },
  timeline: {
    offensive: [
      "2021 cluster: SB486–SB644 → Acts 727–729, 973–974, 1051",
      "2025 cluster: SB207–SB584 petition stack",
      "hammerRole sponsor on petition rows — 'led' language from press, verify",
    ],
    defensive: [
      "Chronology rebuttal only when he narrows to one bill — avoid filibuster of years",
    ],
    verify: ["Pick 3 rows with HIGH source confidence only"],
  },
  billDrilldown: {
    offensive: [
      "Kelly frame vs Hammer frame vs county impact — lead with county",
      "trapSetup on anchor bills — bait/pivot from bill playbook",
      "2021 package badge — link to section 19 narrative",
    ],
    defensive: [
      "Publication risk tag on card — INTERNAL only",
      "Office-stacking research questions — do not state as fact",
    ],
    verify: ["Arkleg enrolled text for high-stakes provisions"],
  },
  claims: {
    offensive: [
      "Green / HUMAN_APPROVED_INTERNAL rows — safe for rehearsal phrasing",
      "Safer wording column vs raw synopsis — use for debate lines",
    ],
    defensive: [
      "REJECTED / DO_NOT_USE — never on stage",
      "NEEDS_REVIEW — research-question framing only",
      "Empty citationAnchorIds — no statistics tonight",
    ],
    verify: ["Run seed-debate-week-claims if ledger empty on deploy"],
  },
  "integrity-2021": {
    offensive: [
      "Six bills: SB486, SB487, SB488, SB582, SB643, SB644 — Acts 727–729, 973–974, 1051",
      "Plain English: enforcement-first, county control, complaint hotline, absentee tightening",
      "Trap lane '2021 vs 2025 pivot' — full drill-down at /trap-lanes/2021-vs-2025-pivot",
      "Kelly contrast line in narrativeArc bullet 7 — SOS implementation partner",
    ],
    defensive: [
      "whenNotToUse: no criminal intent, no stolen election claims",
      "narrativeArc marked INTERPRETATION — verify act text for specifics",
    ],
    verify: ["Memorize six bill numbers OR say 'six-bill 2021 package' if nervous"],
  },
  county: {
    offensive: [
      "County election_administration theme bills — HB1457 poll watchers, SB487 precincts",
      "Message: quorum court + clerk absorb mandates — Hammer authored, SOS should fund",
      "Road story road-01 — Friday mandate, no training (verify county name)",
    ],
    defensive: [
      "Do not claim clerk association endorsement without proof",
      "Unfunded mandate — research-question unless act text verified",
    ],
    verify: ["One verified Arkansas county example if available from trail"],
  },
  "direct-democracy": {
    offensive: [
      "2025 Acts 218, 240, 274, 241, 279, 764, 768 — stack in one session",
      "Trap: fraud data dare + integrity without participation",
      "Kelly: integrity + lawful petition drives together",
    ],
    defensive: [
      "Do not say 'dismantled democracy' without counsel",
      "Volunteer fraud implication — prosecute fraud, not volunteers",
    ],
    verify: ["Act 768 local initiative language on Arkleg before cite"],
  },
  "likely-hammer": {
    offensive: [
      "Expect: check my record, election integrity #1, 16 years, smooth transition (KATV)",
      "Expect: petition fraud prevention, protect constitution",
      "Flip: Check My Record six-beat on coaching page",
    ],
    defensive: [
      "Heritage ranking — verify before repeating opponent claim",
      "Pastor/faith — one sentence respect, pivot to SOS",
    ],
    verify: ["KATV smooth-transition quote in opponent-media-transcripts.json"],
  },
  rebuttal: {
    offensive: [
      "Structure: agree → act or county burden → contrast → bridge to SOS service",
      "Trap lane pivot when he bites on setup question",
    ],
    defensive: [
      "Short sentences — no stacking zingers",
      "End on bridge, not insult",
    ],
    verify: ["Claims on each zinger from drill-down"],
  },
  opening: {
    offensive: [
      "30s offensive script on coaching: clerks, Hammer wrote law, ask about acts",
      "Optional: direct democracy values if petition Q likely",
    ],
    defensive: [
      "No opponent names first 15 seconds in warm open",
      "No unverified act stack in 30s open",
    ],
    verify: ["Choose warm vs offensive open based on moderator format"],
  },
  risk: {
    offensive: [],
    defensive: [
      "No motive attacks (corrupt, stolen) without claims approval",
      "No fraud statistics without conviction data",
      "Hub needs-research count = hard stop list",
      "Personal family attacks off limits",
    ],
    verify: ["Staff reads risk bullets aloud before walk-on"],
  },
  "petition-cluster": {
    offensive: [
      "Matrix bills: SB207, SB208, SB210, SB211, SB551, SB584 + HB1222",
      "Hammer sponsor on each — pattern not accident",
      "Trap: integrity without participation",
    ],
    defensive: [
      "One example bill for 60s answer — not seven acts in one breath",
    ],
    verify: ["directDemocracyConcerns bullets on each bill page"],
  },
  "debate-depth-index": {
    offensive: [
      "Read hammer-attacks then culture-war before mock debate",
      "Memorize 15s decline script from culture-war topic page",
      "if-stuck recovery lines — pause, moderator eyes, safe SOS sentence",
    ],
    defensive: [
      "Depth blocks are not new facts — Claims gate still applies",
      "Do not read paragraphs on stage — internalize structure",
    ],
    verify: ["Culture-war Civic Index lines — claims before air"],
    debateUse: "Hub + every drill-down now shows expect/attack/handle/stuck blocks.",
  },
  "agent-tooling-index": {
    offensive: [
      "Kelly pre-stage sequence: do-not-say → trap detector → 30/60/90 → rebuttal builder",
      "Staff T-24h: source-gap → claim-strength → do-not-say → bill questions",
      "Three-way sequence: counterargument → bridge lines → vulnerability rank",
    ],
    defensive: [
      "Tool output is INTERNAL_DRAFT — never read on stage",
      "LLM queue drafts require NSI-12 review before adaptation",
      "Run trap detector before mock debate, not during live segment",
    ],
    verify: ["Readiness panel: export-ready claims count before headset", "Each run ends in Claims gate for any new line"],
    debateUse: "iPad quick tools mirror pre-stage sequence — same API as this hub.",
  },
  "sos-debate-questions-index": {
    offensive: [
      "LEAN IN: transparency, accountability, work across aisle to unite — tested GREAT in independent + Republican rooms",
      "Non-partisan administration + SOS educates the public — not culture-war pulpit",
      "Arkansas Civic Index last-in-nation — accountability on administration (verify before rank on TV)",
      "HIGH topics: civic education drill-down, turnout, non-partisan arbiter, opening/closing with unity spine",
    ],
    defensive: [
      "Never stop at 'I agree' — add unity fresh-add or Civic Index education line",
      "Do not sound partisan while attacking division — contrast office behavior, not voter tribes",
      "Do not ask Packo to vote for Kelly on stage",
    ],
    verify: [
      "Arkansas Civic Index source/year/metric — claims gate before 'last in country'",
      "THV11 'led the charge' and fraud conviction counts — NEEDS_REVIEW before air",
    ],
    debateUse: "Rehearse 2nd and 3rd position even if you expect to speak first — order changes mid-debate.",
  },
  "trap-lanes-index": {
    offensive: [
      "Lane 1: 2021 vs 2025 — six acts listed in drill-down",
      "Lane 2: integrity + participation false choice",
      "Lane 4: fraud data dare — conviction question",
      "Lane 5: experience = SOS-ready — Check My Record",
    ],
    defensive: [
      "Lane 6: culture-war — decline bait, 15s pivot",
      "Do not coordinate Packo vote on stage",
    ],
    verify: ["Each lane has claimsGate on drill-down page"],
    debateUse: "Pick ONE trap lane per debate segment — do not run all six in one answer.",
  },
  strategy: {
    offensive: [
      "Offensive constitution on coaching page — play the hand, not the courtroom",
      "Packo geometry: anything-but-Hammer without naming Libertarian on stage",
      "Lead with Check My Record when he invites it — six-beat on narrative control panel",
    ],
    defensive: [
      "Educate frame beats zinger stacking — one act per answer max",
      "Do not interrupt seasoned opponent — clip risk",
    ],
    verify: ["Confirm debate format time limits before choosing 30s vs 60s open"],
  },
  rehearsalDeck: {
    offensive: [
      "Drill queue bills from hub — each card ties to act + county impact",
      "30s card: pattern + one act; 60s: add road story if verified",
    ],
    defensive: ["HIGH risk cards — run twice, cut zinger if claims amber"],
    verify: ["Act numbers on cards match bill drill-down before stage"],
  },
  scenarioSimulation: {
    offensive: [
      "Trap lane match: when scenario text mirrors lane, open drill-down script",
      "Cross-exam from P4 when scenario is implementation/funding",
    ],
    defensive: ["whatNotToDo lines are hard stops — not suggestions"],
    verify: ["Linked bills in scenario exist in bill index"],
  },
  opponentRecord: {
    offensive: [
      "Bill index 29 rows — filter petition_gathering theme for debate packet",
      "2021 package JSON linked from command center",
      "Video archive room — KATV smooth transition, THV11 petition (NEEDS_REVIEW)",
    ],
    defensive: ["Gap count — Kelly avoids OPEN topics on stage"],
    verify: ["Theme matrix duplicate matches hub — same top row"],
  },
  closing: {
    offensive: [
      "Close on SOS service vision — clerks, hotline, published rules",
      "Optional: one act anchor if you won record fight — not a stack",
    ],
    defensive: ["No final zinger on Hammer person — job vs record only"],
    verify: ["Section 28 checklist + three moves from executive brief"],
  },
  closingChecklist: {
    offensive: ["Three moves memorized in Kelly voice", "One trap lane script rehearsed 45s"],
    defensive: ["Do-not-say from hub risk", "NOT_READY claims list reviewed"],
    verify: ["Staff verbal checklist 5 min before walk-on"],
  },
  intelligenceGaps: {
    offensive: [],
    defensive: [
      "OPEN gaps = research-question framing only",
      "HIGH priority — staff retrieval before next public event",
    ],
    verify: ["recommendedHumanAction assigned owner"],
  },
  debateProfile: {
    offensive: [
      "High-probability lanes: integrity, experience, uniformity — map to argument map",
      "Check My Record flip when experience lane fires",
    ],
    defensive: ["Time limits per segment — do not over-answer 30s blocks"],
    verify: ["Educate vs attack framing in profile markdown"],
  },
  contrastVsKelly: {
    offensive: [
      "Author vs administrator — Hammer wrote; SOS implements",
      "County partnership vs unfunded mandate — HB1457 / Act 444 examples",
    ],
    defensive: ["Evidence status per frame — INTERPRETATION stays internal"],
    verify: ["Safer contrast wording column before TV"],
  },
  strengthsWeaknesses: {
    offensive: [
      "Acknowledge tenure then pivot: what kind of SOS (coaching script)",
      "debateUsefulness HIGH vulnerabilities only with saferWording",
    ],
    defensive: ["Never improvise fraud or motive lines"],
    verify: ["VERIFIED_FACT strengths only on stage"],
  },
  actionQueue: {
    offensive: [
      "Debate prep action type — assign Debate Prep owner before stage",
      "Citation review rows — close before export-ready count rises",
    ],
    defensive: [
      "Never auto-execute — status changes are human-only",
      "502 fix: page never runs 60s sync on Netlify — use persisted queue",
    ],
    verify: ["Each row has recommendedNextStep + governance warnings"],
  },
};

const WORKFLOW_HREF_KEYS: Record<string, string> = {
  "/admin/intelligence": "hub",
  "/admin/intelligence/kim-hammer/debate-prep": "debatePrepPage",
  "/admin/intelligence/debate-command": "debateCommand",
  "/admin/intelligence/kim-hammer": "opponentRecord",
  "/admin/intelligence/claims": "claims",
  "/admin/intelligence/action-queue": "actionQueue",
  "/admin/intelligence/trap-lanes": "trap-lanes-index",
  "/admin/intelligence/sos-debate-questions": "sos-debate-questions-index",
  "/admin/intelligence/agent-tooling": "agent-tooling-index",
  "/admin/intelligence/debate-depth": "debate-depth-index",
  "/admin/intelligence/kelly-debate-coaching": "kellyDebateCoaching",
  "/admin/intelligence/opponents": "opponents",
  "/admin/intelligence/film-room": "debateWarRoomP4",
};

/** Map surface / prep ids to enrichment keys when names differ. */
const ENRICHMENT_KEY_ALIASES: Record<string, string> = {
  integrity2021: "integrity-2021",
  "theme-matrix": "themeMatrix",
  "argument-map": "argumentMap",
  "likely-args": "likely-hammer",
  "executive-tonight": "executiveBrief",
  "county-deep": "county",
  "closing-checklist": "closing",
  "citation-discipline": "claims",
  "retrieval-queue": "gaps",
  "media-followup": "reporter",
  "debate-profile": "debateProfile",
  "rapid-response": "rapidResponse",
  "strengths-ack": "strengthsWeaknesses",
  vulnerabilities: "strengthsWeaknesses",
  contrast: "contrastVsKelly",
  themes: "themeMatrix",
  gaps: "intelligenceGaps",
  kh3: "backgroundDeep",
  "question-bank": "crossExamBank",
  "core-frame": "contrastVsKelly",
  drill: "rehearsalDeck",
  "likely-hammer": "likely-hammer",
};

export function getWhatToLookForEnrichment(key: string): WhatToLookForEnrichment | undefined {
  const resolved = ENRICHMENT_KEY_ALIASES[key] ?? key;
  return WHAT_TO_LOOK_FOR_ENRICHMENT[resolved];
}

export function enrichOperatorGuide(guide: OperatorGuide, key: string): OperatorGuide {
  const resolvedKey = ENRICHMENT_KEY_ALIASES[key] ?? key;
  const extra = getWhatToLookForEnrichment(resolvedKey);
  if (!extra) return guide;

  const merged = [
    ...guide.whatToLookFor,
    ...extra.offensive.map((t) => `[OFFENSE] ${t}`),
    ...extra.defensive.map((t) => `[DEFENSE] ${t}`),
    ...extra.verify.map((t) => `[VERIFY] ${t}`),
  ];
  const deduped = [...new Set(merged)];

  const howToUseInDebate = extra.debateUse
    ? `${guide.howToUseInDebate} ${extra.debateUse}`
    : guide.howToUseInDebate;

  return {
    ...guide,
    whatToLookFor: deduped,
    howToUseInDebate,
  };
}

export function enrichGuideByHref(guide: OperatorGuide, href: string): OperatorGuide {
  const key = WORKFLOW_HREF_KEYS[href];
  return key ? enrichOperatorGuide(guide, key) : guide;
}

/** Flat list for trap lane drill-down pages */
export function getTrapLaneStaffFindings(laneId: string): WhatToLookForEnrichment | undefined {
  const map: Record<string, WhatToLookForEnrichment> = {
    "2021-vs-2025-pivot": {
      offensive: [
        "Hammer will say 2025 is fresh start — cite 2021 Acts 727–729 + 2025 Acts 218–768",
        "Ask: what changed for clerks between packages — funding line",
        "Sample scripts in drill-down — rehearse 45s pivot",
      ],
      defensive: [
        "Do not list six 2021 bills if time short — say 'six-bill package'",
        "No 'always attacking' tone",
      ],
      verify: ["2021 package JSON: kim-hammer-kh0b-2021-integrity-foundation.json"],
      debateUse:
        "OFFENSIVE: bait 2025 fresh-start → six-bill 2021 + 2025 stack continuity. DEFENSIVE: one package label if time short.",
    },
    "integrity-without-participation": {
      offensive: [
        "Force binary break: prosecute fraud AND protect lawful circulators",
        "Acts 241 fraud justification question",
        "Packo may agree on access — narrow to who administers",
      ],
      defensive: ["Do not say dismantled democracy", "One road story max 15s"],
      verify: ["Acts 218, 240, 241, 274, 768"],
      debateUse:
        "OFFENSIVE: break false choice — fraud prosecution + lawful circulators. DEFENSIVE: no dismantled-democracy rhetoric.",
    },
    "county-champion": {
      offensive: [
        "Clerk association endorsement question on Act 350",
        "Training module question for Act 444",
        "Kelly hotline + training calendar pledge",
      ],
      defensive: ["No fake clerk quote without permission"],
      verify: ["HB1457 / Act 444 poll watcher provisions"],
      debateUse:
        "OFFENSIVE: clerk training + hotline pledge vs unfunded mandates. DEFENSIVE: no endorsement claims without proof.",
    },
    "fraud-data-dare": {
      offensive: [
        "Five-year conviction count question",
        "Act 768 documented local petition problem question",
        "THV11 'led the charge' only if verified",
      ],
      defensive: ["No national fraud stories — Arkansas data only"],
      verify: ["Fraud cases per act — staff research queue"],
      debateUse:
        "OFFENSIVE: conviction count dare + Act 768 problem question. DEFENSIVE: Arkansas data only — no national anecdotes.",
    },
    "experience-equals-sos-ready": {
      offensive: [
        "Welcome Check My Record — verified Arkleg",
        "Author vs administrator frame",
        "Full 60s script on coaching page",
      ],
      defensive: ["No résumé invention", "One Hammer name per answer"],
      verify: ["Act list night-before with counsel"],
      debateUse:
        "OFFENSIVE: welcome Check My Record — author vs administrator + coaching six-beat. DEFENSIVE: one Hammer name per answer.",
    },
    "culture-war-escalation": {
      offensive: ["15s decline + acts/counties pivot"],
      defensive: [
        "No gender weapon",
        "No interrupting",
        "No finger point",
        "Feet planted, eyes moderator",
      ],
      verify: [],
      debateUse:
        "OFFENSIVE: 15s decline then acts/counties. DEFENSIVE: no gender weapon; eyes on moderator; Packo not on stage.",
    },
  };
  return map[laneId];
}
