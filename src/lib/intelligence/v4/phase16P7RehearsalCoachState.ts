/**
 * Phase 16 P7 — Rehearsal coach assignment persistence.
 */
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { RehearsalEncounterId } from "@/lib/intelligence/v4/phase16P0SessionLauncher";
import type { DrillQueueId } from "@/lib/intelligence/v4/phase16P3DrillQueue";

export type RehearsalCoachDrillPin = {
  pinId: string;
  queueId: DrillQueueId;
  cardNumber: number;
  label: string;
  href: string;
  pinnedAt: string;
};

export type RehearsalCoachStateFile = {
  version: 1;
  updatedAt: string;
  assignedEncounterId: RehearsalEncounterId | null;
  assignedAt: string | null;
  pinnedDrills: RehearsalCoachDrillPin[];
};

export const PHASE16_P7_MAX_PINNED_DRILLS = 3;

const STATE_REL = path.join("data", "intelligence", "rehearsal-coach-state.json");

export function rehearsalCoachStatePath(root = process.cwd()): string {
  return path.join(root, STATE_REL);
}

export function loadRehearsalCoachState(root = process.cwd()): RehearsalCoachStateFile | null {
  const file = rehearsalCoachStatePath(root);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as RehearsalCoachStateFile;
  } catch {
    return null;
  }
}

export function saveRehearsalCoachState(state: RehearsalCoachStateFile, root = process.cwd()): void {
  const file = rehearsalCoachStatePath(root);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function emptyState(): RehearsalCoachStateFile {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    assignedEncounterId: null,
    assignedAt: null,
    pinnedDrills: [],
  };
}

export function assignRehearsalCoachEncounter(
  encounterId: RehearsalEncounterId,
  root = process.cwd(),
): RehearsalCoachStateFile {
  const current = loadRehearsalCoachState(root) ?? emptyState();
  const next: RehearsalCoachStateFile = {
    ...current,
    updatedAt: new Date().toISOString(),
    assignedEncounterId: encounterId,
    assignedAt: new Date().toISOString(),
  };
  saveRehearsalCoachState(next, root);
  return next;
}

export function pinRehearsalCoachDrill(
  pin: Omit<RehearsalCoachDrillPin, "pinId" | "pinnedAt">,
  root = process.cwd(),
): RehearsalCoachStateFile {
  const current = loadRehearsalCoachState(root) ?? emptyState();
  const entry: RehearsalCoachDrillPin = {
    ...pin,
    pinId: randomUUID(),
    pinnedAt: new Date().toISOString(),
  };
  const pinnedDrills = [
    entry,
    ...current.pinnedDrills.filter((p) => p.href !== pin.href),
  ].slice(0, PHASE16_P7_MAX_PINNED_DRILLS);
  const next: RehearsalCoachStateFile = {
    ...current,
    updatedAt: new Date().toISOString(),
    pinnedDrills,
  };
  saveRehearsalCoachState(next, root);
  return next;
}

export function unpinRehearsalCoachDrill(pinId: string, root = process.cwd()): RehearsalCoachStateFile {
  const current = loadRehearsalCoachState(root) ?? emptyState();
  const next: RehearsalCoachStateFile = {
    ...current,
    updatedAt: new Date().toISOString(),
    pinnedDrills: current.pinnedDrills.filter((p) => p.pinId !== pinId),
  };
  saveRehearsalCoachState(next, root);
  return next;
}

export function clearRehearsalCoachState(root = process.cwd()): RehearsalCoachStateFile {
  const next = emptyState();
  saveRehearsalCoachState(next, root);
  return next;
}

export function getAssignedRehearsalEncounterId(root = process.cwd()): RehearsalEncounterId | null {
  return loadRehearsalCoachState(root)?.assignedEncounterId ?? null;
}

export function listPinnedRehearsalDrills(root = process.cwd()): RehearsalCoachDrillPin[] {
  return loadRehearsalCoachState(root)?.pinnedDrills ?? [];
}
