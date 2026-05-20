import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildIntelligencePackage } from "./build-intelligence-package";
import { renderAllBriefDocs } from "./render-intelligence-markdown";
import {
  criticalPathV2Schema,
  dataQualityReportSchema,
  diagnosisReportSchema,
  exceptionResolutionPlanSchema,
  filingPredictionSchema,
  intelligencePackageSchema,
  intelligenceSnapshotSchema,
  memoryLedgerSchema,
  workRouterPlanSchema,
} from "./intelligence-types";

const AI_DIR = path.join(process.cwd(), "data", "compliance", "ai");
const DOCS = path.join(process.cwd(), "docs", "compliance");

async function writeJson(name: string, data: unknown) {
  await mkdir(AI_DIR, { recursive: true });
  await writeFile(path.join(AI_DIR, name), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function writeDoc(name: string, content: string) {
  await mkdir(DOCS, { recursive: true });
  await writeFile(path.join(DOCS, name), content, "utf8");
}

export async function writeAllIntelligenceArtifacts() {
  const pkg = await buildIntelligencePackage();
  intelligencePackageSchema.parse(pkg);

  const docs = renderAllBriefDocs(pkg);

  await Promise.all([
    writeJson("intelligence-snapshot.json", pkg.snapshot),
    writeJson("diagnosis.json", pkg.diagnosis),
    writeJson("critical-path-v2.json", pkg.criticalPathV2),
    writeJson("work-router.json", pkg.workRouter),
    writeJson("data-quality.json", pkg.dataQuality),
    writeJson("filing-predictor.json", pkg.filingPredictor),
    writeJson("exception-resolver.json", pkg.exceptionResolver),
    writeJson("memory-ledger.json", pkg.memory),
    writeDoc("COMPLIANCE_AI_INTELLIGENCE_BRIEF.md", docs.intelligenceBrief),
    writeDoc("COMPLIANCE_AI_DIAGNOSIS_REPORT.md", docs.diagnosis),
    writeDoc("COMPLIANCE_AI_CRITICAL_PATH_V2.md", docs.criticalPathV2),
    writeDoc("COMPLIANCE_AI_WORK_ROUTER.md", docs.workRouter),
    writeDoc("COMPLIANCE_AI_DATA_QUALITY_REPORT.md", docs.dataQuality),
    writeDoc("COMPLIANCE_AI_FILING_PREDICTOR.md", docs.filingPredictor),
    writeDoc("COMPLIANCE_AI_EXCEPTION_RESOLVER.md", docs.exceptionResolver),
    writeDoc("COMPLIANCE_AI_MEMORY_LEDGER.md", docs.memoryLedger),
    writeDoc("COMPLIANCE_AI_EXECUTIVE_STATUS.md", docs.executive),
    writeDoc("COMPLIANCE_AI_OPERATOR_TODAY.md", docs.operator),
    writeDoc("COMPLIANCE_AI_ERNIE_TODAY.md", docs.ernie),
    writeDoc("COMPLIANCE_AI_TREASURER_TODAY.md", docs.treasurer),
  ]);

  return pkg;
}

export async function writeIntelligenceSnapshotOnly() {
  const pkg = await buildIntelligencePackage();
  intelligenceSnapshotSchema.parse(pkg.snapshot);
  const docs = renderAllBriefDocs(pkg);
  await writeJson("intelligence-snapshot.json", pkg.snapshot);
  await writeDoc("COMPLIANCE_AI_INTELLIGENCE_BRIEF.md", docs.intelligenceBrief);
  return pkg.snapshot;
}

export async function writeDiagnosisOnly() {
  const pkg = await buildIntelligencePackage();
  diagnosisReportSchema.parse(pkg.diagnosis);
  const docs = renderAllBriefDocs(pkg);
  await writeJson("diagnosis.json", pkg.diagnosis);
  await writeDoc("COMPLIANCE_AI_DIAGNOSIS_REPORT.md", docs.diagnosis);
  return pkg.diagnosis;
}

export async function writeCriticalPathV2Only() {
  const pkg = await buildIntelligencePackage();
  criticalPathV2Schema.parse(pkg.criticalPathV2);
  const docs = renderAllBriefDocs(pkg);
  await writeJson("critical-path-v2.json", pkg.criticalPathV2);
  await writeDoc("COMPLIANCE_AI_CRITICAL_PATH_V2.md", docs.criticalPathV2);
  return pkg.criticalPathV2;
}

export async function writeWorkRouterOnly() {
  const pkg = await buildIntelligencePackage();
  workRouterPlanSchema.parse(pkg.workRouter);
  const docs = renderAllBriefDocs(pkg);
  await writeJson("work-router.json", pkg.workRouter);
  await writeDoc("COMPLIANCE_AI_WORK_ROUTER.md", docs.workRouter);
  return pkg.workRouter;
}

export async function writeDataQualityOnly() {
  const pkg = await buildIntelligencePackage();
  dataQualityReportSchema.parse(pkg.dataQuality);
  const docs = renderAllBriefDocs(pkg);
  await writeJson("data-quality.json", pkg.dataQuality);
  await writeDoc("COMPLIANCE_AI_DATA_QUALITY_REPORT.md", docs.dataQuality);
  return pkg.dataQuality;
}

export async function writeFilingPredictorOnly() {
  const pkg = await buildIntelligencePackage();
  filingPredictionSchema.parse(pkg.filingPredictor);
  const docs = renderAllBriefDocs(pkg);
  await writeJson("filing-predictor.json", pkg.filingPredictor);
  await writeDoc("COMPLIANCE_AI_FILING_PREDICTOR.md", docs.filingPredictor);
  return pkg.filingPredictor;
}

export async function writeExceptionResolverOnly() {
  const pkg = await buildIntelligencePackage();
  exceptionResolutionPlanSchema.parse(pkg.exceptionResolver);
  const docs = renderAllBriefDocs(pkg);
  await writeJson("exception-resolver.json", pkg.exceptionResolver);
  await writeDoc("COMPLIANCE_AI_EXCEPTION_RESOLVER.md", docs.exceptionResolver);
  return pkg.exceptionResolver;
}

export async function writeMemoryLedgerOnly() {
  const pkg = await buildIntelligencePackage();
  memoryLedgerSchema.parse(pkg.memory);
  const docs = renderAllBriefDocs(pkg);
  await writeJson("memory-ledger.json", pkg.memory);
  await writeDoc("COMPLIANCE_AI_MEMORY_LEDGER.md", docs.memoryLedger);
  return pkg.memory;
}

export async function writeBriefsOnly() {
  const pkg = await buildIntelligencePackage();
  const docs = renderAllBriefDocs(pkg);
  await Promise.all([
    writeDoc("COMPLIANCE_AI_EXECUTIVE_STATUS.md", docs.executive),
    writeDoc("COMPLIANCE_AI_OPERATOR_TODAY.md", docs.operator),
    writeDoc("COMPLIANCE_AI_ERNIE_TODAY.md", docs.ernie),
    writeDoc("COMPLIANCE_AI_TREASURER_TODAY.md", docs.treasurer),
  ]);
  return pkg.briefs;
}
