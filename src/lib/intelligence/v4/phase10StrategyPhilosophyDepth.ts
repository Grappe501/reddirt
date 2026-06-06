/**
 * Phase 10 — Strategy & political philosophy depth overlays (2× instruction standard).
 */
import type { DebatePhilosophyBriefing } from "@/lib/intelligence/v4/debateBriefingDepthTypes";
import type { DebatePsychologyManualSection } from "@/lib/intelligence/v4/debatePsychologyTrainingManual";
import type { CampaignPhilosophyNode } from "@/lib/intelligence/types/campaignIntelligenceGraph";

export type Phase10PhilosophyBriefingOverlay = {
  extendedCorePhilosophy: string[];
  strategyCrosswalkSteps: string[];
  frameworkChapterRefs: string[];
  psychologySectionIds: string[];
  intelligenceLinks: Array<{ href: string; label: string }>;
};

export type Phase10PhilosophyGraphOverlay = {
  debateApplication: string[];
  kellySosFraming: string[];
  strategyCrosswalk: string[];
  intelligenceLinks: Array<{ href: string; label: string }>;
};

export type Phase10PsychologyCrosswalk = {
  linkedPhilosophyBriefingIds: string[];
  strategyNotes: string[];
  manualChapterRefs: string[];
};

const FRAMEWORK = "/admin/campaign-strategy/framework";
const HUB = "/admin/intelligence/strategy-philosophy-hub";
const OPPOSITION = "/admin/intelligence/opposition-strategy";
const ALIGNMENT = "/admin/intelligence/strategy-alignment";

function briefingOverlay(
  extended: string[],
  steps: string[],
  psych: string[],
  links: Array<{ href: string; label: string }>,
): Phase10PhilosophyBriefingOverlay {
  return {
    extendedCorePhilosophy: extended,
    strategyCrosswalkSteps: steps,
    frameworkChapterRefs: ["framework", "executive-summary"],
    psychologySectionIds: psych,
    intelligenceLinks: links,
  };
}

