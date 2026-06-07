/**
 * Phase 15 P3 — Stage-safe filter depth overlays per rehearse surface.
 */
import { getAllTrapLaneIds, getTrapLaneDrillDown } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import { getAllSosDebateQuestionIds, getSosDebateQuestionDrillDown } from "@/lib/intelligence/v4/sosDebateQuestionBank";
import { KELLY_CLOSING_SCRIPTS, KELLY_OPENING_SCRIPTS } from "@/lib/intelligence/v4/kellyDebateCoaching";
import { evaluateStageSafeContent } from "@/lib/intelligence/v4/phase15StageSafeFilter";
import { isClaimsGateCandidateBlocked } from "@/lib/intelligence/v4/claimsGatePolicy";

export const PHASE15_P3_STAGE_SAFE_FILTER_HUB_HREF = "/admin/intelligence/stage-safe-filter";

export const PHASE15_P3_TRAP_LANE_TOTAL = 6;
export const PHASE15_P3_COACHING_SCRIPT_TOTAL = 3;

export type StageSafeSurfaceKind = "trap-lane" | "sos-question" | "coaching-script";

export type StageSafeSurfaceOverlay = {
  surfaceId: string;
  kind: StageSafeSurfaceKind;
  title: string;
  href: string;
  claimsGate: string;
  candidateBlocked: boolean;
  filterSteps: string[];
  fallbackFraming: string;
};

function overlay(
  surfaceId: string,
  kind: StageSafeSurfaceKind,
  title: string,
  href: string,
  claimsGate: string,
  steps: string[],
): StageSafeSurfaceOverlay {
  const decision = evaluateStageSafeContent(claimsGate, "candidate");
  return {
    surfaceId,
    kind,
    title,
    href,
    claimsGate,
    candidateBlocked: decision.blocked,
    filterSteps: steps,
    fallbackFraming: decision.fallback.body,
  };
}

export function getTrapLaneStageSafeOverlay(laneId: string): StageSafeSurfaceOverlay | undefined {
  const drill = getTrapLaneDrillDown(laneId);
  if (!drill) return undefined;
  return overlay(
    laneId,
    "trap-lane",
    drill.title,
    `/admin/intelligence/trap-lanes/${laneId}`,
    drill.claimsGate,
    [
      "Evaluate claimsGate with candidate profile — redact sample scripts and rebuttals when blocked.",
      "Keep opponent expectations and setup timing visible — Kelly still learns the trap mechanics.",
      "Show StageSafeBlockedPanel with research-question framing and link to claims ledger.",
    ],
  );
}

export function getSosQuestionStageSafeOverlay(questionId: string): StageSafeSurfaceOverlay | undefined {
  const drill = getSosDebateQuestionDrillDown(questionId);
  if (!drill) return undefined;
  return overlay(
    questionId,
    "sos-question",
    drill.title,
    `/admin/intelligence/sos-debate-questions/${questionId}`,
    drill.claimsGate,
    [
      "Redact speak-order full scripts, quick answers, and sample scripts when candidateBlocked.",
      "Keep moderator phrasing and opponent expectations — Kelly learns the question shape.",
      "ClaimsGateBanner shows stage lock prefix for candidate profile.",
    ],
  );
}

export function getCoachingScriptStageSafeOverlay(scriptId: string): StageSafeSurfaceOverlay | undefined {
  const script =
    KELLY_OPENING_SCRIPTS.find((s) => s.id === scriptId || s.label === scriptId) ??
    KELLY_CLOSING_SCRIPTS.find((s) => s.id === scriptId || s.label === scriptId);
  if (!script) return undefined;
  return overlay(
    script.id,
    "coaching-script",
    script.label,
    "/admin/intelligence/debate-coaching",
    script.claimsGate,
    [
      "ScriptCard checks candidateBlocked before rendering rehearse text.",
      "GENERAL_FRAME and NEEDS_REVIEW gates show staff-verify fallback on candidate deploy.",
      "Staff profile shows full script with claims annotation.",
    ],
  );
}

export const COACHING_SCRIPT_SURFACE_IDS = ["open-30-offensive", "open-30", "close-30"] as const;

export function listStageSafeSurfaceOverlays(): StageSafeSurfaceOverlay[] {
  const traps = getAllTrapLaneIds().map((id) => getTrapLaneStageSafeOverlay(id)!);
  const sos = getAllSosDebateQuestionIds().map((id) => getSosQuestionStageSafeOverlay(id)!);
  const coaching = COACHING_SCRIPT_SURFACE_IDS.map((id) => getCoachingScriptStageSafeOverlay(id)!);
  return [...traps, ...sos, ...coaching];
}

export function stageSafeSurfaceMeetsPhase15P3Bar(overlay: StageSafeSurfaceOverlay): boolean {
  return (
    overlay.filterSteps.length >= 3 &&
    overlay.fallbackFraming.trim().length >= 40 &&
    overlay.href.startsWith("/admin/intelligence")
  );
}

export function countStageSafeSurfacesAtBar(): { atBar: number; total: number; candidateBlocked: number } {
  const surfaces = listStageSafeSurfaceOverlays();
  const atBar = surfaces.filter(stageSafeSurfaceMeetsPhase15P3Bar).length;
  const candidateBlocked = surfaces.filter((s) => s.candidateBlocked).length;
  return { atBar, total: surfaces.length, candidateBlocked };
}

export function countTrapLanesWithCandidateGating(): number {
  return getAllTrapLaneIds().filter((id) => {
    const drill = getTrapLaneDrillDown(id);
    return drill && isClaimsGateCandidateBlocked(drill.claimsGate);
  }).length;
}

export function countSosQuestionsWithCandidateGating(): number {
  return getAllSosDebateQuestionIds().filter((id) => {
    const drill = getSosDebateQuestionDrillDown(id);
    return drill && isClaimsGateCandidateBlocked(drill.claimsGate);
  }).length;
}
