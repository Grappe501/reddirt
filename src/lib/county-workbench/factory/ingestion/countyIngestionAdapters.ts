import { isCountyWorkbenchBridgeAvailable } from "@/lib/agents/county-intelligence/county-workbench-path";
import { loadCountyKpis } from "@/lib/agents/county-intelligence/county-workbench-adapter";
import type { CountyFact, CountyIngestionResult } from "../countyFactoryTypes";
import { registrySlugFromShort } from "../countyFactoryPaths";

export type CountyIngestionAdapter = {
  name: string;
  dataTypes: string[];
  isConfigured: () => boolean;
  ingestCounty: (countySlug: string, dryRun: boolean) => Promise<{
    facts: Omit<CountyFact, "id">[];
    deferredReason: string | null;
    warnings: string[];
  }>;
};

function baseFact(
  countySlug: string,
  partial: Omit<CountyFact, "id" | "countySlug" | "retrievedAt">,
): Omit<CountyFact, "id"> {
  return {
    countySlug,
    retrievedAt: new Date().toISOString(),
    ...partial,
  };
}

export const censusAdapter: CountyIngestionAdapter = {
  name: "census",
  dataTypes: ["demographics", "economic"],
  isConfigured: () => Boolean(process.env.CENSUS_API_KEY?.trim()),
  async ingestCounty(countySlug, dryRun) {
    if (!this.isConfigured()) {
      return {
        facts: [],
        deferredReason: "CENSUS_API_KEY not configured — Pass C1 required",
        warnings: ["No fake census data generated"],
      };
    }
    if (dryRun) return { facts: [], deferredReason: null, warnings: ["Dry run — census adapter ready when key set"] };
    return { facts: [], deferredReason: "Census pull not implemented in this pass — queue Pass C1", warnings: [] };
  },
};

export const blsAdapter: CountyIngestionAdapter = {
  name: "bls",
  dataTypes: ["economic", "employment"],
  isConfigured: () => Boolean(process.env.BLS_API_KEY?.trim()),
  async ingestCounty(countySlug, dryRun) {
    if (!this.isConfigured()) {
      return { facts: [], deferredReason: "BLS_API_KEY not configured — Pass C3 required", warnings: [] };
    }
    if (dryRun) return { facts: [], deferredReason: null, warnings: ["Dry run — BLS adapter deferred"] };
    return { facts: [], deferredReason: "BLS pull not implemented — queue Pass C3", warnings: [] };
  },
};

export const sosRegistrationAdapter: CountyIngestionAdapter = {
  name: "sosRegistration",
  dataTypes: ["voter_registration", "election_history", "turnout"],
  isConfigured: () => process.env.COUNTY_SOS_IMPORT_ENABLED === "1",
  async ingestCounty(countySlug, dryRun) {
    if (!this.isConfigured()) {
      return { facts: [], deferredReason: "COUNTY_SOS_IMPORT_ENABLED=1 not set — Pass C2 required", warnings: [] };
    }
    if (dryRun) return { facts: [], deferredReason: null, warnings: ["Dry run — SOS import path deferred"] };
    return { facts: [], deferredReason: "SOS import not implemented — queue Pass C2", warnings: [] };
  },
};

export const electionHistoryAdapter: CountyIngestionAdapter = {
  name: "electionHistory",
  dataTypes: ["election_history", "turnout"],
  isConfigured: () => process.env.COUNTY_ELECTION_IMPORT_ENABLED === "1",
  async ingestCounty(_countySlug, dryRun) {
    if (!this.isConfigured()) {
      return { facts: [], deferredReason: "COUNTY_ELECTION_IMPORT_ENABLED=1 not set", warnings: [] };
    }
    if (dryRun) return { facts: [], deferredReason: null, warnings: ["Dry run"] };
    return { facts: [], deferredReason: "Election history import deferred — Pass C2", warnings: [] };
  },
};

export const educationAdapter: CountyIngestionAdapter = {
  name: "education",
  dataTypes: ["education", "schools"],
  isConfigured: () => process.env.COUNTY_EDUCATION_IMPORT_ENABLED === "1",
  async ingestCounty(_countySlug, dryRun) {
    if (!this.isConfigured()) {
      return { facts: [], deferredReason: "COUNTY_EDUCATION_IMPORT_ENABLED=1 not set — Pass C4", warnings: [] };
    }
    if (dryRun) return { facts: [], deferredReason: null, warnings: ["Dry run"] };
    return { facts: [], deferredReason: "Education import deferred — Pass C4", warnings: [] };
  },
};

export const healthAdapter: CountyIngestionAdapter = {
  name: "health",
  dataTypes: ["healthcare", "hospitals"],
  isConfigured: () => process.env.COUNTY_HEALTH_IMPORT_ENABLED === "1",
  async ingestCounty(_countySlug, dryRun) {
    if (!this.isConfigured()) {
      return { facts: [], deferredReason: "COUNTY_HEALTH_IMPORT_ENABLED=1 not set — Pass C5", warnings: [] };
    }
    if (dryRun) return { facts: [], deferredReason: null, warnings: ["Dry run"] };
    return { facts: [], deferredReason: "Health import deferred — Pass C5", warnings: [] };
  },
};

export const localAssetsAdapter: CountyIngestionAdapter = {
  name: "localAssets",
  dataTypes: ["civic_infrastructure", "event_opportunities", "media", "local_validators"],
  isConfigured: () => process.env.COUNTY_LOCAL_ASSETS_IMPORT_ENABLED === "1",
  async ingestCounty(_countySlug, dryRun) {
    if (!this.isConfigured()) {
      return { facts: [], deferredReason: "COUNTY_LOCAL_ASSETS_IMPORT_ENABLED=1 not set — Pass C6/C7", warnings: [] };
    }
    if (dryRun) return { facts: [], deferredReason: null, warnings: ["Dry run"] };
    return { facts: [], deferredReason: "Local assets import deferred — Pass C6/C7", warnings: [] };
  },
};

