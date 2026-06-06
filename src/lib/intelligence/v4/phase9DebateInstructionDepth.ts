/**
 * Phase 9 — Debate instruction bridge: dossier research corpus → prep, traps, SOS questions.
 */
import type { SosDebateQuestionCategory } from "@/lib/intelligence/v4/sosDebateQuestionTypes";

export type Phase9PrepInstructionOverlay = {
  dossierSectionIds: string[];
  additionalRehearsalSteps: string[];
  additionalSetupMoves: string[];
  additionalModeratorQuestions: string[];
  clerkRoomBridge: string;
  accaPanelNote: string;
};

export type Phase9TrapInstructionOverlay = {
  dossierSectionIds: string[];
  clerkRoomScript: string;
  additionalRehearsalSteps: string[];
  accaPanelNote: string;
};

export type Phase9SosInstructionOverlay = {
  dossierSectionIds: string[];
  dossierBriefingHook: string;
  additionalRehearsalSteps: string[];
};

export const PHASE9_PREP_SECTION_IDS = [
  "strategy",
  "core-frame",
  "pillars",
  "likely-hammer",
  "question-bank",
  "answer-builder",
  "rebuttal",
  "drill",
  "opening",
  "closing",
  "risk",
  "reporter",
  "county",
  "direct-democracy",
  "executive-tonight",
  "argument-map",
  "strengths-ack",
  "vulnerabilities",
  "integrity-2021",
  "timeline",
  "theme-matrix",
  "rapid-response",
  "retrieval-queue",
  "citation-discipline",
  "media-followup",
  "county-deep",
  "petition-cluster",
  "closing-checklist",
] as const;

const DEFAULT_CLERK_BRIDGE =
  "Clerk pivot: cite published rules, training calendar, and hotline — pull from kelly-sos-office-overview and county-deep dossier sections. Never mock county staffing pain.";

const DEFAULT_ACCA_NOTE =
  "ACCA Mountain View Jun 11: curious tone, pass mic cleanly, max three trap questions — see phase8AccaPanelOperatorRunbook before panel.";

function prep(
  dossierSectionIds: string[],
  rehearsal: string[],
  extras?: Partial<Phase9PrepInstructionOverlay>,
): Phase9PrepInstructionOverlay {
  return {
    dossierSectionIds,
    additionalRehearsalSteps: rehearsal,
    additionalSetupMoves: extras?.additionalSetupMoves ?? [],
    additionalModeratorQuestions: extras?.additionalModeratorQuestions ?? [],
    clerkRoomBridge: extras?.clerkRoomBridge ?? DEFAULT_CLERK_BRIDGE,
    accaPanelNote: extras?.accaPanelNote ?? DEFAULT_ACCA_NOTE,
  };
}

