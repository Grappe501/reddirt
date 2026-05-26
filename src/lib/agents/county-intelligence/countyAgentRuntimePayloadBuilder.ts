import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import {
  loadCountyAgentRuntimeContext,
  type CountyAgentRuntimeContext,
} from "./countyAgentRuntimeContext";
import { buildCountyInstitutionalMemoryBrief } from "./countyMemoryBriefBuilder";
import { resourceAllocationBriefBuilder } from "./resourceAllocationBriefBuilder";
import { publicNarrativeBriefBuilder } from "./publicNarrativeBriefBuilder";

type CountySummaryBrief = {
  countySlug?: string;
  [key: string]: unknown;
};

type CountyWinPathwayInputs = {
  countySlug: string;
  dataConfidence?: number;
  [key: string]: unknown;
};

type StrategyReadiness = {
  countySlug: string;
  countyName: string;
  fips: string;
  turnoutRegistrationFacts: "PRESENT" | "MISSING";
  strategySafeToGenerate: "YES" | "NO";
  strategyBlockedReasons: string[];
};

export type RuntimeCountyPayload = {
  countySlug: string;
  countyName: string;
  fips: string;
  countyIdentity: {
    countySlug: string;
    countyName: string;
    fips: string;
  };
  readinessStatus: {
    strategyReadiness: "YES" | "NO";
    voterFileReadiness: "PRESENT" | "MISSING";
    civicConfidenceScore: number | null;
    mapReady: boolean;
    briefAvailable: boolean;
  };
  strategyGate: {
    allowed: boolean;
    status: "YES" | "NO";
    blockedReasons: string[];
  };
  voterWarehouseBlockerStatus: {
    blocked: boolean;
    blockerCount: number;
    topBlockers: string[];
  };
  registrationSnapshotOpsStatus: {
    templateExists: boolean;
    allCountiesPresent: boolean;
    importFlowConfigured: boolean;
    status: "READY" | "BLOCKED";
  };
  winPathwayReadiness: {
    hasInputs: boolean;
    computationReady: boolean;
    blockers: string[];
    strategySafeToGenerate: "YES" | "NO";
  };
  landingPageReadiness: {
    enabledSections: string[];
    blockedSections: string[];
  };
  allowedTools: string[];
  forbiddenActions: string[];
  nextBestDataActions: string[];
  institutionalMemory: {
    status: "PRESENT" | "NEEDS_REVIEW" | "MISSING";
    confidenceScore: number | null;
    memoryGaps: string[];
    nextSafeDataActions: string[];
  };
  resourceOperations: {
    operationalHealth: number;
    resourcePressure: number;
    volunteerCapacity: number;
    travelBurden: number;
    staffingGaps: number;
    eventROISummary: string;
    interventionUrgencyScore: number;
    operationalConfidenceScore: number;
  };
  publicNarrative: {
    topPublicIssues: string[];
    issueVolatility: number;
    narrativeConfidenceScore: number;
    messagingReadinessStatus: "PRESENT" | "MISSING" | "LOW_CONFIDENCE";
    earnedMediaOpportunities: string[];
  };
};

export type CountyAgentRuntimePayload = {
  generatedAt: string;
  version: "4L.1";
  meta: {
    countyCount: number;
    briefAvailableCount: number;
    winPathwayReadyCount: number;
    voterMetricsReadyCount: number;
    mapReadyCount: number;
    strategyGateYesCount: number;
    automationGateYesCount: number;
  };
  countyPayloads: RuntimeCountyPayload[];
  statewideDashboard: {
    rows: Array<{
      countySlug: string;
      countyName: string;
      briefAvailable: boolean;
      winPathwayReady: boolean;
      voterMetricsReady: boolean;
      mapReady: boolean;
      strategyGate: "YES" | "NO";
      automationGate: "YES" | "NO";
      institutionalMemory: "PRESENT" | "NEEDS_REVIEW" | "MISSING";
    }>;
  };
};

function countySlugFromWorkbenchSlug(slug: string): string {
  return slug.endsWith("-county") ? slug : `${slug}-county`;
}

function getFromRowsBySlug<T extends { countySlug?: string; workbenchSlug?: string; fips5?: string }>(
  rows: T[],
  countySlug: string,
  fips: string,
): T | undefined {
  return rows.find(
    (r) =>
      r.countySlug === countySlug ||
      countySlugFromWorkbenchSlug(String(r.workbenchSlug ?? "")) === countySlug ||
      String(r.fips5 ?? "") === fips,
  );
}

function extractWinInputs(ctx: CountyAgentRuntimeContext, countySlug: string): CountyWinPathwayInputs | null {
  const counties = (ctx.countyWinPathwayInputs.counties as unknown[] | undefined) ?? [];
  const row = counties.find((c) => String((c as { countySlug?: string }).countySlug ?? "") === countySlug);
  if (!row) return null;
  return row as CountyWinPathwayInputs;
}

