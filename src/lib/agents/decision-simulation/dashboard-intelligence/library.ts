export const SCENARIO_LIBRARY_KEY = "dec-sim-scenarios-v1";
export const OUTCOME_LIBRARY_KEY = "dec-sim-outcomes-v1";

export type SavedScenario = {
  id: string;
  title: string;
  savedAt: string;
  opening: string;
  channel: string;
  objective: string;
  context: string;
  operatorId: string;
  counterpartyId: string;
  jobId?: string;
  dominantFrame?: string | null;
  robustnessScore?: number | null;
};

export type ObservedOutcome = {
  jobId: string;
  recordedAt: string;
  actualResponse: string;
  closestFuture: string;
  notes: string;
  predictedFrame: string | null;
};

export function upsertScenario(library: SavedScenario[], scenario: SavedScenario): SavedScenario[] {
  return [scenario, ...library.filter((item) => item.id !== scenario.id)].slice(0, 20);
}

export function duplicateScenario(scenario: SavedScenario, now = new Date().toISOString()): SavedScenario {
  return {
    ...scenario,
    id: `scenario-${Date.now()}`,
    title: `${scenario.title} copy`,
    savedAt: now,
    jobId: undefined,
    dominantFrame: undefined,
    robustnessScore: undefined,
  };
}

export function upsertOutcome(library: ObservedOutcome[], outcome: ObservedOutcome): ObservedOutcome[] {
  return [outcome, ...library.filter((item) => item.jobId !== outcome.jobId)].slice(0, 50);
}
