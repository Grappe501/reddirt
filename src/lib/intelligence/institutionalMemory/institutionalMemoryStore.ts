import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type {
  DecisionLedgerFile,
  LessonsLearnedRegistryFile,
  RecommendationLedgerFile,
  WeeklyReflectionsFile,
  InstitutionalMemoryAuditLog,
} from "@/lib/intelligence/institutionalMemory/types";
import {
  DECISION_LEDGER_REL,
  LESSONS_LEARNED_REGISTRY_REL,
  RECOMMENDATION_LEDGER_REL,
  WEEKLY_REFLECTIONS_REL,
  INSTITUTIONAL_MEMORY_AUDIT_LOG_REL,
} from "@/lib/intelligence/institutionalMemory/types";

const GOVERNANCE = [
  "INTERNAL_USE_ONLY",
  "NON_PUBLISHABLE",
  "HUMAN_REVIEW_REQUIRED",
  "RECOMMENDATION_ONLY",
];

function absPath(repoRoot: string, rel: string): string {
  return path.join(repoRoot, rel);
}

function readJson<T>(repoRoot: string, rel: string): T {
  return JSON.parse(readFileSync(absPath(repoRoot, rel), "utf8")) as T;
}

function writeJson(repoRoot: string, rel: string, data: unknown): void {
  const abs = absPath(repoRoot, rel);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function emptyDecisionLedger(): DecisionLedgerFile {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    purpose: "Governed campaign decision institutional memory.",
    governanceDefaults: GOVERNANCE,
    entries: [],
  };
}

function emptyRecommendationLedger(): RecommendationLedgerFile {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    purpose: "Recommendation history for calibration — capture only, no autonomous execution.",
    governanceDefaults: GOVERNANCE,
    entries: [],
  };
}

function emptyLessonsRegistry(): LessonsLearnedRegistryFile {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    purpose: "Lessons, patterns, and campaign wisdom for future staff.",
    governanceDefaults: GOVERNANCE,
    entries: [],
  };
}

function emptyWeeklyReflections(): WeeklyReflectionsFile {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    purpose: "Human-triggered weekly intelligence reflections — no auto-send or publish.",
    governanceDefaults: GOVERNANCE,
    entries: [],
  };
}

function emptyAuditLog(): InstitutionalMemoryAuditLog {
  return {
    logVersion: "1",
    updatedAt: new Date().toISOString(),
    entries: [],
  };
}

export function loadDecisionLedger(repoRoot: string = process.cwd()): DecisionLedgerFile {
  const rel = DECISION_LEDGER_REL;
  if (!existsSync(absPath(repoRoot, rel))) return emptyDecisionLedger();
  return readJson<DecisionLedgerFile>(repoRoot, rel);
}

export function saveDecisionLedger(repoRoot: string, file: DecisionLedgerFile): void {
  file.updatedAt = new Date().toISOString();
  writeJson(repoRoot, DECISION_LEDGER_REL, file);
}

export function loadRecommendationLedger(repoRoot: string = process.cwd()): RecommendationLedgerFile {
  const rel = RECOMMENDATION_LEDGER_REL;
  if (!existsSync(absPath(repoRoot, rel))) return emptyRecommendationLedger();
  return readJson<RecommendationLedgerFile>(repoRoot, rel);
}

export function saveRecommendationLedger(repoRoot: string, file: RecommendationLedgerFile): void {
  file.updatedAt = new Date().toISOString();
  writeJson(repoRoot, RECOMMENDATION_LEDGER_REL, file);
}

export function loadLessonsLearnedRegistry(repoRoot: string = process.cwd()): LessonsLearnedRegistryFile {
  const rel = LESSONS_LEARNED_REGISTRY_REL;
  if (!existsSync(absPath(repoRoot, rel))) return emptyLessonsRegistry();
  return readJson<LessonsLearnedRegistryFile>(repoRoot, rel);
}

export function saveLessonsLearnedRegistry(repoRoot: string, file: LessonsLearnedRegistryFile): void {
  file.updatedAt = new Date().toISOString();
  writeJson(repoRoot, LESSONS_LEARNED_REGISTRY_REL, file);
}

export function loadWeeklyReflections(repoRoot: string = process.cwd()): WeeklyReflectionsFile {
  const rel = WEEKLY_REFLECTIONS_REL;
  if (!existsSync(absPath(repoRoot, rel))) return emptyWeeklyReflections();
  return readJson<WeeklyReflectionsFile>(repoRoot, rel);
}

export function saveWeeklyReflections(repoRoot: string, file: WeeklyReflectionsFile): void {
  file.updatedAt = new Date().toISOString();
  writeJson(repoRoot, WEEKLY_REFLECTIONS_REL, file);
}

export function loadInstitutionalMemoryAuditLog(repoRoot: string = process.cwd()): InstitutionalMemoryAuditLog {
  const rel = INSTITUTIONAL_MEMORY_AUDIT_LOG_REL;
  if (!existsSync(absPath(repoRoot, rel))) return emptyAuditLog();
  return readJson<InstitutionalMemoryAuditLog>(repoRoot, rel);
}

export function appendInstitutionalMemoryAudit(
  repoRoot: string,
  entry: Omit<InstitutionalMemoryAuditLog["entries"][number], "auditId" | "changedAt">,
): void {
  const log = loadInstitutionalMemoryAuditLog(repoRoot);
  log.entries.push({
    ...entry,
    auditId: `im-audit-${Date.now()}`,
    changedAt: new Date().toISOString(),
  });
  log.updatedAt = new Date().toISOString();
  writeJson(repoRoot, INSTITUTIONAL_MEMORY_AUDIT_LOG_REL, log);
}
