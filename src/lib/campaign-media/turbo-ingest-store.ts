/**
 * Turbo Ingest proposal store (local JSON).
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { writeJsonAtomic } from "@/lib/campaign-media/evidence-store";
import {
  TURBO_INGEST_PROPOSALS_REL,
  type TurboIngestProposalStore,
  type TurboPhotoProposal,
} from "@/lib/campaign-media/turbo-ingest-types";

function abs(rel: string): string {
  return path.join(process.cwd(), rel);
}

export function emptyTurboIngestStore(): TurboIngestProposalStore {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    purpose:
      "Turbo Ingest proposals — AI/heuristic identify + website-fit rankings. Operator must apply; never auto-publish.",
    proposals: [],
  };
}

export function loadTurboIngestStore(): TurboIngestProposalStore {
  const p = abs(TURBO_INGEST_PROPOSALS_REL);
  if (!existsSync(p)) return emptyTurboIngestStore();
  try {
    const raw = JSON.parse(readFileSync(p, "utf8")) as Partial<TurboIngestProposalStore>;
    return {
      ...emptyTurboIngestStore(),
      ...raw,
      version: 1,
      proposals: Array.isArray(raw.proposals) ? raw.proposals : [],
    };
  } catch {
    return emptyTurboIngestStore();
  }
}

export function saveTurboIngestStore(store: TurboIngestProposalStore): void {
  writeJsonAtomic(TURBO_INGEST_PROPOSALS_REL, {
    ...store,
    version: 1,
    updatedAt: new Date().toISOString(),
  });
}

export function upsertTurboProposal(proposal: TurboPhotoProposal): void {
  const store = loadTurboIngestStore();
  const rest = store.proposals.filter((p) => p.photoId !== proposal.photoId);
  store.proposals = [proposal, ...rest].slice(0, 200);
  saveTurboIngestStore(store);
}

export function listPendingTurboProposals(): TurboPhotoProposal[] {
  return loadTurboIngestStore().proposals.filter((p) => p.status === "pending");
}

export function getTurboProposal(photoId: string): TurboPhotoProposal | null {
  return loadTurboIngestStore().proposals.find((p) => p.photoId === photoId) ?? null;
}
