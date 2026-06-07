/**
 * Phase 11 P4 — Philosophy graph claims review closure.
 */
import { loadCampaignPhilosophyGraph } from "@/lib/intelligence/campaignIntelligenceGraph";
import {
  countPhilosophyGraphNodesAtPhase11P4Bar,
  getPhilosophyGraphClaimsOverlay,
  philosophyGraphClaimsMeetsPhase11P4Bar,
  PHILOSOPHY_GRAPH_CLAIMS_HUB_HREF,
  philosophyGraphNodeHref,
  PHASE11_P4_PHILOSOPHY_GRAPH_NODE_TOTAL,
} from "@/lib/intelligence/v4/phase11P4PhilosophyGraphClaimsDepth";
import { listPhilosophyGraphClaims } from "@/lib/intelligence/claims/philosophyGraphClaimsSeed";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";

const MIN_NODES = 8;
const MIN_AT_BAR = 8;
const MIN_PHILOSOPHY_CLAIMS = 8;

export type PhilosophyGraphNodeSurface = {
  philosophyId: string;
  title: string;
  href: string;
  reviewStatus: string;
  phase11P4Enriched: boolean;
  claimId: string;
};

export type Phase11P4Progress = {
  nodeTotal: number;
  nodesAtBar: number;
  philosophyClaimsInLedger: number;
  claimsApprovedInternal: number;
  fieldBookReady: boolean;
  canonReady: boolean;
  migrationRouteBound: boolean;
  strategyMigrationRoutes: number;
  overallPct: number;
};

export function listPhilosophyGraphNodeSurfaces(): PhilosophyGraphNodeSurface[] {
  const graph = loadCampaignPhilosophyGraph();
  return graph.nodes.map((n) => {
    const overlay = getPhilosophyGraphClaimsOverlay(n.philosophyId);
    return {
      philosophyId: n.philosophyId,
      title: n.title,
      href: philosophyGraphNodeHref(n.philosophyId),
      reviewStatus: n.reviewStatus,
      phase11P4Enriched: philosophyGraphClaimsMeetsPhase11P4Bar(overlay),
      claimId: overlay.linkedClaimId,
    };
  });
}

export function computePhase11P4Progress(): Phase11P4Progress {
  const nodes = countPhilosophyGraphNodesAtPhase11P4Bar();
  const claims = listPhilosophyGraphClaims();
  const migrationRoutes = listStrategyMigrationRoutes();

  const fieldBookReady = Boolean(getFieldBookArticle("philosophy-graph-claims-command"));
  const canonReady = Boolean(resolveCanonBinding(PHILOSOPHY_GRAPH_CLAIMS_HUB_HREF));
  const migrationRouteBound = migrationRoutes.some((r) => r.intelligenceHref === PHILOSOPHY_GRAPH_CLAIMS_HUB_HREF);

  const nodeScore =
    nodes.atBar >= MIN_AT_BAR && nodes.total >= MIN_NODES ? 100 : Math.round((nodes.atBar / MIN_AT_BAR) * 100);
  const claimScore =
    claims.length >= MIN_PHILOSOPHY_CLAIMS ? 100 : Math.round((claims.length / MIN_PHILOSOPHY_CLAIMS) * 100);
  const wireChecks = [fieldBookReady, canonReady, migrationRouteBound];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((nodeScore + claimScore + wireScore) / 3));

  return {
    nodeTotal: nodes.total,
    nodesAtBar: nodes.atBar,
    philosophyClaimsInLedger: claims.length,
    claimsApprovedInternal: claims.filter((c) => c.verificationStatus === "HUMAN_APPROVED_INTERNAL").length,
    fieldBookReady,
    canonReady,
    migrationRouteBound,
    strategyMigrationRoutes: migrationRoutes.length,
    overallPct,
  };
}

export type Phase11P4UpgradePassReport = {
  passId: "phase-11-p4-philosophy-graph-claims";
  title: "Step 11 P4 — Philosophy graph claims review";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase11P4Progress;
};

export function computePhase11P4UpgradePass(): Phase11P4UpgradePassReport {
  const progress = computePhase11P4Progress();
  return {
    passId: "phase-11-p4-philosophy-graph-claims",
    title: "Step 11 P4 — Philosophy graph claims review",
    summary:
      "Eight NSI-4 philosophy graph nodes wired to governed claim ledger with P4 review overlays — stage-safe wording, do-not-say lines, operator workflow, and claim-review API integration on every node.",
    completionPct: progress.overallPct,
    hubHref: PHILOSOPHY_GRAPH_CLAIMS_HUB_HREF,
    progress,
  };
}

export function assertPhase11P4Bar(): { ok: boolean; message: string } {
  const p = computePhase11P4Progress();
  const issues: string[] = [];
  if (p.nodesAtBar < MIN_AT_BAR) issues.push(`nodes ${p.nodesAtBar}/${MIN_AT_BAR}`);
  if (p.philosophyClaimsInLedger < MIN_PHILOSOPHY_CLAIMS) {
    issues.push(`claims ${p.philosophyClaimsInLedger}/${MIN_PHILOSOPHY_CLAIMS}`);
  }
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.migrationRouteBound) issues.push("migration");
  if (issues.length === 0) return { ok: true, message: "Phase 11 P4 bar met" };
  return { ok: false, message: issues.join("; ") };
}

export { PHILOSOPHY_GRAPH_CLAIMS_HUB_HREF, PHASE11_P4_PHILOSOPHY_GRAPH_NODE_TOTAL };
