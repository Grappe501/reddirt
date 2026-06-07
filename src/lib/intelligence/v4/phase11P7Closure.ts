/**
 * Phase 11 P7 — Briefing papers chunk attach closure.
 */
import {
  BRIEFING_PAPER_ATTACH_LANE_IDS,
  BRIEFING_PAPERS_CHUNK_ATTACH_HUB_HREF,
  briefingPaperAttachLaneHref,
  briefingPaperAttachMeetsPhase11P7Bar,
  countBriefingPaperAttachLanesAtBar,
  getBriefingPaperAttachOverlay,
  PHASE11_P7_ATTACH_LANE_TOTAL,
  type BriefingPaperAttachLaneId,
} from "@/lib/intelligence/v4/phase11P7BriefingPapersChunkAttachDepth";
import { loadBriefingPapersChunkAttachState } from "@/lib/intelligence/v4/briefingPapersChunkAttachState";
import { computePhase11P6Progress } from "@/lib/intelligence/v4/phase11P6Closure";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";

const MIN_LANES = 8;
const MIN_AT_BAR = 8;
const MIN_ATTACHABLE_CHUNKS = 500;

export type BriefingPaperAttachLaneSurface = {
  laneId: BriefingPaperAttachLaneId;
  paperId: string;
  label: string;
  href: string;
  attachableChunkCount: number;
  phase11P7Enriched: boolean;
};

export type Phase11P7Progress = {
  laneTotal: number;
  lanesAtBar: number;
  totalAttachableChunks: number;
  p6PreviewLanesAtBar: number;
  fieldBookReady: boolean;
  canonReady: boolean;
  briefingPapersRouteBound: boolean;
  strategyMigrationRoutes: number;
  overallPct: number;
};

export function listBriefingPaperAttachLaneSurfaces(): BriefingPaperAttachLaneSurface[] {
  const state = loadBriefingPapersChunkAttachState();
  return BRIEFING_PAPER_ATTACH_LANE_IDS.map((laneId) => {
    const overlay = getBriefingPaperAttachOverlay(laneId);
    const laneState = state?.lanes.find((l) => l.laneId === laneId);
    return {
      laneId,
      paperId: overlay.paperId,
      label: overlay.label,
      href: briefingPaperAttachLaneHref(laneId),
      attachableChunkCount: laneState?.attachableChunkCount ?? 0,
      phase11P7Enriched: briefingPaperAttachMeetsPhase11P7Bar(overlay),
    };
  });
}

export function computePhase11P7Progress(): Phase11P7Progress {
  const state = loadBriefingPapersChunkAttachState();
  const lanes = countBriefingPaperAttachLanesAtBar();
  const p6 = computePhase11P6Progress();
  const migrationRoutes = listStrategyMigrationRoutes();

  const fieldBookReady = Boolean(getFieldBookArticle("briefing-papers-chunk-attach-command"));
  const canonReady = Boolean(resolveCanonBinding(BRIEFING_PAPERS_CHUNK_ATTACH_HUB_HREF));
  const briefingPapersRouteBound = migrationRoutes.some(
    (r) => r.intelligenceHref === "/admin/intelligence/briefing-papers",
  );

  const totalAttachableChunks = state?.totalAttachableChunks ?? 0;

  const laneScore =
    lanes.atBar >= MIN_AT_BAR && lanes.total >= MIN_LANES
      ? 100
      : Math.round((lanes.atBar / MIN_AT_BAR) * 100);
  const chunkScore =
    totalAttachableChunks >= MIN_ATTACHABLE_CHUNKS
      ? 100
      : Math.round((totalAttachableChunks / MIN_ATTACHABLE_CHUNKS) * 100);
  const p6Score =
    p6.lanesAtBar >= 8 ? 100 : Math.round((p6.lanesAtBar / 8) * 100);
  const wireChecks = [fieldBookReady, canonReady, briefingPapersRouteBound];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((laneScore + chunkScore + p6Score + wireScore) / 4));

  return {
    laneTotal: lanes.total,
    lanesAtBar: lanes.atBar,
    totalAttachableChunks,
    p6PreviewLanesAtBar: p6.lanesAtBar,
    fieldBookReady,
    canonReady,
    briefingPapersRouteBound,
    strategyMigrationRoutes: migrationRoutes.length,
    overallPct,
  };
}

export type Phase11P7UpgradePassReport = {
  passId: "phase-11-p7-briefing-papers-chunk-attach";
  title: "Step 11 P7 — Briefing papers chunk attach";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase11P7Progress;
};

export function computePhase11P7UpgradePass(): Phase11P7UpgradePassReport {
  const progress = computePhase11P7Progress();
  return {
    passId: "phase-11-p7-briefing-papers-chunk-attach",
    title: "Step 11 P7 — Briefing papers chunk attach",
    summary:
      "Eight briefing paper attach lanes wire P6 chunk previews into governed briefing paper deep sections — operator attach steps, claims-gated merge via claim-review API, and Field Book promotion handoff.",
    completionPct: progress.overallPct,
    hubHref: BRIEFING_PAPERS_CHUNK_ATTACH_HUB_HREF,
    progress,
  };
}

export function assertPhase11P7Bar(): { ok: boolean; message: string } {
  const p = computePhase11P7Progress();
  const issues: string[] = [];
  if (p.lanesAtBar < MIN_AT_BAR) issues.push(`lanes ${p.lanesAtBar}/${MIN_AT_BAR}`);
  if (p.totalAttachableChunks < MIN_ATTACHABLE_CHUNKS) {
    issues.push(`attachable ${p.totalAttachableChunks}/${MIN_ATTACHABLE_CHUNKS}`);
  }
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.briefingPapersRouteBound) issues.push("briefing-papers migration");
  if (issues.length === 0) return { ok: true, message: "Phase 11 P7 bar met" };
  return { ok: false, message: issues.join("; ") };
}

export {
  BRIEFING_PAPERS_CHUNK_ATTACH_HUB_HREF,
  PHASE11_P7_ATTACH_LANE_TOTAL,
};
