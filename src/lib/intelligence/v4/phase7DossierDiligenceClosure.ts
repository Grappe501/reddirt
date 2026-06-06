/**
 * Phase 7 — Dossier briefing closure + diligence runbook + KH wave 2 + CVSGF transparency frame.
 */
import { computeDossierBriefingBookProgress } from "@/lib/intelligence/v4/candidateDossierBriefingBook";
import {
  buildDiligenceSubjectRunbooks,
  diligenceRunbookCoveragePct,
  DILIGENCE_RUNBOOK_HUB_HREF,
} from "@/lib/intelligence/v4/diligenceOperatorRunbook";
import { getAllElectionFundingDepthSectionIds, getElectionFundingDepthSection } from "@/lib/intelligence/v4/electionFundingDrillDownDepth";
import {
  KIM_HAMMER_V4_MODULES,
  PHASE6_PROMOTED_KH_MODULE_IDS,
  PHASE7_PROMOTED_KH_MODULE_IDS,
} from "@/lib/intelligence/kimHammerV4ModuleRegistry";

const MIN_DOSSIER_OVERALL_PCT = 95;
const MIN_DOSSIER_CANDIDATE_PCT = 90;
const MIN_KH_WAVE2_PROMOTED = 10;
const MIN_ELECTION_FUNDING_AT_BAR = 12;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function electionFundingSectionAtBar(sectionId: string): boolean {
  const s = getElectionFundingDepthSection(sectionId);
  if (!s) return false;
  const rich = s.narrativeOverview.filter((p) => wordCount(p) >= 25);
  return rich.length >= 2 && s.howToPresentOnStage.length >= 1;
}

export type Phase7DossierDiligenceProgress = {
  dossierOverallPct: number;
  kellyPct: number;
  hammerPct: number;
  pakkoPct: number;
  diligenceRunbookPct: number;
  diligenceSubjectCount: number;
  khWave2Promoted: number;
  khTotalPromoted: number;
  electionFundingAtBar: number;
  electionFundingTotal: number;
  overallPct: number;
};

export const PHASE7_UPGRADE_HUB_HREF = "/admin/intelligence/phase-7-upgrade";

export function computePhase7DossierDiligenceProgress(): Phase7DossierDiligenceProgress {
  const dossier = computeDossierBriefingBookProgress();
  const runbookPct = diligenceRunbookCoveragePct();
  const subjects = buildDiligenceSubjectRunbooks();

  let khWave2 = 0;
  for (const id of PHASE7_PROMOTED_KH_MODULE_IDS) {
    const mod = KIM_HAMMER_V4_MODULES[id];
    if (mod && mod.render.type !== "staff-stub") khWave2++;
  }

  let khTotal = 0;
  for (const id of [...PHASE6_PROMOTED_KH_MODULE_IDS, ...PHASE7_PROMOTED_KH_MODULE_IDS]) {
    const mod = KIM_HAMMER_V4_MODULES[id];
    if (mod && mod.render.type !== "staff-stub") khTotal++;
  }

  const fundingIds = getAllElectionFundingDepthSectionIds();
  const fundingAtBar = fundingIds.filter(electionFundingSectionAtBar).length;

  const dossierPct = dossier.overallPct;
  const candidateMin = Math.min(dossier.kellyPct, dossier.hammerPct, dossier.pakkoPct);
  const dossierScore = dossierPct >= MIN_DOSSIER_OVERALL_PCT && candidateMin >= MIN_DOSSIER_CANDIDATE_PCT ? 100 : Math.round((dossierPct + candidateMin) / 2);
  const runbookScore = runbookPct >= 100 ? 100 : runbookPct;
  const khScore = khWave2 >= MIN_KH_WAVE2_PROMOTED ? 100 : Math.round((khWave2 / MIN_KH_WAVE2_PROMOTED) * 100);
  const fundingScore = Math.round((fundingAtBar / MIN_ELECTION_FUNDING_AT_BAR) * 100);

  const overallPct = Math.min(100, Math.round((dossierScore + runbookScore + khScore + fundingScore) / 4));

  return {
    dossierOverallPct: dossier.overallPct,
    kellyPct: dossier.kellyPct,
    hammerPct: dossier.hammerPct,
    pakkoPct: dossier.pakkoPct,
    diligenceRunbookPct: runbookPct,
    diligenceSubjectCount: subjects.length,
    khWave2Promoted: khWave2,
    khTotalPromoted: khTotal,
    electionFundingAtBar: fundingAtBar,
    electionFundingTotal: fundingIds.length,
    overallPct,
  };
}

export type Phase7UpgradePassReport = {
  passId: "phase-7-dossier-diligence-closure";
  title: "Step 7 — Phase 7: Dossier briefing closure + diligence runbook";
  summary: string;
  completionPct: number;
  hubHref: string;
  diligenceHubHref: string;
  progress: Phase7DossierDiligenceProgress;
};

export function computePhase7UpgradePass(): Phase7UpgradePassReport {
  const progress = computePhase7DossierDiligenceProgress();
  return {
    passId: "phase-7-dossier-diligence-closure",
    title: "Step 7 — Phase 7: Dossier briefing closure + diligence runbook",
    summary:
      "Briefing-book bar on all dossier sections, five-search diligence operator runbook, election funding transparency frame, and second-wave Kim Hammer module promotions.",
    completionPct: progress.overallPct,
    hubHref: PHASE7_UPGRADE_HUB_HREF,
    diligenceHubHref: DILIGENCE_RUNBOOK_HUB_HREF,
    progress,
  };
}

export function assertPhase7DossierDiligenceBar(): { ok: boolean; message: string } {
  const p = computePhase7DossierDiligenceProgress();

  if (p.dossierOverallPct < MIN_DOSSIER_OVERALL_PCT) {
    return { ok: false, message: `Dossier overall ${p.dossierOverallPct}% (need ${MIN_DOSSIER_OVERALL_PCT}+)` };
  }
  if (Math.min(p.kellyPct, p.hammerPct, p.pakkoPct) < MIN_DOSSIER_CANDIDATE_PCT) {
    return {
      ok: false,
      message: `Dossier candidate min Kelly ${p.kellyPct}% · Hammer ${p.hammerPct}% · Pakko ${p.pakkoPct}%`,
    };
  }
  if (p.diligenceRunbookPct < 100) {
    return { ok: false, message: `Diligence runbook ${p.diligenceRunbookPct}%` };
  }
  if (p.khWave2Promoted < MIN_KH_WAVE2_PROMOTED) {
    return { ok: false, message: `KH wave 2 ${p.khWave2Promoted}/${MIN_KH_WAVE2_PROMOTED}` };
  }
  if (p.electionFundingAtBar < MIN_ELECTION_FUNDING_AT_BAR) {
    return { ok: false, message: `Election funding ${p.electionFundingAtBar}/${MIN_ELECTION_FUNDING_AT_BAR} at bar` };
  }

  return { ok: true, message: `Phase 7 dossier diligence closure ${p.overallPct}% at bar` };
}
