import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  KELLY_DILIGENCE_COUNSEL_FRAME,
  diligenceCompletionPctFromEntries,
  type DiligenceSearchEntry,
  type DiligenceSearchResult,
  type OpponentDiligenceLogFile,
} from "@/lib/intelligence/v4/kellyCourtDiligenceLogTypes";
import {
  getOpponentDiligenceSubject,
  type OpponentDiligenceSubjectId,
} from "@/lib/intelligence/v4/opponentDiligenceRegistry";

export {
  diligenceCompletionPctFromEntries,
  KELLY_DILIGENCE_COUNSEL_FRAME,
} from "@/lib/intelligence/v4/kellyCourtDiligenceLogTypes";

function writeJson(repoRoot: string, rel: string, data: unknown): void {
  const abs = path.join(repoRoot, rel);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function readJson<T>(repoRoot: string, rel: string): T | null {
  const abs = path.join(repoRoot, rel);
  if (!existsSync(abs)) return null;
  return JSON.parse(readFileSync(abs, "utf8")) as T;
}

export function loadOpponentDiligenceLog(
  subjectId: OpponentDiligenceSubjectId,
  repoRoot: string = process.cwd(),
): OpponentDiligenceLogFile | null {
  const subject = getOpponentDiligenceSubject(subjectId);
  if (!subject) return null;
  return readJson<OpponentDiligenceLogFile>(repoRoot, subject.logRel);
}

export function saveOpponentDiligenceLog(
  log: OpponentDiligenceLogFile,
  repoRoot: string = process.cwd(),
): void {
  const subject = getOpponentDiligenceSubject(log.subjectId);
  if (!subject) throw new Error(`Unknown diligence subject: ${log.subjectId}`);
  log.generatedAt = new Date().toISOString();
  writeJson(repoRoot, subject.logRel, log);
}

export function updateDiligenceEntry(
  subjectId: OpponentDiligenceSubjectId,
  entryId: string,
  patch: {
    result?: DiligenceSearchResult;
    staffInitials?: string | null;
    counselReviewed?: boolean;
    notes?: string;
    debateStageLine?: string | null;
    dateSearched?: string | null;
  },
  repoRoot: string = process.cwd(),
): { ok: true; log: OpponentDiligenceLogFile } | { ok: false; error: string } {
  const log = loadOpponentDiligenceLog(subjectId, repoRoot);
  if (!log) return { ok: false, error: "Diligence log not found" };

  const idx = log.entries.findIndex((e) => e.id === entryId);
  if (idx < 0) return { ok: false, error: "Entry not found" };

  const entry = log.entries[idx]!;
  const next: DiligenceSearchEntry = {
    ...entry,
    ...patch,
    dateSearched:
      patch.dateSearched !== undefined
        ? patch.dateSearched
        : patch.result && patch.result !== "NOT_SEARCHED" && patch.result !== "IN_PROGRESS"
          ? new Date().toISOString().slice(0, 10)
          : entry.dateSearched,
  };

  log.entries[idx] = next;
  saveOpponentDiligenceLog(log, repoRoot);
  return { ok: true, log };
}

export function diligenceCompletionPctForSubject(
  subjectId: OpponentDiligenceSubjectId,
  repoRoot?: string,
): number {
  const log = loadOpponentDiligenceLog(subjectId, repoRoot);
  if (!log) return 0;
  return diligenceCompletionPctFromEntries(log.entries);
}

export function allDiligenceCompletionSummary(repoRoot?: string): {
  subjectId: OpponentDiligenceSubjectId;
  displayName: string;
  pct: number;
  incomplete: number;
}[] {
  return (["kelly-grappe", "kim-hammer", "michael-packo"] as const).map((subjectId) => {
    const log = loadOpponentDiligenceLog(subjectId, repoRoot);
    const entries = log?.entries ?? [];
    const incomplete = entries.filter(
      (e) => e.result !== "CLEAN" && e.result !== "HIT_REQUIRES_COUNSEL",
    ).length;
    return {
      subjectId,
      displayName: log?.displayName ?? subjectId,
      pct: diligenceCompletionPctFromEntries(entries),
      incomplete,
    };
  });
}