export const PHASE10_PHILOSOPHY_BRIEFING_OVERLAY: Record<string, Phase10PhilosophyBriefingOverlay> = {
  "agree-but-never-only-agree": briefingOverlay(
    [
      "Kelly's theory of change (framework chapter) treats civic trust as earned through implementation — agreement without addition sounds like consensus theater, not SOS readiness.",
      "Three-way geometry: when Hammer and Pakko both agree on integrity, the voter question becomes who can administer — this briefing is the philosophical spine for Phase 9 prep bridge county sections.",
    ],
    [
      "Cross-read framework theory-of-change before rehearsing — map shared value to one SOS deliverable.",
      "Pair with psychology manual trust-equation section for warmth + competence balance after agreement.",
      "Log fresh-addition lines in claims ledger if they cite acts or funding figures.",
      "Link to strategy-alignment dashboard — verify narrative matches doctrine-steve-strategy civic trust lane.",
    ],
    ["trust-equation-warmth-competence", "contrast-principle-differentiation", "arkansas-three-way-acca-context"],
    [
      { href: FRAMEWORK, label: "Theory of change" },
      { href: HUB, label: "Strategy & philosophy hub" },
      { href: ALIGNMENT, label: "Strategy alignment" },
      { href: "/admin/intelligence/debate-briefings", label: "All philosophy briefings" },
    ],
  ),
  "author-vs-administrator": briefingOverlay(
    [
      "Executive summary manual chapter positions Kelly as operations executive — author vs administrator is the debate translation of that strategic frame.",
      "Opposition strategy layer documents Hammer's collapse of legislative authorship into SOS readiness — this briefing is the high-road philosophical counter.",
    ],
    [
      "Open opposition-strategy trap map before stage — author/administrator appears in experience-equals-sos-ready lane.",
      "Use build-audit manual chapter for RedDirt/county workbench proof points when citing implementation capacity.",
      "Never invent bill numbers — framework chapter stresses verified doctrine over slogan density.",
    ],
    ["hammer-psychological-profile", "competence-test-heuristics", "dad-test-reliable-leader"],
    [
      { href: FRAMEWORK, label: "Theory of change" },
      { href: OPPOSITION, label: "Opposition strategy" },
      { href: "/admin/intelligence/trap-lanes/experience-equals-sos-ready", label: "Trap lane" },
      { href: HUB, label: "Strategy hub" },
    ],
  ),
  "county-clerk-partnership": briefingOverlay(
    [
      "Philosophy graph node philosophy-county-partnership anchors this briefing — state policy must fund county implementation, not offload complexity.",
      "ACCA Mountain View context makes this the primary clerk-room philosophy — pair with Phase 8 ACCA runbook and Phase 9 clerk bridges.",
    ],
    [
      "Read election-funding drill-down before citing grant ledger language.",
      "Crosswalk to kelly-road-stories-fieldbook dossier section for overtime strain examples.",
      "Strategy alignment: verify messaging matches doctrine-grassroots-principles county partnership lane.",
    ],
    ["arkansas-three-way-acca-context", "when-audience-anxious", "kelly-archetype-competent-mom-executive"],
    [
      { href: "/admin/intelligence/county-clerk-week/acca-summer-conference", label: "ACCA conference" },
      { href: "/admin/intelligence/election-funding", label: "Election funding" },
      { href: `${HUB}#philosophy-county-partnership`, label: "Philosophy node" },
      { href: FRAMEWORK, label: "Theory of change" },
    ],
  ),
  "pile-on-survival": briefingOverlay(
    [
      "Three-way speak-order Field Book article governs pile-on geometry — philosophy here is defensive posture without victim tone.",
      "Steve strategy doctrine stresses relational organizing under attack — survival means adding SOS substance, not escalating insult.",
    ],
    [
      "Rehearse with psychology manual when-opponent-attacks-reframe section.",
      "If Pakko and Hammer both attack Kelly, use agree-but-never-only-agree after direct answer.",
      "Strategy Partner RAG: query campaign-system manual chapter 21 adaptive strategy for pile-on scenarios.",
    ],
    ["when-opponent-attacks-reframe", "when-opponent-angry-or-dominating", "audience-reading-real-time"],
    [
      { href: "/admin/intelligence/field-book/three-way-speak-order", label: "Speak order" },
      { href: HUB, label: "Strategy hub" },
      { href: "/admin/intelligence/kelly-debate-coaching", label: "Debate coaching" },
      { href: ALIGNMENT, label: "Strategy alignment" },
    ],
  ),
  "rebuttal-architecture": briefingOverlay(
    [
      "Rebuttal architecture mirrors framework program chapters on comms-media and direct-contact — structure beats improvisation for first-time debaters.",
      "Opposition strategy cross-exam sequence provides the tactical spine; this briefing provides the philosophical permission to stay structured under pressure.",
    ],
    [
      "Map each rebuttal to one trap lane + one SOS question from Phase 9 bridge.",
      "Psychology manual cognitive-load-five-messages caps message count per answer.",
      "Verify rebuttal claims in ledger before film-room promotion.",
    ],
    ["cognitive-load-five-messages", "contrast-principle-differentiation", "rule-one-emotional-decisions"],
    [
      { href: OPPOSITION, label: "Opposition strategy" },
      { href: "/admin/intelligence/kim-hammer/debate-prep/rebuttal", label: "Prep rebuttal" },
      { href: HUB, label: "Strategy hub" },
      { href: "/admin/intelligence/film-room", label: "Film room" },
    ],
  ),
  "presence-without-repetition": briefingOverlay(
    [
      "Kelly archetype psychology section defines competent-mom-executive presence — repetition signals anxiety; fresh additions signal preparation.",
      "Campaign philosophy graph philosophy-citizen-empowerment links participation framing to non-repetitive differentiation.",
    ],
    [
      "Track used themes in theme-matrix prep section — no duplicate closers in final hour.",
      "Strategy alignment check: messaging frames must stay consistent with doctrine-kelly-theme-integration.",
      "Read executive-summary manual for tone guardrails before high-stakes forums.",
    ],
    ["kelly-archetype-competent-mom-executive", "likability-acknowledgment-phrases", "atmosphere-management-overview"],
    [
      { href: "/admin/campaign-strategy/executive-summary", label: "Executive summary" },
      { href: HUB, label: "Strategy hub" },
      { href: "/admin/intelligence/debate-prep/psychology-manual/kelly-archetype-competent-mom-executive", label: "Archetype section" },
      { href: ALIGNMENT, label: "Strategy alignment" },
    ],
  ),
  "integrity-without-nationalizing": briefingOverlay(
    [
      "Philosophy-civic-trust node: election administration builds confidence through lawful, transparent, non-polarizing process clarity — not national cable-news framing.",
      "Hammer research hooks in opposition layer often nationalize local Arkansas implementation — Kelly stays county-first.",
    ],
    [
      "Pair with integrity-2021 prep section and hammer-2021-six-bill-deep dossier.",
      "Psychology manual three-audiences-battlefield — moderator, room, opponent — before nationalizing any answer.",
      "Framework chapter: Arkansas-specific theory of change, not DC rhetoric.",
    ],
    ["three-audiences-battlefield", "atmosphere-types-five-frames", "hammer-psychological-profile"],
    [
      { href: `${HUB}#philosophy-civic-trust`, label: "Civic trust node" },
      { href: OPPOSITION, label: "Opposition strategy" },
      { href: FRAMEWORK, label: "Theory of change" },
      { href: "/admin/intelligence/trap-lanes/fraud-data-dare", label: "Fraud-data trap" },
    ],
  ),
  "direct-democracy-offense": briefingOverlay(
    [
      "Philosophy-direct-democracy node and Pakko economist dossier intersect here — Kelly supplies SOS operational detail, not anti-petition hostility.",
      "Petition cluster prep + opposition 2025 cluster depth are mandatory pre-reads — philosophy without act proof is dangerous.",
    ],
    [
      "Cross-read packo-economist-platform-deep dossier before three-way petition answers.",
      "Strategy migration: promote verified petition prose to Field Book after claims gate.",
      "Use direct-democracy prep section rehearsal scripts — claims gate all SB584 references.",
    ],
    ["pakko-psychological-profile", "contrast-principle-differentiation", "arkansas-three-way-acca-context"],
    [
      { href: `${HUB}#philosophy-direct-democracy`, label: "Direct democracy node" },
      { href: "/admin/intelligence/kim-hammer/debate-prep/petition-cluster", label: "Petition prep" },
      { href: "/admin/intelligence/opponents/dossiers/michael-packo/packo-economist-platform-deep", label: "Pakko dossier" },
      { href: FRAMEWORK, label: "Theory of change" },
    ],
  ),
};

