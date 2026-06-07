/**
 * Phase 16 P4 — Session debrief capture persistence.
 */
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type SessionDebriefCapture = {
  captureId: string;
  capturedAt: string;
  feltRisky: string[];
  staffFollowUps: string[];
  encounterHint?: string;
};

export type SessionDebriefStateFile = {
  version: 1;
  updatedAt: string;
  preChecklistLastConfirmedAt?: string;
  preChecklistConfirmedIds: string[];
  captures: SessionDebriefCapture[];
};

const STATE_REL = path.join("data", "intelligence", "rehearsal-session-debrief-state.json");

export function sessionDebriefStatePath(root = process.cwd()): string {
  return path.join(root, STATE_REL);
}

export function loadSessionDebriefState(root = process.cwd()): SessionDebriefStateFile | null {
  const file = sessionDebriefStatePath(root);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as SessionDebriefStateFile;
  } catch {
    return null;
  }
}

export function saveSessionDebriefState(state: SessionDebriefStateFile, root = process.cwd()): void {
  const file = sessionDebriefStatePath(root);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function emptyState(): SessionDebriefStateFile {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    preChecklistConfirmedIds: [],
    captures: [],
  };
}

export function confirmPreStageChecklist(
  confirmedIds: string[],
  root = process.cwd(),
): SessionDebriefStateFile {
  const current = loadSessionDebriefState(root) ?? emptyState();
  const next: SessionDebriefStateFile = {
    ...current,
    updatedAt: new Date().toISOString(),
    preChecklistLastConfirmedAt: new Date().toISOString(),
    preChecklistConfirmedIds: confirmedIds,
  };
  saveSessionDebriefState(next, root);
  return next;
}

export function appendSessionDebriefCapture(
  input: {
    feltRisky: string[];
    staffFollowUps: string[];
    encounterHint?: string;
  },
  root = process.cwd(),
): SessionDebriefCapture {
  const current = loadSessionDebriefState(root) ?? emptyState();
  const capture: SessionDebriefCapture = {
    captureId: randomUUID(),
    capturedAt: new Date().toISOString(),
    feltRisky: input.feltRisky,
    staffFollowUps: input.staffFollowUps,
    encounterHint: input.encounterHint,
  };
  const next: SessionDebriefStateFile = {
    ...current,
    updatedAt: new Date().toISOString(),
    captures: [capture, ...current.captures].slice(0, 50),
  };
  saveSessionDebriefState(next, root);
  return capture;
}

export function countSessionDebriefCaptures(root = process.cwd()): number {
  return loadSessionDebriefState(root)?.captures.length ?? 0;
}
