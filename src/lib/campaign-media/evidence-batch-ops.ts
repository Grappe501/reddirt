/**
 * Pass 10 — unified Evidence Workbench batch operation history (read + publish undo).
 */

import { loadBatchPublishRuns, type BatchPublishRun } from "@/lib/campaign-media/batch-photo-publish";
import { loadMediaDerivativesLedger } from "@/lib/campaign-media/media-derivatives";

export type EvidenceBatchOpKind = "publish" | "derivatives";

export type EvidenceBatchOperation = {
  id: string;
  kind: EvidenceBatchOpKind;
  createdAt: string;
  label: string;
  detail: string;
  undoable: boolean;
  undoneAt?: string;
};

function publishLabel(run: BatchPublishRun): string {
  return `Publish · ${run.action} · ${run.appliedIds.length} photo(s)`;
}

export function listEvidenceBatchOperations(limit = 20): EvidenceBatchOperation[] {
  const max = Math.min(Math.max(limit, 1), 40);
  const publish = loadBatchPublishRuns().runs.map((r) => ({
    id: r.id,
    kind: "publish" as const,
    createdAt: r.createdAt,
    label: publishLabel(r),
    detail:
      (r.undoneAt ? `Undone ${r.undoneAt}` : "Active") +
      (r.albumNote ? ` · ${r.albumNote.trim()}` : "") +
      (r.beforeById ? "" : " · no undo snapshot"),
    undoable: !r.undoneAt && Boolean(r.beforeById && Object.keys(r.beforeById).length),
    undoneAt: r.undoneAt,
  }));

  const deriv = (loadMediaDerivativesLedger().batchRuns ?? []).map((r) => ({
    id: r.id,
    kind: "derivatives" as const,
    createdAt: r.createdAt,
    label: `Derivatives · ${r.kinds.join(", ")} · ${r.createdCount} created`,
    detail: `${r.photoIds.length} photo(s)` + (r.errorCount ? ` · ${r.errorCount} failed` : ""),
    undoable: false,
  }));

  return [...publish, ...deriv]
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, max);
}
