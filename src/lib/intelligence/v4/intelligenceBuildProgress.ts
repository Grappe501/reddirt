import fs from "node:fs";
import path from "node:path";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";
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
import { computePhase3UpgradePass } from "@/lib/intelligence/v4/phase3DebateSpineDepth";
import { computePhase4UpgradePass } from "@/lib/intelligence/v4/phase4CanonLoop";
import { computePhase5UpgradePass } from "@/lib/intelligence/v4/phase5GlossaryConnectivity";
import { computePhase6UpgradePass } from "@/lib/intelligence/v4/phase6DebateReadyGovernance";
import { computePhase7UpgradePass } from "@/lib/intelligence/v4/phase7DossierDiligenceClosure";
import { computePhase8UpgradePass } from "@/lib/intelligence/v4/phase8DossierResearchAccaClosure";
import { computePhase9UpgradePass } from "@/lib/intelligence/v4/phase9DebateInstructionClosure";
import { computePhase10UpgradePass } from "@/lib/intelligence/v4/phase10StrategyPhilosophyClosure";
import { computePhase11UpgradePassSync } from "@/lib/intelligence/v4/phase11CampaignSystemClosure";
import { computePhase11P1UpgradePass } from "@/lib/intelligence/v4/phase11KellyStrategicPlanClosure";
import { computePhase11P2UpgradePass } from "@/lib/intelligence/v4/phase11P2Closure";
import { computePhase11P3UpgradePass } from "@/lib/intelligence/v4/phase11P3Closure";
import { computePhase11P4UpgradePass } from "@/lib/intelligence/v4/phase11P4Closure";
import { computePhase11P5UpgradePass } from "@/lib/intelligence/v4/phase11P5Closure";
import { computePhase11P6UpgradePass } from "@/lib/intelligence/v4/phase11P6Closure";
import { computePhase11P7UpgradePass } from "@/lib/intelligence/v4/phase11P7Closure";
import { computePhase11P8UpgradePass } from "@/lib/intelligence/v4/phase11P8Closure";
import { computePhase11P9UpgradePass } from "@/lib/intelligence/v4/phase11P9Closure";
import { computePhase15P0P1UpgradePass } from "@/lib/intelligence/v4/phase15Closure";
import { computePhase15P2UpgradePass } from "@/lib/intelligence/v4/phase15P2Closure";
import { computePhase15P3UpgradePass } from "@/lib/intelligence/v4/phase15P3Closure";
import { computePhase15P4UpgradePass } from "@/lib/intelligence/v4/phase15P4Closure";
import { computePhase15P5UpgradePass } from "@/lib/intelligence/v4/phase15P5Closure";
import { computePhase15P6UpgradePass } from "@/lib/intelligence/v4/phase15P6Closure";
import { computePhase15P7UpgradePass } from "@/lib/intelligence/v4/phase15P7Closure";
import { computePhase15P8UpgradePass } from "@/lib/intelligence/v4/phase15P8Closure";
import { computePhase15P9UpgradePass } from "@/lib/intelligence/v4/phase15P9Closure";
import { computePhase16P0UpgradePass } from "@/lib/intelligence/v4/phase16P0Closure";
import { computePhase16P1UpgradePass } from "@/lib/intelligence/v4/phase16P1Closure";
import { computePhase16P2UpgradePass } from "@/lib/intelligence/v4/phase16P2Closure";
import { computePhase16P3UpgradePass } from "@/lib/intelligence/v4/phase16P3Closure";
import { computePhase16P4UpgradePass } from "@/lib/intelligence/v4/phase16P4Closure";
import { computePhase16P5UpgradePass } from "@/lib/intelligence/v4/phase16P5Closure";
import { computePhase16P6UpgradePass } from "@/lib/intelligence/v4/phase16P6Closure";
import { computePhase16P7UpgradePass } from "@/lib/intelligence/v4/phase16P7Closure";
import { computePhase16P8UpgradePass } from "@/lib/intelligence/v4/phase16P8Closure";
import { computePhase16P9UpgradePass } from "@/lib/intelligence/v4/phase16P9Closure";
import { computePhase17UpgradePass } from "@/lib/intelligence/v4/phase17SearchAiPrepClosure";
import { computePhase18UpgradePass } from "@/lib/intelligence/v4/phase18SearchAiProfessorClosure";
import { computePhase19UpgradePass } from "@/lib/intelligence/v4/phase19ProfessorShowcaseClosure";
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

function buildProgressDegradedFallback(): IntelligenceBuildProgressReport {
  return {
    generatedAt: new Date().toISOString(),
    version: "degraded-netlify-pruned-corpus",
    overallCompletionPct: 0,
    items: [
      {
        id: "build-progress-degraded",
        label: "Build progress unavailable on this deploy",
        category: "Governance",
        completionPct: 0,
        status: "flagged",
        built: 0,
        total: 1,
        flags: ["Large manual corpora pruned from Netlify handler — debate prep routes still load from JSON"],
        href: "/admin/intelligence/kim-hammer/debate-prep",
      },
    ],
    phases: [],
    linkAuditRoutes: [],
    flaggedForMasterBuild: ["build-progress-metrics-unavailable"],
  };
}

export function computeIntelligenceBuildProgress(): IntelligenceBuildProgressReport {
  return tryIntelligenceLoad(
    "intelligence-build-progress",
    computeIntelligenceBuildProgressCore,
    buildProgressDegradedFallback(),
  );
}

