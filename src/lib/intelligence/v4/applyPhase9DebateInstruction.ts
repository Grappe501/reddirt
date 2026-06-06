/**
 * Phase 9 — Apply debate instruction bridge overlays at read time.
 */
import type { DebatePrepSectionDrillDown } from "@/lib/intelligence/v4/debatePrepDrillDownTypes";
import type { TrapLaneDrillDown } from "@/lib/intelligence/v4/trapLaneDrillDownTypes";
import type { SosDebateQuestionDrillDown } from "@/lib/intelligence/v4/sosDebateQuestionTypes";
import {
  getPhase9PrepInstruction,
  getPhase9SosInstruction,
  getPhase9TrapInstruction,
} from "@/lib/intelligence/v4/phase9DebateInstructionDepth";

function dossierHref(sectionId: string) {
  if (sectionId.startsWith("hammer-")) {
    return `/admin/intelligence/opponents/dossiers/kim-hammer/${sectionId}`;
  }
  if (sectionId.startsWith("packo-")) {
    return `/admin/intelligence/opponents/dossiers/michael-packo/${sectionId}`;
  }
  return `/admin/intelligence/candidate-dossiers/kelly-grappe/${sectionId}`;
}

export function prepSectionHasPhase9Bridge(section: DebatePrepSectionDrillDown): boolean {
  const overlay = getPhase9PrepInstruction(section.sectionId);
  return overlay.dossierSectionIds.length >= 2 && overlay.additionalRehearsalSteps.length >= 2;
}

export function applyPhase9PrepInstruction(section: DebatePrepSectionDrillDown): DebatePrepSectionDrillDown {
  const overlay = getPhase9PrepInstruction(section.sectionId);
  const dossierLinks = overlay.dossierSectionIds.map((id) => ({
    href: dossierHref(id),
    label: `Dossier · ${id}`,
  }));

  const relatedLinks = [...section.relatedLinks];
  for (const link of dossierLinks) {
    if (!relatedLinks.some((l) => l.href === link.href)) {
      relatedLinks.push(link);
    }
  }

  return {
    ...section,
    relatedLinks,
    rehearsalSteps: [
      ...section.rehearsalSteps,
      ...overlay.additionalRehearsalSteps,
      `Clerk bridge: ${overlay.clerkRoomBridge}`,
      `ACCA note: ${overlay.accaPanelNote}`,
    ],
    setupMoves: [...section.setupMoves, ...overlay.additionalSetupMoves],
    whatModeratorMayAsk: [...section.whatModeratorMayAsk, ...overlay.additionalModeratorQuestions],
    staffRole: `${section.staffRole} Phase 9 bridge: cross-read dossier sections ${overlay.dossierSectionIds.join(", ")} before rehearsal.`,
  };
}

export function trapLaneHasPhase9Bridge(lane: TrapLaneDrillDown): boolean {
  const overlay = getPhase9TrapInstruction(lane.laneId);
  return Boolean(overlay?.clerkRoomScript && overlay.dossierSectionIds.length >= 2);
}

export function applyPhase9TrapInstruction(lane: TrapLaneDrillDown): TrapLaneDrillDown {
  const overlay = getPhase9TrapInstruction(lane.laneId);
  if (!overlay) return lane;

  const dossierLinks = overlay.dossierSectionIds.map((id) => ({
    href: dossierHref(id),
    label: `Dossier · ${id}`,
  }));

  const relatedLinks = [...(lane.relatedLinks ?? [])];
  for (const link of dossierLinks) {
    if (!relatedLinks.some((l) => l.href === link.href)) {
      relatedLinks.push(link);
    }
  }

  return {
    ...lane,
    relatedLinks,
    rehearsalSteps: [
      ...lane.rehearsalSteps,
      ...overlay.additionalRehearsalSteps,
      `Clerk-room script: ${overlay.clerkRoomScript}`,
      `ACCA: ${overlay.accaPanelNote}`,
    ],
    setupMoves: [...lane.setupMoves, `Dossier pre-read: ${overlay.dossierSectionIds.join(", ")}`],
    packoNote: lane.packoNote
      ? `${lane.packoNote} Phase 9: ${overlay.accaPanelNote}`
      : overlay.accaPanelNote,
  };
}

export function sosQuestionHasPhase9Bridge(question: SosDebateQuestionDrillDown): boolean {
  const overlay = getPhase9SosInstruction(question.category);
  return overlay.dossierSectionIds.length >= 2 && overlay.dossierBriefingHook.length >= 40;
}

export function applyPhase9SosInstruction(question: SosDebateQuestionDrillDown): SosDebateQuestionDrillDown {
  const overlay = getPhase9SosInstruction(question.category);
  const dossierLinks = overlay.dossierSectionIds.map((id) => ({
    href: dossierHref(id),
    label: `Dossier · ${id}`,
  }));

  const relatedLinks = [...question.relatedLinks];
  for (const link of dossierLinks) {
    if (!relatedLinks.some((l) => l.href === link.href)) {
      relatedLinks.push(link);
    }
  }

  return {
    ...question,
    relatedLinks,
    researchBasis: `${question.researchBasis} Phase 9 dossier bridge: ${overlay.dossierBriefingHook}`,
    rehearsalSteps: [...question.rehearsalSteps, ...overlay.additionalRehearsalSteps],
  };
}
