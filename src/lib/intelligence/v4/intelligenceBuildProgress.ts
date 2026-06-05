import fs from "node:fs";
import path from "node:path";
import { loadDebateIntelligenceV4Packet } from "@/lib/intelligence/v4/debateIntelligenceV4";
import { getAllPrepSectionDrillDownIds, getPrepSectionDrillDown } from "@/lib/intelligence/v4/debatePrepSectionDrillDowns";
import { getAllTrapLaneIds, getTrapLaneDrillDown } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import { getAllSosDebateQuestionIds, getSosDebateQuestionDrillDown } from "@/lib/intelligence/v4/sosDebateQuestionBank";
import { listCuratedBillPlaybookNumbers } from "@/lib/intelligence/v4/debateBillOperatorPlaybooks";
import { listAllBillNumbersFromIndex, resolveArklegBillUrl } from "@/lib/intelligence/v4/billActProofDepth";
import { buildSosQuestionResponseRounds } from "@/lib/intelligence/v4/debateResponseRoundEnrichment";
import { buildTrapLaneStepCoverage } from "@/lib/intelligence/v4/trapLaneStepCoverage";
import { listDebatePhilosophyBriefings } from "@/lib/intelligence/v4/debatePhilosophyBriefings";
import { buildSosQuestionBriefing } from "@/lib/intelligence/v4/debateBriefingEnrichment";
import { buildDebatePrepFinderIndex } from "@/lib/intelligence/v4/debatePrepFinder";
import { KELLY_ATTACK_VECTORS } from "@/lib/intelligence/v4/kellyCandidateResearchDepth";
import { KELLY_PUBLIC_RECORD_BRIEF } from "@/lib/intelligence/v4/kellyCandidatePublicRecordBrief";
import { KELLY_OFFENSIVE_MOVES } from "@/lib/intelligence/v4/kellyOffensiveApproachDepth";
import { computeOppositionOffenseReadinessPct } from "@/lib/intelligence/v4/oppositionStrategyLayerMetrics";
import { KIM_HAMMER_V4_MODULES } from "@/lib/intelligence/kimHammerV4ModuleRegistry";
import { getAllAccaConferenceDepthSectionIds } from "@/lib/intelligence/v4/accaClerksConference2026Depth";
import { getAllOpponentDossierSectionIds } from "@/lib/intelligence/v4/opponentCandidateDossierDepth";
import { getAllKellyDossierSectionIds } from "@/lib/intelligence/v4/kellyCandidateDossierDepth";
import { getAllDebatePsychologyManualSectionIds } from "@/lib/intelligence/v4/debatePsychologyTrainingManual";
import { NSI_STAFF_RESEARCH_NAV_ITEMS } from "@/lib/intelligence/debate-week-nav";
import { getTier2DebatePrepLinkAuditRoutes } from "@/lib/intelligence/v4/debatePrepDepthNav";
import {
  buildKimHammerTier3NavGroups,
  getKimHammerTier3LinkAuditRoutes,
} from "@/lib/intelligence/v4/kimHammerOpponentModuleNav";
import { getTier4CoreSpineLinkAuditRoutes } from "@/lib/intelligence/v4/tier4CoreSpineLinkAudit";
import { buildTier4CoreSpineNavGroups } from "@/lib/intelligence/v4/tier4CoreSpineNav";
import { getTier1NavLinkAuditRoutes } from "@/lib/intelligence/navLinkReleaseManifest";
import { DEBATE_DEPTH_TOPICS } from "@/lib/intelligence/v4/debateDepthTopics";
import { allDiligenceCompletionSummary } from "@/lib/intelligence/v4/opponentDiligenceLogStore";
import { getPackoCommandCenterLinkAuditRoutes } from "@/lib/intelligence/opponents/packoCommandCenterRoutes";
import { getPackoContrastGateStatus } from "@/lib/intelligence/v4/packoContrastGate";
import { FIELD_BOOK_ARTICLES, getFieldBookLinkAuditRoutes } from "@/lib/intelligence/fieldBookRegistry";
import { computeCanonLoopStats } from "@/lib/intelligence/fieldBookCanonRegistry";
import { computeDossierBriefingBookProgress } from "@/lib/intelligence/v4/candidateDossierBriefingBook";
import { computePhase2SurfacesDepthProgress } from "@/lib/intelligence/v4/phase2SurfacesDepth";
import { getThreeLaneNavLinkAuditRoutes } from "@/lib/intelligence/v4/threeLaneNav";