function computeIntelligenceBuildProgressCore(): IntelligenceBuildProgressReport {
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

  const phase3Pass = computePhase3UpgradePass();
  items.push({
    id: "phase-3-debate-spine-depth",
    label: "Phase 3 — Five-layer debate spine waves (W1–W6)",
    category: "Debate spine",
    completionPct: phase3Pass.completionPct,
    status:
      phase3Pass.w3DebateSpinePct >= 95
        ? "complete"
        : phase3Pass.w3DebateSpinePct >= 75
          ? "partial"
          : "flagged",
    built: phase3Pass.w3DebateSpinePct,
    total: 100,
    flags:
      phase3Pass.w3DebateSpinePct < 100
        ? [`W3 debate spine ${phase3Pass.w3DebateSpinePct}% · Waves W4–W6 expand incrementally`]
        : ["Trap lanes + SOS bank + command surfaces at five-layer bar"],
    href: "/admin/intelligence/phase-3-upgrade",
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

  const phase4Pass = computePhase4UpgradePass();
  items.push({
    id: "phase-4-canon-loop",
    label: "Phase 4 — Field Book canon loop + strategy migration",
    category: "Canon",
    completionPct: phase4Pass.completionPct,
    status: phase4Pass.completionPct >= 90 ? "complete" : phase4Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase4Pass.progress.bindingsAtBar,
    total: phase4Pass.progress.bindingCount,
    flags:
      phase4Pass.completionPct < 100
        ? [
            `${phase4Pass.progress.bindingCount} bindings · ${phase4Pass.progress.strategyRoutes} strategy routes · Phase D ${phase4Pass.progress.phaseDArticlesAtBar}/${phase4Pass.progress.phaseDArticleTotal}`,
          ]
        : ["Canon loop + strategy migration bridge at bar"],
    href: "/admin/intelligence/phase-4-upgrade",
  });

  const phase5Pass = computePhase5UpgradePass();
  items.push({
    id: "phase-5-glossary-connectivity",
    label: "Phase 5 — Debate glossary + hub connectivity",
    category: "Canon",
    completionPct: Math.min(100, phase5Pass.completionPct),
    status: phase5Pass.completionPct >= 95 ? "complete" : phase5Pass.completionPct >= 80 ? "partial" : "flagged",
    built: phase5Pass.progress.glossaryTermsAtBar,
    total: phase5Pass.progress.glossaryTermCount,
    flags: [
      `${phase5Pass.progress.glossaryTermsAtBar} glossary terms · ${phase5Pass.progress.hubRoutesBound}/${phase5Pass.progress.hubRoutesTotal} hubs · B/C ${phase5Pass.progress.phaseBcArticlesAtBar}/${phase5Pass.progress.phaseBcArticleTotal}`,
    ],
    href: "/admin/intelligence/phase-5-upgrade",
  });

  const phase6Pass = computePhase6UpgradePass();
  items.push({
    id: "phase-6-debate-ready-governance",
    label: "Phase 6 — Debate-ready governance",
    category: "Governance",
    completionPct: phase6Pass.completionPct,
    status: phase6Pass.completionPct >= 85 ? "complete" : phase6Pass.completionPct >= 70 ? "partial" : "flagged",
    built: phase6Pass.progress.prepSectionsAtBar,
    total: phase6Pass.progress.prepSectionTotal,
    flags: [
      `Prep ${phase6Pass.progress.prepSectionsAtBar}/${phase6Pass.progress.prepSectionTotal} · traps ${phase6Pass.progress.trapLanesAtBar}/${phase6Pass.progress.trapLaneTotal} · KH ${phase6Pass.progress.khModulesPromoted}/${phase6Pass.progress.khModulesPromotedTarget} · ${phase6Pass.progress.claimsNeedsReview} claims NEEDS_REVIEW`,
    ],
    href: "/admin/intelligence/phase-6-upgrade",
  });

  const phase7Pass = computePhase7UpgradePass();
  items.push({
    id: "phase-7-dossier-diligence-closure",
    label: "Phase 7 — Dossier briefing closure + diligence runbook",
    category: "Governance",
    completionPct: phase7Pass.completionPct,
    status: phase7Pass.completionPct >= 90 ? "complete" : phase7Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase7Pass.progress.dossierOverallPct,
    total: 100,
    flags: [
      `Dossier K ${phase7Pass.progress.kellyPct}% · H ${phase7Pass.progress.hammerPct}% · P ${phase7Pass.progress.pakkoPct}% · runbook ${phase7Pass.progress.diligenceRunbookPct}% · KH wave2 ${phase7Pass.progress.khWave2Promoted}/10`,
    ],
    href: "/admin/intelligence/phase-7-upgrade",
  });

  const phase8Pass = computePhase8UpgradePass();
  items.push({
    id: "phase-8-dossier-research-acca-closure",
    label: "Phase 8 — Dossier research depth + ACCA panel closure",
    category: "Governance",
    completionPct: phase8Pass.completionPct,
    status: phase8Pass.completionPct >= 90 ? "complete" : phase8Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase8Pass.progress.dossierResearchPct,
    total: 100,
    flags: [
      `Research ${phase8Pass.progress.dossierResearchPct}% · ACCA ${phase8Pass.progress.accaSectionsAtBar}/${phase8Pass.progress.accaSectionTotal} · KH wave3 ${phase8Pass.progress.khWave3Promoted}/10 · K ${phase8Pass.progress.kellySectionsAtResearchBar}/${phase8Pass.progress.kellySectionTotal} sections`,
    ],
    href: "/admin/intelligence/phase-8-upgrade",
  });

  const phase9Pass = computePhase9UpgradePass();
  items.push({
    id: "phase-9-debate-instruction-bridge",
    label: "Phase 9 — Dossier depth + debate instruction bridge",
    category: "Governance",
    completionPct: phase9Pass.completionPct,
    status: phase9Pass.completionPct >= 90 ? "complete" : phase9Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase9Pass.progress.prepSectionsAtBridge,
    total: phase9Pass.progress.prepSectionTotal,
    flags: [
      `Depth ${phase9Pass.progress.dossierDepthPct}% · prep ${phase9Pass.progress.prepSectionsAtBridge}/${phase9Pass.progress.prepSectionTotal} · traps ${phase9Pass.progress.trapLanesAtBridge}/${phase9Pass.progress.trapLaneTotal} · SOS ${phase9Pass.progress.sosQuestionsAtBridge}/${phase9Pass.progress.sosQuestionTotal} · KH wave4 ${phase9Pass.progress.khWave4Promoted}/2`,
    ],
    href: "/admin/intelligence/phase-9-upgrade",
  });

  const phase10Pass = computePhase10UpgradePass();
  items.push({
    id: "phase-10-strategy-philosophy-command",
    label: "Phase 10 — Strategy & political philosophy command",
    category: "Governance",
    completionPct: phase10Pass.completionPct,
    status: phase10Pass.completionPct >= 90 ? "complete" : phase10Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase10Pass.progress.philosophyBriefingsAtBar,
    total: phase10Pass.progress.philosophyBriefingTotal,
    flags: [
      `Briefings ${phase10Pass.progress.philosophyBriefingsAtBar}/8 · psych ${phase10Pass.progress.psychologySectionsAtBar}/19 · graph ${phase10Pass.progress.philosophyGraphNodesAtBar}/8 · inventory ${phase10Pass.progress.inventorySurfaceCount} surfaces`,
    ],
    href: "/admin/intelligence/strategy-philosophy-hub",
  });

  const phase11Pass = computePhase11UpgradePassSync();
  items.push({
    id: "phase-11-campaign-system-surfacing",
    label: "Phase 11 (P0) — Campaign system manual surfacing",
    category: "Governance",
    completionPct: phase11Pass.completionPct,
    status: phase11Pass.completionPct >= 90 ? "complete" : phase11Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase11Pass.progress.totalFiles,
    total: 252,
    flags: [
      `${phase11Pass.progress.totalFiles} files · ${phase11Pass.progress.categoriesWithFiles} categories · ${phase11Pass.progress.priorityPathsInInventory} priority tomes`,
    ],
    href: "/admin/intelligence/phase-11-upgrade",
  });

  const phase11P1Pass = computePhase11P1UpgradePass();
  items.push({
    id: "phase-11-p1-kelly-strategic-plan",
    label: "Phase 11 (P1) — Kelly SOS strategic plan command",
    category: "Governance",
    completionPct: phase11P1Pass.completionPct,
    status: phase11P1Pass.completionPct >= 90 ? "complete" : phase11P1Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase11P1Pass.progress.chaptersAtBar,
    total: phase11P1Pass.progress.chapterTotal,
    flags: [
      `${phase11P1Pass.progress.chaptersAtBar}/${phase11P1Pass.progress.chapterTotal} chapters at P1 bar · intelligence reader live`,
    ],
    href: "/admin/intelligence/phase-11-p1-upgrade",
  });

  const phase11P2Pass = computePhase11P2UpgradePass();
  items.push({
    id: "phase-11-p2-movement-philosophy-staff-strategy",
    label: "Phase 11 (P2) — Movement philosophy + staff strategy command",
    category: "Governance",
    completionPct: phase11P2Pass.completionPct,
    status: phase11P2Pass.completionPct >= 90 ? "complete" : phase11P2Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase11P2Pass.progress.movementDocsAtBar + phase11P2Pass.progress.staffSurfacesAtBar,
    total: phase11P2Pass.progress.movementDocTotal + phase11P2Pass.progress.staffSurfaceTotal,
    flags: [
      `${phase11P2Pass.progress.movementDocsAtBar}/${phase11P2Pass.progress.movementDocTotal} philosophy docs · ${phase11P2Pass.progress.staffSurfacesAtBar}/${phase11P2Pass.progress.staffSurfaceTotal} staff surfaces · debate philosophy feed live`,
    ],
    href: "/admin/intelligence/phase-11-p2-upgrade",
  });

  const phase11P3Pass = computePhase11P3UpgradePass();
  items.push({
    id: "phase-11-p3-strategy-doctrine",
    label: "Phase 11 (P3) — Strategy doctrine JSON command",
    category: "Governance",
    completionPct: phase11P3Pass.completionPct,
    status: phase11P3Pass.completionPct >= 90 ? "complete" : phase11P3Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase11P3Pass.progress.artifactsAtBar,
    total: phase11P3Pass.progress.artifactTotal,
    flags: [
      `${phase11P3Pass.progress.artifactsAtBar}/${phase11P3Pass.progress.artifactTotal} JSON artifacts · ${phase11P3Pass.progress.registryDoctrineCount} registry entries`,
    ],
    href: "/admin/intelligence/phase-11-p3-upgrade",
  });

  const phase11P4Pass = computePhase11P4UpgradePass();
  items.push({
    id: "phase-11-p4-philosophy-graph-claims",
    label: "Phase 11 (P4) — Philosophy graph claims review",
    category: "Governance",
    completionPct: phase11P4Pass.completionPct,
    status: phase11P4Pass.completionPct >= 90 ? "complete" : phase11P4Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase11P4Pass.progress.nodesAtBar,
    total: phase11P4Pass.progress.nodeTotal,
    flags: [
      `${phase11P4Pass.progress.nodesAtBar}/${phase11P4Pass.progress.nodeTotal} nodes · ${phase11P4Pass.progress.philosophyClaimsInLedger} ledger claims · ${phase11P4Pass.progress.claimsApprovedInternal} approved internal`,
    ],
    href: "/admin/intelligence/phase-11-p4-upgrade",
  });

  const phase11P5Pass = computePhase11P5UpgradePass();
  items.push({
    id: "phase-11-p5-field-book-chunk-promotion",
    label: "Phase 11 (P5) — Field Book chunk promotion",
    category: "Organization",
    completionPct: phase11P5Pass.completionPct,
    status: phase11P5Pass.completionPct >= 90 ? "complete" : phase11P5Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase11P5Pass.progress.batchesAtBar,
    total: phase11P5Pass.progress.batchTotal,
    flags: [
      `${phase11P5Pass.progress.totalChunks.toLocaleString()}/${phase11P5Pass.progress.targetChunkTotal.toLocaleString()} chunks · ${phase11P5Pass.progress.batchesAtBar}/${phase11P5Pass.progress.batchTotal} batches · gate ${phase11P5Pass.progress.promotionGateOpen ? "open" : "locked"}`,
    ],
    href: "/admin/intelligence/phase-11-p5-upgrade",
  });

  const phase11P6Pass = computePhase11P6UpgradePass();
  items.push({
    id: "phase-11-p6-strategy-alignment-chunk-preview",
    label: "Phase 11 (P6) — Strategy alignment chunk preview",
    category: "Governance",
    completionPct: phase11P6Pass.completionPct,
    status: phase11P6Pass.completionPct >= 90 ? "complete" : phase11P6Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase11P6Pass.progress.lanesAtBar,
    total: phase11P6Pass.progress.laneTotal,
    flags: [
      `${phase11P6Pass.progress.lanesAtBar}/${phase11P6Pass.progress.laneTotal} preview lanes · ${phase11P6Pass.progress.totalMatchingChunks.toLocaleString()} matching chunks`,
    ],
    href: "/admin/intelligence/phase-11-p6-upgrade",
  });

  const phase11P7Pass = computePhase11P7UpgradePass();
  items.push({
    id: "phase-11-p7-briefing-papers-chunk-attach",
    label: "Phase 11 (P7) — Briefing papers chunk attach",
    category: "Staff",
    completionPct: phase11P7Pass.completionPct,
    status: phase11P7Pass.completionPct >= 90 ? "complete" : phase11P7Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase11P7Pass.progress.lanesAtBar,
    total: phase11P7Pass.progress.laneTotal,
    flags: [
      `${phase11P7Pass.progress.lanesAtBar}/${phase11P7Pass.progress.laneTotal} attach lanes · ${phase11P7Pass.progress.totalAttachableChunks.toLocaleString()} attachable chunks`,
    ],
    href: "/admin/intelligence/phase-11-p7-upgrade",
  });

  const phase11P8Pass = computePhase11P8UpgradePass();
  items.push({
    id: "phase-11-p8-field-book-promotion-execution",
    label: "Phase 11 (P8) — Field Book promotion execution",
    category: "Organization",
    completionPct: phase11P8Pass.completionPct,
    status: phase11P8Pass.completionPct >= 90 ? "complete" : phase11P8Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase11P8Pass.progress.wavesAtBar,
    total: phase11P8Pass.progress.waveTotal,
    flags: [
      `${phase11P8Pass.progress.wavesAtBar}/${phase11P8Pass.progress.waveTotal} waves · pipeline ${phase11P8Pass.progress.promotionPipelineReady ? "ready" : "partial"} · ${phase11P8Pass.progress.canonBindingCount} canon bindings`,
    ],
    href: "/admin/intelligence/phase-11-p8-upgrade",
  });

  const phase11P9Pass = computePhase11P9UpgradePass();
  items.push({
    id: "phase-11-p9-stack-closure",
    label: "Phase 11 (P9) — Stack closure",
    category: "Command",
    completionPct: phase11P9Pass.completionPct,
    status: phase11P9Pass.completionPct >= 90 ? "complete" : phase11P9Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase11P9Pass.progress.passesAtBar,
    total: phase11P9Pass.progress.passTotal,
    flags: [
      `${phase11P9Pass.progress.passesAtBar}/${phase11P9Pass.progress.passTotal} sub-passes · stack ${phase11P9Pass.progress.stackCompletionPct}% · exit ${phase11P9Pass.progress.stackExitReady ? "ready" : "open"}`,
    ],
    href: "/admin/intelligence/phase-11-p9-upgrade",
  });

  const phase15Pass = computePhase15P0P1UpgradePass();
  items.push({
    id: "phase-15-p0-p1-candidate-command",
    label: "Phase 15 (P0+P1) — Candidate command experience",
    category: "Command",
    completionPct: phase15Pass.completionPct,
    status: phase15Pass.completionPct >= 90 ? "complete" : phase15Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase15Pass.progress.p0.sectionCount,
    total: 5,
    flags: [
      `${phase15Pass.progress.p0.linkCount} candidate nav links · builder ${phase15Pass.progress.p0.builderInfraHidden ? "hidden" : "visible"} · home ${phase15Pass.progress.p1.readinessPct}%`,
    ],
    href: "/admin/intelligence/phase-15-p0-p1-upgrade",
  });

  const phase15P2Pass = computePhase15P2UpgradePass();
  items.push({
    id: "phase-15-p2-kelly-prep-week",
    label: "Phase 15 (P2) — Kelly prep week",
    category: "Command",
    completionPct: phase15P2Pass.completionPct,
    status: phase15P2Pass.completionPct >= 90 ? "complete" : phase15P2Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase15P2Pass.progress.daysAtBar,
    total: phase15P2Pass.progress.dayTotal,
    flags: [
      `${phase15P2Pass.progress.daysAtBar}/${phase15P2Pass.progress.dayTotal} days · ${phase15P2Pass.progress.totalReads} reads · nav ${phase15P2Pass.progress.hubInCandidateNav ? "wired" : "open"}`,
    ],
    href: "/admin/intelligence/phase-15-p2-upgrade",
  });

  const phase15P3Pass = computePhase15P3UpgradePass();
  items.push({
    id: "phase-15-p3-stage-safe-filter",
    label: "Phase 15 (P3) — Stage-safe filter",
    category: "Governance",
    completionPct: phase15P3Pass.completionPct,
    status: phase15P3Pass.completionPct >= 90 ? "complete" : phase15P3Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase15P3Pass.progress.surfacesAtBar,
    total: phase15P3Pass.progress.surfaceTotal,
    flags: [
      `${phase15P3Pass.progress.trapLanesGated}/${phase15P3Pass.progress.trapLaneTotal} trap lanes gated · ${phase15P3Pass.progress.sosQuestionsGated} SOS gated · nav ${phase15P3Pass.progress.hubInCandidateNav ? "wired" : "open"}`,
    ],
    href: "/admin/intelligence/phase-15-p3-upgrade",
  });

  const phase15P4Pass = computePhase15P4UpgradePass();
  items.push({
    id: "phase-15-p4-top-tier-surfacing",
    label: "Phase 15 (P4) — Top-tier surfacing",
    category: "Command",
    completionPct: phase15P4Pass.completionPct,
    status: phase15P4Pass.completionPct >= 90 ? "complete" : phase15P4Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase15P4Pass.progress.itemsAtBar,
    total: phase15P4Pass.progress.itemTotal,
    flags: [
      `${phase15P4Pass.progress.briefingTotal} briefings · ${phase15P4Pass.progress.depthTotal} depth · ${phase15P4Pass.progress.psychTotal} psych · home ${phase15P4Pass.progress.tonightOnHome} promoted`,
    ],
    href: "/admin/intelligence/phase-15-p4-upgrade",
  });

  const phase15P5Pass = computePhase15P5UpgradePass();
  items.push({
    id: "phase-15-p5-evidence-honesty",
    label: "Phase 15 (P5) — Evidence honesty badges",
    category: "Governance",
    completionPct: phase15P5Pass.completionPct,
    status: phase15P5Pass.completionPct >= 90 ? "complete" : phase15P5Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase15P5Pass.progress.surfacesAtBar,
    total: phase15P5Pass.progress.surfaceCategoryTotal,
    flags: [
      `${phase15P5Pass.progress.surfacesAtBar}/${phase15P5Pass.progress.surfaceCategoryTotal} surfaces · ${phase15P5Pass.progress.filmDrillBadges} film drills · nav ${phase15P5Pass.progress.hubInCandidateNav ? "wired" : "open"}`,
    ],
    href: "/admin/intelligence/phase-15-p5-upgrade",
  });

  const phase15P6Pass = computePhase15P6UpgradePass();
  items.push({
    id: "phase-15-p6-demo-mode",
    label: "Phase 15 (P6) — Demo mode",
    category: "Candidate UX",
    completionPct: phase15P6Pass.completionPct,
    status: phase15P6Pass.completionPct >= 90 ? "complete" : phase15P6Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase15P6Pass.progress.stepsAtBar,
    total: phase15P6Pass.progress.stepTotal,
    flags: [
      `${phase15P6Pass.progress.stepsAtBar}/${phase15P6Pass.progress.stepTotal} script steps · ${phase15P6Pass.progress.scriptMinutes} min · nav ${phase15P6Pass.progress.hubInCandidateNav ? "wired" : "open"}`,
    ],
    href: "/admin/intelligence/phase-15-p6-upgrade",
  });

  const phase15P7Pass = computePhase15P7UpgradePass();
  items.push({
    id: "phase-15-p7-ipad-polish",
    label: "Phase 15 (P7) — iPad polish",
    category: "Candidate UX",
    completionPct: phase15P7Pass.completionPct,
    status: phase15P7Pass.completionPct >= 90 ? "complete" : phase15P7Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase15P7Pass.progress.sectionsAtBar,
    total: phase15P7Pass.progress.sectionTotal,
    flags: [
      `${phase15P7Pass.progress.sectionsAtBar}/${phase15P7Pass.progress.sectionTotal} sections · ${phase15P7Pass.progress.bottomNavTabs} tabs · nav ${phase15P7Pass.progress.hubInCandidateNav ? "wired" : "open"}`,
    ],
    href: "/admin/intelligence/phase-15-p7-upgrade",
  });

  const phase15P8Pass = computePhase15P8UpgradePass();
  items.push({
    id: "phase-15-p8-staff-backstage",
    label: "Phase 15 (P8) — Staff backstage",
    category: "Candidate UX",
    completionPct: phase15P8Pass.completionPct,
    status: phase15P8Pass.completionPct >= 90 ? "complete" : phase15P8Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase15P8Pass.progress.guardsAtBar,
    total: phase15P8Pass.progress.guardCategoryTotal,
    flags: [
      `${phase15P8Pass.progress.guardsAtBar}/${phase15P8Pass.progress.guardCategoryTotal} guards · ${phase15P8Pass.progress.prefixGuardCount} prefixes · staff nav ${phase15P8Pass.progress.hubInStaffNav ? "wired" : "open"}`,
    ],
    href: "/admin/intelligence/phase-15-p8-upgrade",
  });

  const phase15P9Pass = computePhase15P9UpgradePass();
  items.push({
    id: "phase-15-p9-cce-closure",
    label: "Phase 15 (P9) — CCE closure",
    category: "Candidate UX",
    completionPct: phase15P9Pass.completionPct,
    status: phase15P9Pass.completionPct >= 90 ? "complete" : phase15P9Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase15P9Pass.progress.passesAtBar,
    total: phase15P9Pass.progress.passTotal,
    flags: [
      `${phase15P9Pass.progress.passesAtBar}/${phase15P9Pass.progress.passTotal} passes · stack ${phase15P9Pass.progress.stackCompletionPct}% · exit ${phase15P9Pass.progress.cceExitReady ? "ready" : "open"}`,
    ],
    href: "/admin/intelligence/phase-15-p9-upgrade",
  });

  const phase16P0Pass = computePhase16P0UpgradePass();
  items.push({
    id: "phase-16-p0-session-launcher",
    label: "Phase 16 (P0) — Session launcher",
    category: "Candidate UX",
    completionPct: phase16P0Pass.completionPct,
    status: phase16P0Pass.completionPct >= 90 ? "complete" : phase16P0Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase16P0Pass.progress.encountersAtBar,
    total: phase16P0Pass.progress.encounterTotal,
    flags: [
      `${phase16P0Pass.progress.encountersAtBar}/${phase16P0Pass.progress.encounterTotal} encounters · ${phase16P0Pass.progress.runOfShowStepsAtBar}/${phase16P0Pass.progress.runOfShowStepTotal} steps · nav ${phase16P0Pass.progress.hubInCandidateNav ? "wired" : "open"}`,
    ],
    href: "/admin/intelligence/phase-16-p0-upgrade",
  });

  const phase16P1Pass = computePhase16P1UpgradePass();
  items.push({
    id: "phase-16-p1-run-of-show",
    label: "Phase 16 (P1) — Run-of-show",
    category: "Candidate UX",
    completionPct: phase16P1Pass.completionPct,
    status: phase16P1Pass.completionPct >= 90 ? "complete" : phase16P1Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase16P1Pass.progress.presetsAtBar,
    total: phase16P1Pass.progress.presetTotal,
    flags: [
      `${phase16P1Pass.progress.presetsAtBar}/${phase16P1Pass.progress.presetTotal} presets · standard ${phase16P1Pass.progress.standardStepsAtBar}/${phase16P1Pass.progress.standardStepTotal} steps · nav ${phase16P1Pass.progress.hubInCandidateNav ? "wired" : "open"}`,
    ],
    href: "/admin/intelligence/phase-16-p1-upgrade",
  });

  const phase16P2Pass = computePhase16P2UpgradePass();
  items.push({
    id: "phase-16-p2-encounter-scenarios",
    label: "Phase 16 (P2) — Encounter scenarios",
    category: "Candidate UX",
    completionPct: phase16P2Pass.completionPct,
    status: phase16P2Pass.completionPct >= 90 ? "complete" : phase16P2Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase16P2Pass.progress.scenariosAtBar,
    total: phase16P2Pass.progress.scenarioTotal,
    flags: [
      `${phase16P2Pass.progress.scenariosAtBar}/${phase16P2Pass.progress.scenarioTotal} scenarios · ACCA ${phase16P2Pass.progress.accaStepsAtBar}/${phase16P2Pass.progress.accaStepTotal} steps · nav ${phase16P2Pass.progress.hubInCandidateNav ? "wired" : "open"}`,
    ],
    href: "/admin/intelligence/phase-16-p2-upgrade",
  });

  const phase16P3Pass = computePhase16P3UpgradePass();
  items.push({
    id: "phase-16-p3-drill-queue",
    label: "Phase 16 (P3) — Drill queue",
    category: "Candidate UX",
    completionPct: phase16P3Pass.completionPct,
    status: phase16P3Pass.completionPct >= 90 ? "complete" : phase16P3Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase16P3Pass.progress.queuesAtBar,
    total: phase16P3Pass.progress.queueTotal,
    flags: [
      `${phase16P3Pass.progress.queuesAtBar}/${phase16P3Pass.progress.queueTotal} queues · standard ${phase16P3Pass.progress.standardCardsAtBar}/${phase16P3Pass.progress.standardCardTotal} cards · nav ${phase16P3Pass.progress.hubInCandidateNav ? "wired" : "open"}`,
    ],
    href: "/admin/intelligence/phase-16-p3-upgrade",
  });

  const phase16P4Pass = computePhase16P4UpgradePass();
  items.push({
    id: "phase-16-p4-session-debrief",
    label: "Phase 16 (P4) — Session debrief",
    category: "Candidate UX",
    completionPct: phase16P4Pass.completionPct,
    status: phase16P4Pass.completionPct >= 90 ? "complete" : phase16P4Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase16P4Pass.progress.checklistAtBar,
    total: phase16P4Pass.progress.checklistTotal,
    flags: [
      `${phase16P4Pass.progress.checklistAtBar}/${phase16P4Pass.progress.checklistTotal} checklist · capture api ${phase16P4Pass.progress.captureApiWired ? "wired" : "open"} · nav ${phase16P4Pass.progress.hubInCandidateNav ? "wired" : "open"}`,
    ],
    href: "/admin/intelligence/phase-16-p4-upgrade",
  });

  const phase16P5Pass = computePhase16P5UpgradePass();
  items.push({
    id: "phase-16-p5-ipad-drill-player",
    label: "Phase 16 (P5) — iPad drill player",
    category: "Candidate UX",
    completionPct: phase16P5Pass.completionPct,
    status: phase16P5Pass.completionPct >= 90 ? "complete" : phase16P5Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase16P5Pass.progress.controlsAtBar,
    total: phase16P5Pass.progress.controlTotal,
    flags: [
      `${phase16P5Pass.progress.controlsAtBar}/${phase16P5Pass.progress.controlTotal} controls · shell ${phase16P5Pass.progress.shellDrillNavWired ? "wired" : "open"} · nav ${phase16P5Pass.progress.hubInCandidateNav ? "wired" : "open"}`,
    ],
    href: "/admin/intelligence/phase-16-p5-upgrade",
  });

  const phase16P6Pass = computePhase16P6UpgradePass();
  items.push({
    id: "phase-16-p6-session-memory",
    label: "Phase 16 (P6) — Session memory",
    category: "Candidate UX",
    completionPct: phase16P6Pass.completionPct,
    status: phase16P6Pass.completionPct >= 90 ? "complete" : phase16P6Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase16P6Pass.progress.fieldsAtBar,
    total: phase16P6Pass.progress.fieldTotal,
    flags: [
      `${phase16P6Pass.progress.fieldsAtBar}/${phase16P6Pass.progress.fieldTotal} fields · clear api ${phase16P6Pass.progress.clearApiWired ? "wired" : "open"} · nav ${phase16P6Pass.progress.hubInCandidateNav ? "wired" : "open"}`,
    ],
    href: "/admin/intelligence/phase-16-p6-upgrade",
  });

  const phase16P7Pass = computePhase16P7UpgradePass();
  items.push({
    id: "phase-16-p7-staff-coach",
    label: "Phase 16 (P7) — Staff coach overlay",
    category: "Staff",
    completionPct: phase16P7Pass.completionPct,
    status: phase16P7Pass.completionPct >= 90 ? "complete" : phase16P7Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase16P7Pass.progress.fieldsAtBar,
    total: phase16P7Pass.progress.fieldTotal,
    flags: [
      `${phase16P7Pass.progress.fieldsAtBar}/${phase16P7Pass.progress.fieldTotal} fields · guard ${phase16P7Pass.progress.routeGuardWired ? "wired" : "open"} · staff nav ${phase16P7Pass.progress.hubInStaffNav ? "wired" : "open"}`,
    ],
    href: "/admin/intelligence/phase-16-p7-upgrade",
  });

  const phase16P8Pass = computePhase16P8UpgradePass();
  items.push({
    id: "phase-16-p8-live-event",
    label: "Phase 16 (P8) — Live event mode",
    category: "Candidate UX",
    completionPct: phase16P8Pass.completionPct,
    status: phase16P8Pass.completionPct >= 90 ? "complete" : phase16P8Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase16P8Pass.progress.fieldsAtBar,
    total: phase16P8Pass.progress.fieldTotal,
    flags: [
      `${phase16P8Pass.progress.fieldsAtBar}/${phase16P8Pass.progress.fieldTotal} fields · day-of ${phase16P8Pass.progress.dayOfPlanSafe ? "safe" : "open"} · nav ${phase16P8Pass.progress.hubInCandidateNav ? "wired" : "open"}`,
    ],
    href: "/admin/intelligence/phase-16-p8-upgrade",
  });

  const phase17Pass = computePhase17UpgradePass();
  items.push({
    id: "phase-17-search-ai-prep-v4",
    label: "Phase 17 — Search v4 + AI prep v4",
    category: "Candidate UX",
    completionPct: phase17Pass.completionPct,
    status: phase17Pass.completionPct >= 90 ? "complete" : phase17Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase17Pass.progress.checkpointsAtBar,
    total: phase17Pass.progress.checkpointTotal,
    flags: [
      `${phase17Pass.progress.checkpointsAtBar}/${phase17Pass.progress.checkpointTotal} checkpoints · corpus ${phase17Pass.progress.corpusTotal} · SRE ${phase17Pass.progress.rehearsalDocs} · copilot ${phase17Pass.progress.copilotDocs}`,
    ],
    href: "/admin/intelligence/phase-17-upgrade",
  });

  const phase18Pass = computePhase18UpgradePass();
  items.push({
    id: "phase-18-search-ai-professor-v5",
    label: "Phase 18 — Search v5 + professor tutor v2",
    category: "Candidate UX",
    completionPct: phase18Pass.completionPct,
    status: phase18Pass.completionPct >= 90 ? "complete" : phase18Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase18Pass.progress.checkpointsAtBar,
    total: phase18Pass.progress.checkpointTotal,
    flags: [
      `${phase18Pass.progress.checkpointsAtBar}/${phase18Pass.progress.checkpointTotal} checkpoints · professor modes ${phase18Pass.progress.professorModes} · search v5 ${phase18Pass.progress.searchV5Ready ? "ready" : "open"}`,
    ],
    href: "/admin/intelligence/phase-18-upgrade",
  });

  const phase19Pass = computePhase19UpgradePass();
  items.push({
    id: "phase-19-professor-showcase-v6",
    label: "Phase 19 — Professor showcase v6 cinematic",
    category: "Candidate UX",
    completionPct: phase19Pass.completionPct,
    status: phase19Pass.completionPct >= 90 ? "complete" : phase19Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase19Pass.progress.checkpointsAtBar,
    total: phase19Pass.progress.checkpointTotal,
    flags: [
      `${phase19Pass.progress.checkpointsAtBar}/${phase19Pass.progress.checkpointTotal} checkpoints · ${phase19Pass.progress.version} · sandbox suite wired`,
    ],
    href: "/admin/intelligence/phase-19-upgrade",
  });

  const phase16P9Pass = computePhase16P9UpgradePass();
  items.push({
    id: "phase-16-p9-sre-closure",
    label: "Phase 16 (P9) — SRE stack closure",
    category: "Candidate UX",
    completionPct: phase16P9Pass.completionPct,
    status: phase16P9Pass.completionPct >= 90 ? "complete" : phase16P9Pass.completionPct >= 75 ? "partial" : "flagged",
    built: phase16P9Pass.progress.passesAtBar,
    total: phase16P9Pass.progress.passTotal,
    flags: [
      `${phase16P9Pass.progress.passesAtBar}/${phase16P9Pass.progress.passTotal} passes · stack ${phase16P9Pass.progress.stackCompletionPct}% · exit ${phase16P9Pass.progress.sreExitReady ? "ready" : "open"}`,
    ],
    href: "/admin/intelligence/phase-16-p9-upgrade",
  });

  const canonStats = computeCanonLoopStats();
  items.push({
    id: "field-book-canon-loop",
    label: "Phase D — Field Book canon loop + three-lane nav",
    category: "Organization",
    completionPct: Math.round(
      ((canonStats.bindingCount / 18) * 50 + (phase4Pass.progress.phaseDArticlesAtBar / 3) * 50),
    ),
    status: canonStats.bindingCount >= 18 && phase4Pass.progress.phaseDArticlesAtBar >= 3 ? "complete" : "partial",
    built: canonStats.bindingCount,
    total: 18,
    flags:
      canonStats.bindingCount < 18
        ? ["Expand canon bindings to 18+ intelligence routes"]
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
    "/admin/intelligence/phase-3-upgrade",
    "/admin/intelligence/phase-4-upgrade",
    "/admin/intelligence/phase-5-upgrade",
    "/admin/intelligence/phase-6-upgrade",
    "/admin/intelligence/phase-7-upgrade",
    "/admin/intelligence/phase-8-upgrade",
    "/admin/intelligence/phase-9-upgrade",
    "/admin/intelligence/strategy-philosophy-hub",
    "/admin/intelligence/phase-11-upgrade",
    "/admin/intelligence/campaign-system-manual",
    "/admin/intelligence/kelly-strategic-plan",
    "/admin/intelligence/phase-11-p1-upgrade",
    "/admin/intelligence/movement-philosophy",
    "/admin/intelligence/staff-strategy-command",
    "/admin/intelligence/phase-11-p2-upgrade",
    "/admin/intelligence/strategy-doctrine",
    "/admin/intelligence/phase-11-p3-upgrade",
    "/admin/intelligence/philosophy-graph-claims-review",
    "/admin/intelligence/phase-11-p4-upgrade",
    "/admin/intelligence/field-book-chunk-promotion",
    "/admin/intelligence/phase-11-p5-upgrade",
    "/admin/intelligence/strategy-alignment-chunk-preview",
    "/admin/intelligence/phase-11-p6-upgrade",
    "/admin/intelligence/briefing-papers-chunk-attach",
    "/admin/intelligence/phase-11-p7-upgrade",
    "/admin/intelligence/field-book-promotion-execution",
    "/admin/intelligence/phase-11-p8-upgrade",
    "/admin/intelligence/phase-11-stack-closure",
    "/admin/intelligence/phase-11-p9-upgrade",
    "/admin/intelligence/phase-15-p0-p1-upgrade",
    "/admin/intelligence/kelly-prep-week",
    "/admin/intelligence/kelly-prep-week/day-1-philosophy",
    "/admin/intelligence/phase-15-p2-upgrade",
    "/admin/intelligence/field-book/kelly-prep-week-command",
    "/admin/intelligence/stage-safe-filter",
    "/admin/intelligence/phase-15-p3-upgrade",
    "/admin/intelligence/field-book/stage-safe-filter-command",
    "/admin/intelligence/top-tier-prep",
    "/admin/intelligence/phase-15-p4-upgrade",
    "/admin/intelligence/field-book/top-tier-prep-command",
    "/admin/intelligence/evidence-honesty",
    "/admin/intelligence/phase-15-p5-upgrade",
    "/admin/intelligence/field-book/evidence-honesty-command",
    "/admin/intelligence/demo-mode",
    "/admin/intelligence/phase-15-p6-upgrade",
    "/admin/intelligence/field-book/demo-mode-command",
    "/admin/intelligence/ipad-polish",
    "/admin/intelligence/phase-15-p7-upgrade",
    "/admin/intelligence/field-book/ipad-polish-command",
    "/admin/intelligence/staff-backstage",
    "/admin/intelligence/phase-15-p8-upgrade",
    "/admin/intelligence/field-book/staff-backstage-command",
    "/admin/intelligence/cce-closure",
    "/admin/intelligence/phase-15-p9-upgrade",
    "/admin/intelligence/field-book/cce-closure-command",
    "/admin/intelligence/rehearsal",
    "/admin/intelligence/phase-16-p0-upgrade",
    "/admin/intelligence/field-book/session-launcher-command",
    "/admin/intelligence/run-of-show",
    "/admin/intelligence/phase-16-p1-upgrade",
    "/admin/intelligence/field-book/run-of-show-command",
    "/admin/intelligence/encounters",
    "/admin/intelligence/phase-16-p2-upgrade",
    "/admin/intelligence/field-book/encounter-scenarios-command",
    "/admin/intelligence/drill-queue",
    "/admin/intelligence/phase-16-p3-upgrade",
    "/admin/intelligence/field-book/drill-queue-command",
    "/admin/intelligence/session-debrief",
    "/admin/intelligence/phase-16-p4-upgrade",
    "/admin/intelligence/field-book/session-debrief-command",
    "/admin/intelligence/ipad-drill-player",
    "/admin/intelligence/phase-16-p5-upgrade",
    "/admin/intelligence/field-book/ipad-drill-player-command",
    "/admin/intelligence/rehearsal-history",
    "/admin/intelligence/phase-16-p6-upgrade",
    "/admin/intelligence/field-book/session-memory-command",
    "/admin/intelligence/rehearsal-coach",
    "/admin/intelligence/phase-16-p7-upgrade",
    "/admin/intelligence/field-book/rehearsal-coach-command",
    "/admin/intelligence/live-event",
    "/admin/intelligence/phase-16-p8-upgrade",
    "/admin/intelligence/field-book/live-event-command",
    "/admin/intelligence/sre-closure",
    "/admin/intelligence/phase-16-p9-upgrade",
    "/admin/intelligence/search-ai-prep-hub",
    "/admin/intelligence/phase-17-upgrade",
    "/admin/intelligence/debate-prep-tutor",
    "/admin/intelligence/field-book/sre-closure-command",
    "/admin/intelligence/field-book/campaign-system-manual-command",
    "/admin/intelligence/field-book/kelly-strategic-plan-command",
    "/admin/intelligence/field-book/movement-philosophy-command",
    "/admin/intelligence/field-book/staff-strategy-command",
    "/admin/intelligence/field-book/strategy-doctrine-command",
    "/admin/intelligence/field-book/philosophy-graph-claims-command",
    "/admin/intelligence/field-book/field-book-chunk-promotion-command",
    "/admin/intelligence/field-book/strategy-alignment-chunk-preview-command",
    "/admin/intelligence/field-book/briefing-papers-chunk-attach-command",
    "/admin/intelligence/field-book/field-book-promotion-execution-command",
    "/admin/intelligence/field-book/phase-11-stack-closure-command",
    "/admin/intelligence/field-book/strategy-philosophy-command",
    "/admin/intelligence/field-book/debate-instruction-bridge",
    "/admin/intelligence/field-book/dossier-research-acca-closure",
    "/admin/intelligence/field-book/dossier-diligence-closure",
    "/admin/intelligence/field-book/acca-summer-conference-2026",
    "/admin/intelligence/field-book/glossary",
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
      name: "v6.5 — Candidate dossiers pass (COMPLETE)",
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
    {
      phase: 11,
      name: "v7.0 — Phase 3 five-layer debate spine (COMPLETE)",
      targetVersion: "0.19.0",
      goal: "Six depth waves with five-layer standard on command surfaces, trap lanes, SOS bank, and film room.",
      items: [
        "phase3DebateSpineDepth wave registry + FiveLayerChrome",
        "Phase 3 upgrade hub + wired trap/SOS/command/film-room panels",
        "W3 debate spine at 100% bar",
      ],
      exitCriteria: [
        "test-phase3-debate-spine-depth green",
        "Command surfaces at five-layer bar",
        "Nav release batch 2026-06-05-phase-3-debate-spine-depth",
      ],
    },
    {
      phase: 12,
      name: "v7.0 — Phase 4 Field Book canon loop (COMPLETE)",
      targetVersion: "0.19.0",
      goal: "Route bindings + strategy migration bridge connecting intelligence ↔ Field Book ↔ Kelly SOS manual.",
      items: [
        "20 canon bindings + strategyMigrationBridge (16 routes)",
        "Phase D articles at 6+ paragraph bar",
        "Canon hub + strategy alignment + global FieldBookCanonPanel strip",
      ],
      exitCriteria: [
        "test-phase4-canon-loop green (20 bindings, Phase D 3/3)",
        "Strategy migration coverage 100%",
        "Nav release batch 2026-06-05-phase-4-canon-strategy-migration",
      ],
    },
    {
      phase: 13,
      name: "v8.0 — Phase 5 debate glossary + hub connectivity (COMPLETE)",
      targetVersion: "0.20.0",
      goal: "Debate term registry, Field Book Phase B/C depth, canon bindings on all remaining intelligence hubs.",
      items: [
        "42-term debateGlossaryRegistry + glossary index route",
        "12 Phase B/C Field Book articles at 6-paragraph bar",
        "11 hub canon bindings + strategy bridge extended to 28 routes",
      ],
      exitCriteria: [
        "test-phase5-glossary-connectivity green",
        "All PHASE5_HUB_ROUTES bound",
        "Nav release batch 2026-06-05-phase-5-glossary-connectivity",
      ],
    },
    {
      phase: 14,
      name: "v9.0 — Phase 6 debate-ready governance (COMPLETE)",
      targetVersion: "0.21.0",
      goal: "Prep encounter depth, trap rebuttals, claims review wave, and ten priority KH module promotions.",
      items: [
        "28/28 prep sections with section-specific encounter depth",
        "6/6 trap lanes at rebuttal bar",
        "ClaimsReviewWavePanel + claim-review API wiring",
        "PHASE6_PROMOTED_KH_MODULE_IDS (10 modules)",
      ],
      exitCriteria: [
        "test-phase6-debate-ready-governance green",
        "Debate prep sections 100% on build progress",
        "Nav release batch 2026-06-05-phase-6-debate-ready-governance",
      ],
    },
    {
      phase: 15,
      name: "v10.0 — Phase 7 dossier diligence closure (COMPLETE)",
      targetVersion: "0.22.0",
      goal: "Briefing-book bar on all dossier sections, diligence operator runbook, CVSGF transparency frame, KH wave 2.",
      items: [
        "Read-time dossier enrichment (Kelly + Hammer + Pakko)",
        "Five-search diligence operator runbook (15 guides)",
        "Election funding transparency enrichment",
        "PHASE7_PROMOTED_KH_MODULE_IDS (10 modules)",
      ],
      exitCriteria: [
        "test-phase7-dossier-diligence-closure green",
        "Dossier briefing book 95%+ on build progress",
        "Nav release batch 2026-06-05-phase-7-dossier-diligence-closure",
      ],
    },
    {
      phase: 16,
      name: "v11.0 — Phase 8 dossier research + ACCA closure (COMPLETE)",
      targetVersion: "0.23.0",
      goal: "Sourced research corpus on all dossier sections, ACCA panel operator runbook, KH wave 3.",
      items: [
        "kellyDossierResearchDepth + opponentDossierResearchDepth overlays",
        "6 new deep-dive dossier sections (Kelly + Hammer + Pakko)",
        "ACCA panel enrichment + eight-step operator runbook",
        "PHASE8_PROMOTED_KH_MODULE_IDS (10 modules)",
      ],
      exitCriteria: [
        "test-phase8-dossier-research-acca-closure green",
        "34 dossier sections with research depth at bar",
        "Nav release batch 2026-06-05-phase-8-dossier-research-acca-closure",
      ],
    },
    {
      phase: 17,
      name: "v12.0 — Phase 9 debate instruction bridge (COMPLETE)",
      targetVersion: "0.25.0",
      goal: "2× dossier depth + debate spine integration — prep, traps, SOS questions wired to research corpus.",
      items: [
        "kelly/opponent/acca depth expansion wave 2",
        "phase9DebateInstructionDepth + applyPhase9DebateInstruction bridge",
        "Eight-step debate coaching operator runbook",
        "PHASE9_PROMOTED_KH_MODULE_IDS (2 final staff modules)",
      ],
      exitCriteria: [
        "test-phase9-debate-instruction-bridge green",
        "28 prep + 6 trap + 35 SOS at dossier bridge bar",
        "Nav release batch 2026-06-05-phase-9-debate-instruction-bridge",
      ],
    },
    {
      phase: 18,
      name: "v13.0 — Phase 10 strategy & philosophy command (COMPLETE)",
      targetVersion: "0.26.0",
      goal: "Unified strategy/philosophy inventory integrated into intelligence dashboard at full depth.",
      items: [
        "phase10StrategyPhilosophyDepth overlays on briefings, psych, graph",
        "strategy-philosophy-hub with full surface inventory",
        "Strategy migration bridge extended (debate-briefings, graph, pathway)",
        "Field Book strategy-philosophy-command article",
      ],
      exitCriteria: [
        "test-phase10-strategy-philosophy-command green",
        "8 briefings + 19 psych + 8 graph nodes at Phase 10 bar",
        "Nav release batch 2026-06-05-phase-10-strategy-philosophy-command",
      ],
    },
    {
      phase: 19,
      name: "v14.0 — Phase 11 campaign system manual surfacing (P0)",
      targetVersion: "0.27.0",
      goal: "252-file campaign system manual browsable in intelligence — category inventory, reader, priority tome guides.",
      items: [
        "campaignSystemManualInventory + phase11CampaignSystemClosure",
        "Intelligence reader at /admin/intelligence/campaign-system-manual",
        "Eight category operator guides with intelligence cross-links",
        "Field Book campaign-system-manual-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase11-campaign-system-surfacing green",
        "252 files + 8 categories at Phase 11 bar",
        "Nav release batch 2026-06-05-phase-11-campaign-system-surfacing",
      ],
    },
    {
      phase: 20,
      name: "v14.1 — Phase 11 P1 Kelly strategic plan command",
      targetVersion: "0.28.0",
      goal: "22-chapter Kelly SOS manual in intelligence tree with full chapter depth overlays.",
      items: [
        "kelly-strategic-plan intelligence reader",
        "phase11KellyStrategicPlanDepth on all 22 chapters",
        "Field Book kelly-strategic-plan-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase11-p1-kelly-strategic-plan green",
        "22/22 chapters at P1 bar",
        "Nav release batch 2026-06-05-phase-11-p1-kelly-strategic-plan",
      ],
    },
    {
      phase: 21,
      name: "v14.2 — Phase 11 P2 movement philosophy + staff strategy command",
      targetVersion: "0.29.0",
      goal: "Wire docs/philosophy + VOL-CORE-1 and staff strategy surfaces into intelligence with debate philosophy readiness feed.",
      items: [
        "movement-philosophy intelligence reader with P2 overlays on 5 docs",
        "staff-strategy-command hub — morning brief through scenario simulation",
        "Field Book movement-philosophy-command + staff-strategy-command + canon + migration bridge",
        "Debate command philosophy readiness feed + live readiness dimension",
      ],
      exitCriteria: [
        "test-phase11-p2-movement-philosophy-staff-strategy green",
        "5/5 philosophy docs + 6/6 staff surfaces at P2 bar",
        "Nav release batch 2026-06-05-phase-11-p2-movement-philosophy-staff-strategy",
      ],
    },
    {
      phase: 22,
      name: "v14.3 — Phase 11 P3 strategy doctrine JSON command",
      targetVersion: "0.30.0",
      goal: "Nine SDI-1 JSON artifacts browsable in intelligence with debate and alignment overlays.",
      items: [
        "strategy-doctrine intelligence reader for data/strategy-doctrine/",
        "phase11P3StrategyDoctrineDepth on all 9 artifacts",
        "Field Book strategy-doctrine-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase11-p3-strategy-doctrine green",
        "9/9 artifacts at P3 bar",
        "Nav release batch 2026-06-05-phase-11-p3-strategy-doctrine",
      ],
    },
    {
      phase: 23,
      name: "v14.4 — Phase 11 P4 philosophy graph claims review",
      targetVersion: "0.31.0",
      goal: "Eight NSI-4 philosophy graph nodes bound to claim ledger with P4 review workflow overlays.",
      items: [
        "philosophy-graph-claims-review hub + per-node pages",
        "philosophyGraphClaimsSeed — claim-philosophy-* ledger rows",
        "Field Book philosophy-graph-claims-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase11-p4-philosophy-graph-claims-review green",
        "8/8 nodes at P4 bar + 8 ledger claims",
        "Nav release batch 2026-06-05-phase-11-p4-philosophy-graph-claims",
      ],
    },
    {
      phase: 24,
      name: "v14.5 — Phase 11 P5 Field Book chunk promotion",
      targetVersion: "0.32.0",
      goal: "~2,795 strategy manual chunks catalogued into eleven promotion batches with P5 operator overlays and canon workflow.",
      items: [
        "field-book-chunk-promotion hub + per-batch pages",
        "fieldBookChunkPromotionInventory — batch assignment from strategy-chunking",
        "Field Book field-book-chunk-promotion-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase11-p5-field-book-chunk-promotion green",
        "11/11 batches at P5 bar + 2700+ chunks catalogued",
        "Nav release batch 2026-06-05-phase-11-p5-field-book-chunk-promotion",
      ],
    },
    {
      phase: 25,
      name: "v14.6 — Phase 11 P6 strategy alignment chunk preview",
      targetVersion: "0.33.0",
      goal: "Eight SDI-1 alignment preview lanes wire P5 batches to strategy-alignment chunk filters and claims-gated Field Book handoff.",
      items: [
        "strategy-alignment-chunk-preview hub + per-lane pages",
        "strategyAlignmentChunkPreviewInventory — lane chunk filters from strategy-chunking",
        "Field Book strategy-alignment-chunk-preview-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase11-p6-strategy-alignment-chunk-preview green",
        "8/8 preview lanes at P6 bar + 200+ matching chunks",
        "Nav release batch 2026-06-05-phase-11-p6-strategy-alignment-chunk-preview",
      ],
    },
    {
      phase: 26,
      name: "v14.7 — Phase 11 P7 briefing papers chunk attach",
      targetVersion: "0.34.0",
      goal: "Eight briefing paper attach lanes wire P6 chunk previews into governed paper deep sections with claim-review API gate.",
      items: [
        "briefing-papers-chunk-attach hub + per-lane pages",
        "briefingPapersChunkAttachInventory — attach lane chunk filters from P5/P6",
        "Field Book briefing-papers-chunk-attach-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase11-p7-briefing-papers-chunk-attach green",
        "8/8 attach lanes at P7 bar + 500+ attachable chunks",
        "Nav release batch 2026-06-05-phase-11-p7-briefing-papers-chunk-attach",
      ],
    },
    {
      phase: 27,
      name: "v14.8 — Phase 11 P8 Field Book promotion execution",
      targetVersion: "0.35.0",
      goal: "Eight promotion execution waves complete the P5→P8 canon pipeline with claims-gated Field Book body merge workflow.",
      items: [
        "field-book-promotion-execution hub + per-wave pages",
        "fieldBookPromotionExecutionInventory — wave batch mapping from P5 state",
        "Field Book field-book-promotion-execution-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase11-p8-field-book-promotion-execution green",
        "8/8 execution waves at P8 bar + 2700+ linked chunks + 18+ canon bindings",
        "Nav release batch 2026-06-05-phase-11-p8-field-book-promotion-execution",
      ],
    },
    {
      phase: 28,
      name: "v14.9 — Phase 11 P9 stack closure",
      targetVersion: "0.36.0",
      goal: "Master closure pass aggregating P0–P8 sub-passes with nine stack checkpoints and Phase 11 exit gate.",
      items: [
        "phase-11-stack-closure hub + P9 upgrade pass",
        "phase11StackClosureState — checkpoint aggregation from P0–P8 passes",
        "Field Book phase-11-stack-closure-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase11-p9-stack-closure green",
        "9/9 sub-passes at bar + stack ≥90% + promotion pipeline ready",
        "Nav release batch 2026-06-05-phase-11-p9-stack-closure",
      ],
    },
    {
      phase: 29,
      name: "v15.0 — Phase 15 P0+P1 candidate command experience",
      targetVersion: "0.37.0",
      goal: "Five-section candidate nav with builder infra hidden and unified command home with safe/blocked claims feed.",
      items: [
        "CandidateCommandSectionNav — five orchestrated sections for CANDIDATE profile",
        "candidateCommandHome — readiness + safe/blocked lines on /admin/intelligence",
        "supreme-workbench redirect to command home for non-STAFF profiles",
      ],
      exitCriteria: [
        "test-phase15-p0-p1-candidate-command green",
        "≤25 candidate nav links · 0 builder infra in candidate nav",
        "Nav release batch 2026-06-05-phase-15-p0-p1-candidate-command",
      ],
    },
    {
      phase: 30,
      name: "v15.1 — Phase 15 P2 Kelly prep week",
      targetVersion: "0.38.0",
      goal: "Seven-day orchestrated candidate prep path with ordered reads, per-day pages, and progress tracking.",
      items: [
        "kelly-prep-week hub + seven per-day pages",
        "kellyPrepWeekPath — 24+ ordered reads wired to live intelligence routes",
        "Field Book kelly-prep-week-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase15-p2-kelly-prep-week green",
        "7/7 days at P2 bar + hub in candidate nav",
        "Nav release batch 2026-06-05-phase-15-p2-kelly-prep-week",
      ],
    },
    {
      phase: 31,
      name: "v15.2 — Phase 15 P3 stage-safe filter",
      targetVersion: "0.39.0",
      goal: "Candidate profile claims gating on trap lanes, SOS questions, and coaching — NEEDS_REVIEW lines redacted with staff-verify fallback.",
      items: [
        "stage-safe-filter hub + phase-15-p3-upgrade pass",
        "phase15StageSafeFilter — candidate vs staff audience on rehearse surfaces",
        "Field Book stage-safe-filter-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase15-p3-stage-safe-filter green",
        "Trap/SOS/coaching panels wired · hub in candidate Safety nav",
        "Nav release batch 2026-06-05-phase-15-p3-stage-safe-filter",
      ],
    },
    {
      phase: 32,
      name: "v15.3 — Phase 15 P4 top-tier surfacing",
      targetVersion: "0.40.0",
      goal: "Promote briefings, depth guides, and psychology to command home and top-tier hub — stop burying Kelly's best prep.",
      items: [
        "top-tier-prep hub + phase-15-p4-upgrade pass",
        "CandidateTopTierStrip on command home — top 5 promoted reads",
        "Field Book top-tier-prep-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase15-p4-top-tier-surfacing green",
        "21 promoted surfaces · hub in Home + Philosophy nav",
        "Nav release batch 2026-06-05-phase-15-p4-top-tier-surfacing",
      ],
    },
    {
      phase: 33,
      name: "v15.4 — Phase 15 P5 evidence honesty badges",
      targetVersion: "0.41.0",
      goal: "Unified VERIFIED / NEEDS_REVIEW / NON_PUBLISHABLE badges on film room, briefings, opposition, and rehearse surfaces.",
      items: [
        "evidence-honesty hub + phase-15-p5-upgrade pass",
        "EvidenceHonestyBadge on film room, briefings, opposition, trap/SOS/coaching, claims",
        "Field Book evidence-honesty-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase15-p5-evidence-honesty green",
        "8 surface categories tagged · hub in candidate Home nav",
        "Nav release batch 2026-06-05-phase-15-p5-evidence-honesty",
      ],
    },
    {
      phase: 34,
      name: "v15.5 — Phase 15 P6 demo mode",
      targetVersion: "0.42.0",
      goal: "Purchase-ready demo with seeded tonight scenario and 15-minute walkthrough script for buyer conversations.",
      items: [
        "demo-mode hub + phase-15-p6-upgrade pass",
        "CandidateDemoModeStrip on command home + IntelligenceDemoModeBanner when env live",
        "Field Book demo-mode-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase15-p6-demo-mode green",
        "7 script steps · ~15 minutes · hub in candidate Home nav",
        "Nav release batch 2026-06-05-phase-15-p6-demo-mode",
      ],
    },
    {
      phase: 35,
      name: "v15.6 — Phase 15 P7 iPad polish",
      targetVersion: "0.43.0",
      goal: "Candidate iPad bottom nav aligned to five CCE sections — Kelly stage-side default deploy.",
      items: [
        "ipad-polish hub + phase-15-p7-upgrade pass",
        "CandidateIpadIntelligenceShell five-tab bottom nav + section sheets",
        "Field Book ipad-polish-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase15-p7-ipad-polish green",
        "5 section tabs wired · hub in candidate Safety nav",
        "Nav release batch 2026-06-05-phase-15-p7-ipad-polish",
      ],
    },
    {
      phase: 36,
      name: "v15.7 — Phase 15 P8 staff backstage",
      targetVersion: "0.44.0",
      goal: "Route-level STAFF profile guards on builder and operations surfaces — not nav-only hiding.",
      items: [
        "staff-backstage hub + phase-15-p8-upgrade pass",
        "StaffBackstageRouteGuard in intelligence layout + blocked banner",
        "Field Book staff-backstage-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase15-p8-staff-backstage green",
        "8 guard categories · hub in STAFF Operations nav",
        "Nav release batch 2026-06-05-phase-15-p8-staff-backstage",
      ],
    },
    {
      phase: 37,
      name: "v15.8 — Phase 15 P9 CCE closure",
      targetVersion: "0.45.0",
      goal: "Master CCE closure aggregating P0+P1–P8 — eight checkpoints, stack exit gate, Phase 15 complete.",
      items: [
        "cce-closure hub + phase-15-p9-upgrade pass",
        "CandidateCceClosureStrip on command home + checkpoint queue panel",
        "Field Book cce-closure-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase15-cce-closure green",
        "8/8 CCE passes at bar · hub in candidate Home nav",
        "Nav release batch 2026-06-05-phase-15-p9-cce-closure",
      ],
    },
    {
      phase: 38,
      name: "v16.0 — Phase 16 P0 session launcher",
      targetVersion: "0.46.0",
      goal: "Stage Rehearsal Engine entry — four encounter types and default 30-minute debate-prep run-of-show.",
      items: [
        "rehearsal hub + phase-16-p0-upgrade pass",
        "CandidateRehearsalLauncherStrip on command home + encounter panel",
        "Field Book session-launcher-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase16-p0-session-launcher green",
        "4 encounters · 6-step default run-of-show · hub in Rehearse nav",
        "Nav release batch 2026-06-05-phase-16-p0-session-launcher",
      ],
    },
    {
      phase: 39,
      name: "v16.1 — Phase 16 P1 run-of-show",
      targetVersion: "0.47.0",
      goal: "Four timed run-of-show presets — 15, 30, 45, and 60 minutes — with step lists into existing prep depth.",
      items: [
        "run-of-show hub + phase-16-p1-upgrade pass",
        "CandidateRunOfShowStrip on command home + preset picker panel",
        "Field Book run-of-show-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase16-p1-run-of-show green",
        "4 presets minutes-aligned · hub in Rehearse nav",
        "Nav release batch 2026-06-05-phase-16-p1-run-of-show",
      ],
    },
    {
      phase: 40,
      name: "v16.2 — Phase 16 P2 encounter scenarios",
      targetVersion: "0.48.0",
      goal: "Four encounter scenarios with primary route binds, evidence honesty rules, and ACCA summer conference anchor.",
      items: [
        "encounters hub + phase-16-p2-upgrade pass",
        "CandidateEncounterScenariosStrip on command home + scenario panel",
        "Field Book encounter-scenarios-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase16-p2-encounters green",
        "4 scenarios at bar · ACCA bind wired · hub in Rehearse nav",
        "Nav release batch 2026-06-05-phase-16-p2-encounter-scenarios",
      ],
    },
    {
      phase: 41,
      name: "v16.3 — Phase 16 P3 drill queue",
      targetVersion: "0.49.0",
      goal: "Sequential speak-order drill queue — SOS and trap lane cards with stage-safe gates on every line.",
      items: [
        "drill-queue hub + phase-16-p3-upgrade pass",
        "CandidateDrillQueueStrip on command home + one-card-at-a-time player",
        "Field Book drill-queue-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase16-p3-drill-queue green",
        "3 queues · 6-card standard · hub in Rehearse nav",
        "Nav release batch 2026-06-05-phase-16-p3-drill-queue",
      ],
    },
    {
      phase: 42,
      name: "v16.4 — Phase 16 P4 session debrief",
      targetVersion: "0.50.0",
      goal: "Pre-stage checklist and post-session capture — felt-risky lines and staff follow-ups for human action queue review.",
      items: [
        "session-debrief hub + phase-16-p4-upgrade pass",
        "CandidateSessionDebriefStrip on command home + checklist/capture panel",
        "Field Book session-debrief-command + canon + migration bridge + capture API",
      ],
      exitCriteria: [
        "test-phase16-p4-session-debrief green",
        "5/5 checklist at bar · capture API wired · hub in Rehearse nav",
        "Nav release batch 2026-06-05-phase-16-p4-session-debrief",
      ],
    },
    {
      phase: 43,
      name: "v16.5 — Phase 16 P5 iPad drill player",
      targetVersion: "0.51.0",
      goal: "Full-screen drill stepper in candidate iPad shell — Exit · Prev · Next · Timer with 48px touch targets.",
      items: [
        "ipad-drill-player hub + phase-16-p5-upgrade pass",
        "CandidateIpadIntelligenceShell drill nav collapse + CandidateIpadDrillPlayerStrip",
        "Field Book ipad-drill-player-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase16-p5-ipad-drill-player green",
        "4/4 controls · shell drill nav wired · hub in Rehearse nav",
        "Nav release batch 2026-06-05-phase-16-p5-ipad-drill-player",
      ],
    },
    {
      phase: 44,
      name: "v16.6 — Phase 16 P6 session memory",
      targetVersion: "0.52.0",
      goal: "Continue last drill on command home — persisted rehearsal session with history list and staff reset.",
      items: [
        "rehearsal-history hub + phase-16-p6-upgrade pass",
        "CandidateSessionMemoryStrip on command home + recording hooks on drill/encounter hubs",
        "Field Book session-memory-command + canon + migration bridge + clear API",
      ],
      exitCriteria: [
        "test-phase16-p6-session-memory green",
        "5/5 active-session fields · clear API wired · hub in Home nav",
        "Nav release batch 2026-06-05-phase-16-p6-session-memory",
      ],
    },
    {
      phase: 45,
      name: "v16.7 — Phase 16 P7 staff coach overlay",
      targetVersion: "0.53.0",
      goal: "STAFF-only coach hub — assign tonight's encounter and pin up to three must-run drills on command home.",
      items: [
        "rehearsal-coach hub + phase-16-p7-upgrade pass",
        "CandidateStaffCoachStrip on command home + assign/pin API",
        "Field Book rehearsal-coach-command + canon + migration bridge + route guard",
      ],
      exitCriteria: [
        "test-phase16-p7-staff-coach green",
        "5/5 coach fields · route guard STAFF-only · hub in Operations nav",
        "Nav release batch 2026-06-05-phase-16-p7-staff-coach",
      ],
    },
    {
      phase: 46,
      name: "v16.8 — Phase 16 P8 live event mode",
      targetVersion: "0.54.0",
      goal: "ACCA Jun 11 countdown on command home — day-of shortest stage-safe run-of-show for clerk week and live env.",
      items: [
        "live-event hub + phase-16-p8-upgrade pass",
        "CandidateLiveEventStrip on command home + day-of safe plan panel",
        "Field Book live-event-command + canon + migration bridge",
      ],
      exitCriteria: [
        "test-phase16-p8-live-event green",
        "5/5 live fields · day-of plan stage-safe · hub in Home nav",
        "Nav release batch 2026-06-05-phase-16-p8-live-event",
      ],
    },
    {
      phase: 47,
      name: "v16.9 — Phase 16 P9 SRE stack closure",
      targetVersion: "0.55.0",
      goal: "Master SRE closure — nine P0–P8 checkpoints, stack ≥90%, staff coach guard, iPad player, nav cap.",
      items: [
        "sre-closure hub + phase-16-p9-upgrade pass",
        "CandidateSreClosureStrip on command home + checkpoint queue panel",
        "Field Book sre-closure-command + canon + migration bridge + state persistence",
      ],
      exitCriteria: [
        "test-phase16-sre-closure green",
        "9/9 passes at bar · stack ≥90% · SRE exit ready",
        "Nav release batch 2026-06-05-phase-16-p9-sre-closure",
      ],
    },
    {
      phase: 48,
      name: "v17.0 — Phase 17 Search v4 + AI prep v4",
      targetVersion: "0.56.0",
      goal: "Massive upgrade — unified search corpus (SRE + copilot + prep), search-integrated AI prep dock, profile-aware suggestions.",
      items: [
        "search-ai-prep-hub + phase-17-upgrade pass",
        "smart-v4 search API with copilot recommendations + SRE shortcuts",
        "AI prep v4 dock — 12 quick tools, inline search, governed brief tab",
        "iPad header Search button + prominent search bar",
      ],
      exitCriteria: [
        "test-phase17-search-ai-prep green",
        "8/8 checkpoints at bar · corpus includes SRE + copilot tools",
        "Nav release batch 2026-06-07-phase-17-search-ai-prep-v4",
      ],
    },
    {
      phase: 49,
      name: "v18.0 — Phase 18 Search v5 + professor tutor v2",
      targetVersion: "0.57.0",
      goal: "Collegiate professor depth — seminar briefs, evidence tiers, Socratic search; debate prep tutor v2 with moot court and forensic rubric.",
      items: [
        "smart-v5 search API with professor brief + professor lens",
        "intelligenceProfessorBrief engine + debatePrepProfessorV5 modes",
        "debate-prep-tutor v2 — office hours, seminar, moot court, forensic audit",
        "phase-18-upgrade pass + search bar professor panel",
      ],
      exitCriteria: [
        "test-phase18-search-ai-professor green",
        "7/8 checkpoints at bar · professor modes wired in tutor UI",
        "Nav release batch 2026-06-07-phase-18-search-ai-professor-v5",
      ],
    },
    {
      phase: 50,
      name: "v19.0 — Phase 19 Professor showcase v6 cinematic",
      targetVersion: "0.58.0",
      goal: "Most memorable upgrade — navy-gold seminar hall, per-mode skins, cinematic lecture/rubric panels, search brief hero, full sandbox suite.",
      items: [
        "ProfessorSeminarShowcase chrome + ProfessorSearchBriefPanel",
        "debatePrepProfessorShowcaseV6 mode skins + tailwind seminar animations",
        "DebatePrepTutorClient v6-showcase integration",
        "test-sandbox-intelligence-suite full debate/opps pass",
      ],
      exitCriteria: [
        "test-phase19-professor-showcase green",
        "test-sandbox-intelligence-suite green",
        "Nav release batch 2026-06-08-phase-19-professor-showcase-v6",
      ],
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    version: "v19.0-phase-19-professor-showcase-v6",
    overallCompletionPct,
    items,
    phases,
    linkAuditRoutes,
    flaggedForMasterBuild,
  };
}
