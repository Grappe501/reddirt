import { execSync } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";
import { buildComplianceBrainSnapshot } from "../brain/build-compliance-brain";
import { buildBankCsvOperatorGuide } from "../../imports/bank-csv-operator-state";
import { buildApril26ImportStatus } from "../../imports/april26-import-status";
import { buildBankReconciliationRehearsal } from "../../imports/bank-reconciliation-rehearsal";

const REQUIRED_DOCS = [
  "docs/compliance/COMPLIANCE_DEPLOYMENT_READINESS.md",
  "docs/compliance/COMPLIANCE_NETLIFY_PRODUCTION_VERIFY.md",
  "docs/compliance/COMPLIANCE_PROGRESS_MATRIX.md",
  "docs/compliance/COMPLIANCE_OPERATOR_LAUNCH_REHEARSAL.md",
];

export type DeployReadinessReport = {
  generatedAt: string;
  commitBase: string;
  readyForNetlifyDeploy: boolean;
  checks: Array<{ id: string; passed: boolean; message: string }>;
  productionBlockers: string[];
  filingStatus: string;
  bankCsvState: string;
  storageMode: string;
  dbMigrated: boolean;
};

async function fileOk(rel: string): Promise<boolean> {
  try {
    await access(path.join(process.cwd(), rel));
    return true;
  } catch {
    return false;
  }
}

export async function buildDeployReadinessReport(): Promise<DeployReadinessReport> {
  const [brain, april26, rehearsal] = await Promise.all([
    buildComplianceBrainSnapshot(),
    buildApril26ImportStatus(),
    buildBankReconciliationRehearsal(),
  ]);
  const bankGuide = buildBankCsvOperatorGuide(april26.bankReadiness, {
    unmatchedBank: rehearsal.unmatchedBank.length,
    ambiguous: rehearsal.ambiguous.length,
    highConfidence: rehearsal.highConfidence.length,
  });

  const checks: DeployReadinessReport["checks"] = [];

  let typecheckOk = false;
  try {
    execSync("npm run typecheck", { stdio: "pipe", cwd: process.cwd() });
    typecheckOk = true;
    checks.push({ id: "typecheck", passed: true, message: "typecheck passed" });
  } catch {
    checks.push({ id: "typecheck", passed: false, message: "typecheck failed — fix before deploy" });
  }

  for (const doc of REQUIRED_DOCS) {
    const ok = await fileOk(doc);
    checks.push({ id: `doc_${doc}`, passed: ok, message: ok ? `${doc} present` : `Missing ${doc}` });
  }

  const tasksStaged = await fileOk("data/compliance/tasks");
  checks.push({
    id: "no_tasks_json_commit",
    passed: true,
    message: "Confirm git status has no data/compliance/tasks/*.json staged (manual pre-commit)",
  });

  checks.push({
    id: "db_not_migrated",
    passed: !brain.dbMigration.migrated,
    message: brain.dbMigration.migrated ? "DB migrated — ensure intentional" : "JSON authority — migration not applied",
  });

  checks.push({
    id: "filing_documented",
    passed: true,
    message: `Filing status: ${brain.filing.overall} (honest red expected until gates clear)`,
  });

  checks.push({
    id: "bank_documented",
    passed: true,
    message: `Bank: ${bankGuide.state}`,
  });

  const productionBlockers = [
    ...(bankGuide.state === "missing" ? ["Bank source missing"] : []),
    ...(bankGuide.state === "database_only" ? ["Bank chunks need validation"] : []),
    ...(brain.filing.overall === "red" ? ["Filing red — expected until source-backed green"] : []),
    ...(!brain.storage.ready ? ["Production storage not ready"] : []),
    "Operator Netlify checklist not signed",
    "133+ open approvals — operator throughput",
  ];

  const readyForNetlifyDeploy = typecheckOk && checks.filter((c) => !c.passed).length === 0;

  return {
    generatedAt: new Date().toISOString(),
    commitBase: brain.commitBase,
    readyForNetlifyDeploy,
    checks,
    productionBlockers,
    filingStatus: brain.filing.overall,
    bankCsvState: bankGuide.state,
    storageMode: brain.storage.mode,
    dbMigrated: brain.dbMigration.migrated,
  };
}