export const campaignNotesAdapter: CountyIngestionAdapter = {
  name: "campaignNotes",
  dataTypes: ["message_themes", "field_assets", "research_notes"],
  isConfigured: () => true,
  async ingestCounty(countySlug, dryRun) {
    if (dryRun) return { facts: [], deferredReason: null, warnings: ["Campaign notes require manual entry"] };
    return {
      facts: [
        baseFact(countySlug, {
          factType: "research_notes",
          factKey: "factory_status",
          value: "Awaiting operator-reviewed campaign notes",
          valueType: "string",
          sourceId: "campaign-internal-notes",
          sourceName: "Campaign Internal Notes",
          sourceUrlOrPath: "internal-review-only",
          sourceDate: null,
          confidence: 100,
          verificationStatus: "MISSING",
          publicUseRisk: "LOW",
          reviewStatus: "NEEDS_REVIEW",
          notes: "Placeholder gap marker — not field truth",
        }),
      ],
      deferredReason: null,
      warnings: ["Research note is a gap marker only"],
    };
  },
};

export const workbenchBridgeAdapter: CountyIngestionAdapter = {
  name: "workbenchBridge",
  dataTypes: ["readiness", "planning_proxy", "profile_depth"],
  isConfigured: () => isCountyWorkbenchBridgeAvailable(),
  async ingestCounty(countySlug, dryRun) {
    const short = countySlug.replace(/-county$/, "");
    if (!isCountyWorkbenchBridgeAvailable()) {
      return {
        facts: [],
        deferredReason: "County workbench bridge unavailable — set COUNTY_WORKBENCH_ROOT",
        warnings: [],
      };
    }
    const kpi = loadCountyKpis(short);
    if (!kpi) {
      return {
        facts: [],
        deferredReason: "County not in workbench CSV",
        warnings: ["Set COUNTY_WORKBENCH_ROOT"],
      };
    }
    if (dryRun) {
      return { facts: [], deferredReason: null, warnings: [`Would ingest workbench KPIs for ${short}`] };
    }
    const facts: Omit<CountyFact, "id">[] = [
      baseFact(registrySlugFromShort(short), {
        factType: "readiness",
        factKey: "workbenchDepth",
        value: kpi.deploymentReadiness === "SHELL_ONLY" ? "shell" : "full",
        valueType: "string",
        sourceId: "county-workbench-bridge",
        sourceName: "County Workbench Bridge",
        sourceUrlOrPath: "dashboard-v2-county-coverage.csv",
        sourceDate: null,
        confidence: 85,
        verificationStatus: "IMPORTED_UNVERIFIED",
        publicUseRisk: "MEDIUM",
        reviewStatus: "NEEDS_REVIEW",
        notes: "Workbench CSV import",
      }),
      baseFact(registrySlugFromShort(short), {
        factType: "readiness",
        factKey: "completionPercent",
        value: kpi.countyReadinessScore ?? 0,
        valueType: "number",
        sourceId: "county-workbench-bridge",
        sourceName: "County Workbench Bridge",
        sourceUrlOrPath: "dashboard-v2-county-coverage.csv",
        sourceDate: null,
        confidence: 85,
        verificationStatus: "IMPORTED_UNVERIFIED",
        publicUseRisk: "MEDIUM",
        reviewStatus: "NEEDS_REVIEW",
        notes: "Profile completion from workbench QA",
      }),
    ];
    if (kpi.planningVoteTargetProxy != null) {
      facts.push(
        baseFact(registrySlugFromShort(short), {
          factType: "planning_proxy",
          factKey: "voteTargetStatewide50",
          value: kpi.planningVoteTargetProxy,
          valueType: "number",
          sourceId: "county-workbench-bridge",
          sourceName: "County Workbench Bridge",
          sourceUrlOrPath: "arkansasStateAlignedTargets2022.json",
          sourceDate: "2022",
          confidence: 40,
          verificationStatus: "ESTIMATED",
          publicUseRisk: "HIGH",
          reviewStatus: "NEEDS_REVIEW",
          notes: "NOT registration goal — planning estimate only",
        }),
      );
    }
    return { facts, deferredReason: null, warnings: ["Never overwrite CountyCampaignStats.registrationGoal"] };
  },
};

export const ALL_COUNTY_ADAPTERS: CountyIngestionAdapter[] = [
  censusAdapter,
  blsAdapter,
  sosRegistrationAdapter,
  electionHistoryAdapter,
  educationAdapter,
  healthAdapter,
  localAssetsAdapter,
  campaignNotesAdapter,
  workbenchBridgeAdapter,
];

export function getAdapterByName(name: string): CountyIngestionAdapter | null {
  return ALL_COUNTY_ADAPTERS.find((a) => a.name === name) ?? null;
}

export function toIngestionResult(
  adapterName: string,
  countySlug: string | "ALL",
  dryRun: boolean,
  input: { facts: Omit<CountyFact, "id">[]; deferredReason: string | null; warnings: string[] },
  factsAdded: number,
): CountyIngestionResult {
  return {
    jobId: `ing-${adapterName}-${Date.now().toString(36)}`,
    adapterName,
    countySlug,
    status: input.deferredReason ? (dryRun ? "DRY_RUN" : "DEFERRED") : dryRun ? "DRY_RUN" : "COMPLETE",
    factsAdded,
    factsUpdated: 0,
    deferredReason: input.deferredReason,
    warnings: input.warnings,
    completedAt: new Date().toISOString(),
  };
}