/** Section-specific dossier crosswalks — every prep section gets ≥2 dossier anchors. */
export const PHASE9_PREP_INSTRUCTION: Record<string, Phase9PrepInstructionOverlay> = {
  strategy: prep(
    ["kelly-sos-office-overview", "kelly-debate-credential-intro", "kelly-experience-office-crosswalk"],
    [
      "Read kelly-debate-credential-intro researchDepth aloud; mark any NEEDS_REVIEW facts before stage.",
      "Rehearse Experience → Skill → Office in 45s using kelly-30-second-bio narrative — no résumé dates without claims gate.",
      "Staff interrupts twice with Hammer tenure bait; Kelly pivots to administrator frame from kelly-experience-office-crosswalk.",
    ],
    {
      additionalModeratorQuestions: [
        "Why should voters trust a first-time debater to run statewide elections?",
        "How is Secretary of State different from writing election law in the Senate?",
      ],
    },
  ),
  "core-frame": prep(
    ["kelly-sos-office-overview", "kelly-public-trust-stewardship"],
    [
      "Map each core frame sentence to one SOS duty in kelly-sos-office-overview plainEnglishWalkthrough.",
      "Practice depoliticized service close from kelly-public-trust-stewardship — no partisan bait.",
    ],
  ),
  pillars: prep(
    ["kelly-organizational-leadership", "kelly-civic-education", "kelly-rural-arkansas"],
    [
      "One pillar per dossier lane: leadership, civic education, rural — each gets a county user example.",
      "Timer drill: 20s per pillar, then bridge to all seventy-five counties.",
    ],
  ),
  "likely-hammer": prep(
    ["hammer-2021-six-bill-deep", "hammer-background-business-pastoral"],
    [
      "Tier-verify each Hammer line in claims ledger before rehearsing agree-then-contrast.",
      "Never attack pastoral identity — pivot to implementation from hammer-2021-six-bill-deep sourced facts.",
    ],
    {
      additionalSetupMoves: [
        "Pre-read CVSGF and poll-watcher statute authorship in opponent dossier — claims gate bill numbers.",
      ],
    },
  ),
  "question-bank": prep(
    ["kelly-next-prep-modules", "hammer-2021-six-bill-deep"],
    [
      "Link each anticipated moderator question to one bill playbook + one dossier section.",
      "Run five-question lightning round with staff playing moderator.",
    ],
  ),
  "answer-builder": prep(
    ["kelly-experience-office-crosswalk", "kelly-road-stories-fieldbook"],
    [
      "Every answer: acknowledge → SOS duty → one road story from kelly-road-stories-fieldbook → measurable follow-through.",
      "Penalize answers longer than 60s without a county example.",
    ],
  ),
  rebuttal: prep(
    ["kelly-public-record-defensive", "hammer-2021-six-bill-deep"],
    [
      "Rehearse agree-then-contrast under interruption — kelly-public-record-defensive for LEARNS-CAPES pivots.",
      "Staff logs any improvised stat; claims gate before next rep.",
    ],
  ),
  drill: prep(
    ["kelly-next-prep-modules", "kelly-debate-credential-intro"],
    [
      "Mock debate: 3 rounds × 90s — opening, rebuttal, closing using dossier scripts only.",
      "Debrief: which lines lacked sourced facts in researchDepth panels?",
    ],
  ),
  opening: prep(
    ["kelly-30-second-bio", "kelly-debate-credential-intro"],
    [
      "Opening under 75 words — pull from kelly-30-second-bio narrativeOverview, not campaign website copy.",
      "End with clerk partnership pledge + published rules commitment.",
    ],
  ),
  closing: prep(
    ["kelly-public-trust-stewardship", "kelly-sos-office-overview"],
    [
      "Closing: trust operator frame — elections, filings, records, county support — one sentence each.",
      "Final line names one day-one action with a published deadline.",
    ],
  ),
  risk: prep(
    ["kelly-public-record-defensive", "kelly-family-stewardship"],
    [
      "Risk meter: flag any line that triggers culture-war escalation — use culture-war trap lane pivot.",
      "Defensive dossier sections are staff-read; Kelly rehearses pivots only.",
    ],
  ),
  reporter: prep(
    ["kelly-road-stories-fieldbook", "kelly-rural-arkansas"],
    [
      "Reporter follow-up: one road story + one rural Arkansas fact from dossier sourcedFacts.",
      "Never speculate on opponent motives — stay on SOS service.",
    ],
  ),
  county: prep(
    ["kelly-sos-office-overview", "kelly-road-stories-fieldbook", "kelly-experience-office-crosswalk"],
    [
      "County section is ACCA preview — rehearse with clerk-room vocabulary from acca-summer-conference depth.",
      "Pair Act 350 burden with training calendar + hotline solution — not legal overreach.",
    ],
    {
      clerkRoomBridge:
        "Lead with clerk partnership: training dollars, grant ledger publication, Monday-morning guidance when statutes change.",
      additionalModeratorQuestions: [
        "What will you do differently for county clerks on day one?",
        "How will counties implement new mandates without unfunded burden?",
      ],
    },
  ),
  "direct-democracy": prep(
    ["packo-economist-platform-deep", "kelly-civic-education"],
    [
      "Three-way geometry: respect Pakko reform ideas; supply SOS operational detail Hammer cannot from Senate.",
      "Petition cluster questions → lawful process + transparent guidance from kelly-civic-education.",
    ],
  ),
  "executive-tonight": prep(
    ["kelly-debate-credential-intro", "kelly-next-prep-modules"],
    [
      "Tonight focus: one message only — administrator readiness for seventy-five counties.",
      "No new research after T-2 hours — dossier sections already claims-gated.",
    ],
  ),
  "argument-map": prep(
    ["kelly-experience-office-crosswalk", "hammer-2021-six-bill-deep"],
    [
      "Argument map: Kelly claim → Hammer likely response → dossier-sourced contrast → bridge to SOS duty.",
      "Visual map on iPad in staff mode only — not on stage.",
    ],
  ),
  "strengths-ack": prep(
    ["hammer-background-business-pastoral", "kelly-debate-credential-intro"],
    [
      "Acknowledge one Hammer strength (election-law focus) in under 12 seconds before contrast.",
      "Fair acknowledgment builds moderator trust — then administrator pivot.",
    ],
  ),
  vulnerabilities: prep(
    ["kelly-public-record-defensive", "kelly-family-stewardship"],
    [
      "Vulnerability framing: name concern → boundary → SOS solution — never defensive rambling.",
      "Rehearse LEARNS-CAPES pivot from kelly-public-record-defensive fieldResearchNotes.",
    ],
  ),
  "integrity-2021": prep(
    ["hammer-2021-six-bill-deep", "kelly-sos-office-overview"],
    [
      "2021 package: verify primary vs co-sponsor in claims ledger before citing bill numbers.",
      "Contrast: senator writes rules → secretary administers service with published guidance.",
    ],
  ),
  timeline: prep(
    ["hammer-2021-six-bill-deep", "kelly-career-timeline-deep"],
    [
      "Timeline answers: one Kelly career beat + one Hammer legislative cluster — both claims-gated.",
      "Avoid chronological filibuster — voters want forward-looking SOS plan.",
    ],
  ),
  "theme-matrix": prep(
    ["kelly-community-building", "kelly-leadership-development"],
    [
      "Theme matrix: map Hammer themes to Kelly SOS counter-themes using dossier experienceHighlights.",
      "Staff tracks which themes Kelly has already used — no repetition in closing hour.",
    ],
  ),
  "rapid-response": prep(
    ["kelly-next-prep-modules", "kelly-road-stories-fieldbook"],
    [
      "Rapid response locker: three pre-approved 15s pivots from dossier howToUseInDebate arrays.",
      "No live retrieval on stage — Kelly has memorized pivots only.",
    ],
  ),
  "retrieval-queue": prep(
    ["kelly-next-prep-modules", "kelly-public-record-defensive"],
    [
      "Staff retrieval queue is never read aloud — Kelly uses rehearsed pivots only.",
      "Post-debate: promote verified lines to Field Book within 24 hours.",
    ],
  ),
  "citation-discipline": prep(
    ["kelly-public-record-defensive", "hammer-2021-six-bill-deep"],
    [
      "Citation drill: every number must trace to researchDepth.sourcedFacts or claims ledger tier.",
      "Practice saying 'I will verify that figure before stating it publicly' when uncertain.",
    ],
  ),
  "media-followup": prep(
    ["kelly-road-stories-fieldbook", "kelly-rural-arkansas"],
    [
      "Post-debate media: one road story + one SOS duty — no opponent pile-on.",
      "Capture verbatim quotes for claims ledger within 2 hours.",
    ],
  ),
  "county-deep": prep(
    ["kelly-road-stories-fieldbook", "kelly-sos-office-overview", "kelly-experience-office-crosswalk"],
    [
      "County deep dive: overtime strain stories from road-05/road-06 with SOS training-calendar solution.",
      "This section is the ACCA panel backbone — rehearse with clerk audience in mind.",
    ],
    {
      clerkRoomBridge:
        "When clerks describe unfunded mandates, agree on burden, then publish-the-ledger + hotline + training cadence.",
    },
  ),
  "petition-cluster": prep(
    ["packo-economist-platform-deep", "kelly-civic-education"],
    [
      "Petition cluster: lawful access frame from kelly-civic-education — no minimizing clerk workload.",
      "If Pakko validates burden frame, Kelly adds SOS implementation detail.",
    ],
  ),
  "closing-checklist": prep(
    ["kelly-30-second-bio", "kelly-next-prep-modules"],
    [
      "Five minutes before stage: mental print only — opening sentence, one clerk pledge, one trust close.",
      "Default if stuck: 'I am running to administer elections fairly in all seventy-five counties.'",
    ],
  ),
};

