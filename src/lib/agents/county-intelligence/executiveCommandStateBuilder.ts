import fs from "node:fs";
import path from "node:path";
import type {
  CampaignHealthScorecardFile,
  ExecutiveAlertStreamFile,
  ExecutiveBriefRegistryFile,
  ExecutiveCommandReadinessFile,
  ExecutiveCommandStateFile,
  ExecutivePriorityRankingFile,
  OperationalBottleneckMapFile,
  RegionalPressureMapFile,
  StatewideInterventionQueueFile,
  StatewideReadinessMatrixFile,
} from "./executiveCommandTypes";

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relPath), "utf8")) as T;
}

export function loadExecutiveCommandState(): ExecutiveCommandStateFile {
  return readJson<ExecutiveCommandStateFile>("data/executive-command/executive-command-state.json");
}

export function loadStatewideReadinessMatrix(): StatewideReadinessMatrixFile {
  return readJson<StatewideReadinessMatrixFile>("data/executive-command/statewide-readiness-matrix.json");
}

export function loadExecutivePriorityRanking(): ExecutivePriorityRankingFile {
  return readJson<ExecutivePriorityRankingFile>("data/executive-command/executive-priority-ranking.json");
}

export function loadOperationalBottleneckMap(): OperationalBottleneckMapFile {
  return readJson<OperationalBottleneckMapFile>("data/executive-command/operational-bottleneck-map.json");
}

export function loadStatewideInterventionQueue(): StatewideInterventionQueueFile {
  return readJson<StatewideInterventionQueueFile>("data/executive-command/statewide-intervention-queue.json");
}

export function loadRegionalPressureMap(): RegionalPressureMapFile {
  return readJson<RegionalPressureMapFile>("data/executive-command/regional-pressure-map.json");
}

export function loadCampaignHealthScorecard(): CampaignHealthScorecardFile {
  return readJson<CampaignHealthScorecardFile>("data/executive-command/campaign-health-scorecard.json");
}

export function loadExecutiveAlertStream(): ExecutiveAlertStreamFile {
  return readJson<ExecutiveAlertStreamFile>("data/executive-command/executive-alert-stream.json");
}

export function loadExecutiveBriefRegistry(): ExecutiveBriefRegistryFile {
  return readJson<ExecutiveBriefRegistryFile>("data/executive-command/executive-brief-registry.json");
}

export function loadExecutiveCommandReadiness(): ExecutiveCommandReadinessFile {
  return readJson<ExecutiveCommandReadinessFile>("data/audit/executive-command-readiness-table.json");
}

