import type { CountyAgentRuntimePayload, RuntimeCountyPayload } from "./countyAgentRuntimePayloadBuilder";

export const CAMPAIGN_MANAGER_ANALYSIS_TOOLS = [
  "systemEfficiencyAnalyzer",
  "countyOpportunityScanner",
  "trendAnalyzer",
  "scenarioModeler",
  "kpiGapAnalyzer",
  "messageReadinessAnalyzer",
  "countyManagerBriefGenerator",
  "statewidePortfolioOptimizer",
] as const;

export type ScenarioSimulation = {
  label: string;
  clearlyScenario: true;
  note: string;
};

export type CountyManagerBrief = {
  countySlug: string;
  countyName: string;
  whatChanged: string;
  whatIsBlocked: string;
  biggestOperationalOpportunity: string;
  biggestRisk: string;
  dataConfidence: string;
  winPathwayReadiness: "READY" | "BLOCKED";
  kpiGaps: string[];
  recommendedOperatorActions: string[];
  humanApprovalsNeeded: string[];
  scenarios: ScenarioSimulation[];
  sourceArtifacts: string[];
};

export type CampaignManagerAnalysisResult = {
  tools: string[];
  systemEfficiencyAnalyzer: {
    blockedPipelines: string[];
  };
  countyOpportunityScanner: {
    highReadiness: string[];
    weakDataConfidence: string[];
  };
  trendAnalyzer: {
    summary: string[];
  };
  statewidePortfolioOptimizer: {
    rankedOperationalUrgency: Array<{ countySlug: string; countyName: string; urgencyScore: number }>;
  };
  countyManagerBriefs: CountyManagerBrief[];
  safety: {
    noRawVoterRowsExposed: true;
    noIndividualTargeting: true;
    noContactListGeneration: true;
    noAutomatedPersuasionCopy: true;
    noFinalStrategyWhenGateNo: true;
    simulationsClearlyScenario: true;
    recommendationsCiteSourceArtifacts: true;
  };
};

function buildScenarios(county: RuntimeCountyPayload): ScenarioSimulation[] {
  return [
    {
      label: "registration_growth_plus_10pct",
      clearlyScenario: true,
      note: `Scenario only: if ${county.countyName} registration grows by 10%, readiness pressure may reduce.`,
    },
    {
      label: "volunteer_capacity_plus_20pct",
      clearlyScenario: true,
      note: `Scenario only: if volunteer capacity increases by 20%, field bottlenecks may soften.`,
    },
  ];
}

function buildCountyManagerBrief(county: RuntimeCountyPayload): CountyManagerBrief {
  return {
    countySlug: county.countySlug,
    countyName: county.countyName,
    whatChanged: county.institutionalMemory.status === "PRESENT"
      ? "Institutional memory context available for operator review."
      : "Institutional memory remains incomplete; readiness unchanged.",
    whatIsBlocked: county.strategyGate.blockedReasons[0] ?? "strategy gate blocked",
    biggestOperationalOpportunity: county.nextBestDataActions[0] ?? "fill county data readiness gaps",
    biggestRisk: county.institutionalMemory.memoryGaps[0] ?? "memory gap unresolved",
    dataConfidence:
      county.institutionalMemory.confidenceScore != null && county.institutionalMemory.confidenceScore >= 60
        ? "MEDIUM"
        : "LOW",
    winPathwayReadiness: county.winPathwayReadiness.computationReady ? "READY" : "BLOCKED",
    kpiGaps: county.winPathwayReadiness.blockers,
    recommendedOperatorActions: county.nextBestDataActions.slice(0, 5),
    humanApprovalsNeeded: [
      "Human review of county memory assertions before canon usage.",
      "Human approval required before any strategy drafting.",
    ],
    scenarios: buildScenarios(county),
    sourceArtifacts: [
      "data/audit/county-memory-readiness-table.json",
      "data/county-memory/county-memory-index.json",
      "data/county-memory/county-relationship-graph.json",
    ],
  };
}

export function runCampaignManagerAnalysisAgent(
  runtime: CountyAgentRuntimePayload,
): CampaignManagerAnalysisResult {
  const countyManagerBriefs = runtime.countyPayloads.map((county) => buildCountyManagerBrief(county));
  const rankedOperationalUrgency = runtime.countyPayloads
    .map((county) => ({
      countySlug: county.countySlug,
      countyName: county.countyName,
      urgencyScore:
        (county.strategyGate.status === "NO" ? 40 : 0) +
        (county.institutionalMemory.status === "MISSING" ? 35 : county.institutionalMemory.status === "NEEDS_REVIEW" ? 20 : 0) +
        county.voterWarehouseBlockerStatus.blockerCount,
    }))
    .sort((a, b) => b.urgencyScore - a.urgencyScore);

  return {
    tools: [...CAMPAIGN_MANAGER_ANALYSIS_TOOLS],
    systemEfficiencyAnalyzer: {
      blockedPipelines: [
        "voter warehouse schema blockers",
        "county memory gaps requiring manual ingestion",
      ],
    },
    countyOpportunityScanner: {
      highReadiness: runtime.countyPayloads
        .filter((county) => county.institutionalMemory.status === "PRESENT")
        .slice(0, 10)
        .map((county) => county.countySlug),
      weakDataConfidence: runtime.countyPayloads
        .filter((county) => (county.institutionalMemory.confidenceScore ?? 0) < 60)
        .slice(0, 15)
        .map((county) => county.countySlug),
    },
    trendAnalyzer: {
      summary: [
        "Readiness trend: memory coverage remains mostly MISSING/NEEDS_REVIEW.",
        "Operational trend: strategy stays blocked where memory/readiness gates are incomplete.",
      ],
    },
    statewidePortfolioOptimizer: {
      rankedOperationalUrgency,
    },
    countyManagerBriefs,
    safety: {
      noRawVoterRowsExposed: true,
      noIndividualTargeting: true,
      noContactListGeneration: true,
      noAutomatedPersuasionCopy: true,
      noFinalStrategyWhenGateNo: true,
      simulationsClearlyScenario: true,
      recommendationsCiteSourceArtifacts: true,
    },
  };
}