function computeCountyWinPathwayFallback(
  inputs: CountyWinPathwayInputs | null,
): { blockers: string[]; strategySafeToGenerate: "YES" | "NO" } | null {
  if (!inputs) return null;
  const confidence = Number(inputs.dataConfidence ?? 0);
  if (confidence >= 70) {
    return { blockers: [], strategySafeToGenerate: "YES" };
  }
  return {
    blockers: ["data confidence below readiness threshold (fallback computation)"],
    strategySafeToGenerate: "NO",
  };
}

async function loadBrief(
  countySlug: string,
  cachedPope: CountySummaryBrief | null,
): Promise<CountySummaryBrief | null> {
  if (countySlug === "pope-county" && cachedPope) return cachedPope;
  return null;
}

function buildCountyPayload(
  ctx: CountyAgentRuntimeContext,
  county: { slug: string; displayName: string; fips: string },
  strategy: StrategyReadiness | undefined,
  brief: CountySummaryBrief | null,
): RuntimeCountyPayload {
  const voterFileRow = getFromRowsBySlug(ctx.voterFileReadinessRows, county.slug, county.fips);
  const civicRow = getFromRowsBySlug(ctx.civicReadinessRows, county.slug, county.fips);
  const mapRow = getFromRowsBySlug(ctx.mapReadinessRows, county.slug, county.fips);

  const voterWarehouseBlocked = Boolean(ctx.voterWarehouseSchemaReadiness.blocked);
  const voterWarehouseBlockers = (ctx.voterWarehouseSchemaReadiness.blockers as string[] | undefined) ?? [];
  const winInputs = extractWinInputs(ctx, county.slug);
  const win = computeCountyWinPathwayFallback(winInputs);

  const strategyStatus = strategy?.strategySafeToGenerate ?? "NO";
  const strategyBlockedReasons = strategy?.strategyBlockedReasons ?? ["strategy readiness row missing"];

  const mapReady = mapRow?.heatMapEligible === "YES";
  const voterMetricsReady = strategy?.turnoutRegistrationFacts === "PRESENT";
  const briefAvailable = brief != null;
  const winReady = win != null && win.blockers.length === 0;

  const enabledSections: string[] = [];
  const blockedSections: string[] = [];

  if (briefAvailable) enabledSections.push("County Summary Brief");
  else blockedSections.push("County Summary Brief");

  if (winReady) enabledSections.push("Win pathway");
  else blockedSections.push("Win pathway");

  if (voterMetricsReady) enabledSections.push("Voter metrics");
  else blockedSections.push("Voter metrics");

  if (mapReady) enabledSections.push("Map readiness");
  else blockedSections.push("Map readiness");

  if (strategyStatus === "YES") enabledSections.push("Strategy gate");
  else blockedSections.push("Strategy gate");

  const toolGroups = (ctx.countyIntelligenceOrchestration.toolGroups as Record<string, unknown>) ?? {};
  const allowedTools = Object.values(toolGroups)
    .flatMap((v) => (Array.isArray(v) ? v.map((x) => String(x)) : []))
    .filter(Boolean);
  const forbiddenActions = [
    ...((ctx.countyIntelligenceOrchestration.forbidden as string[] | undefined) ?? []),
    ...((ctx.landingPageContract.forbidden as string[] | undefined) ?? []),
    "target individual voters",
    "generate contact lists",
    "automate outreach",
    "produce final strategy while strategy gate is NO",
  ];

  const nextBestDataActions: string[] = [];
  if (voterWarehouseBlocked) nextBestDataActions.push("Clear voter warehouse schema blockers (4J-S).");
  if (!ctx.registrationSnapshotOps.allCountiesPresent)
    nextBestDataActions.push("Regenerate/fix registration snapshot template for all 75 counties.");
  if (!voterMetricsReady) nextBestDataActions.push("Import registration snapshot then rebuild voter metrics.");
  if (!winReady) nextBestDataActions.push("Backfill win-pathway inputs (asOfDate/snapshot/file date/confidence).");
  if (strategyStatus !== "YES") nextBestDataActions.push("Resolve strategy readiness blockers before strategy generation.");
  if (!mapReady) nextBestDataActions.push("Complete map/geocode readiness to enable map sections.");

  const memoryBrief = buildCountyInstitutionalMemoryBrief(county.slug);
  const memoryRow = ctx.countyMemory.readinessTable.rows.find((row) => row.countySlug === county.slug);
  if (memoryRow?.memoryTimeline !== "PRESENT") {
    nextBestDataActions.push("Capture county institutional memory timeline and source notes.");
  }
  const resourceBrief = resourceAllocationBriefBuilder(county.slug);
  nextBestDataActions.push(...resourceBrief.recommendedSafeOperatorActions.slice(0, 2));
  const narrativeBrief = publicNarrativeBriefBuilder(county.slug);
  nextBestDataActions.push(...narrativeBrief.recommendedSafeOperatorActions.slice(0, 2));

  return {
    countySlug: county.slug,
    countyName: county.displayName,
    fips: county.fips,
    countyIdentity: {
      countySlug: county.slug,
      countyName: county.displayName,
      fips: county.fips,
    },
    readinessStatus: {
      strategyReadiness: strategyStatus,
      voterFileReadiness: voterFileRow?.readiness.voterFilePresent ?? "MISSING",
      civicConfidenceScore: civicRow?.readiness.confidenceScore ?? null,
      mapReady,
      briefAvailable,
    },
    strategyGate: {
      allowed: strategyStatus === "YES",
      status: strategyStatus,
      blockedReasons: strategyBlockedReasons,
    },
    voterWarehouseBlockerStatus: {
      blocked: voterWarehouseBlocked,
      blockerCount: voterWarehouseBlockers.length,
      topBlockers: voterWarehouseBlockers.slice(0, 5),
    },
    registrationSnapshotOpsStatus: {
      templateExists: ctx.registrationSnapshotOps.templateExists,
      allCountiesPresent: ctx.registrationSnapshotOps.allCountiesPresent,
      importFlowConfigured: Boolean(ctx.registrationSnapshotOps.importFlowPath),
      status:
        ctx.registrationSnapshotOps.templateExists &&
        ctx.registrationSnapshotOps.allCountiesPresent &&
        Boolean(ctx.registrationSnapshotOps.importFlowPath)
          ? "READY"
          : "BLOCKED",
    },
    winPathwayReadiness: {
      hasInputs: winInputs != null,
      computationReady: winReady,
      blockers: win?.blockers ?? ["win pathway inputs missing"],
      strategySafeToGenerate: win?.strategySafeToGenerate ?? "NO",
    },
    landingPageReadiness: {
      enabledSections,
      blockedSections,
    },
    allowedTools,
    forbiddenActions: [...new Set(forbiddenActions)],
    nextBestDataActions: [...new Set(nextBestDataActions)],
    institutionalMemory: {
      status: memoryBrief.status,
      confidenceScore: memoryBrief.confidenceScore,
      memoryGaps: memoryBrief.memoryGaps,
      nextSafeDataActions: memoryBrief.nextSafeDataActions,
    },
    resourceOperations: {
      operationalHealth: resourceBrief.operationalHealth,
      resourcePressure: resourceBrief.resourcePressure,
      volunteerCapacity: resourceBrief.volunteerCapacity,
      travelBurden: resourceBrief.travelBurden,
      staffingGaps: resourceBrief.staffingGaps,
      eventROISummary: resourceBrief.eventROISummary,
      interventionUrgencyScore: resourceBrief.interventionUrgency.score,
      operationalConfidenceScore: resourceBrief.operationalConfidenceScore,
    },
    publicNarrative: {
      topPublicIssues: narrativeBrief.topPublicIssues,
      issueVolatility: narrativeBrief.issueVolatility,
      narrativeConfidenceScore: narrativeBrief.narrativeConfidenceScore,
      messagingReadinessStatus: narrativeBrief.messagingReadinessStatus,
      earnedMediaOpportunities: narrativeBrief.earnedMediaOpportunities,
    },
  };
}

