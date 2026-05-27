import { resourceImpactModeler } from "./resourceImpactModeler";
import { eventImpactScenarioModeler } from "./eventImpactScenarioModeler";

export function operationalTradeoffAnalyzer(countySlug: string) {
  const resource = resourceImpactModeler(countySlug);
  const event = eventImpactScenarioModeler(countySlug);
  return {
    countySlug,
    scenarioLabel: "MODEL" as const,
    tradeoffSummary: [
      "MODEL: increasing staffing improves operational readiness but may reduce travel flexibility.",
      "MODEL: event expansion can improve engagement while increasing volunteer strain.",
    ],
    projectedCompositeImpact: Math.round(
      (resource.projectedOperationalImpact + event.projectedReadinessLift) / 2,
    ),
    confidenceScore: Math.round((resource.confidenceScore + event.confidenceScore) / 2),
  };
}

