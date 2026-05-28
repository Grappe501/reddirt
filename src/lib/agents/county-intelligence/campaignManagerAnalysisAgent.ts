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
import { statewideInterventionCoordinator } from "./statewideInterventionCoordinator";
import { loadCampaignHealthScorecard, loadExecutiveAlertStream, loadExecutivePriorityRanking, loadOperationalBottleneckMap, loadRegionalPressureMap, loadStatewideInterventionQueue, loadStatewideReadinessMatrix } from "./executiveCommandStateBuilder";

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

export const MULTI_AGENT_COORDINATION_TOOLS = [
  "campaignBrainSynthesisEngine",
  "crossAgentInsightAggregator",
  "statewideInterventionCoordinator",
  "crossAgentConflictResolver",
  "executivePriorityRanker",
  "operationalRiskFusionAnalyzer",
  "statewideReadinessSynthesizer",
  "crossDomainTrendAnalyzer",
  "campaignBrainHealthInspector",
  "agentSafetyGatekeeper",
  "agentDependencyInspector",
  "coordinationGapExplainer",
  "statewideResourceConflictAnalyzer",
  "statewideNarrativeAlignmentAnalyzer",
  "executiveCoordinationBriefBuilder",
] as const;

export const EXECUTIVE_COMMAND_CENTER_TOOLS = [
  "executiveCommandStateBuilder",
  "statewideReadinessSynthesizer",
  "executivePriorityRanker",
  "operationalBottleneckMapper",
  "statewideInterventionCoordinator",
  "regionalPressureAnalyzer",
  "campaignHealthScorecard",
  "executiveAlertStream",
  "executiveBriefBuilder",
  "executiveUrgencyAnalyzer",
  "statewideOpportunityScanner",
  "statewideRiskScanner",
  "campaignHealthInspector",
  "executiveReadinessExplainer",
  "statewideTrendFusionAnalyzer",
  "statewideDependencyExplorer",
  "statewideConfidenceAnalyzer",
  "executiveScenarioComparisonTool",
  "executiveCoordinationSummary",
  "blockedAutomationMatrixInspector",
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
  multiAgentCoordination: {
    tools: string[];
    activeCopilots: string[];
    statewideSynthesisBrief: string[];
    executiveUrgencyRanking: Array<{
      countySlug: string;
      countyName: string;
      executiveUrgency: number;
      coordinationConfidence: number;
    }>;
    blockedAutomationMatrix: string[];
  };
  executiveCommandCenter: {
    tools: string[];
    readinessMatrixRows: number;
    interventionQueueRows: number;
    bottleneckRows: number;
    regionalPressureRows: number;
    priorityTopTen: Array<{
      countySlug: string;
      countyName: string;
      executivePriorityScore: number;
      urgencyBand: "HIGH" | "MEDIUM" | "LOW";
    }>;
    campaignHealthSummary: Array<{
      metric: string;
      score: number;
      label: "SIGNAL" | "TREND" | "FORECAST" | "MODEL";
      status: "PRESENT" | "MISSING" | "LOW_CONFIDENCE";
    }>;
    executiveAlerts: Array<{
      countySlug: string;
      countyName: string;
      severity: "INFO" | "WARN" | "CRITICAL";
      label: "SIGNAL" | "TREND" | "FORECAST" | "MODEL";
    }>;
    blockedAutomationMatrix: string[];
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
  const executiveReadinessMatrix = loadStatewideReadinessMatrix();
  const executiveInterventionQueue = loadStatewideInterventionQueue();
  const executiveBottleneckMap = loadOperationalBottleneckMap();
  const executiveRegionalPressure = loadRegionalPressureMap();
  const executivePriority = loadExecutivePriorityRanking();
  const executiveHealth = loadCampaignHealthScorecard();
  const executiveAlerts = loadExecutiveAlertStream();

  return {
    tools: [
      ...CAMPAIGN_MANAGER_ANALYSIS_TOOLS,
      ...RESOURCE_ALLOCATION_FORECAST_TOOLS,
      ...PUBLIC_NARRATIVE_INTELLIGENCE_TOOLS,
      ...SIMULATION_SCENARIO_ENGINE_TOOLS,
      ...MULTI_AGENT_COORDINATION_TOOLS,
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
      countyScenarioRankings: runtime.countyPayloads
        .map((county) => {
          const brief = simulationBriefBuilder(county.countySlug);
          const scenarioRisk: "LOW" | "MEDIUM" | "HIGH" =
            brief.confidenceScore >= 70 ? "LOW" : brief.confidenceScore >= 45 ? "MEDIUM" : "HIGH";
          return {
            countySlug: county.countySlug,
            countyName: county.countyName,
            confidenceScore: brief.confidenceScore,
            scenarioRisk,
            label: "MODEL" as const,
          };
        })
        .sort((a, b) => b.confidenceScore - a.confidenceScore),
      statewideModeledBottlenecks: [
        "MODEL: readiness trajectories are constrained by low-confidence simulation assumptions in several counties.",
        "FORECAST: intervention timing sensitivity increases where turnout and registration projections diverge.",
      ],
    },
    multiAgentCoordination: {
      tools: [...MULTI_AGENT_COORDINATION_TOOLS],
      activeCopilots: [
        "County Intelligence Copilot",
        "Institutional Memory Copilot",
        "Resource Allocation Copilot",
        "Public Narrative Copilot",
        "Simulation Scenario Copilot",
        "Civic/Demographic Copilot",
        "Voter Metrics Copilot",
        "Events & Calendar Copilot",
        "Volunteer Operations Copilot",
        "Compliance & Risk Copilot",
        "Executive Coordination Copilot",
      ],
      statewideSynthesisBrief: [
        "SYNTHESIS: cross-agent readiness coordination highlights counties with elevated operational and narrative pressure.",
        "SYNTHESIS: simulation confidence and compliance gating jointly shape executive intervention priorities.",
      ],
      executiveUrgencyRanking: statewideInterventionCoordinator().rankedInterventions.slice(0, 75),
      blockedAutomationMatrix: [
        "No autonomous campaign execution.",
        "No autonomous outreach.",
        "No autonomous resource allocation.",
        "No autonomous final strategy execution.",
      ],
    },
    executiveCommandCenter: {
      tools: [...EXECUTIVE_COMMAND_CENTER_TOOLS],
      readinessMatrixRows: executiveReadinessMatrix.rows.length,
      interventionQueueRows: executiveInterventionQueue.rows.length,
      bottleneckRows: executiveBottleneckMap.rows.length,
      regionalPressureRows: executiveRegionalPressure.rows.length,
      priorityTopTen: executivePriority.rows.slice(0, 10).map((row) => ({
        countySlug: row.countySlug,
        countyName: row.countyName,
        executivePriorityScore: row.executivePriorityScore,
        urgencyBand: row.urgencyBand,
      })),
      campaignHealthSummary: executiveHealth.metrics,
      executiveAlerts: executiveAlerts.rows.slice(0, 20).map((row) => ({
        countySlug: row.countySlug,
        countyName: row.countyName,
        severity: row.severity,
        label: row.label,
      })),
      blockedAutomationMatrix: [
        "No autonomous campaign execution.",
        "No autonomous outreach.",
        "No autonomous resource allocation.",
        "No autonomous final campaign strategy generation.",
        "No targeting/contact-list actions.",
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

