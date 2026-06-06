/**
 * Phase 8 — Dossier research depth corpus + ACCA panel closure + KH wave 3.
 */
import {
  getAllAccaConferenceDepthSectionIds,
  getAccaConferenceDepthSection,
} from "@/lib/intelligence/v4/accaClerksConference2026Depth";
import { accaSectionMeetsPhase8Bar } from "@/lib/intelligence/v4/phase8AccaPanelEnrichment";
import { getKellyDossierSections } from "@/lib/intelligence/v4/kellyCandidateDossierDepth";
import { getOpponentDossierSectionsForCandidate } from "@/lib/intelligence/v4/opponentCandidateDossierDepth";
import {
  KIM_HAMMER_V4_MODULES,
  PHASE6_PROMOTED_KH_MODULE_IDS,
  PHASE7_PROMOTED_KH_MODULE_IDS,
  PHASE8_PROMOTED_KH_MODULE_IDS,
} from "@/lib/intelligence/kimHammerV4ModuleRegistry";

const MIN_SOURCED_FACTS_PER_SECTION = 4;
const MIN_NARRATIVE_PARAGRAPHS = 7;
const MIN_KH_WAVE3_PROMOTED = 10;
const MIN_ACCA_SECTIONS_AT_BAR = 12;

function dossierSectionMeetsResearchBar(section: {
  narrativeOverview: string[];
  researchDepth?: { sourcedFacts: string[] };
}): boolean {
  const facts = section.researchDepth?.sourcedFacts.length ?? 0;
  return facts >= MIN_SOURCED_FACTS_PER_SECTION && section.narrativeOverview.length >= MIN_NARRATIVE_PARAGRAPHS;
}

export type Phase8DossierResearchAccaProgress = {
  kellySectionsAtResearchBar: number;
  kellySectionTotal: number;
  hammerSectionsAtResearchBar: number;
  hammerSectionTotal: number;
  pakkoSectionsAtResearchBar: number;
  pakkoSectionTotal: number;
  dossierResearchPct: number;
  accaSectionsAtBar: number;
  accaSectionTotal: number;
  accaPanelPct: number;
  khWave3Promoted: number;
  khTotalPromoted: number;
  overallPct: number;
};

export const PHASE8_UPGRADE_HUB_HREF = "/admin/intelligence/phase-8-upgrade";
export const ACCA_PANEL_HUB_HREF = "/admin/intelligence/county-clerk-week/acca-summer-conference";

export function computePhase8DossierResearchAccaProgress(): Phase8DossierResearchAccaProgress {
  const kelly = getKellyDossierSections();
  const hammer = getOpponentDossierSectionsForCandidate("kim-hammer");
  const pakko = getOpponentDossierSectionsForCandidate("michael-packo");

  const kellyAtBar = kelly.filter(dossierSectionMeetsResearchBar).length;
  const hammerAtBar = hammer.filter(dossierSectionMeetsResearchBar).length;
  const pakkoAtBar = pakko.filter(dossierSectionMeetsResearchBar).length;

  const totalDossier = kelly.length + hammer.length + pakko.length;
  const atBarDossier = kellyAtBar + hammerAtBar + pakkoAtBar;
  const dossierResearchPct = Math.round((atBarDossier / Math.max(1, totalDossier)) * 100);

  const accaIds = getAllAccaConferenceDepthSectionIds();
  const accaAtBar = accaIds.filter((id) => {
    const s = getAccaConferenceDepthSection(id);
    return s && accaSectionMeetsPhase8Bar(s);
  }).length;
  const accaPanelPct = Math.round((accaAtBar / MIN_ACCA_SECTIONS_AT_BAR) * 100);

  let khWave3 = 0;
  for (const id of PHASE8_PROMOTED_KH_MODULE_IDS) {
    const mod = KIM_HAMMER_V4_MODULES[id];
    if (mod && mod.render.type !== "staff-stub") khWave3++;
  }

  let khTotal = 0;
  for (const id of [
    ...PHASE6_PROMOTED_KH_MODULE_IDS,
    ...PHASE7_PROMOTED_KH_MODULE_IDS,
    ...PHASE8_PROMOTED_KH_MODULE_IDS,
  ]) {
    const mod = KIM_HAMMER_V4_MODULES[id];
    if (mod && mod.render.type !== "staff-stub") khTotal++;
  }

  const dossierScore = dossierResearchPct >= 95 ? 100 : dossierResearchPct;
  const accaScore = accaAtBar >= MIN_ACCA_SECTIONS_AT_BAR ? 100 : accaPanelPct;
  const khScore = khWave3 >= MIN_KH_WAVE3_PROMOTED ? 100 : Math.round((khWave3 / MIN_KH_WAVE3_PROMOTED) * 100);

  const overallPct = Math.min(100, Math.round((dossierScore + accaScore + khScore) / 3));

  return {
    kellySectionsAtResearchBar: kellyAtBar,
    kellySectionTotal: kelly.length,
    hammerSectionsAtResearchBar: hammerAtBar,
    hammerSectionTotal: hammer.length,
    pakkoSectionsAtResearchBar: pakkoAtBar,
    pakkoSectionTotal: pakko.length,
    dossierResearchPct,
    accaSectionsAtBar: accaAtBar,
    accaSectionTotal: accaIds.length,
    accaPanelPct,
    khWave3Promoted: khWave3,
    khTotalPromoted: khTotal,
    overallPct,
  };
}

export type Phase8UpgradePassReport = {
  passId: "phase-8-dossier-research-acca-closure";
  title: "Step 8 — Phase 8: Dossier research depth + ACCA panel closure";
  summary: string;
  completionPct: number;
  hubHref: string;
  accaHubHref: string;
  progress: Phase8DossierResearchAccaProgress;
};

export function computePhase8UpgradePass(): Phase8UpgradePassReport {
  const progress = computePhase8DossierResearchAccaProgress();
  return {
    passId: "phase-8-dossier-research-acca-closure",
    title: "Step 8 — Phase 8: Dossier research depth + ACCA panel closure",
    summary:
      "Sourced research corpus on all candidate dossier sections, ACCA Mountain View panel operator scripts, and third-wave Kim Hammer module promotions.",
    completionPct: progress.overallPct,
    hubHref: PHASE8_UPGRADE_HUB_HREF,
    accaHubHref: ACCA_PANEL_HUB_HREF,
    progress,
  };
}

export function assertPhase8DossierResearchAccaBar(): { ok: boolean; message: string } {
  const p = computePhase8DossierResearchAccaProgress();

  if (p.dossierResearchPct < 95) {
    return {
      ok: false,
      message: `Dossier research ${p.dossierResearchPct}% (K ${p.kellySectionsAtResearchBar}/${p.kellySectionTotal} · H ${p.hammerSectionsAtResearchBar}/${p.hammerSectionTotal} · P ${p.pakkoSectionsAtResearchBar}/${p.pakkoSectionTotal})`,
    };
  }
  if (p.accaSectionsAtBar < MIN_ACCA_SECTIONS_AT_BAR) {
    return { ok: false, message: `ACCA panel ${p.accaSectionsAtBar}/${MIN_ACCA_SECTIONS_AT_BAR} at bar` };
  }
  if (p.khWave3Promoted < MIN_KH_WAVE3_PROMOTED) {
    return { ok: false, message: `KH wave 3 ${p.khWave3Promoted}/${MIN_KH_WAVE3_PROMOTED}` };
  }

  return { ok: true, message: `Phase 8 dossier research ACCA closure ${p.overallPct}% at bar` };
}
