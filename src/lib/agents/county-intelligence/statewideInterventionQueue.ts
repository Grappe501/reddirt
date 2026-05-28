import { loadStatewideInterventionQueue } from "./executiveCommandStateBuilder";

export function statewideInterventionQueue() {
  const rows = loadStatewideInterventionQueue().rows.slice().sort((a, b) => b.priority - a.priority);
  return { rows };
}

