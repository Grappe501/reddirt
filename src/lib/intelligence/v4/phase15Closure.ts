/**
 * Phase 15 P0+P1 — Candidate Command Experience closure.
 */
import { computePhase15P0Progress, assertPhase15P0Bar } from "@/lib/intelligence/v4/phase15P0Closure";
import { computePhase15P1Progress, assertPhase15P1Bar } from "@/lib/intelligence/v4/phase15P1Closure";
import { CANDIDATE_COMMAND_HOME_HREF } from "@/lib/intelligence/v4/phase15CandidateCommandDepth";

export type Phase15P0P1Progress = {
  p0: ReturnType<typeof computePhase15P0Progress>;
  p1: ReturnType<typeof computePhase15P1Progress>;
  overallPct: number;
};

export type Phase15P0P1UpgradePassReport = {
  passId: "phase-15-p0-p1-candidate-command";
  title: "Step 15 P0+P1 — Candidate command experience";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase15P0P1Progress;
};

export function computePhase15P0P1Progress(): Phase15P0P1Progress {
  const p0 = computePhase15P0Progress();
  const p1 = computePhase15P1Progress();
  const overallPct = Math.min(100, Math.round((p0.overallPct + p1.overallPct) / 2));
  return { p0, p1, overallPct };
}

export function computePhase15P0P1UpgradePass(): Phase15P0P1UpgradePassReport {
  const progress = computePhase15P0P1Progress();
  return {
    passId: "phase-15-p0-p1-candidate-command",
    title: "Step 15 P0+P1 — Candidate command experience",
    summary:
      "Nav collapse into five orchestrated sections for candidate profile, builder infra hidden from primary nav, and unified command home with readiness plus safe/blocked claims feed.",
    completionPct: progress.overallPct,
    hubHref: CANDIDATE_COMMAND_HOME_HREF,
    progress,
  };
}

export function assertPhase15P0P1Bar(): { ok: boolean; message: string } {
  const p0 = assertPhase15P0Bar();
  const p1 = assertPhase15P1Bar();
  if (p0.ok && p1.ok) return { ok: true, message: "Phase 15 P0+P1 bar met" };
  return { ok: false, message: [p0.ok ? null : p0.message, p1.ok ? null : p1.message].filter(Boolean).join("; ") };
}

export { CANDIDATE_COMMAND_HOME_HREF };
