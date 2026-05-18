import { buildComplianceExecutiveScore } from "../../../scoring/compliance-score";
import type { FinalizationInspectorResult } from "../inspector-types";

export async function inspectCommercialReadiness(): Promise<FinalizationInspectorResult> {
  const executive = await buildComplianceExecutiveScore();
  return {
    id: "commercial",
    label: "Commercial Readiness Scorer",
    score: executive.commercialReadinessPct,
    status: executive.commercialReadinessPct >= 80 ? "green" : executive.commercialReadinessPct >= 55 ? "yellow" : "red",
    explanation: `Executive ${executive.score}/100 (${executive.status}).`,
  };
}
