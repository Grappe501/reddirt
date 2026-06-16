import progressSource from "../../../data/campaign-brain/election-plan/immersion-mission-progress.source.json";

export type MissionProgressMetric = {
  id: string;
  label: string;
  current: number;
  goal: number;
  primary?: boolean;
  unit?: string;
};

export type MissionProgressRecord = {
  owner: string;
  updatedAt: string;
  nextAction: string;
  metrics: MissionProgressMetric[];
};

type SourceFile = {
  version: number;
  updatedAt: string;
  note: string;
  missions: Record<string, MissionProgressRecord>;
};

const file = progressSource as SourceFile;

export function getMissionProgress(missionId: string): MissionProgressRecord | null {
  return file.missions[missionId] ?? null;
}

export function getMissionProgressPrimaryMetric(record: MissionProgressRecord): MissionProgressMetric | null {
  return record.metrics.find((m) => m.primary) ?? record.metrics[0] ?? null;
}

export function missionProgressPct(metric: MissionProgressMetric): number {
  if (metric.goal <= 0) return 0;
  return Math.min(100, (metric.current / metric.goal) * 100);
}

export function missionProgressRemaining(metric: MissionProgressMetric): number {
  return Math.max(0, metric.goal - metric.current);
}

export function formatMissionMetricValue(metric: MissionProgressMetric): string {
  const val = metric.current.toLocaleString("en-US");
  const goal = metric.goal.toLocaleString("en-US");
  if (metric.unit === "%") return `${val}% / ${goal}%`;
  return `${val} / ${goal}`;
}
