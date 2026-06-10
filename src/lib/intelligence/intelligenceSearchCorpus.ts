/**
 * Build the full admin intelligence search corpus from in-code registries + nav.
 */
import { buildCandidateCommandNavSections } from "@/lib/intelligence/v4/candidateCommandNav";
import { getDebateWeekNavItems } from "@/lib/intelligence/debate-week-nav";
import { buildThreeLaneNavGroups } from "@/lib/intelligence/v4/threeLaneNav";
import { FIELD_BOOK_ARTICLES, FIELD_BOOK_HUB_HREF } from "@/lib/intelligence/fieldBookRegistry";
import { loadClaimLedger, loadCitationSources } from "@/lib/intelligence/claims/claimLedgerStore";
import type { ClaimLedgerEntry } from "@/lib/intelligence/claims/claimLedgerTypes";
import { DEBATE_GLOSSARY_TERMS } from "@/lib/intelligence/v4/debateGlossaryRegistry";
import { TRAP_LANE_DRILL_DOWNS } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import {
  getAllSosDebateQuestionIds,
  getSosDebateQuestionDrillDown,
} from "@/lib/intelligence/v4/sosDebateQuestionBank";
import { OPPONENT_DILIGENCE_SUBJECTS } from "@/lib/intelligence/v4/opponentDiligenceRegistry";
import { buildKimHammerTier3NavItems } from "@/lib/intelligence/v4/kimHammerOpponentModuleNav";
import { DEBATE_DEPTH_TOPICS } from "@/lib/intelligence/v4/debateDepthTopics";
import { KELLY_OFFENSIVE_MOVES } from "@/lib/intelligence/v4/kellyOffensiveApproachDepth";
import {
  INTEGRITY_2021_PACKAGE_DEPTH,
  PETITION_2025_CLUSTER_DEPTH,
} from "@/lib/intelligence/v4/integrityPackageDepth";
import { OPPONENT_TRAP_LANES } from "@/lib/intelligence/v4/kellyOpponentContrastPlaybook";
import { buildDebatePrepFinderIndex } from "@/lib/intelligence/v4/debatePrepFinder";
import { listDebatePhilosophyBriefings } from "@/lib/intelligence/v4/debatePhilosophyBriefings";
import { getAllPrepSectionDrillDownIds, getPrepSectionDrillDown } from "@/lib/intelligence/v4/debatePrepSectionDrillDowns";
import { loadAiCopilotToolRegistry } from "@/lib/intelligence/aiCopilotOrchestrator";
import { REHEARSAL_HUB_HREF } from "@/lib/intelligence/v4/phase16P0SessionLauncher";
import { RUN_OF_SHOW_HUB_HREF } from "@/lib/intelligence/v4/phase16P1RunOfShow";
import { ENCOUNTERS_HUB_HREF } from "@/lib/intelligence/v4/phase16P2EncounterScenarios";
import { DRILL_QUEUE_HUB_HREF } from "@/lib/intelligence/v4/phase16P3DrillQueue";
import { SESSION_DEBRIEF_HUB_HREF } from "@/lib/intelligence/v4/phase16P4SessionDebrief";
import { REHEARSAL_HISTORY_HUB_HREF } from "@/lib/intelligence/v4/phase16P6SessionMemory";
import { REHEARSAL_COACH_HUB_HREF } from "@/lib/intelligence/v4/phase16P7StaffCoach";
import { LIVE_EVENT_HUB_HREF } from "@/lib/intelligence/v4/phase16P8LiveEventMode";
import { SRE_CLOSURE_HUB_HREF } from "@/lib/intelligence/v4/phase16P9SreClosureDepth";
import { SEARCH_AI_PREP_HUB_HREF } from "@/lib/intelligence/intelligenceAiPrepV4";
import { DEBATE_PREP_TUTOR_HUB_HREF } from "@/lib/intelligence/v4/debatePrepTutorPackage";
import type { CandidateIntelSearchKind } from "@/lib/intelligence/candidateIntelligenceSearch";

export type IntelSearchDocument = {
  id: string;
  kind: CandidateIntelSearchKind;
  href: string;
  title: string;
  body: string;
  section?: string;
  badge?: string;
  priority: number;
  claimsGate?: string;
};

const corpusCache = new Map<string, IntelSearchDocument[]>();