export async function buildCountyAgentRuntimePayload(): Promise<CountyAgentRuntimePayload> {
  const ctx = await loadCountyAgentRuntimeContext();

  const strategyRows = ctx.strategyReadinessRows;
  const countyPayloads: RuntimeCountyPayload[] = [];

  for (const county of ARKANSAS_COUNTY_REGISTRY) {
    const strategy = strategyRows.find((r) => r.countySlug === county.slug);
    const brief = await loadBrief(county.slug, ctx.countyBriefs.popeCounty);
    countyPayloads.push(buildCountyPayload(ctx, county, strategy, brief));
  }

  const rows = countyPayloads.map((p) => ({
    countySlug: p.countySlug,
    countyName: p.countyName,
    briefAvailable: p.readinessStatus.briefAvailable,
    winPathwayReady: p.winPathwayReadiness.computationReady,
    voterMetricsReady: p.readinessStatus.voterFileReadiness === "PRESENT",
    mapReady: p.readinessStatus.mapReady,
    strategyGate: p.strategyGate.status,
    automationGate: "NO" as const,
    institutionalMemory: p.institutionalMemory.status,
  }));

  const meta = {
    countyCount: countyPayloads.length,
    briefAvailableCount: rows.filter((r) => r.briefAvailable).length,
    winPathwayReadyCount: rows.filter((r) => r.winPathwayReady).length,
    voterMetricsReadyCount: rows.filter((r) => r.voterMetricsReady).length,
    mapReadyCount: rows.filter((r) => r.mapReady).length,
    strategyGateYesCount: rows.filter((r) => r.strategyGate === "YES").length,
    automationGateYesCount: 0,
  };

  return {
    generatedAt: new Date().toISOString(),
    version: "4L.1",
    meta,
    countyPayloads,
    statewideDashboard: { rows },
  };
}

