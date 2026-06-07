/**
 * Phase 11 P2 — Debate command philosophy & staff strategy readiness feed.
 */
import { computePhase11P2Progress } from "@/lib/intelligence/v4/phase11P2Closure";
import { computePhase11P3Progress } from "@/lib/intelligence/v4/phase11P3Closure";
import { computePhase11P4Progress } from "@/lib/intelligence/v4/phase11P4Closure";
import { PHILOSOPHY_GRAPH_CLAIMS_HUB_HREF } from "@/lib/intelligence/v4/phase11P4PhilosophyGraphClaimsDepth";
import { computePhase11P5Progress } from "@/lib/intelligence/v4/phase11P5Closure";
import { FIELD_BOOK_CHUNK_PROMOTION_HUB_HREF } from "@/lib/intelligence/v4/phase11P5FieldBookChunkPromotionDepth";
import { computePhase11P6Progress } from "@/lib/intelligence/v4/phase11P6Closure";
import { STRATEGY_ALIGNMENT_CHUNK_PREVIEW_HUB_HREF } from "@/lib/intelligence/v4/phase11P6StrategyAlignmentChunkPreviewDepth";
import { computePhase11P7Progress } from "@/lib/intelligence/v4/phase11P7Closure";
import { BRIEFING_PAPERS_CHUNK_ATTACH_HUB_HREF } from "@/lib/intelligence/v4/phase11P7BriefingPapersChunkAttachDepth";
import { computePhase11P8Progress } from "@/lib/intelligence/v4/phase11P8Closure";
import { FIELD_BOOK_PROMOTION_EXECUTION_HUB_HREF } from "@/lib/intelligence/v4/phase11P8FieldBookPromotionExecutionDepth";
import {
  listPhase11StackCheckpointSurfaces,
  PHASE_11_STACK_CLOSURE_HUB_HREF,
} from "@/lib/intelligence/v4/phase11P9Closure";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { MOVEMENT_PHILOSOPHY_HUB_HREF } from "@/lib/philosophy/movement-philosophy-nav";
import { STAFF_STRATEGY_COMMAND_HUB_HREF } from "@/lib/intelligence/v4/staffStrategyCommandInventory";
import { STRATEGY_DOCTRINE_HUB_HREF } from "@/lib/strategy-doctrine/strategy-doctrine-nav";
import { listStrategyMigrationCoverage } from "@/lib/intelligence/v4/strategyPhilosophyInventory";

export type PhilosophyReadinessRow = {
  id: string;
  label: string;
  score: number;
  status: "ready" | "partial" | "gap";
  detail: string;
  href: string;
};

export type DebateCommandPhilosophyReadinessFeed = {
  overallScore: number;
  rows: PhilosophyReadinessRow[];
  gaps: string[];
  nextModules: Array<{ href: string; label: string }>;
};

function statusFromScore(score: number): "ready" | "partial" | "gap" {
  if (score >= 90) return "ready";
  if (score >= 70) return "partial";
  return "gap";
}