export function getIntelSearchDocumentByHref(
  href: string,
  profile: "CANDIDATE" | "STAFF" | "CLERK_WEEK" = "CANDIDATE",
): IntelSearchDocument | undefined {
  const cacheKey = profile;
  if (!corpusCache.has(cacheKey)) {
    corpusCache.set(cacheKey, buildIntelSearchCorpus(profile));
  }
  const norm = href.split("?")[0]?.replace(/\/$/, "") ?? href;
  return corpusCache.get(cacheKey)!.find((d) => {
    const dh = d.href.split("?")[0]?.replace(/\/$/, "") ?? d.href;
    return dh === norm || norm.startsWith(`${dh}/`);
  });
}

function isCandidateSafeClaim(entry: ClaimLedgerEntry): boolean {
  if (entry.internalUseStatus === "DO_NOT_USE") return false;
  if (entry.verificationStatus === "REJECTED" || entry.verificationStatus === "RETIRED") return false;
  return true;
}

function claimBadge(entry: ClaimLedgerEntry): string {
  if (entry.verificationStatus === "HUMAN_VERIFIED" || entry.verificationStatus === "HUMAN_APPROVED_INTERNAL") {
    return "Verified";
  }
  if (entry.verificationStatus === "NEEDS_REVIEW" || entry.classification === "NEEDS_REVIEW") {
    return "Needs review";
  }
  return entry.classification;
}

