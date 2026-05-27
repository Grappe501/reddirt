import fs from "node:fs";
import path from "node:path";
import type {
  CountyScenarioRegistryFile,
  EventImpactScenariosFile,
  PathwaySensitivityModelFile,
  RegistrationGrowthScenariosFile,
  ResourceImpactModelsFile,
  SimulationEngineReadinessFile,
  StatewideScenarioMatrixFile,
  TurnoutSensitivityModelsFile,
} from "./simulationEngineTypes";

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relPath), "utf8")) as T;
}

export function loadCountyScenarioRegistry(): CountyScenarioRegistryFile {
  return readJson<CountyScenarioRegistryFile>("data/simulations/county-scenario-registry.json");
}

export function loadStatewideScenarioMatrix(): StatewideScenarioMatrixFile {
  return readJson<StatewideScenarioMatrixFile>("data/simulations/statewide-scenario-matrix.json");
}

export function loadPathwaySensitivityModel(): PathwaySensitivityModelFile {
  return readJson<PathwaySensitivityModelFile>("data/simulations/pathway-sensitivity-model.json");
}

export function loadRegistrationGrowthScenarios(): RegistrationGrowthScenariosFile {
  return readJson<RegistrationGrowthScenariosFile>("data/simulations/registration-growth-scenarios.json");
}

export function loadResourceImpactModels(): ResourceImpactModelsFile {
  return readJson<ResourceImpactModelsFile>("data/simulations/resource-impact-models.json");
}

export function loadEventImpactScenarios(): EventImpactScenariosFile {
  return readJson<EventImpactScenariosFile>("data/simulations/event-impact-scenarios.json");
}

export function loadTurnoutSensitivityModels(): TurnoutSensitivityModelsFile {
  return readJson<TurnoutSensitivityModelsFile>("data/simulations/turnout-sensitivity-models.json");
}

export function loadSimulationEngineReadiness(): SimulationEngineReadinessFile {
  return readJson<SimulationEngineReadinessFile>("data/audit/simulation-engine-readiness-table.json");
}