/** Live feed for debate command — movement philosophy wiring + staff strategy surfaces + migration coverage. */
export function computeDebateCommandPhilosophyReadiness(): DebateCommandPhilosophyReadinessFeed {
  const p2 = computePhase11P2Progress();
  const p3 = computePhase11P3Progress();
  const p4 = computePhase11P4Progress();
  const p5 = computePhase11P5Progress();
  const p6 = computePhase11P6Progress();
  const p7 = computePhase11P7Progress();
  const p8 = computePhase11P8Progress();
  const stackCheckpoints = listPhase11StackCheckpointSurfaces();
  const stackPassesAtBar = stackCheckpoints.filter((c) => c.atBar).length;
  const stackCompletionPct = Math.round(
    stackCheckpoints.reduce((s, c) => s + c.completionPct, 0) / Math.max(1, stackCheckpoints.length),
  );
  const stackFieldBookReady = Boolean(getFieldBookArticle("phase-11-stack-closure-command"));
  const stackCanonReady = Boolean(resolveCanonBinding(PHASE_11_STACK_CLOSURE_HUB_HREF));
  const stackExitReady =
    stackPassesAtBar >= 9 &&
    stackCompletionPct >= 90 &&
    p8.promotionPipelineReady &&
    stackFieldBookReady &&
    stackCanonReady;
  const coverage = listStrategyMigrationCoverage();

  const movementScore =
    p2.movementDocTotal > 0 ? Math.round((p2.movementDocsAtBar / p2.movementDocTotal) * 100) : 0;
  const staffScore =
    p2.staffSurfaceTotal > 0 ? Math.round((p2.staffSurfacesAtBar / p2.staffSurfaceTotal) * 100) : 0;
  const doctrineScore =
    p3.artifactTotal > 0 ? Math.round((p3.artifactsAtBar / p3.artifactTotal) * 100) : 0;
  const graphClaimsScore =
    p4.nodeTotal > 0 && p4.philosophyClaimsInLedger >= p4.nodeTotal
      ? Math.round((p4.nodesAtBar / p4.nodeTotal) * 100)
      : Math.round((p4.philosophyClaimsInLedger / Math.max(1, p4.nodeTotal)) * 50);
  const chunkPromotionScore =
    p5.batchTotal > 0
      ? Math.round(
          ((p5.batchesAtBar / p5.batchTotal) * 50 +
            (p5.totalChunks >= 2700 ? 50 : Math.round((p5.totalChunks / 2700) * 50))) /
            1,
        )
      : 0;
  const alignmentPreviewScore =
    p6.laneTotal > 0
      ? Math.round(
          ((p6.lanesAtBar / p6.laneTotal) * 50 +
            (p6.totalMatchingChunks >= 200 ? 50 : Math.round((p6.totalMatchingChunks / 200) * 50))) /
            1,
        )
      : 0;
  const briefingAttachScore =
    p7.laneTotal > 0
      ? Math.round(
          ((p7.lanesAtBar / p7.laneTotal) * 50 +
            (p7.totalAttachableChunks >= 500 ? 50 : Math.round((p7.totalAttachableChunks / 500) * 50))) /
            1,
        )
      : 0;
  const promotionExecutionScore =
    p8.waveTotal > 0
      ? Math.round(
          ((p8.wavesAtBar / p8.waveTotal) * 50 +
            (p8.promotionPipelineReady ? 50 : Math.round((p8.totalLinkedChunks / 2700) * 50))) /
            1,
        )
      : 0;
  const stackClosureScore =
    stackCheckpoints.length > 0
      ? Math.round(
          ((stackPassesAtBar / stackCheckpoints.length) * 50 +
            (stackExitReady ? 50 : Math.round((stackCompletionPct / 90) * 50))) /
            1,
        )
      : 0;
  const migrationScore =
    coverage.unboundHrefs.length === 0
      ? 100
      : Math.max(0, 100 - coverage.unboundHrefs.length * 20);
  const canonScore = Math.round(
    ((p2.movementCanonReady ? 1 : 0) +
      (p2.staffCanonReady ? 1 : 0) +
      (p2.fieldBookMovementReady ? 1 : 0) +
      (p2.fieldBookStaffReady ? 1 : 0) +
      (p3.fieldBookReady ? 1 : 0) +
      (p3.canonReady ? 1 : 0) +
      (p4.fieldBookReady ? 1 : 0) +
      (p4.canonReady ? 1 : 0) +
      (p5.fieldBookReady ? 1 : 0) +
      (p5.canonReady ? 1 : 0) +
      (p6.fieldBookReady ? 1 : 0) +
      (p6.canonReady ? 1 : 0) +
      (p7.fieldBookReady ? 1 : 0) +
      (p7.canonReady ? 1 : 0) +
      (p8.fieldBookReady ? 1 : 0) +
      (p8.canonReady ? 1 : 0) +
      (stackFieldBookReady ? 1 : 0) +
      (stackCanonReady ? 1 : 0)) *
      (100 / 18),
  );

  const rows: PhilosophyReadinessRow[] = [
    {
      id: "movement-philosophy",
      label: "Movement philosophy corpus",
      score: movementScore,
      status: statusFromScore(movementScore),
      detail: `${p2.movementDocsAtBar}/${p2.movementDocTotal} docs at P2 bar — docs/philosophy + VOL-CORE-1`,
      href: MOVEMENT_PHILOSOPHY_HUB_HREF,
    },
    {
      id: "staff-strategy",
      label: "Staff strategy command",
      score: staffScore,
      status: statusFromScore(staffScore),
      detail: `${p2.staffSurfacesAtBar}/${p2.staffSurfaceTotal} surfaces enriched — morning brief through scenario simulation`,
      href: STAFF_STRATEGY_COMMAND_HUB_HREF,
    },
    {
      id: "strategy-doctrine",
      label: "Strategy doctrine JSON (SDI-1)",
      score: doctrineScore,
      status: statusFromScore(doctrineScore),
      detail: `${p3.artifactsAtBar}/${p3.artifactTotal} JSON artifacts · ${p3.registryDoctrineCount} registry entries`,
      href: STRATEGY_DOCTRINE_HUB_HREF,
    },
    {
      id: "philosophy-graph-claims",
      label: "Philosophy graph claims (NSI-4)",
      score: graphClaimsScore,
      status: statusFromScore(graphClaimsScore),
      detail: `${p4.nodesAtBar}/${p4.nodeTotal} nodes · ${p4.philosophyClaimsInLedger} ledger claims · ${p4.claimsApprovedInternal} approved internal`,
      href: PHILOSOPHY_GRAPH_CLAIMS_HUB_HREF,
    },
    {
      id: "field-book-chunk-promotion",
      label: "Field Book chunk promotion (P5)",
      score: chunkPromotionScore,
      status: statusFromScore(chunkPromotionScore),
      detail: `${p5.totalChunks.toLocaleString()} chunks · ${p5.batchesAtBar}/${p5.batchTotal} batches · gate ${p5.promotionGateOpen ? "open" : "locked"}`,
      href: FIELD_BOOK_CHUNK_PROMOTION_HUB_HREF,
    },
    {
      id: "strategy-alignment-chunk-preview",
      label: "Alignment chunk preview (P6)",
      score: alignmentPreviewScore,
      status: statusFromScore(alignmentPreviewScore),
      detail: `${p6.lanesAtBar}/${p6.laneTotal} preview lanes · ${p6.totalMatchingChunks.toLocaleString()} matching chunks`,
      href: STRATEGY_ALIGNMENT_CHUNK_PREVIEW_HUB_HREF,
    },
    {
      id: "briefing-papers-chunk-attach",
      label: "Briefing papers chunk attach (P7)",
      score: briefingAttachScore,
      status: statusFromScore(briefingAttachScore),
      detail: `${p7.lanesAtBar}/${p7.laneTotal} attach lanes · ${p7.totalAttachableChunks.toLocaleString()} attachable chunks`,
      href: BRIEFING_PAPERS_CHUNK_ATTACH_HUB_HREF,
    },
    {
      id: "field-book-promotion-execution",
      label: "Field Book promotion execution (P8)",
      score: promotionExecutionScore,
      status: statusFromScore(promotionExecutionScore),
      detail: `${p8.wavesAtBar}/${p8.waveTotal} waves · pipeline ${p8.promotionPipelineReady ? "ready" : "partial"} · ${p8.canonBindingCount} canon`,
      href: FIELD_BOOK_PROMOTION_EXECUTION_HUB_HREF,
    },
    {
      id: "phase-11-stack-closure",
      label: "Phase 11 stack closure (P9)",
      score: stackClosureScore,
      status: statusFromScore(stackClosureScore),
      detail: `${stackPassesAtBar}/${stackCheckpoints.length} sub-passes · stack ${stackCompletionPct}% · exit ${stackExitReady ? "ready" : "open"}`,
      href: PHASE_11_STACK_CLOSURE_HUB_HREF,
    },
    {
      id: "migration-bridge",
      label: "Strategy migration bridge",
      score: migrationScore,
      status: statusFromScore(migrationScore),
      detail:
        coverage.unboundHrefs.length === 0
          ? `${p2.strategyMigrationRoutes} routes bound`
          : `${coverage.unboundHrefs.length} key hrefs unbound: ${coverage.unboundHrefs.slice(0, 2).join(", ")}`,
      href: "/admin/intelligence/strategy-philosophy-hub",
    },
    {
      id: "canon-field-book",
      label: "Canon + Field Book wiring",
      score: canonScore,
      status: statusFromScore(canonScore),
      detail: `Movement ${p2.movementCanonReady ? "bound" : "open"} · Staff ${p2.staffCanonReady ? "bound" : "open"}`,
      href: "/admin/intelligence/field-book/canon",
    },
  ];

  const overallScore = Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length);

  const gaps: string[] = [];
  if (movementScore < 100) gaps.push("Complete movement philosophy doc overlays");
  if (staffScore < 100) gaps.push("Enrich remaining staff strategy surfaces");
  if (doctrineScore < 100) gaps.push("Complete strategy doctrine JSON artifact overlays");
  if (graphClaimsScore < 100) gaps.push("Clear philosophy graph NEEDS_REVIEW claims before stage");
  if (chunkPromotionScore < 100) gaps.push("Catalogue remaining Field Book chunk promotion batches");
  if (alignmentPreviewScore < 100) gaps.push("Complete strategy alignment chunk preview lanes");
  if (briefingAttachScore < 100) gaps.push("Wire briefing papers chunk attach lanes");
  if (promotionExecutionScore < 100) gaps.push("Complete Field Book promotion execution waves");
  if (stackClosureScore < 100) gaps.push("Complete Phase 11 stack closure — all P0–P8 sub-passes at bar");
  if (coverage.unboundHrefs.length > 0) {
    gaps.push(`Bind migration bridge: ${coverage.unboundHrefs.join(", ")}`);
  }
  if (canonScore < 100) gaps.push("Finish Field Book + canon bindings (P2/P3)");
  const nextModules: Array<{ href: string; label: string }> = [];
  if (movementScore < 100) nextModules.push({ href: MOVEMENT_PHILOSOPHY_HUB_HREF, label: "Movement philosophy hub" });
  if (staffScore < 100) nextModules.push({ href: STAFF_STRATEGY_COMMAND_HUB_HREF, label: "Staff strategy command" });
  if (doctrineScore < 100) nextModules.push({ href: STRATEGY_DOCTRINE_HUB_HREF, label: "Strategy doctrine hub" });
  if (graphClaimsScore < 100) nextModules.push({ href: PHILOSOPHY_GRAPH_CLAIMS_HUB_HREF, label: "Philosophy claims hub" });
  if (chunkPromotionScore < 100) {
    nextModules.push({ href: FIELD_BOOK_CHUNK_PROMOTION_HUB_HREF, label: "Chunk promotion hub" });
  }
  if (alignmentPreviewScore < 100) {
    nextModules.push({ href: STRATEGY_ALIGNMENT_CHUNK_PREVIEW_HUB_HREF, label: "Alignment chunk preview" });
  }
  if (briefingAttachScore < 100) {
    nextModules.push({ href: BRIEFING_PAPERS_CHUNK_ATTACH_HUB_HREF, label: "Briefing chunk attach" });
  }
  if (promotionExecutionScore < 100) {
    nextModules.push({ href: FIELD_BOOK_PROMOTION_EXECUTION_HUB_HREF, label: "Promotion execution" });
  }
  if (stackClosureScore < 100) {
    nextModules.push({ href: PHASE_11_STACK_CLOSURE_HUB_HREF, label: "Stack closure hub" });
  }
  if (coverage.unboundHrefs.length > 0) {
    nextModules.push({ href: coverage.unboundHrefs[0]!, label: "Unbound strategy surface" });
  }
  nextModules.push({ href: "/admin/intelligence/phase-11-p9-upgrade", label: "Phase 11 P9 pass" });

  return {
    overallScore,
    rows,
    gaps: gaps.slice(0, 4),
    nextModules: nextModules.slice(0, 4),
  };
}