export const PHASE9_TRAP_INSTRUCTION: Record<string, Phase9TrapInstructionOverlay> = {
  "2021-vs-2025-pivot": {
    dossierSectionIds: ["hammer-2021-six-bill-deep", "kelly-experience-office-crosswalk"],
    clerkRoomScript:
      "Senator Hammer and I both want secure elections. My question is whether counties received training support when each new mandate landed — published ledgers and a hotline clerks can reach.",
    additionalRehearsalSteps: [
      "Rehearse setup question from ACCA runbook step 4 — curious tone, not prosecution.",
      "If Hammer cites 2021 package, agree on intent, pivot to 2023/2025 implementation burden with sourced facts.",
    ],
    accaPanelNote: "Max one trap in clerk room — voters punish prosecutorial tone at continuing-education events.",
  },
  "integrity-without-participation": {
    dossierSectionIds: ["kelly-civic-education", "kelly-public-trust-stewardship"],
    clerkRoomScript:
      "Integrity and participation are not opposites — my job is making lawful pathways clear so every eligible voter can participate with confidence.",
    additionalRehearsalSteps: [
      "Bridge to Stand Up Arkansas civic education work — then SOS neutral training obligation.",
      "Claims gate any voter-turnout statistics before stage use.",
    ],
    accaPanelNote: "Pakko may echo participation frame — Kelly adds administrator detail, not third-candidate attack.",
  },
  "county-champion": {
    dossierSectionIds: ["kelly-road-stories-fieldbook", "kelly-sos-office-overview"],
    clerkRoomScript:
      "Clerks need a Secretary of State who publishes guidance on Monday morning, not just solidarity rhetoric on Saturday.",
    additionalRehearsalSteps: [
      "Pre-read hammer-traps-clerk-room ACCA section for Hammer's top three clerk lines.",
      "Agree-then-contrast: training budgets, grant ledgers, poll-watcher training ownership.",
    ],
    accaPanelNote: "Primary ACCA trap lane — rehearse before Jun 11 panel.",
  },
  "fraud-data-dare": {
    dossierSectionIds: ["hammer-2021-six-bill-deep", "kelly-public-trust-stewardship"],
    clerkRoomScript:
      "If there is evidence of fraud, prosecute it — and publish the data voters can verify. My focus is making lawful processes work in all seventy-five counties.",
    additionalRehearsalSteps: [
      "Never dare without sourced fraud statistics — use claims gate or decline to cite.",
      "Pivot to transparent ledgers and clerk hotline accountability.",
    ],
    accaPanelNote: "ES&S platinum sponsor room — no vendor bashing; integrity + transparency framing.",
  },
  "experience-equals-sos-ready": {
    dossierSectionIds: ["kelly-organizational-leadership", "kelly-experience-office-crosswalk"],
    clerkRoomScript:
      "Senate experience writing law is valuable — administering it fairly for seventy-five counties every day is a different job, and that is the job I am running for.",
    additionalRehearsalSteps: [
      "Fair acknowledge tenure in one sentence — then Verizon/Rock Dental → SOS process reliability.",
      "Rehearse under 12-second pivot per phase9DebateCoachingRunbook step 5.",
    ],
    accaPanelNote: "Most likely Hammer frame in three-way panel — Kelly stays calm, not defensive.",
  },
  "culture-war-escalation": {
    dossierSectionIds: ["kelly-public-record-defensive", "kelly-family-stewardship"],
    clerkRoomScript:
      "I am not here to fight culture wars — I am here to run elections, filings, and records access fairly for every Arkansas voter.",
    additionalRehearsalSteps: [
      "LEARNS-CAPES pivot from kelly-public-record-defensive — lawful engagement history → neutral SOS training.",
      "Never attack faith, family, or personal identity — job-fit contrast only.",
    ],
    accaPanelNote: "If Hammer escalates, Kelly drops voice half a level and returns to SOS duties list.",
  },
};

