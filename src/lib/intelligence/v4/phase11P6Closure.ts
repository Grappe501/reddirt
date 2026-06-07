/**
 * Phase 11 P6 — Strategy alignment chunk preview closure.
 */
import {
  countStrategyAlignmentChunkPreviewLanesAtBar,
  STRATEGY_ALIGNMENT_CHUNK_PREVIEW_HUB_HREF,
  alignmentChunkPreviewLaneHref,
  getStrategyAlignmentChunkPreviewOverlay,
  PHASE11_P6_PREVIEW_LANE_TOTAL,
  ALIGNMENT_CHUNK_PREVIEW_LANE_IDS,
  strategyAlignmentChunkPreviewMeetsPhase11P6Bar,
  type AlignmentChunkPreviewLaneId,
} from "@/lib/intelligence/v4/phase11P6StrategyAlignmentChunkPreviewDepth";
import { loadStrategyAlignmentChunkPreviewState } from "@/lib/intelligence/v4/strategyAlignmentChunkPreviewState";
import { computePhase11P5Progress } from "@/lib/intelligence/v4/phase11P5Closure";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";

const MIN_LANES = 8;
const MIN_AT_BAR = 8;
const MIN_MATCHING_CHUNKS = 200;

export type AlignmentChunkPreviewLaneSurface = {
  laneId: AlignmentChunkPreviewLaneId;
  label: string;
  href: string;
  matchingChunkCount: number;
  phase11P6Enriched: boolean;
  alignmentDoctrineIds: string[];
};

export type Phase11P6Progress = {
  laneTotal: number;
  lanesAtBar: number;
  totalMatchingChunks: number;
  p5PromotionGateOpen: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  alignmentRouteBound: boolean;
  strategyMigrationRoutes: number;
  overallPct: number;
};

export function listAlignmentChunkPreviewLaneSurfaces(): AlignmentChunkPreviewLaneSurface[] {
  const state = loadStrategyAlignmentChunkPreviewState();
  return ALIGNMENT_CHUNK_PREVIEW_LANE_IDS.map((laneId) => {
    const overlay = getStrategyAlignmentChunkPreviewOverlay(laneId);
    const laneState = state?.lanes.find((l) => l.laneId === laneId);
    return {
      laneId,
      label: overlay.label,
      href: alignmentChunkPreviewLaneHref(laneId),
      matchingChunkCount: laneState?.matchingChunkCount ?? 0,
      phase11P6Enriched: strategyAlignmentChunkPreviewMeetsPhase11P6Bar(overlay),
      alignmentDoctrineIds: overlay.alignmentDoctrineIds,
    };
  });
}

export function computePhase11P6Progress(): Phase11P6Progress {
  const state = loadStrategyAlignmentChunkPreviewState();
  const lanes = countStrategyAlignmentChunkPreviewLanesAtBar();
  const p5 = computePhase11P5Progress();
  const migrationRoutes = listStrategyMigrationRoutes();

  const fieldBookReady = Boolean(getFieldBookArticle("strategy-alignment-chunk-preview-command"));
  const canonReady = Boolean(resolveCanonBinding(STRATEGY_ALIGNMENT_CHUNK_PREVIEW_HUB_HREF));
  const alignmentRouteBound = migrationRoutes.some(
    (r) => r.intelligenceHref === "/admin/intelligence/strategy-alignment",
  );

  const totalMatchingChunks = state?.totalMatchingChunks ?? 0;

  const laneScore =
    lanes.atBar >= MIN_AT_BAR && lanes.total >= MIN_LANES
      ? 100
      : Math.round((lanes.atBar / MIN_AT_BAR) * 100);
  const chunkScore =
    totalMatchingChunks >= MIN_MATCHING_CHUNKS
      ? 100
      : Math.round((totalMatchingChunks / MIN_MATCHING_CHUNKS) * 100);
  const p5Score = p5.totalChunks >= 2700 ? 100 : Math.round((p5.totalChunks / 2700) * 100);
  const wireChecks = [fieldBookReady, canonReady, alignmentRouteBound];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((laneScore + chunkScore + p5Score + wireScore) / 4));

  return {
    laneTotal: lanes.total,
    lanesAtBar: lanes.atBar,
    totalMatchingChunks,
    p5PromotionGateOpen: p5.promotionGateOpen,
    fieldBookReady,
    canonReady,
    alignmentRouteBound,
    strategyMigrationRoutes: migrationRoutes.length,
    overallPct,
  };
}

export type Phase11P6UpgradePassReport = {
  passId: "phase-11-p6-strategy-alignment-chunk-preview";
  title: "Step 11 P6 — Strategy alignment chunk preview";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase11P6Progress;
};

export function computePhase11P6UpgradePass(): Phase11P6UpgradePassReport {
  const progress = computePhase11P6Progress();
  return {
    passId: "phase-11-p6-strategy-alignment-chunk-preview",
    title: "Step 11 P6 — Strategy alignment chunk preview",
    summary:
      "Eight SDI-1 alignment preview lanes wire P5 promotion batches to strategy-alignment — doctrine crosswalk, chunk sample filters, claims-gated preview steps, and Field Book promotion handoff.",
    completionPct: progress.overallPct,
    hubHref: STRATEGY_ALIGNMENT_CHUNK_PREVIEW_HUB_HREF,
    progress,
  };
}

export function assertPhase11P6Bar(): { ok: boolean; message: string } {
  const p = computePhase11P6Progress();
  const issues: string[] = [];
  if (p.lanesAtBar < MIN_AT_BAR) issues.push(`lanes ${p.lanesAtBar}/${MIN_AT_BAR}`);
  if (p.totalMatchingChunks < MIN_MATCHING_CHUNKS) {
    issues.push(`matching chunks ${p.totalMatchingChunks}/${MIN_MATCHING_CHUNKS}`);
  }
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.alignmentRouteBound) issues.push("alignment migration");
  if (issues.length === 0) return { ok: true, message: "Phase 11 P6 bar met" };
  return { ok: false, message: issues.join("; ") };
}

export {
  STRATEGY_ALIGNMENT_CHUNK_PREVIEW_HUB_HREF,
  PHASE11_P6_PREVIEW_LANE_TOTAL,
};
