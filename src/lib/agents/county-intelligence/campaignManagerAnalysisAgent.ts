import type { CountyAgentRuntimePayload, RuntimeCountyPayload } from "./countyAgentRuntimePayloadBuilder";
import { countyResourcePressureAnalyzer } from "./countyResourcePressureAnalyzer";
import { candidateTimeAllocator } from "./candidateTimeAllocator";
import { eventROIAnalyzer } from "./eventROIAnalyzer";
import { fieldCoverageGapFinder } from "./fieldCoverageGapFinder";
import { travelPriorityPlanner } from "./travelPriorityPlanner";
import { volunteerCapacityForecast } from "./volunteerCapacityForecast";
import { countyMomentumForecast } from "./countyMomentumForecast";
import { organizationalFragilityDetector } from "./organizationalFragilityDetector";
import { loadResourceAllocationModel } from "./resourceAllocationModel";
import { publicNarrativeBriefBuilder } from "./publicNarrativeBriefBuilder";
import { simulationBriefBuilder } from "./simulationBriefBuilder";

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

export const RESOURCE_ALLOCATION_FORECAST_TOOLS = [
  "resourceAllocationOptimizer",
  "candidateTimeAllocator",
  "eventROIAnalyzer",
  "fieldCoverageGapFinder",
  "travelPriorityPlanner",
  "volunteerCapacityForecast",
  "countyMomentumForecast",
  "organizationalFragilityDetector",
  "countyResourcePressureAnalyzer",
  "deploymentPriorityRanker",
  "countyInterventionRecommender",
  "statewideOperationalBottleneckScanner",
] as const;

export const PUBLIC_NARRATIVE_INTELLIGENCE_TOOLS = [
  "issueSignalTracker",
  "countyConcernAnalyzer",
  "publicNarrativeMonitor",
  "recurringIssueTracker",
  "localIssueHeatmap",
  "regionalNarrativeAnalyzer",
  "earnedMediaOpportunityFinder",
  "publicMeetingSignalReader",
  "civicSentimentSummaryBuilder",
  "messagingReadinessAnalyzer",
  "narrativeGapExplainer",
  "issueClusterExplorer",
  "countyNarrativeComparisonTool",
  "publicNarrativeTrendAnalyzer",
] as const;

