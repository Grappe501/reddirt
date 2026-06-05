import { getAllAccaConferenceDepthSectionIds } from "@/lib/intelligence/v4/accaClerksConference2026Depth";
import { listAllBillNumbersFromIndex } from "@/lib/intelligence/v4/billActProofDepth";
import { getAllPrepSectionDrillDownIds } from "@/lib/intelligence/v4/debatePrepSectionDrillDowns";
import { getAllElectionFundingDepthSectionIds } from "@/lib/intelligence/v4/electionFundingDrillDownDepth";
import { getAllKellyDossierSectionIds } from "@/lib/intelligence/v4/kellyCandidateDossierDepth";
import { getAllOpponentDossierSectionIds } from "@/lib/intelligence/v4/opponentCandidateDossierDepth";
import { getAllSosDebateQuestionIds } from "@/lib/intelligence/v4/sosDebateQuestionBank";
import { getAllTrapLaneIds } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import { buildTier4CoreSpineNavGroups } from "@/lib/intelligence/v4/tier4CoreSpineNav";

/** Server/build-only drill-down routes — imports modules that read JSON via node:fs. */
export function getTier4CoreSpineDrillDownRoutes(): string[] {
  const billNumbers = listAllBillNumbersFromIndex().slice(0, 29);
  return [
    ...getAllTrapLaneIds().map((id) => `/admin/intelligence/trap-lanes/${id}`),
    ...getAllSosDebateQuestionIds().map((id) => `/admin/intelligence/sos-debate-questions/${id}`),
    ...getAllAccaConferenceDepthSectionIds().map(
      (id) => `/admin/intelligence/county-clerk-week/acca-summer-conference/${id}`,
    ),
    ...getAllElectionFundingDepthSectionIds().map((id) => `/admin/intelligence/election-funding/${id}`),
    ...getAllKellyDossierSectionIds().map((id) => `/admin/intelligence/candidate-dossiers/kelly-grappe/${id}`),
    ...getAllOpponentDossierSectionIds().flatMap((id) => [
      `/admin/intelligence/opponents/dossiers/kim-hammer/${id}`,
      `/admin/intelligence/opponents/dossiers/michael-packo/${id}`,
    ]),
    "/admin/intelligence/candidate-dossiers/kelly-grappe",
    "/admin/intelligence/opponents/dossiers/kim-hammer",
    "/admin/intelligence/opponents/dossiers/michael-packo",
    ...getAllPrepSectionDrillDownIds().map((id) => `/admin/intelligence/kim-hammer/debate-prep/${id}`),
    ...billNumbers.flatMap((b) => [
      `/admin/intelligence/kim-hammer/bills/${b}`,
      `/admin/intelligence/kim-hammer/bills/${b}/act-proof`,
    ]),
  ];
}

export function getTier4CoreSpineLinkAuditRoutes(): string[] {
  const seen = new Set<string>();
  const routes: string[] = [];
  const add = (href: string) => {
    const normalized = href.replace(/\/$/, "") || href;
    if (seen.has(normalized)) return;
    seen.add(normalized);
    routes.push(normalized);
  };
  for (const group of buildTier4CoreSpineNavGroups()) {
    for (const item of group.items) add(item.href);
  }
  for (const href of getTier4CoreSpineDrillDownRoutes()) add(href);
  return routes;
}
