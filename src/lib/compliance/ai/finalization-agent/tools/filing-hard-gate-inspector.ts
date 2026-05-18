import { evaluateFilingHardGates } from "../../../filing-readiness/hard-gates";
import { gradeFilingReadiness } from "../../../filing-readiness/filing-readiness-grade";
import type { FinalizationInspectorResult } from "../inspector-types";

export async function inspectFilingHardGates(): Promise<FinalizationInspectorResult> {
  const gates = await evaluateFilingHardGates();
  const grade = gradeFilingReadiness(gates);
  return {
    id: "filing-hard-gates",
    label: "Filing Hard Gate Inspector",
    score: grade.score,
    status: grade.status,
    explanation: grade.label,
  };
}
