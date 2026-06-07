/**
 * Phase 11 P5 — Field Book chunk promotion closure.
 */
import {
  countFieldBookChunkPromotionBatchesAtBar,
  FIELD_BOOK_CHUNK_PROMOTION_HUB_HREF,
  fieldBookChunkPromotionBatchHref,
  fieldBookChunkPromotionMeetsPhase11P5Bar,
  getFieldBookChunkPromotionOverlay,
  PHASE11_P5_INTELLIGENCE_GATE_PCT,
  PHASE11_P5_MIN_CHUNK_TOTAL,
  PHASE11_P5_TARGET_CHUNK_TOTAL,
  PROMOTION_BATCH_IDS,
  type PromotionBatchId,
} from "@/lib/intelligence/v4/phase11P5FieldBookChunkPromotionDepth";
import { loadFieldBookChunkPromotionState } from "@/lib/intelligence/v4/fieldBookChunkPromotionState";
import { computePhase11UpgradePassSync } from "@/lib/intelligence/v4/phase11CampaignSystemClosure";
import { computePhase11P1UpgradePass } from "@/lib/intelligence/v4/phase11KellyStrategicPlanClosure";
import { computePhase11P2UpgradePass } from "@/lib/intelligence/v4/phase11P2Closure";
import { computePhase11P3UpgradePass } from "@/lib/intelligence/v4/phase11P3Closure";
import { computePhase11P4UpgradePass } from "@/lib/intelligence/v4/phase11P4Closure";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";

const MIN_BATCHES = 11;
const MIN_AT_BAR = 11;

export type PromotionBatchSurface = {
  batchId: PromotionBatchId;
  label: string;
  href: string;
  chunkCount: number;
  status: string;
  phase11P5Enriched: boolean;
  targetFieldBookSlugs: string[];
};

export type Phase11P5Progress = {
  totalChunks: number;
  targetChunkTotal: number;
  strategicPlanChunks: number;
  campaignSystemChunks: number;
  batchTotal: number;
  batchesAtBar: number;
  phase11StackReadinessPct: number;
  promotionGateOpen: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  migrationRouteBound: boolean;
  strategyMigrationRoutes: number;
  overallPct: number;
};

export function computePhase11StackReadinessPct(): number {
  const passes = [
    computePhase11UpgradePassSync(),
    computePhase11P1UpgradePass(),
    computePhase11P2UpgradePass(),
    computePhase11P3UpgradePass(),
    computePhase11P4UpgradePass(),
  ];
  return Math.round(passes.reduce((s, p) => s + p.completionPct, 0) / passes.length);
}

export function listPromotionBatchSurfaces(): PromotionBatchSurface[] {
  const state = loadFieldBookChunkPromotionState();
  return PROMOTION_BATCH_IDS.map((batchId) => {
    const overlay = getFieldBookChunkPromotionOverlay(batchId);
    const batchState = state?.batches.find((b) => b.batchId === batchId);
    return {
      batchId,
      label: overlay.label,
      href: fieldBookChunkPromotionBatchHref(batchId),
      chunkCount: batchState?.chunkCount ?? 0,
      status: batchState?.status ?? "catalogued",
      phase11P5Enriched: fieldBookChunkPromotionMeetsPhase11P5Bar(overlay),
      targetFieldBookSlugs: overlay.targetFieldBookSlugs,
    };
  });
}

export function computePhase11P5Progress(): Phase11P5Progress {
  const state = loadFieldBookChunkPromotionState();
  const batches = countFieldBookChunkPromotionBatchesAtBar();
  const migrationRoutes = listStrategyMigrationRoutes();
  const phase11StackReadinessPct = computePhase11StackReadinessPct();

  const totalChunks = state?.totalChunks ?? 0;
  const fieldBookReady = Boolean(getFieldBookArticle("field-book-chunk-promotion-command"));
  const canonReady = Boolean(resolveCanonBinding(FIELD_BOOK_CHUNK_PROMOTION_HUB_HREF));
  const migrationRouteBound = migrationRoutes.some((r) => r.intelligenceHref === FIELD_BOOK_CHUNK_PROMOTION_HUB_HREF);

  const batchScore =
    batches.atBar >= MIN_AT_BAR && batches.total >= MIN_BATCHES
      ? 100
      : Math.round((batches.atBar / MIN_AT_BAR) * 100);
  const chunkScore =
    totalChunks >= PHASE11_P5_MIN_CHUNK_TOTAL
      ? 100
      : Math.round((totalChunks / PHASE11_P5_MIN_CHUNK_TOTAL) * 100);
  const gateScore =
    phase11StackReadinessPct >= PHASE11_P5_INTELLIGENCE_GATE_PCT
      ? 100
      : Math.round((phase11StackReadinessPct / PHASE11_P5_INTELLIGENCE_GATE_PCT) * 100);
  const wireChecks = [fieldBookReady, canonReady, migrationRouteBound];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((batchScore + chunkScore + gateScore + wireScore) / 4));

  return {
    totalChunks,
    targetChunkTotal: PHASE11_P5_TARGET_CHUNK_TOTAL,
    strategicPlanChunks: state?.strategicPlanChunks ?? 0,
    campaignSystemChunks: state?.campaignSystemChunks ?? 0,
    batchTotal: batches.total,
    batchesAtBar: batches.atBar,
    phase11StackReadinessPct,
    promotionGateOpen:
      phase11StackReadinessPct >= PHASE11_P5_INTELLIGENCE_GATE_PCT &&
      totalChunks >= PHASE11_P5_MIN_CHUNK_TOTAL &&
      batches.atBar >= MIN_AT_BAR,
    fieldBookReady,
    canonReady,
    migrationRouteBound,
    strategyMigrationRoutes: migrationRoutes.length,
    overallPct,
  };
}

export type Phase11P5UpgradePassReport = {
  passId: "phase-11-p5-field-book-chunk-promotion";
  title: "Step 11 P5 — Field Book chunk promotion";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase11P5Progress;
};

export function computePhase11P5UpgradePass(): Phase11P5UpgradePassReport {
  const progress = computePhase11P5Progress();
  return {
    passId: "phase-11-p5-field-book-chunk-promotion",
    title: "Step 11 P5 — Field Book chunk promotion",
    summary:
      "Strategy manual chunk corpus (~2,795 H2/H3 units) catalogued into eleven promotion batches with P5 operator overlays, claims gates, and canon promotion workflow — gated at ~98% phase-11 stack readiness before Field Book execution.",
    completionPct: progress.overallPct,
    hubHref: FIELD_BOOK_CHUNK_PROMOTION_HUB_HREF,
    progress,
  };
}

export function assertPhase11P5Bar(): { ok: boolean; message: string } {
  const p = computePhase11P5Progress();
  const issues: string[] = [];
  if (p.batchesAtBar < MIN_AT_BAR) issues.push(`batches ${p.batchesAtBar}/${MIN_AT_BAR}`);
  if (p.totalChunks < PHASE11_P5_MIN_CHUNK_TOTAL) {
    issues.push(`chunks ${p.totalChunks}/${PHASE11_P5_MIN_CHUNK_TOTAL}`);
  }
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.migrationRouteBound) issues.push("migration");
  if (issues.length === 0) return { ok: true, message: "Phase 11 P5 bar met" };
  return { ok: false, message: issues.join("; ") };
}

export {
  FIELD_BOOK_CHUNK_PROMOTION_HUB_HREF,
  PHASE11_P5_TARGET_CHUNK_TOTAL,
  PHASE11_P5_MIN_CHUNK_TOTAL,
  PHASE11_P5_INTELLIGENCE_GATE_PCT,
};
