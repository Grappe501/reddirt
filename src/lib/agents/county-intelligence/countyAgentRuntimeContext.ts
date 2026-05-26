import fs from "node:fs";
import path from "node:path";
import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import type {
  CountyEventOutcomesFile,
  CountyMemoryIndexFile,
  CountyMemoryReadinessTable,
  CountyRelationshipGraphFile,
  RegionalInfluenceMapFile,
} from "./countyMemoryTypes";
import type {
  CandidateTimeAllocationFile,
  CountyResourcePressureFile,
  EventROIModelFile,
  FieldCoverageReadinessFile,
  ResourceAllocationModelFile,
  ResourceAllocationReadinessFile,
  TravelPriorityMapFile,
} from "./resourceAllocationTypes";
import type {
  CivicSentimentSummaryFile,
  CountyIssueClustersFile,
  EarnedMediaOpportunitiesFile,
  PublicIssueSignalRegistryFile,
  PublicMeetingWatchlistFile,
  PublicNarrativeReadinessFile,
  RegionalNarrativeMapFile,
} from "./publicNarrativeTypes";

type JsonRecord = Record<string, unknown>;

type StrategyReadinessRow = {
  countySlug: string;
  countyName: string;
  fips: string;
  turnoutRegistrationFacts: "PRESENT" | "MISSING";
  strategySafeToGenerate: "YES" | "NO";
  strategyBlockedReasons: string[];
};

type VoterFileReadinessRow = {
  fips5: string;
  workbenchSlug: string;
  readiness: {
    voterFilePresent: "PRESENT" | "MISSING";
    confidenceScore: number;
    heatMapSafe: "YES" | "NO";
  };
};

type CivicReadinessRow = {
  fips5: string;
  workbenchSlug: string;
  readiness: {
    confidenceScore: number;
  };
};

type MapReadinessRow = {
  fips5: string;
  workbenchSlug: string;
  boundarySourcePresent: "PRESENT" | "MISSING";
  geocodeQuality: "PASS" | "MISSING" | "WARN";
  voterFileLinked: "PRESENT" | "MISSING";
  heatMapEligible: "YES" | "NO";
};

export type CountyAgentRuntimeContext = {
  countyIntelligenceOrchestration: JsonRecord;
  campaignBrainOperatingSystemMap: JsonRecord;
  voterWarehouseSchemaReadiness: JsonRecord;
  countyWinPathwayInputs: JsonRecord;
  landingPageContract: JsonRecord;
  strategyReadinessRows: StrategyReadinessRow[];
  voterFileReadinessRows: VoterFileReadinessRow[];
  civicReadinessRows: CivicReadinessRow[];
  mapReadinessRows: MapReadinessRow[];
  registrationSnapshotOps: {
    templatePath: string;
    importFlowPath: string;
    templateExists: boolean;
    templateCountyRows: number;
    expectedCountyRows: number;
    allCountiesPresent: boolean;
  };
  countyBriefs: {
    popeCounty: Record<string, unknown> | null;
  };
  countyMemory: {
    memoryIndex: CountyMemoryIndexFile;
    eventOutcomes: CountyEventOutcomesFile;
    relationshipGraph: CountyRelationshipGraphFile;
    regionalInfluenceMap: RegionalInfluenceMapFile;
    readinessTable: CountyMemoryReadinessTable;
  };
  resourceAllocation: {
    allocationModel: ResourceAllocationModelFile;
    candidateTimeAllocation: CandidateTimeAllocationFile;
    fieldCoverageReadiness: FieldCoverageReadinessFile;
    countyResourcePressure: CountyResourcePressureFile;
    eventROIModel: EventROIModelFile;
    travelPriorityMap: TravelPriorityMapFile;
    readinessTable: ResourceAllocationReadinessFile;
  };
  publicNarrative: {
    issueSignalRegistry: PublicIssueSignalRegistryFile;
    countyIssueClusters: CountyIssueClustersFile;
    regionalNarrativeMap: RegionalNarrativeMapFile;
    earnedMediaOpportunities: EarnedMediaOpportunitiesFile;
    civicSentimentSummary: CivicSentimentSummaryFile;
    publicMeetingWatchlist: PublicMeetingWatchlistFile;
    readinessTable: PublicNarrativeReadinessFile;
  };
};

function readJsonFile<T = JsonRecord>(relPath: string): T {
  const abs = path.join(process.cwd(), relPath);
  return JSON.parse(fs.readFileSync(abs, "utf8")) as T;
}

function readJsonFileOr<T>(relPath: string, fallback: T): T {
  const abs = path.join(process.cwd(), relPath);
  if (!fs.existsSync(abs)) return fallback;
  return JSON.parse(fs.readFileSync(abs, "utf8")) as T;
}