export const PHASE10_PHILOSOPHY_GRAPH_OVERLAY: Record<string, Phase10PhilosophyGraphOverlay> = {
  "philosophy-civic-trust": {
    debateApplication: [
      "Debate frame: balls-and-strikes SOS — process you can trust — never nationalize Arkansas county implementation.",
      "Pair with integrity-without-nationalizing briefing and fraud-data-dare trap lane.",
      "ACCA tone: curious clerk partnership, not cable-news prosecution.",
    ],
    kellySosFraming: [
      "Published rules, training calendars, and verification pathways voters can understand.",
      "Depoliticized service — office belongs to every voter in all seventy-five counties.",
    ],
    strategyCrosswalk: [
      "doctrine-steve-strategy civic trust lane",
      "framework theory-of-change executive summary",
      "strategy-alignment dashboard coherence check",
    ],
    intelligenceLinks: [
      { href: "/admin/intelligence/debate-briefings/integrity-without-nationalizing", label: "Briefing" },
      { href: FRAMEWORK, label: "Manual framework" },
      { href: ALIGNMENT, label: "SDI-1 alignment" },
    ],
  },
  "philosophy-transparency": {
    debateApplication: [
      "Show-your-work framing for CVSGF ledger questions — publish-the-ledger is philosophy made operational.",
      "Hammer may claim transparency via bill authorship — Kelly cites SOS publication duty.",
    ],
    kellySosFraming: ["Audit-ready processes", "Public records literacy programs", "Grant ledger publication"],
    strategyCrosswalk: ["doctrine-sos-keeper-records", "build-audit RedDirt transparency chapter"],
    intelligenceLinks: [
      { href: "/admin/intelligence/field-book/cvsgf-ledger-gap", label: "CVSGF Field Book" },
      { href: HUB, label: "Strategy hub" },
    ],
  },
  "philosophy-participation": {
    debateApplication: [
      "Integrity + access together — never let Hammer own participation after Kelly agrees on security.",
      "Pakko may amplify access frame — Kelly adds SOS implementation detail.",
    ],
    kellySosFraming: ["Voter assistance", "Stable polling places", "Plain-language lawful pathways"],
    strategyCrosswalk: ["doctrine-grassroots-playbook", "programs/registration manual chapter"],
    intelligenceLinks: [
      { href: "/admin/intelligence/debate-briefings/agree-but-never-only-agree", label: "Agree briefing" },
      { href: "/admin/intelligence/sos-debate-questions", label: "SOS questions" },
    ],
  },
  "philosophy-county-partnership": {
    debateApplication: [
      "Primary ACCA philosophy — support clerks with funding, training, hotline when mandates land.",
      "County-deep prep section is tactical expression of this node.",
    ],
    kellySosFraming: ["SOS county toolkit", "Implementation readiness", "Monday-morning guidance"],
    strategyCrosswalk: ["doctrine-county-kpi-model", "election-funding intelligence"],
    intelligenceLinks: [
      { href: "/admin/intelligence/debate-briefings/county-clerk-partnership", label: "Clerk briefing" },
      { href: "/admin/intelligence/county-clerk-week/acca-summer-conference", label: "ACCA" },
    ],
  },
  "philosophy-modernization": {
    debateApplication: [
      "Modernize with support — never unfunded mandate without training calendar.",
      "Contrast Hammer author frame with Kelly administrator modernization.",
    ],
    kellySosFraming: ["Transparent rollout", "County capacity building", "VVSG-aware stewardship"],
    strategyCrosswalk: ["doctrine-kelly-theme-integration", "programs/compliance manual"],
    intelligenceLinks: [
      { href: "/admin/intelligence/election-equipment-vvsg", label: "VVSG hub" },
      { href: HUB, label: "Strategy hub" },
    ],
  },
  "philosophy-citizen-empowerment": {
    debateApplication: [
      "Stand Up Arkansas civic education history maps to SOS education duty — empowerment through literacy, not slogans.",
      "Avoid culture-war traps — empowerment is process clarity.",
    ],
    kellySosFraming: ["Know your rights materials", "Accessible process", "Civic education programs"],
    strategyCrosswalk: ["doctrine-relational-organizing", "kelly-civic-education dossier section"],
    intelligenceLinks: [
      { href: "/admin/intelligence/candidate-dossiers/kelly-grappe/kelly-civic-education", label: "Kelly civic ed dossier" },
      { href: FRAMEWORK, label: "Framework" },
    ],
  },
  "philosophy-anti-centralization": {
    debateApplication: [
      "Local accountability vs Little Rock mandate dumps — clerk-room safe frame.",
      "Pair with Act 350 burden stories from road dossier when verified.",
    ],
    kellySosFraming: ["Seventy-five county flexibility within published statewide rules", "Quorum court respect"],
    strategyCrosswalk: ["doctrine-grassroots-principles", "county workbench audit"],
    intelligenceLinks: [
      { href: "/admin/campaign-strategy/build-audit", label: "Build audit" },
      { href: HUB, label: "Strategy hub" },
    ],
  },
  "philosophy-direct-democracy": {
    debateApplication: [
      "Lawful petition process + SOS certification workload — pro-voter, pro-process.",
      "Three-way: respect Pakko reform ideas; supply administrator detail.",
    ],
    kellySosFraming: ["Clear certification rules", "County verification time funding", "Published petition guidance"],
    strategyCrosswalk: ["2025 petition cluster opposition depth", "packo-economist-platform dossier"],
    intelligenceLinks: [
      { href: "/admin/intelligence/debate-briefings/direct-democracy-offense", label: "Direct democracy briefing" },
      { href: OPPOSITION, label: "Opposition strategy" },
    ],
  },
};

