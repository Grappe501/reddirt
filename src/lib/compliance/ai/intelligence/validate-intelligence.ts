import { access } from "node:fs/promises";
import path from "node:path";
import { readFile } from "node:fs/promises";
import {
  criticalPathV2Schema,
  dataQualityReportSchema,
  diagnosisReportSchema,
  exceptionResolutionPlanSchema,
  filingPredictionSchema,
  intelligenceSnapshotSchema,
  memoryLedgerSchema,
  workRouterPlanSchema,
} from "./intelligence-types";

const AI_DIR = path.join(process.cwd(), "data", "compliance", "ai");
const DOCS = path.join(process.cwd(), "docs", "compliance");

const JSON_ARTIFACTS: { file: string; schema: (data: unknown) => unknown }[] = [
  { file: "intelligence-snapshot.json", schema: (d) => intelligenceSnapshotSchema.parse(d) },
  { file: "diagnosis.json", schema: (d) => diagnosisReportSchema.parse(d) },
  { file: "critical-path-v2.json", schema: (d) => criticalPathV2Schema.parse(d) },
  { file: "work-router.json", schema: (d) => workRouterPlanSchema.parse(d) },
  { file: "data-quality.json", schema: (d) => dataQualityReportSchema.parse(d) },
  { file: "filing-predictor.json", schema: (d) => filingPredictionSchema.parse(d) },
  { file: "exception-resolver.json", schema: (d) => exceptionResolutionPlanSchema.parse(d) },
  { file: "memory-ledger.json", schema: (d) => memoryLedgerSchema.parse(d) },
];

const DOC_ARTIFACTS = [
  "COMPLIANCE_AI_INTELLIGENCE_BRIEF.md",
  "COMPLIANCE_AI_DIAGNOSIS_REPORT.md",
  "COMPLIANCE_AI_CRITICAL_PATH_V2.md",
  "COMPLIANCE_AI_WORK_ROUTER.md",
  "COMPLIANCE_AI_DATA_QUALITY_REPORT.md",
  "COMPLIANCE_AI_FILING_PREDICTOR.md",
  "COMPLIANCE_AI_EXCEPTION_RESOLVER.md",
  "COMPLIANCE_AI_MEMORY_LEDGER.md",
  "COMPLIANCE_AI_EXECUTIVE_STATUS.md",
  "COMPLIANCE_AI_OPERATOR_TODAY.md",
  "COMPLIANCE_AI_ERNIE_TODAY.md",
  "COMPLIANCE_AI_TREASURER_TODAY.md",
];

export type IntelligenceQaResult = {
  ok: boolean;
  errors: string[];
  jsonValidated: number;
  docsFound: number;
};

export async function validateIntelligenceArtifacts(): Promise<IntelligenceQaResult> {
  const errors: string[] = [];

  for (const { file, schema } of JSON_ARTIFACTS) {
    const p = path.join(AI_DIR, file);
    try {
      const raw = await readFile(p, "utf8");
      schema(JSON.parse(raw));
    } catch (e) {
      errors.push(`${file}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  let docsFound = 0;
  for (const doc of DOC_ARTIFACTS) {
    const p = path.join(DOCS, doc);
    try {
      await access(p);
      docsFound += 1;
    } catch {
      errors.push(`missing doc: ${doc}`);
    }
  }

  const snap = await readFile(path.join(AI_DIR, "intelligence-snapshot.json"), "utf8").catch(() => null);
  if (snap) {
    const parsed = intelligenceSnapshotSchema.parse(JSON.parse(snap));
    if (parsed.filingStatus === "green" && parsed.openQueueItems > 50) {
      errors.push("suspicious: filing green with large open queue");
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    jsonValidated: JSON_ARTIFACTS.length - errors.filter((e) => e.endsWith(".json")).length,
    docsFound,
  };
}
