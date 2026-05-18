import type { FilingHardGate } from "./hard-gates";
import type { FilingReadinessStatus } from "./filing-readiness-types";

export type FilingReadinessGrade = {
  status: FilingReadinessStatus;
  score: number;
  passedGates: number;
  totalGates: number;
  overriddenGates: number;
  label: string;
};

export function gradeFilingReadiness(gates: FilingHardGate[]): FilingReadinessGrade {
  const totalGates = gates.length;
  const passedGates = gates.filter((gate) => gate.status === "passed").length;
  const overriddenGates = gates.filter((gate) => gate.status === "overridden").length;
  const blocked = gates.filter((gate) => gate.blocking && gate.status === "blocked").length;
  const score = totalGates ? Math.round(((passedGates + overriddenGates * 0.5) / totalGates) * 100) : 0;
  const status: FilingReadinessStatus = blocked ? "red" : overriddenGates ? "yellow" : score >= 90 ? "green" : score >= 70 ? "yellow" : "red";
  return {
    status,
    score,
    passedGates,
    totalGates,
    overriddenGates,
    label: status === "green" ? "Ready for compliance officer review" : status === "yellow" ? "Conditional — overrides or warnings present" : "Blocked — resolve hard gates",
  };
}
