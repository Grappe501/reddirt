import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { BankImportAnalysis, GoodChangeImportAnalysis, ReconciliationAnalysis } from "./imports/types";
import { matchGoodChangeToBank } from "./reconciliation/match-goodchange-to-bank";

const COMPLIANCE_DIR = path.join(process.cwd(), "data", "compliance");
const GOODCHANGE_DIR = path.join(COMPLIANCE_DIR, "imports", "goodchange");
const BANK_DIR = path.join(COMPLIANCE_DIR, "imports", "bank");
const ANALYSIS_DIR = path.join(COMPLIANCE_DIR, "analysis");

export async function getComplianceStorageStatus() {
  return {
    mode: "json-fallback" as const,
    label: "Storage mode: JSON fallback",
    directory: "data/compliance",
    dbBacked: false,
  };
}

export async function loadGoodChangeAnalyses(): Promise<GoodChangeImportAnalysis[]> {
  return readAnalysisFiles<GoodChangeImportAnalysis>(GOODCHANGE_DIR);
}

export async function loadBankAnalyses(): Promise<BankImportAnalysis[]> {
  const fromDir = await readAnalysisFiles<BankImportAnalysis>(BANK_DIR);
  const fromAggregate = await readBankAnalysesFromAggregate();
  const byBatchId = new Map<string, BankImportAnalysis>();
  for (const analysis of [...fromAggregate, ...fromDir]) {
    byBatchId.set(analysis.batch.id, analysis);
  }
  return [...byBatchId.values()];
}

async function readBankAnalysesFromAggregate(): Promise<BankImportAnalysis[]> {
  const bankPath = path.join(ANALYSIS_DIR, "bank-import-analysis.json");
  try {
    const raw = JSON.parse(await readFile(bankPath, "utf8")) as { batches?: BankImportAnalysis[] };
    return Array.isArray(raw.batches) ? raw.batches : [];
  } catch {
    return [];
  }
}

export async function buildReconciliationAnalysis(): Promise<ReconciliationAnalysis> {
  const [goodChangeAnalyses, bankAnalyses] = await Promise.all([loadGoodChangeAnalyses(), loadBankAnalyses()]);
  return matchGoodChangeToBank({
    goodChangeContributions: goodChangeAnalyses.flatMap((analysis) => analysis.stagedContributions),
    bankTransactions: bankAnalyses.flatMap((analysis) => analysis.stagedTransactions),
  });
}

export async function writeBaselineAnalysisReports(): Promise<{
  goodChange: string;
  bank: string;
  reconciliation: string;
}> {
  await mkdir(ANALYSIS_DIR, { recursive: true });
  const [goodChangeAnalyses, bankAnalyses] = await Promise.all([loadGoodChangeAnalyses(), loadBankAnalyses()]);
  const reconciliation = await buildReconciliationAnalysis();
  const goodChangePath = path.join(ANALYSIS_DIR, "goodchange-import-analysis.json");
  const bankPath = path.join(ANALYSIS_DIR, "bank-import-analysis.json");
  const reconciliationPath = path.join(ANALYSIS_DIR, "reconciliation-analysis.json");

  await Promise.all([
    writeFile(goodChangePath, `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      status: goodChangeAnalyses.length ? "ready" : "sample_needed",
      batches: goodChangeAnalyses,
      notes: goodChangeAnalyses.length
        ? ["GoodChange uploaded analyses are present in ignored local import storage."]
        : ["No GoodChange sample CSV has been uploaded yet. Real export needed for exact columns and sample-row assessment."],
    }, null, 2)}\n`, "utf8"),
    writeFile(bankPath, `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      status: bankAnalyses.length ? "ready" : "sample_needed",
      batches: bankAnalyses,
      notes: bankAnalyses.length
        ? ["Bank uploaded analyses are present in ignored local import storage."]
        : ["No bank sample CSV has been uploaded yet. Real export needed for exact columns and sample-row assessment."],
    }, null, 2)}\n`, "utf8"),
    writeFile(reconciliationPath, `${JSON.stringify(reconciliation, null, 2)}\n`, "utf8"),
  ]);

  return {
    goodChange: "data/compliance/analysis/goodchange-import-analysis.json",
    bank: "data/compliance/analysis/bank-import-analysis.json",
    reconciliation: "data/compliance/analysis/reconciliation-analysis.json",
  };
}

async function readAnalysisFiles<T>(directory: string): Promise<T[]> {
  try {
    const files = (await readdir(directory)).filter((file) => file.endsWith(".analysis.json")).sort();
    const values = await Promise.all(
      files.map(async (file) => {
        const raw = await readFile(path.join(directory, file), "utf8");
        return JSON.parse(raw) as T;
      }),
    );
    return values;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}
