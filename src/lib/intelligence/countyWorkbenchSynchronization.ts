import { getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";
import { isCountyWorkbenchBridgeAvailable } from "@/lib/agents/county-intelligence/county-workbench-path";
import { listCountyWorkbenchCounties } from "@/lib/agents/county-intelligence/county-workbench-adapter";
import { loadKimHammerGeographicNarrativeOverlays } from "@/lib/opposition/kimHammerGeographicNarrativeState";
import { COUNTY_REGIONS } from "@/lib/intelligence/types/countyBriefingIntelligence";
import { resolveNarrativeDoctrineAlignment } from "@/lib/intelligence/campaignStrategicAlignment";

export type CampaignCountyIdentity = {
  countyId: string;
  registrySlug: string;
  workbenchSlug: string;
  fieldOpsName: string;
  displayName: string;
  fips: string | null;
  regionId: string | null;
};

export type CountyWorkbenchSyncRecord = {
  countyId: string;
  countyName: string;
  identity: CampaignCountyIdentity;
  overlayReconciled: boolean;
  workbenchConnected: boolean;
  workbenchDepth: string | null;
  doctrineLinks: string[];
  mediaRegionGroup: string | null;
  countyClusterId: string | null;
  operationalBurdenThemes: string[];
  syncNotes: string[];
};

const MEDIA_REGION_GROUPS: Record<string, string> = {
  pulaski: "central-arkansas-media",
  washington: "northwest-arkansas-media",
  benton: "northwest-arkansas-media",
  sebastian: "river-valley-media",
  craighead: "northeast-arkansas-media",
  statewide: "statewide-media",
};

const COUNTY_CLUSTERS: Record<string, string[]> = {
  "cluster-nw-growth": ["washington", "benton"],
  "cluster-central-urban": ["pulaski"],
  "cluster-west-rural": ["sebastian"],
  "cluster-ne-rural": ["craighead"],
  "cluster-statewide": ["statewide"],
};

export function resolveCampaignCountyIdentity(countyId: string): CampaignCountyIdentity {
  if (countyId === "statewide") {
    return {
      countyId,
      registrySlug: "statewide",
      workbenchSlug: "statewide",
      fieldOpsName: "Statewide",
      displayName: "Statewide",
      fips: null,
      regionId: null,
    };
  }

  const registrySlug = `${countyId}-county`;
  const registry = getRegistryCountyBySlug(registrySlug);
  const fieldOpsName = countyId.charAt(0).toUpperCase() + countyId.slice(1);

  return {
    countyId,
    registrySlug,
    workbenchSlug: countyId,
    fieldOpsName,
    displayName: registry?.displayName ?? `${fieldOpsName} County`,
    fips: registry?.fips ?? null,
    regionId: registry?.regionId ?? null,
  };
}

export function resolveCountyClusterId(countyId: string): string | null {
  for (const [clusterId, members] of Object.entries(COUNTY_CLUSTERS)) {
    if (members.includes(countyId)) return clusterId;
  }
  return null;
}

export function listCountyClusterGroups(): Array<{ clusterId: string; countyIds: string[] }> {
  return Object.entries(COUNTY_CLUSTERS).map(([clusterId, countyIds]) => ({ clusterId, countyIds }));
}

export function reconcileCountyOverlayWithWorkbench(
  countyId: string,
  repoRoot: string = process.cwd(),
): CountyWorkbenchSyncRecord {
  const identity = resolveCampaignCountyIdentity(countyId);
  const overlays = loadKimHammerGeographicNarrativeOverlays(repoRoot);
  const overlay = overlays.overlays.find((row) => row.countyId === countyId);

  const workbenchAvailable = isCountyWorkbenchBridgeAvailable();
  let workbenchConnected = false;
  let workbenchDepth: string | null = null;

  if (workbenchAvailable && countyId !== "statewide") {
    const counties = listCountyWorkbenchCounties();
    const match = counties.find(
      (row) =>
        row.countySlug === identity.workbenchSlug ||
        row.countySlug === identity.registrySlug ||
        row.countyName.toLowerCase().includes(identity.fieldOpsName.toLowerCase()),
    );
    if (match) {
      workbenchConnected = true;
      workbenchDepth = match.workbenchDepth ?? "unknown";
    }
  }

  const doctrineLinks: string[] = [];
  for (const narrativeId of overlay?.narrativeIds ?? []) {
    const alignment = resolveNarrativeDoctrineAlignment(narrativeId, repoRoot);
    if (alignment) doctrineLinks.push(...alignment.matchedDoctrineIds);
  }

  const syncNotes: string[] = [];
  if (!overlay) syncNotes.push("NSI-2 geographic overlay missing — county briefing uses fallback identity only.");
  if (!workbenchAvailable) syncNotes.push("CountyWorkbench bridge unavailable — filesystem read adapter skipped.");
  else if (!workbenchConnected && countyId !== "statewide") {
    syncNotes.push(`CountyWorkbench has no matched row for ${identity.workbenchSlug}.`);
  }
  if (overlay?.unresolvedDependencies.some((dep) => dep.includes("BLOCKED") || dep.includes("NEEDS_REVIEW"))) {
    syncNotes.push("Overlay unresolved dependencies require reconciliation before heavy local deployment.");
  }

  return {
    countyId,
    countyName: identity.displayName,
    identity,
    overlayReconciled: Boolean(overlay),
    workbenchConnected,
    workbenchDepth,
    doctrineLinks: [...new Set(doctrineLinks)],
    mediaRegionGroup: MEDIA_REGION_GROUPS[countyId] ?? null,
    countyClusterId: resolveCountyClusterId(countyId),
    operationalBurdenThemes: overlay?.countyBurdenSignals ?? [],
    syncNotes,
  };
}

export function summarizeCountyWorkbenchSynchronization(
  repoRoot: string = process.cwd(),
): {
  bridgeAvailable: boolean;
  countyCount: number;
  connectedCount: number;
  records: CountyWorkbenchSyncRecord[];
} {
  const overlays = loadKimHammerGeographicNarrativeOverlays(repoRoot);
  const records = overlays.overlays.map((overlay) =>
    reconcileCountyOverlayWithWorkbench(overlay.countyId, repoRoot),
  );

  return {
    bridgeAvailable: isCountyWorkbenchBridgeAvailable(),
    countyCount: records.length,
    connectedCount: records.filter((row) => row.workbenchConnected).length,
    records,
  };
}

export function normalizeCountyIdFromSlug(input: string): string {
  if (input === "statewide") return "statewide";
  if (COUNTY_REGIONS[input]) return input;
  return input.replace(/-county$/i, "").toLowerCase();
}
