/**
 * Phase 11 P8 — Field Book promotion execution closure.
 */
import { computeCanonLoopStats } from "@/lib/intelligence/fieldBookCanonRegistry";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { loadFieldBookPromotionExecutionState } from "@/lib/intelligence/v4/fieldBookPromotionExecutionState";
import { computePhase11P5Progress } from "@/lib/intelligence/v4/phase11P5Closure";
import { computePhase11P7Progress } from "@/lib/intelligence/v4/phase11P7Closure";
import {
  countFieldBookPromotionExecutionWavesAtBar,
  FIELD_BOOK_PROMOTION_EXECUTION_HUB_HREF,
  fieldBookPromotionExecutionMeetsPhase11P8Bar,
  fieldBookPromotionExecutionWaveHref,
  getFieldBookPromotionExecutionOverlay,
  PHASE11_P8_EXECUTION_WAVE_TOTAL,
  PROMOTION_EXECUTION_WAVE_IDS,
  type PromotionExecutionWaveId,
} from "@/lib/intelligence/v4/phase11P8FieldBookPromotionExecutionDepth";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";

const MIN_WAVES = 8;
const MIN_AT_BAR = 8;
const MIN_LINKED_CHUNKS = 2700;
const MIN_CANON_BINDINGS = 18;

export type PromotionExecutionWaveSurface = {
  waveId: PromotionExecutionWaveId;
  label: string;
  href: string;
  linkedChunkCount: number;
  status: string;
  phase11P8Enriched: boolean;
  targetFieldBookSlugs: string[];
};

export type Phase11P8Progress = {
  waveTotal: number;
  wavesAtBar: number;
  totalLinkedChunks: number;
  p5TotalChunks: number;
  p7LanesAtBar: number;
  canonBindingCount: number;
  promotionPipelineReady: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  canonHubBound: boolean;
  strategyMigrationRoutes: number;
  overallPct: number;
};

export function listPromotionExecutionWaveSurfaces(): PromotionExecutionWaveSurface[] {
  const state = loadFieldBookPromotionExecutionState();
  return PROMOTION_EXECUTION_WAVE_IDS.map((waveId) => {
    const overlay = getFieldBookPromotionExecutionOverlay(waveId);
    const waveState = state?.waves.find((w) => w.waveId === waveId);
    return {
      waveId,
      label: overlay.label,
      href: fieldBookPromotionExecutionWaveHref(waveId),
      linkedChunkCount: waveState?.linkedChunkCount ?? 0,
      status: waveState?.status ?? "pending",
      phase11P8Enriched: fieldBookPromotionExecutionMeetsPhase11P8Bar(overlay),
      targetFieldBookSlugs: overlay.targetFieldBookSlugs,
    };
  });
}

export function computePhase11P8Progress(): Phase11P8Progress {
  const state = loadFieldBookPromotionExecutionState();
  const waves = countFieldBookPromotionExecutionWavesAtBar();
  const p5 = computePhase11P5Progress();
  const p7 = computePhase11P7Progress();
  const canonStats = computeCanonLoopStats();
  const migrationRoutes = listStrategyMigrationRoutes();

  const fieldBookReady = Boolean(getFieldBookArticle("field-book-promotion-execution-command"));
  const canonReady = Boolean(resolveCanonBinding(FIELD_BOOK_PROMOTION_EXECUTION_HUB_HREF));
  const canonHubBound = Boolean(resolveCanonBinding("/admin/intelligence/field-book/canon"));

  const totalLinkedChunks = state?.totalLinkedChunks ?? 0;

  const waveScore =
    waves.atBar >= MIN_AT_BAR && waves.total >= MIN_WAVES
      ? 100
      : Math.round((waves.atBar / MIN_AT_BAR) * 100);
  const chunkScore =
    totalLinkedChunks >= MIN_LINKED_CHUNKS
      ? 100
      : Math.round((totalLinkedChunks / MIN_LINKED_CHUNKS) * 100);
  const pipelineScore =
    p5.totalChunks >= 2700 && p7.lanesAtBar >= 8 ? 100 : Math.round(((p5.totalChunks >= 2700 ? 50 : 0) + (p7.lanesAtBar >= 8 ? 50 : 0)));
  const wireChecks = [fieldBookReady, canonReady, canonHubBound, canonStats.bindingCount >= MIN_CANON_BINDINGS];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((waveScore + chunkScore + pipelineScore + wireScore) / 4));

  return {
    waveTotal: waves.total,
    wavesAtBar: waves.atBar,
    totalLinkedChunks,
    p5TotalChunks: p5.totalChunks,
    p7LanesAtBar: p7.lanesAtBar,
    canonBindingCount: canonStats.bindingCount,
    promotionPipelineReady:
      p5.totalChunks >= 2700 &&
      p7.lanesAtBar >= 8 &&
      waves.atBar >= MIN_AT_BAR &&
      canonStats.bindingCount >= MIN_CANON_BINDINGS,
    fieldBookReady,
    canonReady,
    canonHubBound,
    strategyMigrationRoutes: migrationRoutes.length,
    overallPct,
  };
}

export type Phase11P8UpgradePassReport = {
  passId: "phase-11-p8-field-book-promotion-execution";
  title: "Step 11 P8 — Field Book promotion execution";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase11P8Progress;
};

export function computePhase11P8UpgradePass(): Phase11P8UpgradePassReport {
  const progress = computePhase11P8Progress();
  return {
    passId: "phase-11-p8-field-book-promotion-execution",
    title: "Step 11 P8 — Field Book promotion execution",
    summary:
      "Eight promotion execution waves complete the P5→P8 canon pipeline — operator execution guides, claims-gated Field Book body merge workflow, and canon closure gate after P6 preview and P7 briefing attach.",
    completionPct: progress.overallPct,
    hubHref: FIELD_BOOK_PROMOTION_EXECUTION_HUB_HREF,
    progress,
  };
}

export function assertPhase11P8Bar(): { ok: boolean; message: string } {
  const p = computePhase11P8Progress();
  const issues: string[] = [];
  if (p.wavesAtBar < MIN_AT_BAR) issues.push(`waves ${p.wavesAtBar}/${MIN_AT_BAR}`);
  if (p.totalLinkedChunks < MIN_LINKED_CHUNKS) {
    issues.push(`linked chunks ${p.totalLinkedChunks}/${MIN_LINKED_CHUNKS}`);
  }
  if (p.p5TotalChunks < 2700) issues.push(`P5 chunks ${p.p5TotalChunks}`);
  if (p.p7LanesAtBar < 8) issues.push(`P7 lanes ${p.p7LanesAtBar}/8`);
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.canonHubBound) issues.push("canon hub");
  if (p.canonBindingCount < MIN_CANON_BINDINGS) {
    issues.push(`canon bindings ${p.canonBindingCount}/${MIN_CANON_BINDINGS}`);
  }
  if (issues.length === 0) return { ok: true, message: "Phase 11 P8 bar met" };
  return { ok: false, message: issues.join("; ") };
}

export {
  FIELD_BOOK_PROMOTION_EXECUTION_HUB_HREF,
  PHASE11_P8_EXECUTION_WAVE_TOTAL,
};