export const PHASE9_SOS_CATEGORY_INSTRUCTION: Record<SosDebateQuestionCategory, Phase9SosInstructionOverlay> = {
  "elections-integrity": {
    dossierSectionIds: ["kelly-sos-office-overview", "hammer-2021-six-bill-deep"],
    dossierBriefingHook:
      "Anchor integrity answers in kelly-public-trust-stewardship + hammer-2021-six-bill-deep sourced facts — claims gate all bill numbers.",
    additionalRehearsalSteps: [
      "30s direct answer names one SOS action + one verification mechanism.",
      "Link to fraud-data-dare trap lane if Hammer escalates.",
    ],
  },
  "voter-access": {
    dossierSectionIds: ["kelly-civic-education", "kelly-rural-arkansas"],
    dossierBriefingHook: "Participation frame from kelly-civic-education — plain-language lawful pathways.",
    additionalRehearsalSteps: ["Avoid partisan turnout rhetoric — clerk-neutral vocabulary."],
  },
  "county-administration": {
    dossierSectionIds: ["kelly-road-stories-fieldbook", "kelly-sos-office-overview"],
    dossierBriefingHook: "County answers pull from kelly-road-stories-fieldbook + county-deep prep section.",
    additionalRehearsalSteps: ["Name training calendar, hotline, and published grant ledger in every county answer."],
  },
  "direct-democracy": {
    dossierSectionIds: ["packo-economist-platform-deep", "kelly-civic-education"],
    dossierBriefingHook: "Three-way: respect Pakko reform ideas; Kelly supplies SOS operational detail.",
    additionalRehearsalSteps: ["Petition cluster prep section is mandatory pre-read."],
  },
  "business-services": {
    dossierSectionIds: ["kelly-sos-office-overview", "kelly-organizational-leadership"],
    dossierBriefingHook: "Business filings lane in kelly-sos-office-overview — reliability and predictable guidance.",
    additionalRehearsalSteps: ["Translate Verizon/Rock Dental into filing-system reliability language."],
  },
  "office-role": {
    dossierSectionIds: ["kelly-sos-office-overview", "kelly-debate-credential-intro"],
    dossierBriefingHook: "Experience → Skill → Office crosswalk — senator writes, secretary administers.",
    additionalRehearsalSteps: ["Rehearse four-function SOS map in under 45 seconds."],
  },
  "experience-readiness": {
    dossierSectionIds: ["kelly-experience-office-crosswalk", "kelly-career-timeline-deep"],
    dossierBriefingHook: "Career timeline deep section + experience-office crosswalk for readiness answers.",
    additionalRehearsalSteps: ["Fair acknowledge Hammer tenure; pivot to management systems."],
  },
  "security-cyber": {
    dossierSectionIds: ["kelly-sos-office-overview", "kelly-public-trust-stewardship"],
    dossierBriefingHook: "VVSG and equipment questions — defer technical claims to verified corpus; boundary on SOS authority.",
    additionalRehearsalSteps: ["Link to election-equipment-vvsg hub for staff research; Kelly uses plain-language trust frame."],
  },
  "three-way-race": {
    dossierSectionIds: ["packo-economist-platform-deep", "kelly-debate-credential-intro"],
    dossierBriefingHook: "Three-way geometry from Pakko dossier + Kelly credential intro — no personal attacks.",
    additionalRehearsalSteps: ["Never pile on Pakko to hurt Hammer in clerk rooms."],
  },
  "current-record": {
    dossierSectionIds: ["hammer-2021-six-bill-deep", "kelly-public-record-defensive"],
    dossierBriefingHook: "Record contrast uses sourced legislative facts — claims gate before broadcast.",
    additionalRehearsalSteps: ["Agree-then-contrast script from likely-hammer prep section."],
  },
};

export function getPhase9PrepInstruction(sectionId: string): Phase9PrepInstructionOverlay {
  return (
    PHASE9_PREP_INSTRUCTION[sectionId] ??
    prep(
      ["kelly-sos-office-overview", "kelly-debate-credential-intro"],
      [
        "Read linked dossier sections researchDepth panel before rehearsing this prep module.",
        "Practice agree-then-contrast with one Hammer line — claims gate all numbers.",
      ],
    )
  );
}

export function getPhase9TrapInstruction(laneId: string): Phase9TrapInstructionOverlay | undefined {
  return PHASE9_TRAP_INSTRUCTION[laneId];
}

export function getPhase9SosInstruction(category: SosDebateQuestionCategory): Phase9SosInstructionOverlay {
  return PHASE9_SOS_CATEGORY_INSTRUCTION[category];
}
