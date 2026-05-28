import { loadRegionalPressureMap } from "./executiveCommandStateBuilder";

export function regionalPressureAnalyzer() {
  const rows = loadRegionalPressureMap().rows.slice().sort((a, b) => b.pressureScore - a.pressureScore);
  return { rows };
}

