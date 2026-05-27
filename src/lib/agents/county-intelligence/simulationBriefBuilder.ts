import { countyScenarioSimulator } from "./countyScenarioSimulator";
import { pathwaySensitivityAnalyzer } from "./pathwaySensitivityAnalyzer";
import { registrationGrowthProjector } from "./registrationGrowthProjector";
import { turnoutSensitivityAnalyzer } from "./turnoutSensitivityAnalyzer";
import { resourceImpactModeler } from "./resourceImpactModeler";
import { eventImpactScenarioModeler } from "./eventImpactScenarioModeler";
import { operationalTradeoffAnalyzer } from "./operationalTradeoffAnalyzer";
import { scenarioConfidenceScorer } from "./scenarioConfidenceScorer";
import { loadCountyScenarioRegistry } from "./statewideScenarioMatrix";
import type { SimulationBrief } from "./simulationEngineTypes";

export function simulationBriefBuilder(countySlug: string): SimulationBrief {
  const scenarios = countyScenarioSimulator(countySlug);
  const pathway = pathwaySensitivityAnalyzer(countySlug);
  const registration = registrationGrowthProjector(countySlug);
  const turnout = turnoutSensitivityAnalyzer(countySlug);
  const resource = resourceImpactModeler(countySlug);
  const event = eventImpactScenarioModeler(countySlug);
  const tradeoff = operationalTradeoffAnalyzer(countySlug);
  const confidence = scenarioConfidenceScorer(countySlug);
  const source = loadCountyScenarioRegistry().rows.find((row) => row.countySlug === countySlug);

  return {
    countySlug,
    countyName: source?.countyName ?? countySlug,
    scenarioCards: scenarios.scenarios.map(
      (s) => `${s.label}: ${s.scenarioId} (impact ${s.readinessImpact}, confidence ${s.confidenceScore})`,
    ),
    pathwaySensitivity: pathway.factors.map((f) => ({
      factor: f.factor,
      influence: f.influence,
      label: f.scenarioLabel,
    })),
    registrationProjection: `${registration.scenarioLabel}: projected registrations ${registration.projectedRegistrations} (${registration.growthPercent}%).`,
    turnoutScenario: `${turnout.scenarioLabel}: projected turnout ${turnout.projectedTurnout} (delta ${turnout.turnoutDelta}).`,
    readinessTrajectory: `FORECAST: readiness trajectory impact ${Math.round(
      (resource.projectedOperationalImpact + event.projectedReadinessLift) / 2,
    )}.`,
    interventionImpactEstimate: `MODEL: intervention impact estimate ${tradeoff.projectedCompositeImpact}.`,
    simulationAssumptions: [
      ...registration.assumptions,
      ...turnout.assumptions,
      "SCENARIO assumptions are explicit and non-canonical.",
    ],
    confidenceScore: confidence.confidenceScore,
    scenarioRiskIndicators: [
      "SCENARIO risk: low-confidence counties require manual review.",
      "FORECAST risk: missing readiness inputs can understate bottlenecks.",
    ],
    recommendedSafeOperatorActions: [
      "Review SCENARIO assumptions with county operators before action.",
      "Use simulations as aggregate planning guidance, not canon truth.",
      "Do not convert modeled outcomes into autonomous strategy actions.",
    ],
    sourceLayers:
      source?.sourceLayers ?? [
        "data/simulations/county-scenario-registry.json",
        "data/audit/simulation-engine-readiness-table.json",
      ],
  };
}

