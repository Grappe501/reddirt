import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadStagedMoneyMovements } from "../money/money-movement-storage";
import { loadBankAnalyses, buildReconciliationAnalysis } from "../storage";
import type { ComplianceReconciliationMatch, ComplianceReconciliationStatus } from "./reconciliation-workbench-types";

const RECON_DIR = path.join(process.cwd(), "data", "compliance", "reconciliation");
const MATCHES_PATH = path.join(RECON_DIR, "matches.json");

export async function loadReconciliationMatches(): Promise<ComplianceReconciliationMatch[]> {
  return readJson<ComplianceReconciliationMatch[]>(MATCHES_PATH, []);
}

export async function saveReconciliationMatches(matches: ComplianceReconciliationMatch[]): Promise<void> {
  await writeJson(MATCHES_PATH, matches);
}

export async function buildReconciliationWorkbench() {
  const [matches, bankAnalyses, movements, preview] = await Promise.all([
    loadReconciliationMatches(),
    loadBankAnalyses(),
    loadStagedMoneyMovements(),
    buildReconciliationAnalysis(),
  ]);
  const bankTransactions = bankAnalyses.flatMap((analysis) => analysis.stagedTransactions);
  const matchedBankIds = new Set(matches.flatMap((match) => match.bankTransactionIds));
  const matchedMovementIds = new Set(matches.flatMap((match) => match.moneyMovementIds));
  return {
    matches,
    suggestedPreview: preview.candidates,
    unmatchedBankTransactions: bankTransactions.filter((transaction) => !matchedBankIds.has(transaction.id) && transaction.reconciliationStatus !== "ignored"),
    unmatchedMoneyMovements: movements.filter((movement) => !matchedMovementIds.has(movement.id) && movement.reconciliationStatus !== "matched" && movement.reconciliationStatus !== "ignored"),
    lockedCount: matches.filter((match) => match.status === "locked").length,
    approvedCount: matches.filter((match) => match.status === "approved" || match.status === "locked").length,
  };
}

export async function upsertReconciliationMatch(input: Omit<ComplianceReconciliationMatch, "createdAt" | "updatedAt" | "humanReviewRequired">): Promise<ComplianceReconciliationMatch> {
  const matches = await loadReconciliationMatches();
  const existing = matches.find((match) => match.id === input.id);
  const now = new Date().toISOString();
  const next: ComplianceReconciliationMatch = {
    ...existing,
    ...input,
    variance: input.variance ?? computeVariance(input.bankAmount, input.ledgerAmount),
    reviewerInitials: input.reviewerInitials?.trim().toUpperCase(),
    approvedAt: input.status === "approved" || input.status === "locked" ? input.approvedAt ?? existing?.approvedAt ?? now : input.approvedAt,
    lockedAt: input.status === "locked" ? input.lockedAt ?? existing?.lockedAt ?? now : input.lockedAt,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    humanReviewRequired: true,
  };
  await saveReconciliationMatches([next, ...matches.filter((match) => match.id !== next.id)]);
  return next;
}

export function transitionReconciliationStatus(status: ComplianceReconciliationStatus): ComplianceReconciliationStatus {
  if (status === "approved") return "locked";
  if (status === "suggested") return "approved";
  return status;
}

function computeVariance(bankAmount?: number, ledgerAmount?: number): number | undefined {
  if (bankAmount === undefined || ledgerAmount === undefined) return undefined;
  return Math.round((bankAmount - ledgerAmount) * 100) / 100;
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
