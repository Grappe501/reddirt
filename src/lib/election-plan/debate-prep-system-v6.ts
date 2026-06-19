/**
 * Debate Prep System v6 — forum transcript intelligence woven through prep surfaces.
 */
import { buildDebatePrepSystemV5Snapshot, type DebatePrepSystemV5Snapshot } from "@/lib/election-plan/debate-prep-system-v5";
import { loadForumTranscriptIntel, type ForumTranscriptIntelSlice } from "@/lib/intelligence/v4/forumTranscriptIntel";

export const DEBATE_PREP_SYSTEM_V6_VERSION = "debate-prep-system-v6.0-forum-intel";

export type DebatePrepSystemV6Snapshot = DebatePrepSystemV5Snapshot & {
  version: typeof DEBATE_PREP_SYSTEM_V6_VERSION;
  headline: string;
  intro: string;
  forumIntel: ForumTranscriptIntelSlice;
  /** Readiness boost when forum analysis is integrated (0–10). */
  forumIntelReadinessBoost: number;
};

export function buildDebatePrepSystemV6Snapshot(referenceDate?: string): DebatePrepSystemV6Snapshot {
  const base = buildDebatePrepSystemV5Snapshot(referenceDate);
  const forumIntel = loadForumTranscriptIntel();

  const forumIntelReadinessBoost =
    forumIntel.deepAnalysisReady ? 10 : forumIntel.analysisReady ? 6 : forumIntel.transcriptReady ? 2 : 0;

  const readinessPct = Math.min(100, base.readinessPct + forumIntelReadinessBoost);

  const modules = base.modules.map((mod) => {
    if (mod.id === "forum-lab" && forumIntel.ready) {
      return {
        ...mod,
        status: "ready" as const,
        statusNote: `${forumIntel.transcriptChars.toLocaleString()} chars · ${forumIntel.capitalizeMoves.length} capitalize moves · wired into Days 4–5`,
      };
    }
    if (mod.id === "techniques" && forumIntel.ready) {
      return {
        ...mod,
        statusNote: `${mod.statusNote ?? ""} · ACCA forum addenda live`.trim(),
      };
    }
    if (mod.id === "trap-lanes" && forumIntel.hammerThemes.length) {
      return {
        ...mod,
        statusNote: `${forumIntel.hammerThemes.length} Hammer forum tells indexed`,
      };
    }
    if (mod.id === "ai-tutor" && forumIntel.ready) {
      const forumCards = forumIntel.capitalizeMoves.length + forumIntel.predictedQuestions.length;
      return {
        ...mod,
        statusNote: `Forum ACCA cards in three-way/deep modes · ${forumCards}+ drill prompts · coach/critique context wired`,
      };
    }
    if (mod.id === "rehearsal" && forumIntel.ready) {
      return {
        ...mod,
        status: "ready" as const,
        statusNote: `forum-acca-tonight queue live · run-of-show enriched for ACCA panel encounter`,
      };
    }
    return mod;
  });

  const todayFocus =
    forumIntel.ready && forumIntel.predictedQuestions[0]
      ? `Forum intel: rehearse "${forumIntel.predictedQuestions[0].slice(0, 80)}…"`
      : base.todayFocus;

  return {
    ...base,
    version: DEBATE_PREP_SYSTEM_V6_VERSION,
    headline: "Debate Prep System v6 · forum intel integrated",
    intro:
      "Election Plan command course with ACCA transcript intelligence merged into Days 4–8, trap lanes, techniques addenda, and Day 5 capitalize drills — not a separate lab silo.",
    readinessPct,
    readinessLabel:
      forumIntel.ready && readinessPct >= 75
        ? "Forum-informed · on track"
        : forumIntel.transcriptReady && !forumIntel.analysisReady
          ? "Transcript ready — run analysis"
          : base.readinessLabel,
    todayFocus,
    forumTranscriptReady: forumIntel.transcriptReady,
    forumAnalysisReady: forumIntel.ready,
    modules,
    forumIntel,
    forumIntelReadinessBoost,
  };
}
