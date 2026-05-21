import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import type { AgentMemoryType } from "../memory/agent-memory-write-planner";

export type MemoryReviewStatus = "pending" | "approved" | "rejected" | "hold";

export type MemoryReviewRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: MemoryReviewStatus;
  memoryType: AgentMemoryType;
  sourceObservationId?: string;
  suggestedStorageTarget: string;
  riskLevel: string;
  reason: string;
  reviewNote?: string;
  reviewedBy?: string;
};

const REL = "data/campaign-events/agent-memory-review.json";

function filePath(repoRoot?: string) {
  return path.join(repoRoot ?? process.cwd(), REL);
}

export function loadMemoryReviewQueue(repoRoot?: string): MemoryReviewRecord[] {
  const p = filePath(repoRoot);
  if (!existsSync(p)) return [];
  try {
    const raw = JSON.parse(readFileSync(p, "utf8"));
    return Array.isArray(raw?.candidates) ? raw.candidates : Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function save(queue: MemoryReviewRecord[], repoRoot?: string) {
  const p = filePath(repoRoot);
  const dir = path.dirname(p);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(p, JSON.stringify({ candidates: queue }, null, 2), "utf8");
}

export function upsertMemoryCandidate(
  partial: Omit<MemoryReviewRecord, "id" | "createdAt" | "updatedAt" | "status"> & {
    id?: string;
    status?: MemoryReviewStatus;
  },
  repoRoot?: string,
): MemoryReviewRecord {
  const queue = loadMemoryReviewQueue(repoRoot);
  const now = new Date().toISOString();
  const existing = partial.id ? queue.find((q) => q.id === partial.id) : undefined;
  if (existing) {
    const updated = { ...existing, ...partial, updatedAt: now };
    save(queue.map((q) => (q.id === existing.id ? updated : q)), repoRoot);
    return updated;
  }
  const rec: MemoryReviewRecord = {
    id: partial.id ?? `mem_${Date.now().toString(36)}`,
    createdAt: now,
    updatedAt: now,
    status: partial.status ?? "pending",
    memoryType: partial.memoryType,
    sourceObservationId: partial.sourceObservationId,
    suggestedStorageTarget: partial.suggestedStorageTarget,
    riskLevel: partial.riskLevel,
    reason: partial.reason,
    reviewNote: partial.reviewNote,
    reviewedBy: partial.reviewedBy,
  };
  save([...queue, rec].slice(-100), repoRoot);
  return rec;
}

export function setMemoryReviewStatus(
  id: string,
  status: MemoryReviewStatus,
  actor: string,
  note?: string,
  repoRoot?: string,
): MemoryReviewRecord | null {
  const queue = loadMemoryReviewQueue(repoRoot);
  const idx = queue.findIndex((q) => q.id === id);
  if (idx < 0) return null;
  const updated: MemoryReviewRecord = {
    ...queue[idx],
    status,
    reviewedBy: actor,
    reviewNote: note?.trim() || queue[idx].reviewNote,
    updatedAt: new Date().toISOString(),
  };
  queue[idx] = updated;
  save(queue, repoRoot);
  return updated;
}
