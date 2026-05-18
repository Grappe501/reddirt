import { checkComplianceStorageHealth } from "../../../storage/storage-health";
import type { FinalizationInspectorResult } from "../inspector-types";

export async function inspectStorageReadiness(): Promise<FinalizationInspectorResult> {
  const health = await checkComplianceStorageHealth();
  const score = health.ready ? 90 : health.envPresent ? 55 : 35;
  return {
    id: "storage",
    label: "Storage Readiness Inspector",
    score,
    status: health.ready ? "green" : health.envPresent ? "yellow" : "red",
    explanation: health.summary,
  };
}
