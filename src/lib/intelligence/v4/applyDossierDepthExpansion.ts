/**
 * Phase 9 depth pass — merge second-wave expansion overlays.
 */
import type { KellyDossierDepthSection } from "@/lib/intelligence/v4/kellyCandidateDossierDepth";
import type { OpponentDossierDepthSection } from "@/lib/intelligence/v4/opponentCandidateDossierDepth";
import type { AccaConferenceDepthSection } from "@/lib/intelligence/v4/accaClerksConference2026Depth";
import type { DossierResearchDepthBlock, DossierResearchOverlay } from "@/lib/intelligence/v4/applyCandidateDossierResearchDepth";
import { KELLY_DOSSIER_DEPTH_EXPANSION } from "@/lib/intelligence/v4/kellyDossierDepthExpansion";
import { OPPONENT_DOSSIER_DEPTH_EXPANSION } from "@/lib/intelligence/v4/opponentDossierDepthExpansion";
import { ACCA_CONFERENCE_DEPTH_EXPANSION } from "@/lib/intelligence/v4/accaConferenceDepthExpansion";

function mergeResearchBlock(
  existing: DossierResearchDepthBlock | undefined,
  overlay: DossierResearchOverlay,
): DossierResearchDepthBlock {
  return {
    sourcedFacts: [...(existing?.sourcedFacts ?? []), ...(overlay.sourcedFacts ?? [])],
    fieldResearchNotes: [...(existing?.fieldResearchNotes ?? []), ...(overlay.fieldResearchNotes ?? [])],
  };
}

export function applyKellyDossierDepthExpansion(section: KellyDossierDepthSection): KellyDossierDepthSection {
  const overlay = KELLY_DOSSIER_DEPTH_EXPANSION[section.sectionId];
  if (!overlay) return section;
  return {
    ...section,
    narrativeOverview: [...section.narrativeOverview, ...(overlay.additionalNarrative ?? [])],
    experienceHighlights: [...section.experienceHighlights, ...(overlay.additionalHighlights ?? [])],
    plainEnglishWalkthrough: [...section.plainEnglishWalkthrough, ...(overlay.additionalWalkthrough ?? [])],
    howToUseInDebate: [...section.howToUseInDebate, ...(overlay.additionalWalkthrough?.slice(0, 2) ?? [])],
    howToUseOnTrail: [...section.howToUseOnTrail, ...(overlay.fieldResearchNotes?.slice(0, 1) ?? [])],
    researchDepth: mergeResearchBlock(section.researchDepth, overlay),
  };
}

export function applyOpponentDossierDepthExpansion(section: OpponentDossierDepthSection): OpponentDossierDepthSection {
  const overlay = OPPONENT_DOSSIER_DEPTH_EXPANSION[section.sectionId];
  if (!overlay) return section;
  return {
    ...section,
    narrativeOverview: [...section.narrativeOverview, ...(overlay.additionalNarrative ?? [])],
    plainEnglishWalkthrough: [...section.plainEnglishWalkthrough, ...(overlay.additionalWalkthrough ?? [])],
    hardEvidence: [...section.hardEvidence, ...(overlay.additionalHardEvidence ?? [])],
    howToUseInDebate: [...section.howToUseInDebate, ...(overlay.additionalWalkthrough?.slice(0, 2) ?? [])],
    howToUseInClerkRoom: [...section.howToUseInClerkRoom, ...(overlay.fieldResearchNotes?.slice(0, 1) ?? [])],
    researchDepth: mergeResearchBlock(section.researchDepth, overlay),
  };
}

export function applyAccaConferenceDepthExpansion(section: AccaConferenceDepthSection): AccaConferenceDepthSection {
  const overlay = ACCA_CONFERENCE_DEPTH_EXPANSION[section.sectionId];
  if (!overlay) return section;
  return {
    ...section,
    narrativeOverview: [...section.narrativeOverview, ...(overlay.additionalNarrative ?? [])],
    howToPresentInPanel: [...section.howToPresentInPanel, ...(overlay.additionalWalkthrough?.slice(0, 2) ?? [])],
    staffActions: [...section.staffActions, ...(overlay.fieldResearchNotes?.slice(0, 2) ?? [])],
    plainEnglishWalkthrough: [...section.plainEnglishWalkthrough, ...(overlay.additionalWalkthrough ?? [])],
    hardEvidence: [...section.hardEvidence, ...(overlay.additionalHardEvidence ?? [])],
  };
}
