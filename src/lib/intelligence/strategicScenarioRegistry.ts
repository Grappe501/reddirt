import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { StrategicScenarioRegistry } from "@/lib/intelligence/types/strategicScenarioSimulation";

export const STRATEGIC_SCENARIO_REGISTRY_REL = "data/intelligence/strategic-scenario-registry.json";

export function loadStrategicScenarioRegistry(repoRoot: string = process.cwd()): StrategicScenarioRegistry {
  const abs = path.join(repoRoot, STRATEGIC_SCENARIO_REGISTRY_REL);
  if (!existsSync(abs)) {
    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      purpose: "NSI-14 scenario registry not initialized.",
      governanceDefaults: {
        publicationSafety: "NON_PUBLISHABLE",
        humanReviewRequired: true,
        scenarioModelLabel: "SCENARIO_MODEL · INTERNAL_ONLY · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED",
        autonomousMutation: false,
      },
      scenarios: [],
    };
  }
  return JSON.parse(readFileSync(abs, "utf8")) as StrategicScenarioRegistry;
}