function tryReadJsonFile<T = JsonRecord>(relPath: string): T | null {
  const abs = path.join(process.cwd(), relPath);
  if (!fs.existsSync(abs)) return null;
  return JSON.parse(fs.readFileSync(abs, "utf8")) as T;
}

function countTemplateRows(csvPath: string): { rowCount: number; allCountiesPresent: boolean } {
  if (!fs.existsSync(csvPath)) return { rowCount: 0, allCountiesPresent: false };
  const text = fs.readFileSync(csvPath, "utf8");
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length <= 1) return { rowCount: 0, allCountiesPresent: false };
  const rows = lines.slice(1);
  const fipsInTemplate = new Set(
    rows.map((r) => r.split(",")[0]?.trim() ?? "").filter((x) => /^\d{5}$/.test(x)),
  );
  const allCountiesPresent = ARKANSAS_COUNTY_REGISTRY.every((c) => fipsInTemplate.has(c.fips));
  return { rowCount: rows.length, allCountiesPresent };
}

export async function loadCountyAgentRuntimeContext(): Promise<CountyAgentRuntimeContext> {
  const countyIntelligenceOrchestration = readJsonFile<JsonRecord>(
    "data/campaign-events/county-intelligence-copilot-orchestration.json",
  );
  const campaignBrainOperatingSystemMap = readJsonFile<JsonRecord>(
    "data/campaign-events/campaign-brain-operating-system-map.json",
  );
  const voterWarehouseSchemaReadiness = readJsonFileOr<JsonRecord>(
    "data/audit/voter-warehouse-schema-readiness.json",
    { blocked: true, blockers: ["voter warehouse schema readiness file missing"] },
  );
  const countyWinPathwayInputs = readJsonFileOr<JsonRecord>("data/audit/county-win-pathway-inputs.json", {
    counties: [],
  });
  const landingPageContract = readJsonFileOr<JsonRecord>(
    "data/campaign-events/county-landing-page-orchestration-contract.json",
    { forbidden: ["contact targeting list export", "strategy generation while gate is NO"] },
  );

  const strategyReadiness = readJsonFileOr<{ counties: StrategyReadinessRow[] }>(
    "data/audit/county-strategy-readiness-table.json",
    {
      counties: ARKANSAS_COUNTY_REGISTRY.map((county) => ({
        countySlug: county.slug,
        countyName: county.displayName,
        fips: county.fips,
        turnoutRegistrationFacts: "MISSING" as const,
        strategySafeToGenerate: "NO" as const,
        strategyBlockedReasons: ["strategy readiness file missing"],
      })),
    },
  );
  const voterFileReadiness = readJsonFileOr<{ counties: VoterFileReadinessRow[] }>(
    "data/audit/voter-file-readiness-table.json",
    {
      counties: ARKANSAS_COUNTY_REGISTRY.map((county) => ({
        fips5: county.fips,
        workbenchSlug: county.slug.replace(/-county$/, ""),
        readiness: { voterFilePresent: "MISSING" as const, confidenceScore: 0, heatMapSafe: "NO" as const },
      })),
    },
  );
  const civicReadiness = readJsonFileOr<{ counties: CivicReadinessRow[] }>(
    "data/audit/civic-data-readiness-table.json",
    {
      counties: ARKANSAS_COUNTY_REGISTRY.map((county) => ({
        fips5: county.fips,
        workbenchSlug: county.slug.replace(/-county$/, ""),
        readiness: { confidenceScore: 0 },
      })),
    },
  );
  const mapReadiness = readJsonFileOr<{ counties: MapReadinessRow[] }>(
    "data/audit/voter-precinct-map-readiness-table.json",
    {
      counties: ARKANSAS_COUNTY_REGISTRY.map((county) => ({
        fips5: county.fips,
        workbenchSlug: county.slug.replace(/-county$/, ""),
        boundarySourcePresent: "MISSING" as const,
        geocodeQuality: "MISSING" as const,
        voterFileLinked: "MISSING" as const,
        heatMapEligible: "NO" as const,
      })),
    },
  );

  const templatePath = path.join(
    process.cwd(),
    "data",
    "import-templates",
    "voter-registration-snapshot-template.csv",
  );
  const templateStatus = countTemplateRows(templatePath);
  const cachedBriefs = tryReadJsonFile<Record<string, Record<string, unknown>>>(
    "data/audit/county-summary-briefs.json",
  );

  const countyMemoryIndex = readJsonFile<CountyMemoryIndexFile>(
    "data/county-memory/county-memory-index.json",
  );
  const countyEventOutcomes = readJsonFile<CountyEventOutcomesFile>(
    "data/county-memory/county-event-outcomes.json",
  );
  const countyRelationshipGraph = readJsonFile<CountyRelationshipGraphFile>(
    "data/county-memory/county-relationship-graph.json",
  );
  const regionalInfluenceMap = readJsonFile<RegionalInfluenceMapFile>(
    "data/county-memory/regional-influence-map.json",
  );
  const countyMemoryReadinessTable = readJsonFile<CountyMemoryReadinessTable>(
    "data/audit/county-memory-readiness-table.json",
  );
  const resourceAllocationModel = readJsonFile<ResourceAllocationModelFile>(
    "data/resource-allocation/resource-allocation-model.json",
  );
  const candidateTimeAllocation = readJsonFile<CandidateTimeAllocationFile>(
    "data/resource-allocation/candidate-time-allocation.json",
  );
  const fieldCoverageReadiness = readJsonFile<FieldCoverageReadinessFile>(
    "data/resource-allocation/field-coverage-readiness.json",
  );
  const countyResourcePressure = readJsonFile<CountyResourcePressureFile>(
    "data/resource-allocation/county-resource-pressure-table.json",
  );
  const eventROIModel = readJsonFile<EventROIModelFile>(
    "data/resource-allocation/event-roi-model.json",
  );
  const travelPriorityMap = readJsonFile<TravelPriorityMapFile>(
    "data/resource-allocation/travel-priority-map.json",
  );
  const resourceAllocationReadiness = readJsonFile<ResourceAllocationReadinessFile>(
    "data/audit/resource-allocation-readiness-table.json",
  );
  const issueSignalRegistry = readJsonFile<PublicIssueSignalRegistryFile>(
    "data/public-narrative/public-issue-signal-registry.json",
  );
  const countyIssueClusters = readJsonFile<CountyIssueClustersFile>(
    "data/public-narrative/county-issue-clusters.json",
  );
  const regionalNarrativeMap = readJsonFile<RegionalNarrativeMapFile>(
    "data/public-narrative/regional-narrative-map.json",
  );
  const earnedMediaOpportunities = readJsonFile<EarnedMediaOpportunitiesFile>(
    "data/public-narrative/earned-media-opportunities.json",
  );
  const civicSentimentSummary = readJsonFile<CivicSentimentSummaryFile>(
    "data/public-narrative/civic-sentiment-summary.json",
  );
  const publicMeetingWatchlist = readJsonFile<PublicMeetingWatchlistFile>(
    "data/public-narrative/public-meeting-watchlist.json",
  );
  const publicNarrativeReadiness = readJsonFile<PublicNarrativeReadinessFile>(
    "data/audit/public-narrative-readiness-table.json",
  );

  return {
    countyIntelligenceOrchestration,
    campaignBrainOperatingSystemMap,
    voterWarehouseSchemaReadiness,
    countyWinPathwayInputs,
    landingPageContract,
    strategyReadinessRows: strategyReadiness.counties,
    voterFileReadinessRows: voterFileReadiness.counties,
    civicReadinessRows: civicReadiness.counties,
    mapReadinessRows: mapReadiness.counties,
    registrationSnapshotOps: {
      templatePath: "data/import-templates/voter-registration-snapshot-template.csv",
      importFlowPath: "scripts/brain/import-voter-registration-snapshot.ts",
      templateExists: fs.existsSync(templatePath),
      templateCountyRows: templateStatus.rowCount,
      expectedCountyRows: ARKANSAS_COUNTY_REGISTRY.length,
      allCountiesPresent: templateStatus.allCountiesPresent,
    },
    countyBriefs: {
      popeCounty: cachedBriefs?.["pope-county"] ?? null,
    },
    countyMemory: {
      memoryIndex: countyMemoryIndex,
      eventOutcomes: countyEventOutcomes,
      relationshipGraph: countyRelationshipGraph,
      regionalInfluenceMap,
      readinessTable: countyMemoryReadinessTable,
    },
    resourceAllocation: {
      allocationModel: resourceAllocationModel,
      candidateTimeAllocation,
      fieldCoverageReadiness,
      countyResourcePressure,
      eventROIModel,
      travelPriorityMap,
      readinessTable: resourceAllocationReadiness,
    },
    publicNarrative: {
      issueSignalRegistry,
      countyIssueClusters,
      regionalNarrativeMap,
      earnedMediaOpportunities,
      civicSentimentSummary,
      publicMeetingWatchlist,
      readinessTable: publicNarrativeReadiness,
    },
  };
}

