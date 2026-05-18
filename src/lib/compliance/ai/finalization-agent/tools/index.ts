import type { FinalizationInspectorResult } from "../inspector-types";
import { inspectRuleCorpus } from "./rule-corpus-auditor";
import { inspectFilingHardGates } from "./filing-hard-gate-inspector";
import { inspectReconciliationLocks } from "./reconciliation-lock-inspector";
import { inspectFilingExport } from "./filing-export-inspector";
import { inspectStorageReadiness } from "./storage-readiness-inspector";
import { inspectDbPersistence } from "./db-persistence-inspector";
import { inspectGoodChangeSampleGaps } from "./goodchange-sample-gap-inspector";
import { inspectBankMatchGaps } from "./bank-match-gap-inspector";
import { inspectCommercialReadiness } from "./commercial-readiness-scorer";
import { inspectFinalLaunch } from "./final-launch-advisor";

export const finalizationInspectors = [
  inspectRuleCorpus,
  inspectFilingHardGates,
  inspectReconciliationLocks,
  inspectFilingExport,
  inspectStorageReadiness,
  inspectDbPersistence,
  inspectGoodChangeSampleGaps,
  inspectBankMatchGaps,
  inspectCommercialReadiness,
  inspectFinalLaunch,
] as const;

export async function runAllFinalizationInspectors(): Promise<FinalizationInspectorResult[]> {
  const results: FinalizationInspectorResult[] = [];
  for (const inspector of finalizationInspectors) {
    const result = await inspector();
    results.push(result);
  }
  return results;
}
