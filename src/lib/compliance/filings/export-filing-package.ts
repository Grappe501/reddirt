import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadApprovalEvents } from "../approvals/approval-storage";
import { auditComplianceRuleCorpus } from "../knowledge/compliance-rule-index";
import { loadComplianceRuleCorpus } from "../knowledge/load-compliance-rule-corpus";
import { evaluateFilingHardGates } from "../filing-readiness/hard-gates";
import { loadReconciliationMatches } from "../reconciliation/reconciliation-workbench-storage";
import { loadDocumentMetadata } from "../storage/document-storage";
import { buildArkansasFilingDataset, movementToCsvRow } from "./build-arkansas-filing-dataset";
import type { FilingExportBuildInput, FilingPackageExport } from "./filing-export-types";

const EXPORT_DIR = path.join(process.cwd(), "data", "compliance", "filings", "exports");

export async function exportFilingPackage(input: FilingExportBuildInput): Promise<FilingPackageExport> {
  const [documents, matches, corpus, approvalEvents, hardGates] = await Promise.all([
    loadDocumentMetadata(),
    loadReconciliationMatches(),
    loadComplianceRuleCorpus(),
    loadApprovalEvents(),
    input.hardGates ? Promise.resolve(input.hardGates) : evaluateFilingHardGates(),
  ]);
  const includedRecordIds = await resolveIncludedIds();
  const fullDataset = await buildArkansasFilingDataset(includedRecordIds);
  const audit = auditComplianceRuleCorpus(corpus);
  const watermark = input.legalVerificationComplete ? "READY FOR COMPLIANCE OFFICER REVIEW" : "DRAFT — NOT LEGAL FILING CERTIFIED";
  const generatedAt = new Date().toISOString();
  const exportRoot = path.join(EXPORT_DIR, input.filingId);
  await mkdir(exportRoot, { recursive: true });
  const artifacts: FilingPackageExport["artifacts"] = [];
  const writeArtifact = async (name: string, kind: string, contents: string) => {
    const relative = path.join("data", "compliance", "filings", "exports", input.filingId, name).replace(/\\/g, "/");
    await writeFile(path.join(process.cwd(), relative), contents, "utf8");
    artifacts.push({ name, path: relative, kind });
    return relative;
  };
  await writeArtifact("filing-summary.html", "html", renderSummaryHtml(input.label, watermark, input.readiness));
  await writeArtifact("filing-data.json", "json", JSON.stringify({ filingId: input.filingId, dataset: fullDataset, generatedAt }, null, 2));
  await writeArtifact("contributions.csv", "csv", toCsv(fullDataset.contributions.map(movementToCsvRow)));
  await writeArtifact("expenditures.csv", "csv", toCsv(fullDataset.expenditures.map(movementToCsvRow)));
  await writeArtifact("debts-obligations.csv", "csv", toCsv(fullDataset.debts.map(movementToCsvRow)));
  await writeArtifact("loans.csv", "csv", toCsv(fullDataset.loans.map(movementToCsvRow)));
  await writeArtifact("in-kind.csv", "csv", toCsv(fullDataset.inKind.map(movementToCsvRow)));
  await writeArtifact("reimbursements.csv", "csv", toCsv(fullDataset.reimbursements.map(movementToCsvRow)));
  await writeArtifact("supporting-document-index.json", "json", JSON.stringify(documents, null, 2));
  await writeArtifact("audit-manifest.json", "json", JSON.stringify({ hardGates, approvalEvents: approvalEvents.slice(0, 200) }, null, 2));
  const hashManifest = await Promise.all(artifacts.map(async (artifact) => ({
    path: artifact.path,
    sha256: sha256(await import("node:fs/promises").then((fs) => fs.readFile(path.join(process.cwd(), artifact.path)))),
  })));
  await writeArtifact("hash-manifest.json", "json", JSON.stringify(hashManifest, null, 2));
  await writeArtifact("certification-cover-sheet.html", "html", renderCertificationCover(input.label, watermark, input.generatedByInitials));
  const pkg: FilingPackageExport = {
    filingId: input.filingId,
    filingPeriod: input.readiness.filingPeriod ?? {},
    includedRecordIds,
    excludedRecordIds: fullDataset.excludedIds,
    readinessStatus: input.readiness.overallStatus,
    ruleCoverageStatus: audit.warning,
    reconciliationStatus: `${matches.filter((item) => item.status === "locked").length}/${matches.length} locked`,
    approvalChainSummary: approvalEvents.slice(0, 20).map((event) => `${event.role}:${event.stage} by ${event.actorInitials}`),
    hashManifest,
    generatedAt,
    generatedByInitials: input.generatedByInitials.trim().toUpperCase(),
    watermark,
    artifacts,
  };
  await writeFile(path.join(exportRoot, "package-manifest.json"), `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
  return pkg;
}

async function resolveIncludedIds(): Promise<string[]> {
  const { loadStagedMoneyMovements } = await import("../money/money-movement-storage");
  const movements = await loadStagedMoneyMovements();
  return movements.filter((movement) => movement.approvalStatus === "approved").map((movement) => movement.id);
}

function sha256(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function toCsv(rows: Record<string, string>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [headers.join(","), ...rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(","))].join("\n");
}

function renderSummaryHtml(label: string, watermark: string, readiness: FilingExportBuildInput["readiness"]): string {
  return `<!doctype html><html><body><h1>${escapeHtml(label)}</h1><p><strong>${escapeHtml(watermark)}</strong></p><p>Status: ${readiness.overallStatus}</p><p>Human review required. Not legal certification.</p></body></html>`;
}

function renderCertificationCover(label: string, watermark: string, initials: string): string {
  return `<!doctype html><html><body><h1>Certification cover sheet</h1><p>${escapeHtml(label)}</p><p>${escapeHtml(watermark)}</p><p>Prepared by: ${escapeHtml(initials)}</p></body></html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] ?? char));
}
