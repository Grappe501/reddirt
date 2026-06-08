/**
 * Phase 19 — Professor showcase v6 closure pass.
 */
import {
  computePhase19ProfessorShowcaseDepth,
  PHASE19_CHECKPOINT_IDS,
  PHASE19_UPGRADE_HREF,
  phase19CheckpointMeetsBar,
  type Phase19CheckpointId,
} from "@/lib/intelligence/v4/phase19ProfessorShowcaseDepth";
import { SEARCH_AI_PREP_HUB_HREF } from "@/lib/intelligence/v4/phase17SearchAiPrepDepth";

const MIN_CHECKPOINTS = 7;
const MIN_COMPLETION = 90;

export function computePhase19UpgradePass() {
  const depth = computePhase19ProfessorShowcaseDepth();
  return {
    title: "Professor showcase v6 — cinematic seminar upgrade",
    summary:
      "The most memorable professor pass: navy-gold seminar hall hero, per-mode cinematic skins, animated lecture panels, forensic rubric showcase, and search brief hero — our last chance to impress before stage.",
    completionPct: depth.completionPct,
    progress: depth,
    checkpoints: PHASE19_CHECKPOINT_IDS.map((id) => ({
      id,
      atBar: phase19CheckpointMeetsBar(id),
    })),
  };
}

export function assertPhase19Bar(): { ok: boolean; message: string } {
  const d = computePhase19ProfessorShowcaseDepth();
  if (d.checkpointsAtBar < MIN_CHECKPOINTS) {
    return { ok: false, message: `${d.checkpointsAtBar}/${d.checkpointTotal} checkpoints — need ${MIN_CHECKPOINTS}` };
  }
  if (d.completionPct < MIN_COMPLETION) {
    return { ok: false, message: `Completion ${d.completionPct}% — need ≥${MIN_COMPLETION}%` };
  }
  return { ok: true, message: "Phase 19 bar met — professor showcase v6 ready for main merge" };
}

export { SEARCH_AI_PREP_HUB_HREF, PHASE19_UPGRADE_HREF };
export type { Phase19CheckpointId };