export function buildIntelSearchCorpus(profile: "CANDIDATE" | "STAFF" | "CLERK_WEEK" = "CANDIDATE"): IntelSearchDocument[] {
  const docs: IntelSearchDocument[] = [];
  const seen = new Set<string>();

  const push = (doc: IntelSearchDocument) => {
    const key = `${doc.kind}::${doc.href}::${doc.title.slice(0, 48)}`;
    if (seen.has(key)) return;
    seen.add(key);
    docs.push(doc);
  };

  for (const sec of buildCandidateCommandNavSections(profile)) {
    for (const link of sec.links) {
      push({
        id: `nav:${link.href}`,
        kind: "nav",
        href: link.href,
        title: link.label,
        body: [sec.label, sec.summary, link.label, link.description ?? ""].join("\n"),
        section: sec.label,
        badge: sec.label,
        priority: 0.06,
      });
    }
  }

  for (const group of buildThreeLaneNavGroups(profile)) {
    for (const link of group.links) {
      push({
        id: `nav:${link.href}`,
        kind: "nav",
        href: link.href,
        title: link.label,
        body: [group.label, link.label].join("\n"),
        section: group.label,
        badge: group.label,
        priority: 0.05,
      });
    }
  }

  for (const item of getDebateWeekNavItems()) {
    push({
      id: `nav:${item.href}`,
      kind: "nav",
      href: item.href,
      title: item.label,
      body: [item.label, item.description ?? ""].join("\n"),
      section: "Debate week",
      badge: "Debate week",
      priority: 0.05,
    });
  }

  for (const article of FIELD_BOOK_ARTICLES) {
    push({
      id: `fb:${article.slug}`,
      kind: "field_book",
      href: `${FIELD_BOOK_HUB_HREF}/${article.slug}`,
      title: article.title,
      body: [
        article.title,
        article.category,
        article.summary,
        ...article.body,
        ...article.sidebarFacts.map((f) => `${f.label}: ${f.value}`),
        ...article.seeAlso,
      ].join("\n"),
      section: article.category,
      badge: "Field Book",
      priority: 0.08,
    });
  }

  for (const entry of loadClaimLedger().entries.filter(isCandidateSafeClaim)) {
    const verified =
      entry.verificationStatus === "HUMAN_VERIFIED" ||
      entry.verificationStatus === "HUMAN_APPROVED_INTERNAL";
    push({
      id: `claim:${entry.id}`,
      kind: "claim",
      href: `/admin/intelligence/claims?claim=${encodeURIComponent(entry.id)}`,
      title: entry.claimText.slice(0, 140) + (entry.claimText.length > 140 ? "…" : ""),
      body: [
        entry.claimText,
        entry.domain,
        entry.opponentId ?? "",
        entry.countySlug ?? "",
        ...entry.topicTags,
        entry.recommendedHumanAction,
        entry.classification,
        entry.verificationStatus,
      ].join("\n"),
      section: entry.domain,
      badge: claimBadge(entry),
      priority: verified ? 0.1 : 0.04,
    });
  }

  for (const src of loadCitationSources().sources) {
    push({
      id: `citation:${src.id}`,
      kind: "citation",
      href: `/admin/intelligence/claims?source=${encodeURIComponent(src.id)}`,
      title: src.title,
      body: [src.title, src.summary, src.quoteOrExcerpt ?? "", src.author ?? "", src.publisher ?? ""].join("\n"),
      section: src.sourceType,
      badge: src.reliabilityRating,
      priority: 0.03,
    });
  }

  for (const [laneId, lane] of Object.entries(TRAP_LANE_DRILL_DOWNS)) {
    push({
      id: `trap:${laneId}`,
      kind: "trap_lane",
      href: `/admin/intelligence/trap-lanes/${laneId}`,
      title: lane.title,
      body: [
        lane.title,
        lane.summary,
        lane.narrativeOverview,
        ...lane.whatToExpectHammerToSay,
        ...lane.setupMoves,
        lane.kellyPivotDeep,
        ...lane.rebuttalScripts.map((r) => `${r.trigger} ${r.contrast} ${r.bridge}`),
        ...lane.rehearsalSteps,
        lane.claimsGate ?? "",
      ].join("\n"),
      section: `Trap lane ${lane.laneNumber}`,
      badge: lane.claimsGate?.includes("VERIFIED") ? "Verified gate" : "Review gate",
      claimsGate: lane.claimsGate,
      priority: 0.12,
    });
  }

  for (const qId of getAllSosDebateQuestionIds()) {
    const q = getSosDebateQuestionDrillDown(qId);
    if (!q) continue;
    push({
      id: `sos:${qId}`,
      kind: "sos_question",
      href: `/admin/intelligence/sos-debate-questions/${qId}`,
      title: q.title,
      body: [
        q.title,
        q.categoryLabel,
        q.directAnswer30s,
        q.directAnswer60s,
        q.whyModeratorsAsk,
        ...q.moderatorLikelyPhrasings,
        ...q.whatHammerLikelySays,
        ...q.whatPackoMayAdd,
        q.agreeButNeverOnlyAgree,
        q.claimsGate ?? "",
      ].join("\n"),
      section: q.categoryLabel,
      badge: `SOS Q${q.questionNumber}`,
      claimsGate: q.claimsGate,
      priority: 0.11,
    });
  }

  for (const entry of buildDebatePrepFinderIndex()) {
    const kindMap: Record<string, CandidateIntelSearchKind> = {
      question: "sos_question",
      "trap-lane": "trap_lane",
      philosophy: "field_book",
      "prep-section": "hammer_module",
      opposition: "nav",
    };
    push({
      id: `finder:${entry.id}`,
      kind: kindMap[entry.kind] ?? "nav",
      href: entry.href,
      title: entry.title,
      body: [entry.title, entry.summary, ...entry.tags].join("\n"),
      section: "Prep finder",
      badge: entry.kind,
      priority: 0.09,
    });
  }

  for (const p of listDebatePhilosophyBriefings()) {
    push({
      id: `philosophy:${p.briefingId}`,
      kind: "field_book",
      href: `/admin/intelligence/debate-briefings/${p.briefingId}`,
      title: p.title,
      body: [p.title, p.summary, p.eyebrow, ...p.linkedQuestionIds].join("\n"),
      section: "Philosophy briefing",
      badge: p.eyebrow,
      priority: 0.1,
    });
  }

  for (const secId of getAllPrepSectionDrillDownIds()) {
    const s = getPrepSectionDrillDown(secId);
    if (!s) continue;
    const sectionClaimsGate = s.zingers.find((z) => z.claimsGate)?.claimsGate;
    push({
      id: `prepsec:${secId}`,
      kind: "hammer_module",
      href: `/admin/intelligence/kim-hammer/debate-prep/${secId}`,
      title: `Prep §${s.sectionNumber}: ${s.sectionTitle}`,
      body: [
        s.sectionTitle,
        s.whyItMatters,
        ...s.rebuttalScripts.map((r) => `${r.trigger} ${r.contrast}`),
        ...s.rehearsalSteps,
      ].join("\n"),
      section: "Debate prep section",
      badge: sectionClaimsGate ?? "Review gate",
      claimsGate: sectionClaimsGate,
      priority: 0.1,
    });
  }

  for (const term of DEBATE_GLOSSARY_TERMS) {
    push({
      id: `glossary:${term.id}`,
      kind: "glossary",
      href: term.intelligenceHref ?? `/admin/intelligence/field-book/glossary#${term.id}`,
      title: term.label,
      body: [term.label, term.definition, term.category, ...(term.seeAlso ?? [])].join("\n"),
      section: term.category,
      badge: "Glossary",
      priority: 0.05,
    });
  }

  for (const mod of buildKimHammerTier3NavItems()) {
    push({
      id: `kh:${mod.href}`,
      kind: "hammer_module",
      href: mod.href,
      title: mod.label,
      body: [mod.label, mod.description].join("\n"),
      section: "Kim Hammer",
      badge: "Opposition",
      priority: 0.09,
    });
  }

  for (const subj of OPPONENT_DILIGENCE_SUBJECTS) {
    push({
      id: `diligence:${subj.subjectId}`,
      kind: "diligence",
      href: subj.href,
      title: `${subj.displayName} diligence`,
      body: [subj.displayName, subj.eyebrow, subj.summary].join("\n"),
      section: subj.eyebrow,
      badge: "Diligence",
      priority: 0.07,
    });
  }

  for (const topic of DEBATE_DEPTH_TOPICS) {
    const d = topic.depth;
    push({
      id: `depth:${topic.topicId}`,
      kind: "debate_depth",
      href: topic.href,
      title: topic.title,
      body: [
        topic.title,
        topic.summary,
        d.whatToExpectPlain,
        ...(d.howHeWillAttack ?? []),
        ...(d.howToHandleIt ?? []),
        ...(d.ifYouGetHungUp ?? []),
        ...(d.handlingAdversity ?? []),
        ...(d.cultureWarDefense ?? []),
      ].join("\n"),
      section: "Debate depth",
      badge: `${topic.estimatedMinutes} min read`,
      priority: 0.11,
    });
  }

  for (const move of KELLY_OFFENSIVE_MOVES) {
    push({
      id: `offense:${move.id}`,
      kind: "offensive_move",
      href: "/admin/intelligence/opposition-strategy",
      title: move.name,
      body: [
        move.name,
        move.whenToUse,
        move.setup,
        move.execution,
        move.secondRoundKelly,
        move.thirdRoundKelly,
        move.backupEvidence,
        move.educationNote,
      ].join("\n"),
      section: "Offensive move",
      badge: move.riskIfOverused.slice(0, 60),
      priority: 0.1,
    });
  }

  push({
    id: "integrity-2021",
    kind: "offensive_move",
    href: "/admin/intelligence/opposition-strategy",
    title: INTEGRITY_2021_PACKAGE_DEPTH.headline,
    body: [
      INTEGRITY_2021_PACKAGE_DEPTH.headline,
      INTEGRITY_2021_PACKAGE_DEPTH.plainEnglishSummary,
      ...INTEGRITY_2021_PACKAGE_DEPTH.narrativeArc,
      INTEGRITY_2021_PACKAGE_DEPTH.debateTrap.setupQuestion,
      INTEGRITY_2021_PACKAGE_DEPTH.debateTrap.kellyPivot,
      ...INTEGRITY_2021_PACKAGE_DEPTH.billAnchors.map((b) => `${b.billNumber} Act ${b.actNumber} ${b.theme}`),
    ].join("\n"),
    section: "2021 package",
    badge: "Opposition offense",
    priority: 0.13,
  });

  push({
    id: "petition-2025",
    kind: "offensive_move",
    href: "/admin/intelligence/opposition-strategy",
    title: PETITION_2025_CLUSTER_DEPTH.headline,
    body: [
      PETITION_2025_CLUSTER_DEPTH.headline,
      PETITION_2025_CLUSTER_DEPTH.plainEnglishSummary,
      PETITION_2025_CLUSTER_DEPTH.hammerExpectedFrame,
      PETITION_2025_CLUSTER_DEPTH.kellyOffensiveLead,
      ...PETITION_2025_CLUSTER_DEPTH.billAnchors.map((b) => `${b.billNumber} Act ${b.actNumber} ${b.theme}`),
    ].join("\n"),
    section: "2025 petition cluster",
    badge: "Opposition offense",
    priority: 0.12,
  });

  for (const trap of OPPONENT_TRAP_LANES) {
    push({
      id: `trap-summary:${trap.name}`,
      kind: "trap_lane",
      href: "/admin/intelligence/trap-lanes",
      title: trap.name,
      body: [
        trap.name,
        trap.whyItWorks,
        trap.baitLineYouWantFromOpponent,
        trap.moderatorOrKellySetupQuestion,
        trap.kellyPivotWhenHeBites,
      ].join("\n"),
      section: "Trap lane overview",
      badge: "Quick trap ref",
      priority: 0.09,
    });
  }

  const sreRoutes: { href: string; title: string; body: string; badge: string }[] = [
    {
      href: SEARCH_AI_PREP_HUB_HREF,
      title: "Search & AI prep command hub",
      body: "Unified smart search v4 and governed AI prep tools — debate prep, opposition research, SRE rehearsal stack.",
      badge: "v4 hub",
    },
    {
      href: DEBATE_PREP_TUTOR_HUB_HREF,
      title: "AI debate prep tutor",
      body: "Time-boxed political debate coach — 5 min panic, 15 min pre-stage, 30 min rehearsal with practice critique. Trap pivots, SOS speak-order, Check My Record six-beat, Packo three-way dynamics.",
      badge: "Tutor v1",
    },
    {
      href: REHEARSAL_HUB_HREF,
      title: "Session launcher",
      body: "Start rehearsal session — encounters, run-of-show, drill queue, debrief, session memory.",
      badge: "SRE P0",
    },
    {
      href: RUN_OF_SHOW_HUB_HREF,
      title: "Run of show",
      body: "Timed stage sequence — speak order, transitions, trap lane cues, three-way panel flow.",
      badge: "SRE P1",
    },
    {
      href: ENCOUNTERS_HUB_HREF,
      title: "Encounter scenarios",
      body: "Three-way debate encounters — Hammer bait, Pakko contrast, moderator traps, ACCA panel.",
      badge: "SRE P2",
    },
    {
      href: DRILL_QUEUE_HUB_HREF,
      title: "Drill queue",
      body: "Stage-safe drill cards — trap lanes, SOS questions, offensive moves, claims-gated lines.",
      badge: "SRE P3",
    },
    {
      href: SESSION_DEBRIEF_HUB_HREF,
      title: "Session debrief",
      body: "Capture rehearsal outcomes — what worked, verify lines, staff notes for next session.",
      badge: "SRE P4",
    },
    {
      href: REHEARSAL_HISTORY_HUB_HREF,
      title: "Session memory",
      body: "Prior rehearsal history — recurring traps, verified pivots, stage-safe patterns.",
      badge: "SRE P6",
    },
    {
      href: REHEARSAL_COACH_HUB_HREF,
      title: "Rehearsal coach",
      body: "Staff rehearsal coach — drill pins, queue cards, governed feedback (staff only).",
      badge: "SRE P7",
    },
    {
      href: LIVE_EVENT_HUB_HREF,
      title: "Live event mode",
      body: "ACCA Jun 11 countdown — day-of shortest stage-safe run-of-show for clerk week.",
      badge: "SRE P8",
    },
    {
      href: SRE_CLOSURE_HUB_HREF,
      title: "SRE stack closure",
      body: "Nine checkpoint SRE closure — session launcher through live event readiness.",
      badge: "SRE P9",
    },
    {
      href: "/admin/intelligence/debate-prep-finder",
      title: "Debate prep finder",
      body: "Keyword finder across SOS questions, trap lanes, philosophy briefings, prep sections.",
      badge: "Prep finder",
    },
    {
      href: "/admin/intelligence/agent-tooling",
      title: "Agent tooling package",
      body: "Full governed copilot tool sequences — 37 registered tools for debate and opposition research.",
      badge: "AI prep",
    },
  ];

  for (const route of sreRoutes) {
    if (profile === "CANDIDATE" && route.href === REHEARSAL_COACH_HUB_HREF) continue;
    push({
      id: `rehearsal:${route.href}`,
      kind: "rehearsal",
      href: route.href,
      title: route.title,
      body: route.body,
      section: "SRE rehearsal stack",
      badge: route.badge,
      priority: 0.14,
    });
  }

  for (const tool of loadAiCopilotToolRegistry().tools) {
    if (profile !== "STAFF" && !["debate_prep", "briefing_papers", "writing_tools"].includes(tool.category)) {
      continue;
    }
    push({
      id: `copilot:${tool.toolId}`,
      kind: "copilot_tool",
      href: `/admin/intelligence/agent-tooling?tool=${encodeURIComponent(tool.toolId)}`,
      title: tool.name,
      body: [tool.name, tool.category, tool.purpose, ...tool.routedSystems].join("\n"),
      section: "AI prep tool",
      badge: tool.category.replace(/_/g, " "),
      priority: tool.category === "debate_prep" ? 0.13 : 0.06,
    });
  }

  return docs;
}

export function countIntelSearchCorpus(profile: "CANDIDATE" | "STAFF" | "CLERK_WEEK" = "CANDIDATE") {
  const docs = buildIntelSearchCorpus(profile);
  const byKind: Record<string, number> = {};
  for (const d of docs) {
    byKind[d.kind] = (byKind[d.kind] ?? 0) + 1;
  }
  return { total: docs.length, byKind };
}
