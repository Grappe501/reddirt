import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildFilingReadinessReport } from "../filing-readiness/build-filing-readiness-report";
import { loadStagedMoneyMovements } from "../money/money-movement-storage";
import { loadDocumentMetadata } from "../storage/document-storage";
import type { ComplianceFilingSnapshot } from "./filing-types";

const FILINGS_DIR = path.join(process.cwd(), "data", "compliance", "filings");
const FILINGS_INDEX_PATH = path.join(FILINGS_DIR, "filing-snapshots.json");

export async function loadFilingSnapshots(): Promise<ComplianceFilingSnapshot[]> {
  return readJson<ComplianceFilingSnapshot[]>(FILINGS_INDEX_PATH, []);
}

export async function createDraftFilingSnapshot(input: {
  label: string;
  createdByInitials: string;
}): Promise<ComplianceFilingSnapshot> {
  const [existing, readiness, movements, documents] = await Promise.all([
    loadFilingSnapshots(),
    buildFilingReadinessReport(),
    loadStagedMoneyMovements(),
    loadDocumentMetadata(),
  ]);
  const now = new Date().toISOString();
  const id = `filing-${now.replace(/[-:.TZ]/g, "").slice(0, 14)}-${Math.random().toString(36).slice(2, 8)}`;
  const includedRecordIds = movements.filter((movement) => movement.approvalStatus === "approved").map((movement) => movement.id);
  const htmlSummary = renderHtmlSummary(input.label, readiness);
  const packageJson = {
    id,
    label: input.label,
    createdAt: now,
    includedRecordIds,
    readiness,
    humanCertificationRequired: true,
  };
  const jsonPackagePath = path.join(FILINGS_DIR, `${id}.json`);
  await mkdir(FILINGS_DIR, { recursive: true });
  await writeFile(jsonPackagePath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");
  const packageHash = sha256(JSON.stringify(packageJson));
  const snapshot: ComplianceFilingSnapshot = {
    id,
    label: input.label,
    filingPeriodLabel: readiness.filingPeriod?.label,
    status: readiness.overallStatus === "green" ? "ready_for_certification" : "draft",
    createdAt: now,
    createdByInitials: input.createdByInitials.trim().toUpperCase() || "UNK",
    includedRecordIds,
    supportingDocumentIds: documents.map((document) => document.id),
    readiness,
    htmlSummary,
    csvExports: [],
    jsonPackagePath: path.relative(process.cwd(), jsonPackagePath).replace(/\\/g, "/"),
    auditHashManifest: [{ path: path.relative(process.cwd(), jsonPackagePath).replace(/\\/g, "/"), sha256: packageHash }],
    packageHash,
    humanCertificationRequired: true,
  };
  await writeJson(FILINGS_INDEX_PATH, [snapshot, ...existing]);
  return snapshot;
}

function renderHtmlSummary(label: string, readiness: Awaited<ReturnType<typeof buildFilingReadinessReport>>): string {
  return `<h1>${escapeHtml(label)}</h1><p>Status: ${readiness.overallStatus}</p><p>Human review required. This is not legal certification.</p>`;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] ?? char));
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
