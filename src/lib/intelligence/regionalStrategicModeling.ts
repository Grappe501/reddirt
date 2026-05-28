import { buildAggregateCampaignIntelligenceIndex } from "@/lib/intelligence/aggregateCampaignIntelligence";
import { listCountyClusterGroups, reconcileCountyOverlayWithWorkbench } from "@/lib/intelligence/countyWorkbenchSynchronization";
import { loadCountyBriefingIntelligenceIndex, resolveCountyBriefingIntelligence } from "@/lib/intelligence/countyBriefingIntelligence";
import type {
  CountyOperationalSignal,
  RegionalNarrativeCluster,
} from "@/lib/intelligence/types/aggregateCampaignIntelligence";
import { loadKimHammerGeographicNarrativeOverlays } from "@/lib/opposition/kimHammerGeographicNarrativeState";

const CLUSTER_TITLES: Record<string, string> = {
  "cluster-nw-growth": "Northwest Growth Counties",
  "cluster-central-urban": "Central Urban Anchor",
  "cluster-west-rural": "Western River Valley",
  "cluster-ne-rural": "Northeast Arkansas",
  "cluster-statewide": "Statewide Baseline",
};

export function resolveRegionalNarrativeClusters(
  repoRoot: string = process.cwd(),
): RegionalNarrativeCluster[] {
  const aggregate = buildAggregateCampaignIntelligenceIndex(
    loadCountyBriefingIntelligenceIndex(repoRoot).counties,
    repoRoot,
  );
  const envByCounty = new Map(aggregate.countyEnvironments.map((row) => [row.countyId, row]));

  return listCountyClusterGroups().map(({ clusterId, countyIds }) => {
    const sharedThemes: string[] = [];
    const signals: CountyOperationalSignal[] = [];

    for (const countyId of countyIds) {
      const sync = reconcileCountyOverlayWithWorkbench(countyId, repoRoot);
      sharedThemes.push(...sync.operationalBurdenThemes.slice(0, 2));
      const env = envByCounty.get(countyId);
      for (const row of env?.operationalSignals ?? []) signals.push(row.signal);
    }

    const dominantOperationalSignal: RegionalNarrativeCluster["dominantOperationalSignal"] =
      signals.includes("COUNTY_STRUCTURALLY_COMPLEX")
        ? "COUNTY_STRUCTURALLY_COMPLEX"
        : signals.includes("COUNTY_HIGH_OPPORTUNITY")
          ? "COUNTY_HIGH_OPPORTUNITY"
          : signals.includes("COUNTY_MEDIA_SATURATED")
            ? "COUNTY_MEDIA_SATURATED"
            : signals.length > 0
              ? signals[0]
              : "MIXED";

    return {
      clusterId,
      title: CLUSTER_TITLES[clusterId] ?? clusterId,
      countyIds,
      sharedThemes: [...new Set(sharedThemes)].slice(0, 4),
      dominantOperationalSignal,
      deploymentSummary: `${CLUSTER_TITLES[clusterId] ?? clusterId}: ${countyIds.length} county(ies) — dominant signal ${dominantOperationalSignal.replaceAll("_", " ")}.`,
    };
  });
}

export function computeRegionalStrategicSimilarity(
  countyIdA: string,
  countyIdB: string,
  repoRoot: string = process.cwd(),
): {
  score: number;
  sharedThemes: string[];
  sharedSignals: string[];
} {
  const a = reconcileCountyOverlayWithWorkbench(countyIdA, repoRoot);
  const b = reconcileCountyOverlayWithWorkbench(countyIdB, repoRoot);
  const briefingA = resolveCountyBriefingIntelligence(countyIdA, repoRoot);
  const briefingB = resolveCountyBriefingIntelligence(countyIdB, repoRoot);

  const sharedThemes = a.operationalBurdenThemes.filter((theme) =>
    b.operationalBurdenThemes.includes(theme),
  );
  const sharedSignals = (briefingA?.briefingSignals ?? [])
    .map((row) => row.signal)
    .filter((signal) => briefingB?.briefingSignals.some((row) => row.signal === signal));

  let score = 0.3;
  if (a.countyClusterId && a.countyClusterId === b.countyClusterId) score += 0.25;
  if (a.mediaRegionGroup && a.mediaRegionGroup === b.mediaRegionGroup) score += 0.15;
  score += Math.min(0.3, sharedThemes.length * 0.1);
  score += Math.min(0.2, sharedSignals.length * 0.05);

  return {
    score: Number(Math.min(1, score).toFixed(2)),
    sharedThemes,
    sharedSignals,
  };
}

export function computeCountyClusterReadiness(
  countyId: string,
  repoRoot: string = process.cwd(),
): {
  clusterId: string | null;
  readinessLabel: "READY" | "CAUTION" | "BLOCKED";
  summary: string;
} {
  const sync = reconcileCountyOverlayWithWorkbench(countyId, repoRoot);
  const briefing = resolveCountyBriefingIntelligence(countyId, repoRoot);
  const aggregate = buildAggregateCampaignIntelligenceIndex(
    loadCountyBriefingIntelligenceIndex(repoRoot).counties,
    repoRoot,
  ).countyEnvironments.find(
    (row) => row.countyId === countyId,
  );

  if (!briefing) {
    return { clusterId: sync.countyClusterId, readinessLabel: "BLOCKED", summary: "County briefing unavailable." };
  }

  if (briefing.confidenceBand === "BLOCKED" || aggregate?.operationalSignals.some((row) => row.signal === "COUNTY_STRUCTURALLY_COMPLEX")) {
    return {
      clusterId: sync.countyClusterId,
      readinessLabel: "CAUTION",
      summary: "Cluster deployment requires citation verification and media-risk discipline.",
    };
  }

  if (briefing.confidenceBand === "STRONG" && aggregate?.operationalSignals.some((row) => row.signal === "COUNTY_HIGH_OPPORTUNITY")) {
    return {
      clusterId: sync.countyClusterId,
      readinessLabel: "READY",
      summary: "Cluster conditions favor doctrine-aligned aggregate deployment with field support.",
    };
  }

  return {
    clusterId: sync.countyClusterId,
    readinessLabel: "CAUTION",
    summary: "Mixed cluster readiness — use regional model for framing, not autonomous deployment.",
  };
}

export function summarizeRegionalDeploymentConditions(
  repoRoot: string = process.cwd(),
): {
  clusterCount: number;
  clusters: RegionalNarrativeCluster[];
  highOpportunityCounties: string[];
  cautionCounties: string[];
} {
  const clusters = resolveRegionalNarrativeClusters(repoRoot);
  const overlays = loadKimHammerGeographicNarrativeOverlays(repoRoot);
  const highOpportunityCounties: string[] = [];
  const cautionCounties: string[] = [];

  for (const overlay of overlays.overlays) {
    const readiness = computeCountyClusterReadiness(overlay.countyId, repoRoot);
    if (readiness.readinessLabel === "READY") highOpportunityCounties.push(overlay.countyId);
    if (readiness.readinessLabel === "CAUTION" || readiness.readinessLabel === "BLOCKED") {
      cautionCounties.push(overlay.countyId);
    }
  }

  return {
    clusterCount: clusters.length,
    clusters,
    highOpportunityCounties,
    cautionCounties,
  };
}