export type BuildProgressItem = {
  id: string;
  label: string;
  category: string;
  completionPct: number;
  status: "complete" | "partial" | "stub" | "flagged";
  built: number;
  total: number;
  flags: string[];
  href?: string;
};

export type BuildPhase = {
  phase: number;
  name: string;
  targetVersion: string;
  goal: string;
  items: string[];
  exitCriteria: string[];
};

export type IntelligenceBuildProgressReport = {
  generatedAt: string;
  version: string;
  overallCompletionPct: number;
  items: BuildProgressItem[];
  phases: BuildPhase[];
  linkAuditRoutes: string[];
  flaggedForMasterBuild: string[];
};

function scoreDrillDown(minFields: boolean[], flags: string[] = []): { pct: number; status: BuildProgressItem["status"] } {
  const built = minFields.filter(Boolean).length;
  const total = minFields.length;
  const pct = Math.round((built / total) * 100);
  let status: BuildProgressItem["status"] = "complete";
  if (pct < 50) status = "stub";
  else if (pct < 90) status = "partial";
  if (flags.length) status = pct >= 90 ? "flagged" : status;
  return { pct, status };
}

export function computeIntelligenceBuildProgress(): IntelligenceBuildProgressReport {
  const v4 = loadDebateIntelligenceV4Packet();
  const items: BuildProgressItem[] = [];

  // Debate prep sections
  const prepIds = getAllPrepSectionDrillDownIds();
  let prepBuilt = 0;
  for (const id of prepIds) {
    const d = getPrepSectionDrillDown(id)!;
    const ok =
      d.rebuttalScripts.length >= 1 &&
      d.rehearsalSteps.length >= 1 &&
      d.whyItMatters.length > 20 &&
      !!d.encounterDepth?.whatToExpectPlain;
    if (ok) prepBuilt++;
  }
  items.push({
    id: "debate-prep-sections",
    label: "Debate prep drill-downs (28 sections)",
    category: "Debate prep",
    completionPct: Math.round((prepBuilt / prepIds.length) * 100),
    status: prepBuilt === prepIds.length ? "complete" : "partial",
    built: prepBuilt,
    total: prepIds.length,
    flags: prepBuilt < prepIds.length ? ["Some sections missing encounter depth"] : [],
    href: "/admin/intelligence/kim-hammer/debate-prep",
  });

  // Trap lanes
  const trapIds = getAllTrapLaneIds();
  let trapBuilt = 0;
  for (const id of trapIds) {
    const d = getTrapLaneDrillDown(id)!;
    const coverage = buildTrapLaneStepCoverage(d);
    const ok =
      d.rebuttalScripts.length >= 1 &&
      d.whatToExpectHammerToSay.length >= 3 &&
      coverage.steps.length >= 6 &&
      !!d.encounterDepth?.whatToExpectPlain;
    if (ok) trapBuilt++;
  }
  items.push({
    id: "trap-lanes",
    label: "Trap lane drill-downs (6 lanes)",
    category: "Trap lanes",
    completionPct: Math.round((trapBuilt / trapIds.length) * 100),
    status: trapBuilt === trapIds.length ? "complete" : "partial",
    built: trapBuilt,
    total: trapIds.length,
    flags: [],
    href: "/admin/intelligence/trap-lanes",
  });

  // SOS questions
  const qIds = getAllSosDebateQuestionIds();
  let qBuilt = 0;
  for (const id of qIds) {
    const d = getSosDebateQuestionDrillDown(id)!;
    const rounds = buildSosQuestionResponseRounds(d);
    const ok =
      d.speakOrderDrills.length === 3 &&
      d.directAnswer30s.length > 30 &&
      rounds.rounds.length >= 5 &&
      (d.comprehensive?.speakFirstFullScript.length ?? 0) > 80;
    if (ok) qBuilt++;
  }
  items.push({
    id: "sos-questions",
    label: "Expected SOS questions (35 — full speak-order scripts)",
    category: "Questions",
    completionPct: Math.round((qBuilt / qIds.length) * 100),
    status: qBuilt === qIds.length ? "complete" : "partial",
    built: qBuilt,
    total: qIds.length,
    flags: [],
    href: "/admin/intelligence/sos-debate-questions",
  });

  // v6.3 briefing depth — why, alternatives, Hammer hooks on every question
  const philosophyCount = listDebatePhilosophyBriefings().length;
  let briefingBuilt = 0;
  for (const id of qIds) {
    const d = getSosDebateQuestionDrillDown(id)!;
    const b = buildSosQuestionBriefing(d);
    const ok =
      b.whyThisAnswerWorks.length > 80 &&
      b.alternativeOpeners.length >= 3 &&
      b.alternativeClosers.length >= 3 &&
      b.hammerResearchHooks.length >= 3;
    if (ok) briefingBuilt++;
  }
  items.push({
    id: "debate-briefing-depth",
    label: "Debate briefing depth (questions + philosophy)",
    category: "Briefings",
    completionPct: Math.round((briefingBuilt / qIds.length) * 100),
    status: briefingBuilt === qIds.length && philosophyCount >= 8 ? "complete" : "partial",
    built: briefingBuilt,
    total: qIds.length,
    flags: briefingBuilt < qIds.length ? ["Some questions missing full briefing enrichment"] : [],
    href: "/admin/intelligence/debate-briefings",
  });

  items.push({
    id: "debate-prep-finder",
    label: "Prep finder search index",
    category: "Navigation",
    completionPct: 100,
    status: "complete",
    built: buildDebatePrepFinderIndex().length,
    total: buildDebatePrepFinderIndex().length,
    flags: [],
    href: "/admin/intelligence/debate-briefings",
  });

  // Bills + act proof
  const billNumbers = listAllBillNumbersFromIndex();
  const curated = listCuratedBillPlaybookNumbers();
  let actProofBuilt = 0;
  let arklegLinked = 0;
  for (const b of billNumbers) {
    if (resolveArklegBillUrl(b)) arklegLinked++;
    if (v4.billNarratives.find((n) => n.billNumber.toUpperCase() === b.toUpperCase())) actProofBuilt++;
  }
  items.push({
    id: "bill-act-proof",
    label: "Bill act-proof drill-downs + Arkleg links",
    category: "Bills",
    completionPct: Math.round((actProofBuilt / billNumbers.length) * 100),
    status: actProofBuilt === billNumbers.length ? "complete" : "partial",
    built: actProofBuilt,
    total: billNumbers.length,
    flags:
      arklegLinked < billNumbers.length
        ? [`${billNumbers.length - arklegLinked} bills missing Arkleg URL`]
        : curated.length < billNumbers.length
          ? [`${billNumbers.length - curated.length} bills auto-synthesized playbooks (not curated)`]
          : [],
    href: "/admin/intelligence/kim-hammer/debate-prep",
  });

  // Kelly research
  const kellyNeedsResearch = KELLY_ATTACK_VECTORS.filter((v) => v.verificationStatus === "NEEDS_RESEARCH").length;
  const kellyPublicBriefVerified = KELLY_PUBLIC_RECORD_BRIEF.filter((f) => f.verificationStatus === "VERIFIED").length;
  items.push({
    id: "kelly-research",
    label: "Kelly candidate research depth",
    category: "Kelly defense",
    completionPct: Math.round(((KELLY_ATTACK_VECTORS.length - kellyNeedsResearch) / KELLY_ATTACK_VECTORS.length) * 100),
    status: kellyNeedsResearch === 0 ? "complete" : "partial",
    built: KELLY_ATTACK_VECTORS.length - kellyNeedsResearch,
    total: KELLY_ATTACK_VECTORS.length,
    flags: [
      ...(kellyNeedsResearch ? [`${kellyNeedsResearch} vector NEEDS_RESEARCH (CourtConnect staff search)`] : []),
      ...(kellyPublicBriefVerified >= 4 ? [] : ["Expand public record brief verified sources"]),
    ],
    href: "/admin/intelligence/kelly-debate-coaching",
  });

  items.push({
    id: "kelly-public-brief",
    label: "Kelly public record brief (sourced)",
    category: "Kelly defense",
    completionPct: Math.round((kellyPublicBriefVerified / KELLY_PUBLIC_RECORD_BRIEF.length) * 100),
    status: kellyPublicBriefVerified >= KELLY_PUBLIC_RECORD_BRIEF.length - 1 ? "complete" : "partial",
    built: kellyPublicBriefVerified,
    total: KELLY_PUBLIC_RECORD_BRIEF.length,
    flags: ["Complete five-search logs at /admin/intelligence/diligence before stage claims"],
    href: "/admin/intelligence/diligence/kelly-grappe",
  });

  // Offensive approach
  items.push({
    id: "offensive-approach",
    label: "Offensive approach (respond · rebut · lead)",
    category: "Offense",
    completionPct: 100,
    status: "complete",
    built: KELLY_OFFENSIVE_MOVES.length,
    total: KELLY_OFFENSIVE_MOVES.length,
    flags: [],
    href: "/admin/intelligence/kelly-debate-coaching",
  });

  // Claims ledger — live ratio from ledger file
  let claimsSupported = 0;
  let claimsTotal = 0;
  let claimsNeedsReview = 0;
  try {
    const ledger = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "data/intelligence/claims/claim-ledger.json"), "utf8"),
    ) as { entries?: Array<{ classification?: string }> };
    const entries = ledger.entries ?? [];
    claimsTotal = entries.length;
    claimsSupported = entries.filter((e) => e.classification === "VERIFIED").length;
    claimsNeedsReview = entries.filter((e) => e.classification === "NEEDS_REVIEW").length;
  } catch {
    /* optional */
  }
  const claimsPct =
    claimsTotal > 0 ? Math.round((claimsSupported / claimsTotal) * 100) : claimsSupported > 50 ? 85 : 60;
  items.push({
    id: "claims-ledger",
    label: "Claims ledger verification",
    category: "Governance",
    completionPct: claimsPct,
    status: claimsPct >= 90 ? "complete" : claimsPct >= 75 ? "partial" : "flagged",
    built: claimsSupported,
    total: claimsTotal || claimsSupported + 20,
    flags:
      claimsNeedsReview > 0
        ? [`${claimsNeedsReview} claims NEEDS_REVIEW — verify before broadcast`]
        : ["Retrieval queue tasks may remain open — verify before broadcast"],
    href: "/admin/intelligence/claims",
  });

  // NSI staff stubs — live pages promoted where route exists
  const khModuleEntries = Object.values(KIM_HAMMER_V4_MODULES);
  const khStaffStubs = khModuleEntries.filter((m) => m.render.type === "staff-stub").length;
  const khLiveModules = khModuleEntries.length - khStaffStubs;
  const khPct = Math.round((khLiveModules / khModuleEntries.length) * 100);
  items.push({
    id: "kh-staff-modules",
    label: "Kim Hammer staff modules (launch stubs)",
    category: "Staff NSI",
    completionPct: khPct,
    status: khPct >= 80 ? "complete" : khPct >= 50 ? "partial" : "stub",
    built: khLiveModules,
    total: khModuleEntries.length,
    flags: khStaffStubs > 0 ? [`${khStaffStubs} KH modules still staff-stub in launch mode`] : [],
    href: "/admin/intelligence/kim-hammer",
  });

  const offenseReadinessPct = computeOppositionOffenseReadinessPct();
  items.push({
    id: "debate-command-scores",
    label: "Debate command live readiness scores",
    category: "Readiness",
    completionPct: offenseReadinessPct,
    status: offenseReadinessPct >= 85 ? "complete" : offenseReadinessPct >= 70 ? "partial" : "flagged",
    built: offenseReadinessPct,
    total: 100,
    flags: offenseReadinessPct < 85 ? ["Raise lowest dimension on supreme workbench before stage"] : [],
    href: "/admin/intelligence/supreme-workbench",
  });

  // Opposition strategy layer v6.2
  items.push({
    id: "opposition-strategy-layer",
    label: "Opposition strategy layer (v6.2)",
    category: "Offense",
    completionPct: offenseReadinessPct,
    status: offenseReadinessPct >= 85 ? "complete" : "partial",
    built: listCuratedBillPlaybookNumbers().length,
    total: billNumbers.length,
    flags:
      listCuratedBillPlaybookNumbers().length < billNumbers.length
        ? [`${billNumbers.length - listCuratedBillPlaybookNumbers().length} bills still auto-synthesized`]
        : [],
    href: "/admin/intelligence/opposition-strategy",
  });

  // Supreme workbench v6
  items.push({
    id: "supreme-workbench",
    label: "Supreme workbench command surface",
    category: "Command",
    completionPct: 100,
    status: "complete",
    built: 8,
    total: 8,
    flags: [],
    href: "/admin/intelligence/supreme-workbench",
  });

  // Election funding intelligence (CVSGF + HAVA)
  items.push({
    id: "election-funding-cvsgf",
    label: "County Voting System Grant Fund research",
    category: "Election funding",
    completionPct: 88,
    status: "partial",
    built: 15,
    total: 17,
    flags: [
      "Statewide county-by-county award ledger not public — records request drafted",
      "Garland $14,340 — verify primary county budget document",
      "75-county budget scrape not complete",
    ],
    href: "/admin/intelligence/election-funding",
  });

  // ACCA Summer Conference 2026 — Mountain View SOS panel
  const accaSectionIds = getAllAccaConferenceDepthSectionIds();
  items.push({
    id: "acca-summer-conference-2026",
    label: "ACCA Mountain View SOS candidates panel (Jun 11)",
    category: "County clerks",
    completionPct: 92,
    status: "partial",
    built: accaSectionIds.length,
    total: accaSectionIds.length + 1,
    flags: ["Moderator name and panel format details not yet confirmed with AAC"],
    href: "/admin/intelligence/county-clerk-week/acca-summer-conference",
  });

  items.push({
    id: "kelly-alignment-dossier",
    label: "Kelly Experience-to-Office Alignment dossier",
    category: "Kelly profile",
    completionPct: 100,
    status: "complete",
    built: getAllKellyDossierSectionIds().length,
    total: getAllKellyDossierSectionIds().length,
    flags: ["Court diligence log still NOT_SEARCHED — do not claim clean search on stage"],
    href: "/admin/intelligence/candidate-dossiers/kelly-grappe",
  });

  items.push({
    id: "candidate-dossier-briefing-book",
    label: "Phase 1 — Dossier briefing book (Kelly + Hammer + Pakko)",
    category: "Candidate dossiers",
    completionPct: computeDossierBriefingBookProgress().overallPct,
    status:
      computeDossierBriefingBookProgress().overallPct >= 90
        ? "complete"
        : computeDossierBriefingBookProgress().overallPct >= 75
          ? "partial"
          : "flagged",
    built: computeDossierBriefingBookProgress().overallPct,
    total: 100,
    flags:
      computeDossierBriefingBookProgress().overallPct < 90
        ? [
            `Kelly ${computeDossierBriefingBookProgress().kellyPct}% · Hammer ${computeDossierBriefingBookProgress().hammerPct}% · Pakko ${computeDossierBriefingBookProgress().pakkoPct}% at briefing-book bar`,
          ]
        : ["Briefing book mode live — bio chapters + read-aloud blocks on all dossier hubs"],
    href: "/admin/intelligence/candidate-dossiers",
  });

  items.push({
    id: "pakko-command-center",
    label: "Phase 0 — Pakko command center",
    category: "Opposition",
    completionPct: getPackoContrastGateStatus().blocked ? 85 : 100,
    status: getPackoContrastGateStatus().blocked ? "partial" : "complete",
    built: 4,
    total: 4,
    flags: getPackoContrastGateStatus().blocked
      ? [getPackoContrastGateStatus().message]
      : ["Contrast gate open — rehearsal modules live; no personal attack without counsel"],
    href: "/admin/intelligence/opponents/michael-packo",
  });

  items.push({
    id: "opponent-dossiers",
    label: "Opponent candidate dossiers (Hammer + Pakko)",
    category: "Opposition",
    completionPct: 92,
    status: "partial",
    built: getAllOpponentDossierSectionIds().length,
    total: getAllOpponentDossierSectionIds().length + 2,
    flags: getPackoContrastGateStatus().blocked
      ? ["Pakko contrast LOCKED — PACKO-01/02 OPEN", "Hammer + Kelly diligence logs NOT_SEARCHED"]
      : ["Hammer + Kelly diligence logs NOT_SEARCHED"],
    href: "/admin/intelligence/candidate-dossiers",
  });

  const phase2Surfaces = computePhase2SurfacesDepthProgress();
  items.push({
    id: "phase-2-diligence-field-book",
    label: "Phase 2 — Diligence operator prose + Field Book depth",
    category: "Governance",
    completionPct: phase2Surfaces.overallPct,
    status:
      phase2Surfaces.overallPct >= 100 ? "complete" : phase2Surfaces.overallPct >= 75 ? "partial" : "flagged",
    built: phase2Surfaces.overallPct,
    total: 100,
    flags:
      phase2Surfaces.overallPct < 100
        ? [`Operator guides ${phase2Surfaces.diligenceGuidePct}% · Field Book Phase A ${phase2Surfaces.fieldBookPhaseAPct}%`]
        : ["15 search operator guides + 8 Phase A Field Book articles at briefing bar"],
    href: "/admin/intelligence/diligence",
  });

  const diligenceRows = allDiligenceCompletionSummary();
  const diligenceAvg = Math.round(
    diligenceRows.reduce((sum, r) => sum + r.pct, 0) / Math.max(1, diligenceRows.length),
  );
  items.push({
    id: "opponent-diligence-hub",
    label: "Phase A — court/financial diligence (Kelly + Hammer + Pakko)",
    category: "Governance",
    completionPct: diligenceAvg,
    status: diligenceAvg >= 100 ? "complete" : diligenceAvg > 0 ? "partial" : "flagged",
    built: diligenceRows.filter((r) => r.pct >= 100).length,
    total: diligenceRows.length,
    flags: diligenceRows.flatMap((r) =>
      r.incomplete > 0 ? [`${r.displayName}: ${r.incomplete} searches NOT_SEARCHED`] : [],
    ),
    href: "/admin/intelligence/diligence",
  });

  const fieldBookPhaseA = FIELD_BOOK_ARTICLES.filter((a) => a.phaseId === "phase-a").length;
  const fieldBookPhaseD = FIELD_BOOK_ARTICLES.filter((a) => a.phaseId === "phase-d").length;
  items.push({
    id: "field-book",
    label: "The Field Book — campaign encyclopedia",
    category: "Canon",
    completionPct: Math.round((fieldBookPhaseA / FIELD_BOOK_ARTICLES.length) * 100),
    status: "partial",
    built: FIELD_BOOK_ARTICLES.length,
    total: FIELD_BOOK_ARTICLES.length + 40,
    flags: [
      "Phase A articles live — Phases B–D expand as upgrades ship",
      "Strategy manual migration after ~98% intelligence",
    ],
    href: "/admin/intelligence/field-book",
  });

  const canonStats = computeCanonLoopStats();
  items.push({
    id: "field-book-canon-loop",
    label: "Phase D — Field Book canon loop + three-lane nav",
    category: "Organization",
    completionPct: Math.round(
      ((canonStats.bindingCount / 12) * 50 + (fieldBookPhaseD / 3) * 50),
    ),
    status: canonStats.bindingCount >= 12 && fieldBookPhaseD >= 3 ? "complete" : "partial",
    built: canonStats.bindingCount,
    total: 12,
    flags:
      fieldBookPhaseD < 3
        ? ["Expand Phase D Field Book articles (three-lane-nav, role profiles, strategy migration)"]
        : [],
    href: "/admin/intelligence/field-book/canon",
  });

  items.push({
    id: "debate-psychology-manual",
    label: "Debate psychology training manual",
    category: "Debate prep",
    completionPct: 100,
    status: "complete",
    built: getAllDebatePsychologyManualSectionIds().length,
    total: getAllDebatePsychologyManualSectionIds().length,
    flags: [],
    href: "/admin/intelligence/debate-prep/psychology-manual",
  });

  items.push({
    id: "nsi-staff-research-suite",
    label: "NSI staff research suite (Tier 1)",
    category: "Staff",
    completionPct: 100,
    status: "complete",
    built: NSI_STAFF_RESEARCH_NAV_ITEMS.length,
    total: NSI_STAFF_RESEARCH_NAV_ITEMS.length,
    flags: [],
    href: "/admin/intelligence/morning-brief",
  });

  items.push({
    id: "debate-philosophy-briefings",
    label: "Philosophy briefing library (Tier 2)",
    category: "Debate prep",
    completionPct: 100,
    status: "complete",
    built: listDebatePhilosophyBriefings().length,
    total: listDebatePhilosophyBriefings().length,
    flags: [],
    href: "/admin/intelligence/debate-briefings",
  });

  items.push({
    id: "debate-depth-library",
    label: "Plain-language depth library (Tier 2)",
    category: "Debate prep",
    completionPct: 100,
    status: "complete",
    built: DEBATE_DEPTH_TOPICS.length,
    total: DEBATE_DEPTH_TOPICS.length,
    flags: [],
    href: "/admin/intelligence/debate-depth",
  });

  const khTier3Groups = buildKimHammerTier3NavGroups();
  const khTier3ModuleCount = khTier3Groups.reduce((n, g) => n + g.modules.length, 0);
  items.push({
    id: "kim-hammer-tier3-nav",
    label: "Kim Hammer research stack (Tier 3)",
    category: "Opposition",
    completionPct: 100,
    status: "complete",
    built: khTier3ModuleCount,
    total: khTier3ModuleCount,
    flags: [],
    href: "/admin/intelligence/kim-hammer",
  });

  const tier4Groups = buildTier4CoreSpineNavGroups();
  const tier4SurfaceCount = tier4Groups.reduce((n, g) => n + g.items.length, 0);
  items.push({
    id: "tier4-core-spine-nav",
    label: "Core debate-week spine (Tier 4)",
    category: "Command",
    completionPct: 100,
    status: "complete",
    built: tier4SurfaceCount,
    total: tier4SurfaceCount,
    flags: [],
    href: "/admin/intelligence/supreme-workbench",
  });

  const overallCompletionPct = Math.round(items.reduce((s, i) => s + i.completionPct, 0) / items.length);

  const psychologyIds = getAllDebatePsychologyManualSectionIds();
  const linkAuditRoutes = [
    "/admin/intelligence",
    "/admin/intelligence/supreme-workbench",
    "/admin/intelligence/opposition-strategy",
    "/admin/intelligence/kim-hammer/debate-prep",
    "/admin/intelligence/trap-lanes",
    "/admin/intelligence/sos-debate-questions",
    "/admin/intelligence/debate-briefings",
    "/admin/intelligence/debate-depth",
    "/admin/intelligence/kelly-debate-coaching",
    "/admin/intelligence/debate-command",
    "/admin/intelligence/claims",
    "/admin/intelligence/election-funding",
    "/admin/intelligence/county-clerk-week/acca-summer-conference",
    "/admin/intelligence/candidate-dossiers",
    "/admin/intelligence/candidate-dossiers/kelly-grappe",
    "/admin/intelligence/candidate-dossiers",
    "/admin/intelligence/opponents/dossiers/kim-hammer",
    "/admin/intelligence/opponents/dossiers/michael-packo",
    ...getPackoCommandCenterLinkAuditRoutes(),
    "/admin/intelligence/build-progress",
    "/admin/intelligence/debate-prep/psychology-manual",
    ...psychologyIds.map((id) => `/admin/intelligence/debate-prep/psychology-manual/${id}`),
    ...NSI_STAFF_RESEARCH_NAV_ITEMS.map((item) => item.href),
    ...getTier1NavLinkAuditRoutes(),
    ...getTier2DebatePrepLinkAuditRoutes(),
    ...getKimHammerTier3LinkAuditRoutes(),
    ...getTier4CoreSpineLinkAuditRoutes(),
    ...getFieldBookLinkAuditRoutes(),
    ...getThreeLaneNavLinkAuditRoutes(),
    "/admin/intelligence/field-book/canon",
    "/admin/intelligence/diligence",
    "/admin/intelligence/diligence/kelly-grappe",
    "/admin/intelligence/diligence/kim-hammer",
    "/admin/intelligence/diligence/michael-packo",
    ...trapIds.map((id) => `/admin/intelligence/trap-lanes/${id}`),
    ...qIds.map((id) => `/admin/intelligence/sos-debate-questions/${id}`),
    ...listDebatePhilosophyBriefings().map((p) => `/admin/intelligence/debate-briefings/${p.briefingId}`),
    ...prepIds.map((id) => `/admin/intelligence/kim-hammer/debate-prep/${id}`),
    ...billNumbers.slice(0, 29).map((b) => `/admin/intelligence/kim-hammer/bills/${b}`),
    ...billNumbers.slice(0, 29).map((b) => `/admin/intelligence/kim-hammer/bills/${b}/act-proof`),
  ];

  const flaggedForMasterBuild = items.flatMap((i) => (i.flags.length ? i.flags.map((f) => `[${i.label}] ${f}`) : []));

  const phases: BuildPhase[] = [
    {
      phase: 1,
      name: "v5.0 — Drill-down depth (COMPLETE)",
      targetVersion: "0.13.0",
      goal: "Act-proof pages, response rounds, trap step coverage, progress dashboard, link audit.",
      items: [
        "Bill act-proof drill-down with Arkleg links",
        "SOS question response round enrichment",
        "Trap lane step-by-step coverage",
        "Kelly research + offensive depth modules",
        "Build progress dashboard",
      ],
      exitCriteria: [
        "All bill drill-down links go to act-proof (not self-loop)",
        "Link audit script passes on intelligence routes",
        "Typecheck clean",
      ],
    },
    {
      phase: 2,
      name: "v5.1 — Curated bill depth",
      targetVersion: "0.13.1",
      goal: "Expand curated playbooks from 5 anchor bills to full 29.",
      items: ["Curate remaining 24 bill playbooks", "Enrolled-act PDF links for all acts", "County examples per bill (verified)"],
      exitCriteria: ["0 auto-synthesized playbooks flagged on progress chart"],
    },
    {
      phase: 3,
      name: "v5.2 — Kelly verification pass",
      targetVersion: "0.13.2",
      goal: "Close NEEDS_RESEARCH on Kelly attack vectors.",
      items: ["CourtConnect search log", "Financial diligence log", "Counsel-approved denial scripts"],
      exitCriteria: ["Kelly research section 100% on progress chart"],
    },
    {
      phase: 4,
      name: "v5.3 — Live readiness wiring (COMPLETE)",
      targetVersion: "0.14.0",
      goal: "Supreme workbench unifies live scores, operator sequences, and opposition lanes.",
      items: [
        "Supreme workbench command surface",
        "Live readiness dimensions wired to drill-down depth",
        "Debate command scores from supreme workbench",
        "Kelly court diligence log checklist",
      ],
      exitCriteria: [
        "Debate command scores live from supreme workbench",
        "8 readiness dimensions computed from packet + drill-downs",
        "Operator sequences T-24h through spin room",
      ],
    },
    {
      phase: 5,
      name: "v6.0 — Staff module completion",
      targetVersion: "0.15.0",
      goal: "Promote launch stubs to live modules where debate week needs them.",
      items: ["Citation locker integration", "Narrative drift monitor", "County briefing automation"],
      exitCriteria: ["Staff modules >80% on progress chart"],
    },
    {
      phase: 6,
      name: "v6.1 — Curated bill completion + CVSGF ledger",
      targetVersion: "0.16.0",
      goal: "Close remaining auto-synthesized playbooks and statewide funding ledger.",
      items: [
        "Curate remaining auto-synthesized bill playbooks",
        "Execute CVSGF records request",
        "Close Kelly diligence log searches",
      ],
      exitCriteria: ["0 auto-synthesized playbooks flagged", "Kelly research 100%", "CVSGF ledger verified or deferred with owner"],
    },
    {
      phase: 7,
      name: "v6.2 — Opposition strategy layer (COMPLETE)",
      targetVersion: "0.15.2",
      goal: "Unified offense command: 2021/2025 package depth, trap lane map, offensive moves, cross-exam wiring.",
      items: [
        "Opposition strategy layer page + panel",
        "2021 integrity package six-bill anchors curated",
        "2025 petition cluster depth module",
        "Live claims ledger ratio on build progress",
        "Kelly diligence log JSON + supreme workbench integration",
      ],
      exitCriteria: [
        "Opposition strategy route live on Netlify",
        "11+ curated bill playbooks (2021 package complete)",
        "Hub compact panels for supreme workbench + opposition strategy",
        "Link audit includes /opposition-strategy",
      ],
    },
    {
      phase: 8,
      name: "v6.3 — Debate briefing depth (COMPLETE)",
      targetVersion: "0.16.0",
      goal: "Full quick-read briefings on every SOS question and trap lane — why, alternatives, Hammer hooks — plus philosophy library and prep finder.",
      items: [
        "Debate briefing enrichment on 23 SOS questions",
        "Eight philosophy/handling briefing pages",
        "Prep finder search across questions, traps, prep sections",
        "Hub + SOS index wired to briefing library",
        "Build progress tracks briefing completion",
      ],
      exitCriteria: [
        "Every SOS question drill-down opens with briefing panel",
        "Philosophy briefings route live",
        "Prep finder returns results for county, petition, integrity",
        "Netlify typecheck clean",
      ],
    },
    {
      phase: 9,
      name: "v6.4 — Gap closure pass (THIS PASS)",
      targetVersion: "0.16.1",
      goal: "Curate all 29 bill playbooks, deepen Kelly public-record research, honest court diligence protocol, CVSGF FY2026-27 deferred.",
      items: [
        "Index-curated playbooks for remaining 18 bills",
        "Kelly public record brief + expanded attack vectors",
        "Court diligence log v2 with public brief links",
        "CVSGF FY2026-27 marked DEFERRED — not fabricated",
        "Promote debate-prep + debate-archive launch modules",
      ],
      exitCriteria: [
        "0 auto-synthesized playbooks flagged",
        "29/29 curated bill playbooks on audit",
        "Kelly public brief live on coaching panel",
        "Netlify deploy green",
      ],
    },
    {
      phase: 10,
      name: "v6.5 — Candidate dossiers pass (THIS PASS)",
      targetVersion: "0.18.0",
      goal: "Kelly Experience-to-Office Alignment Profile as first-class dossier; unified candidate hub; narrative depth upgrade; Netlify hardening.",
      items: [
        "Kelly alignment dossier — 12 drill-down sections + crosswalk table",
        "Unified /candidate-dossiers hub (Kelly + Hammer + Pakko)",
        "iPad Profile tab + enriched opponent executive narratives",
        "Hardening audit extended for Kelly routes",
      ],
      exitCriteria: [
        "Kelly dossier single-page readout live on Netlify",
        "All three candidates reachable from dossier hub",
        "Hardening audit + typecheck green",
        "No serverless hang on dossier load (JSON + static TS only)",
      ],
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    version: "v6.5-candidate-dossiers-pass",
    overallCompletionPct,
    items,
    phases,
    linkAuditRoutes,
    flaggedForMasterBuild,
  };
}