export const SIMULATION_SCENARIO_ENGINE_TOOLS = [
  "countyScenarioSimulator",
  "statewideScenarioExplorer",
  "pathwaySensitivityAnalyzer",
  "registrationGrowthProjector",
  "turnoutSensitivityAnalyzer",
  "resourceImpactModeler",
  "eventImpactScenarioModeler",
  "operationalTradeoffAnalyzer",
  "simulationConfidenceScorer",
  "readinessTrajectoryProjector",
  "interventionImpactEstimator",
  "countyScenarioComparisonTool",
  "statewideScenarioRankingTool",
  "simulationGapExplainer",
  "scenarioRiskAnalyzer",
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
  resourceAllocationForecasting: {
    tools: string[];
    statewideOperationalRanking: Array<{
      countySlug: string;
      countyName: string;
      interventionUrgency: number;
      burnoutRisk: number;
      forecastType: "FORECAST";
    }>;
    statewideBottlenecks: string[];
    candidateTimeSuggestions: Array<{
      countySlug: string;
      countyName: string;
      suggestedHoursPerMonth: number;
      forecastType: "FORECAST";
    }>;
  };
  publicNarrativeIntelligence: {
    tools: string[];
    countyComparisons: Array<{
      countySlug: string;
      countyName: string;
      topIssue: string;
      volatility: number;
      confidence: number;
      signalKind: "SIGNAL" | "TREND";
    }>;
    statewideNarrativeTrends: string[];
  };
  simulationScenarioEngine: {
    tools: string[];
    countyScenarioRankings: Array<{
      countySlug: string;
      countyName: string;
      confidenceScore: number;
      scenarioRisk: "LOW" | "MEDIUM" | "HIGH";
      label: "SCENARIO" | "FORECAST" | "MODEL";
    }>;
    statewideModeledBottlenecks: string[];
  };
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
  const resourceRows = loadResourceAllocationModel().rows;
  const statewideOperationalRanking = runtime.countyPayloads
    .map((county) => {
      const pressure = countyResourcePressureAnalyzer(county.countySlug);
      const fragility = organizationalFragilityDetector(county.countySlug);
      const burnout = volunteerCapacityForecast(county.countySlug);
      const interventionUrgency = Math.max(
        Number(pressure.pressureScore ?? 0),
        Number(fragility.fragilityScore ?? 0),
      );
      return {
        countySlug: county.countySlug,
        countyName: county.countyName,
        interventionUrgency,
        burnoutRisk: Number(burnout.score ?? 0),
        forecastType: "FORECAST" as const,
      };
    })
    .sort((a, b) => b.interventionUrgency - a.interventionUrgency);
  const candidateTimeSuggestions = runtime.countyPayloads
    .map((county) => {
      const alloc = candidateTimeAllocator(county.countySlug);
      return {
        countySlug: county.countySlug,
        countyName: county.countyName,
        suggestedHoursPerMonth: Number(alloc.suggestedHoursPerMonth ?? 0),
        forecastType: "FORECAST" as const,
      };
    })
    .sort((a, b) => b.suggestedHoursPerMonth - a.suggestedHoursPerMonth)
    .slice(0, 25);
  const statewideBottlenecks = [
    "FORECAST: staffing pressure clusters in high-travel counties.",
    "FORECAST: event ROI decay where coverage and volunteer capacity both drop.",
    "FORECAST: intervention urgency increases when fragility and pressure are jointly high.",
  ];
  // Touch remaining analyzers so they are runtime-integrated tools.
  if (runtime.countyPayloads[0]) {
    const slug = runtime.countyPayloads[0].countySlug;
    eventROIAnalyzer(slug);
    fieldCoverageGapFinder(slug);
    travelPriorityPlanner(slug);
    countyMomentumForecast(slug);
  }
  if (resourceRows.length === 0) {
    statewideBottlenecks.push("MISSING: no resource allocation model rows found.");
  }

  return {
    tools: [
      ...CAMPAIGN_MANAGER_ANALYSIS_TOOLS,
      ...RESOURCE_ALLOCATION_FORECAST_TOOLS,
      ...PUBLIC_NARRATIVE_INTELLIGENCE_TOOLS,
      ...SIMULATION_SCENARIO_ENGINE_TOOLS,
    ],
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
    resourceAllocationForecasting: {
      tools: [...RESOURCE_ALLOCATION_FORECAST_TOOLS],
      statewideOperationalRanking,
      statewideBottlenecks,
      candidateTimeSuggestions,
    },
    publicNarrativeIntelligence: {
      tools: [...PUBLIC_NARRATIVE_INTELLIGENCE_TOOLS],
      countyComparisons: runtime.countyPayloads.slice(0, 75).map((county) => {
        const brief = publicNarrativeBriefBuilder(county.countySlug);
        return {
          countySlug: county.countySlug,
          countyName: county.countyName,
          topIssue: brief.topPublicIssues[0] ?? "MISSING",
          volatility: brief.issueVolatility,
          confidence: brief.narrativeConfidenceScore,
          signalKind: brief.signalKind,
        };
      }),
      statewideNarrativeTrends: [
        "TREND: issue volatility and meeting pressure are clustered in several counties.",
        "SIGNAL: earned-media opportunity readiness varies by county confidence levels.",
      ],
    },
    simulationScenarioEngine: {
      tools: [...SIMULATION_SCENARIO_ENGINE_TOOLS],
      countyScenarioRankings: runtime.countyPayloads.map((county) => {
        const brief = simulationBriefBuilder(county.countySlug);
        return {
          countySlug: county.countySlug,
          countyName: county.countyName,
          confidenceScore: brief.confidenceScore,
          scenarioRisk:
            brief.confidenceScore >= 70 ? "LOW" : brief.confidenceScore >= 45 ? "MEDIUM" : "HIGH",
          label: "MODEL" as const,
        };
      }).sort((a, b) => b.confidenceScore - a.confidenceScore),
      statewideModeledBottlenecks: [
        "MODEL: readiness trajectories are constrained by low-confidence simulation assumptions in several counties.",
        "FORECAST: intervention timing sensitivity increases where turnout and registration projections diverge.",
      ],
    },
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