const DEFAULT_PSYCH_CROSSWALK: Phase10PsychologyCrosswalk = {
  linkedPhilosophyBriefingIds: ["agree-but-never-only-agree", "author-vs-administrator"],
  strategyNotes: [
    "Cross-read strategy-philosophy-hub inventory before stage — philosophy briefings govern handling method.",
    "Verify psychology rehearsal scripts against claims gate before public adaptation.",
  ],
  manualChapterRefs: ["framework", "executive-summary"],
};

export const PHASE10_PSYCHOLOGY_CROSSWALK: Record<string, Phase10PsychologyCrosswalk> = {
  "advanced-candidate-manual-intro": {
    linkedPhilosophyBriefingIds: ["rebuttal-architecture", "presence-without-repetition"],
    strategyNotes: ["Start with hub inventory — 8 briefings + 19 psychology sections + 8 graph nodes."],
    manualChapterRefs: ["framework", "meta"],
  },
  "hammer-psychological-profile": {
    linkedPhilosophyBriefingIds: ["author-vs-administrator", "rebuttal-architecture"],
    strategyNotes: ["Pair with opposition-strategy layer and kim-hammer vulnerability matrix."],
    manualChapterRefs: ["framework", "build-audit"],
  },
  "pakko-psychological-profile": {
    linkedPhilosophyBriefingIds: ["direct-democracy-offense", "pile-on-survival"],
    strategyNotes: ["Three-way geometry — never pile on Pakko to hurt Hammer in clerk rooms."],
    manualChapterRefs: ["framework"],
  },
  "arkansas-three-way-acca-context": {
    linkedPhilosophyBriefingIds: ["county-clerk-partnership", "agree-but-never-only-agree"],
    strategyNotes: ["Mandatory ACCA pre-read — Phase 8 runbook + Phase 9 clerk bridges."],
    manualChapterRefs: ["framework", "lane"],
  },
};

