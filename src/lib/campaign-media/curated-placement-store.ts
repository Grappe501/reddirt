/**
 * Persist curated placement proposals + undo snapshots.
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { writeJsonAtomic } from "@/lib/campaign-media/evidence-store";
import {
  CURATED_PLACEMENT_PROPOSALS_REL,
  type CuratedPlacementProposal,
  type CuratedPlacementStore,
  type CuratedPlacementUndoSnapshot,
} from "@/lib/campaign-media/curated-placement-types";

function abs(rel: string): string {
  return path.join(process.cwd(), rel);
}

export function emptyCuratedPlacementStore(): CuratedPlacementStore {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    purpose:
      "Curated homepage placement proposals — ordered ID diffs for HOMEPAGE_*. Apply only with confirmCurate; never silent.",
    proposals: [],
    undoSnapshots: [],
  };
}

export function loadCuratedPlacementStore(): CuratedPlacementStore {
  const p = abs(CURATED_PLACEMENT_PROPOSALS_REL);
  if (!existsSync(p)) return emptyCuratedPlacementStore();
  try {
    const raw = JSON.parse(readFileSync(p, "utf8")) as Partial<CuratedPlacementStore>;
    return {
      ...emptyCuratedPlacementStore(),
      ...raw,
      version: 1,
      proposals: Array.isArray(raw.proposals) ? raw.proposals : [],
      undoSnapshots: Array.isArray(raw.undoSnapshots) ? raw.undoSnapshots : [],
    };
  } catch {
    return emptyCuratedPlacementStore();
  }
}

export function saveCuratedPlacementStore(store: CuratedPlacementStore): void {
  writeJsonAtomic(CURATED_PLACEMENT_PROPOSALS_REL, {
    ...store,
    version: 1,
    updatedAt: new Date().toISOString(),
  });
}

export function upsertCuratedPlacementProposal(proposal: CuratedPlacementProposal): void {
  const store = loadCuratedPlacementStore();
  store.proposals = [proposal, ...store.proposals.filter((p) => p.id !== proposal.id)].slice(0, 40);
  saveCuratedPlacementStore(store);
}

export function getCuratedPlacementProposal(id: string): CuratedPlacementProposal | null {
  const tid = String(id ?? "").trim();
  if (!tid) return null;
  return loadCuratedPlacementStore().proposals.find((p) => p.id === tid) ?? null;
}

export function listPendingCuratedPlacementProposals(): CuratedPlacementProposal[] {
  return loadCuratedPlacementStore().proposals.filter((p) => p.status === "pending");
}

export function pushCuratedUndoSnapshot(snap: CuratedPlacementUndoSnapshot): void {
  const store = loadCuratedPlacementStore();
  store.undoSnapshots = [snap, ...store.undoSnapshots].slice(0, 20);
  saveCuratedPlacementStore(store);
}

export function getCuratedUndoSnapshot(id: string): CuratedPlacementUndoSnapshot | null {
  const tid = String(id ?? "").trim();
  if (!tid) return null;
  return loadCuratedPlacementStore().undoSnapshots.find((s) => s.id === tid) ?? null;
}
