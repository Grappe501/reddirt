/**
 * Merge research corpus overlays into dossier sections at read time.
 */
import type { KellyDossierDepthSection } from "@/lib/intelligence/v4/kellyCandidateDossierDepth";
import type { OpponentDossierDepthSection } from "@/lib/intelligence/v4/opponentCandidateDossierDepth";
import { KELLY_DOSSIER_RESEARCH_OVERLAY } from "@/lib/intelligence/v4/kellyDossierResearchDepth";
import { OPPONENT_DOSSIER_RESEARCH_OVERLAY } from "@/lib/intelligence/v4/opponentDossierResearchDepth";

export type DossierResearchDepthBlock = {
  sourcedFacts: string[];
  fieldResearchNotes: string[];
};

export type DossierResearchOverlay = {
  additionalNarrative?: string[];
  additionalHighlights?: string[];
  additionalWalkthrough?: string[];
  additionalHardEvidence?: OpponentDossierDepthSection["hardEvidence"];
  sourcedFacts?: string[];
  fieldResearchNotes?: string[];
};

function mergeResearchBlock(
  existing: DossierResearchDepthBlock | undefined,
  overlay: DossierResearchOverlay,
): DossierResearchDepthBlock {
  return {
    sourcedFacts: [...(existing?.sourcedFacts ?? []), ...(overlay.sourcedFacts ?? [])],
    fieldResearchNotes: [...(existing?.fieldResearchNotes ?? []), ...(overlay.fieldResearchNotes ?? [])],
  };
}

export function applyKellyDossierResearchDepth(section: KellyDossierDepthSection): KellyDossierDepthSection {
  const overlay = KELLY_DOSSIER_RESEARCH_OVERLAY[section.sectionId];
  if (!overlay) return section;

  return {
    ...section,
    narrativeOverview: [...section.narrativeOverview, ...(overlay.additionalNarrative ?? [])],
    experienceHighlights: [...section.experienceHighlights, ...(overlay.additionalHighlights ?? [])],
    plainEnglishWalkthrough: [...section.plainEnglishWalkthrough, ...(overlay.additionalWalkthrough ?? [])],
    researchDepth: mergeResearchBlock(section.researchDepth, overlay),
  };
}

export function applyOpponentDossierResearchDepth(section: OpponentDossierDepthSection): OpponentDossierDepthSection {
  const overlay = OPPONENT_DOSSIER_RESEARCH_OVERLAY[section.sectionId];
  if (!overlay) return section;

  return {
    ...section,
    narrativeOverview: [...section.narrativeOverview, ...(overlay.additionalNarrative ?? [])],
    plainEnglishWalkthrough: [...section.plainEnglishWalkthrough, ...(overlay.additionalWalkthrough ?? [])],
    hardEvidence: [...section.hardEvidence, ...(overlay.additionalHardEvidence ?? [])],
    researchDepth: mergeResearchBlock(section.researchDepth, overlay),
  };
}
