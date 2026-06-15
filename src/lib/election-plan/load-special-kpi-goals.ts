import source from "../../../data/campaign-brain/special-kpi-goals.source.json";

export type SpecialKpiGoalType = "sos_lift_pct" | "county_majority";

export type SpecialKpiGoal = {
  id: string;
  scope: "city" | "county";
  locationSlug: string;
  locationName: string;
  eventLabel?: string;
  label: string;
  goalType: SpecialKpiGoalType;
  description: string;
  baseline2022SosVotes: number;
  baselineSource: string;
  href: string;
  currentSosVotes: number;
  /** SOS lift goal */
  targetIncreasePct?: number;
  targetSosVotes?: number;
  /** County majority goal */
  targetWinPct?: number;
  baseline2022SosOpponentVotes?: number;
  baseline2022Turnout?: number;
  targetSosVotesMajority?: number;
  currentWinPct?: number | null;
  planningTurnoutBasis?: string;
};

type SourceFile = {
  updatedAt: string;
  explanation: string;
  goals: SpecialKpiGoal[];
};

const file = source as SourceFile;

export function getSpecialKpiGoals(): SpecialKpiGoal[] {
  return file.goals;
}

export function getSpecialKpiGoal(id: string): SpecialKpiGoal | undefined {
  return file.goals.find((g) => g.id === id);
}

export function getSpecialKpiGoalForCounty(countySlug: string): SpecialKpiGoal | undefined {
  return file.goals.find((g) => g.scope === "county" && g.locationSlug === countySlug);
}

export function getSpecialKpiGoalForCity(citySlug: string): SpecialKpiGoal | undefined {
  return file.goals.find((g) => g.scope === "city" && g.locationSlug === citySlug);
}

export function specialKpiTargetVotes(goal: SpecialKpiGoal): number {
  if (goal.goalType === "county_majority") return goal.targetSosVotesMajority ?? 0;
  return goal.targetSosVotes ?? 0;
}

export function specialKpiProgressPct(goal: SpecialKpiGoal): number {
  const target = specialKpiTargetVotes(goal);
  if (target <= 0) return 0;
  return Math.min(100, (goal.currentSosVotes / target) * 100);
}

export function specialKpiGapToTarget(goal: SpecialKpiGoal): number {
  return Math.max(0, specialKpiTargetVotes(goal) - goal.currentSosVotes);
}

export function specialKpiExplanation(): string {
  return file.explanation;
}