export function getPhase10PhilosophyBriefingOverlay(briefingId: string): Phase10PhilosophyBriefingOverlay {
  return (
    PHASE10_PHILOSOPHY_BRIEFING_OVERLAY[briefingId] ?? {
      extendedCorePhilosophy: [
        "Strategy philosophy hub crosswalk: read framework theory-of-change and linked psychology sections before rehearsing this briefing.",
      ],
      strategyCrosswalkSteps: [
        "Open strategy-philosophy-hub for full inventory.",
        "Check strategy-alignment dashboard for doctrine coherence.",
      ],
      frameworkChapterRefs: ["framework"],
      psychologySectionIds: ["advanced-candidate-manual-intro"],
      intelligenceLinks: [{ href: HUB, label: "Strategy & philosophy hub" }],
    }
  );
}

export function getPhase10PhilosophyGraphOverlay(philosophyId: string): Phase10PhilosophyGraphOverlay {
  return (
    PHASE10_PHILOSOPHY_GRAPH_OVERLAY[philosophyId] ?? {
      debateApplication: ["Map this philosophy node to one debate briefing and one SOS question before stage."],
      kellySosFraming: ["Administrator readiness for seventy-five counties."],
      strategyCrosswalk: ["framework theory-of-change"],
      intelligenceLinks: [{ href: HUB, label: "Strategy hub" }],
    }
  );
}

export function getPhase10PsychologyCrosswalk(sectionId: string): Phase10PsychologyCrosswalk {
  return PHASE10_PSYCHOLOGY_CROSSWALK[sectionId] ?? DEFAULT_PSYCH_CROSSWALK;
}

export type EnrichedPhilosophyNode = CampaignPhilosophyNode & Phase10PhilosophyGraphOverlay;

export function philosophyBriefingMeetsPhase10Bar(b: DebatePhilosophyBriefing): boolean {
  const o = getPhase10PhilosophyBriefingOverlay(b.briefingId);
  return (
    o.extendedCorePhilosophy.length >= 2 &&
    o.strategyCrosswalkSteps.length >= 3 &&
    o.intelligenceLinks.length >= 4
  );
}

export function philosophyNodeMeetsPhase10Bar(node: EnrichedPhilosophyNode): boolean {
  return node.debateApplication.length >= 2 && node.kellySosFraming.length >= 2 && node.intelligenceLinks.length >= 2;
}

export function psychologySectionMeetsPhase10Bar(section: DebatePsychologyManualSection): boolean {
  const o = getPhase10PsychologyCrosswalk(section.sectionId);
  return o.linkedPhilosophyBriefingIds.length >= 1 && o.strategyNotes.length >= 1;
}
