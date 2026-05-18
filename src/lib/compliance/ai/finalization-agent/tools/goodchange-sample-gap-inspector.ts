import { loadGoodChangeAnalyses } from "../../../storage";
import type { FinalizationInspectorResult } from "../inspector-types";

export async function inspectGoodChangeSampleGaps(): Promise<FinalizationInspectorResult> {
  const batches = await loadGoodChangeAnalyses();
  const score = batches.length >= 1 ? 70 : 25;
  return {
    id: "goodchange-samples",
    label: "GoodChange Sample Gap Inspector",
    score,
    status: batches.length ? "yellow" : "red",
    explanation: batches.length
      ? `${batches.length} analyzed batch(es) — confirm sanitized sample rows and field mapping at /admin/compliance/imports/sample-needed.`
      : "No GoodChange CSV analyzed — upload sample export for column discovery.",
  };
}
