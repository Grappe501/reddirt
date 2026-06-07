/**
 * Phase 16 P6 — Rehearsal session memory persistence.
 */
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { EncounterScenarioId } from "@/lib/intelligence/v4/phase16P2EncounterScenarios";
import type { DrillQueueId } from "@/lib/intelligence/v4/phase16P3DrillQueue";

export type RehearsalSessionKind = "drill-queue" | "ipad-drill" | "encounter";

export type RehearsalActiveSession = {
  sessionKind: RehearsalSessionKind;
  queueId?: DrillQueueId;
  encounterId?: EncounterScenarioId;
  cardNumber: number;
  totalSteps: number;
  label: string;
  continueHref: string;
  updatedAt: string;
};

export type RehearsalSessionHistoryEntry = {
  entryId: string;
  recordedAt: string;
  sessionKind: RehearsalSessionKind;
  label: string;
  stepLabel: string;
  continueHref: string;
};

export type RehearsalSessionStateFile = {
  version: 1;
  updatedAt: string;
  active: RehearsalActiveSession | null;
  history: RehearsalSessionHistoryEntry[];
};

export const PHASE16_P6_HISTORY_MAX = 20;

const STATE_REL = path.join("data", "intelligence", "rehearsal-session-state.json");

export function rehearsalSessionStatePath(root = process.cwd()): string {
  return path.join(root, STATE_REL);
}

export function loadRehearsalSessionState(root = process.cwd()): RehearsalSessionStateFile | null {
  const file = rehearsalSessionStatePath(root);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as RehearsalSessionStateFile;
  } catch {
    return null;
  }
}

export function saveRehearsalSessionState(state: RehearsalSessionStateFile, root = process.cwd()): void {
  const file = rehearsalSessionStatePath(root);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function emptyState(): RehearsalSessionStateFile {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    active: null,
    history: [],
  };
}

function appendHistory(
  history: RehearsalSessionHistoryEntry[],
  active: RehearsalActiveSession,
): RehearsalSessionHistoryEntry[] {
  const entry: RehearsalSessionHistoryEntry = {
    entryId: randomUUID(),
    recordedAt: active.updatedAt,
    sessionKind: active.sessionKind,
    label: active.label,
    stepLabel: `Step ${active.cardNumber}/${active.totalSteps}`,
    continueHref: active.continueHref,
  };
  return [entry, ...history.filter((h) => h.continueHref !== active.continueHref)].slice(0, PHASE16_P6_HISTORY_MAX);
}

export function persistRehearsalActiveSession(
  active: Omit<RehearsalActiveSession, "updatedAt">,
  root = process.cwd(),
): RehearsalSessionStateFile {
  const current = loadRehearsalSessionState(root) ?? emptyState();
  const nextActive: RehearsalActiveSession = {
    ...active,
    updatedAt: new Date().toISOString(),
  };
  const next: RehearsalSessionStateFile = {
    ...current,
    updatedAt: new Date().toISOString(),
    active: nextActive,
    history: appendHistory(current.history, nextActive),
  };
  saveRehearsalSessionState(next, root);
  return next;
}

export function clearRehearsalSessionMemory(root = process.cwd()): RehearsalSessionStateFile {
  const next: RehearsalSessionStateFile = {
    version: 1,
    updatedAt: new Date().toISOString(),
    active: null,
    history: [],
  };
  saveRehearsalSessionState(next, root);
  return next;
}

export function getRehearsalActiveSession(root = process.cwd()): RehearsalActiveSession | null {
  return loadRehearsalSessionState(root)?.active ?? null;
}

export function listRehearsalSessionHistory(root = process.cwd()): RehearsalSessionHistoryEntry[] {
  return loadRehearsalSessionState(root)?.history ?? [];
}
