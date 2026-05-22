"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { MessageStudioDraftListRow } from "@/lib/email-command-center/message-studio-drafts";
import type { MessageStudioDraftStatus } from "@prisma/client";
import {
  archiveServerMessageDraftAction,
  createMessageDraftRevisionAction,
  patchMessageStudioDraftWorkflowAction,
} from "@/app/admin/message-studio-draft-actions";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<MessageStudioDraftStatus, string> = {
  DRAFT: "Draft",
  NEEDS_REVIEW: "Needs review",
  IN_REVIEW: "In review",
  APPROVED_FOR_SEND_GOVERNANCE: "Approved for send governance",
  ARCHIVED: "Archived",
};

const GROUP_ORDER: MessageStudioDraftStatus[] = [
  "DRAFT",
  "NEEDS_REVIEW",
  "IN_REVIEW",
  "APPROVED_FOR_SEND_GOVERNANCE",
  "ARCHIVED",
];

const MS_PATH = "/admin/workbench/email-command-center/message-studio";

function formatShort(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function withinRecent(updatedAt: string, mode: "24h" | "7d" | "30d"): boolean {
  const t = new Date(updatedAt).getTime();
  if (Number.isNaN(t)) return false;
  const now = Date.now();
  const ms = mode === "24h" ? 864e5 : mode === "7d" ? 7 * 864e5 : 30 * 864e5;
  return now - t <= ms;
}

export type MessageStudioSharedDraftReviewQueueProps = {
  rows: MessageStudioDraftListRow[];
  onOpenDraft: (serverId: string) => void;
  pending: boolean;
};

function DraftCard({
  row,
  pending,
  onOpen,
  onError,
  onRefresh,
}: {
  row: MessageStudioDraftListRow;
  pending: boolean;
  onOpen: (id: string) => void;
  onError: (msg: string | null) => void;
  onRefresh: () => void;
}) {
  const [transition, startTransition] = useTransition();
  const busy = pending || transition;
  const [nextStatus, setNextStatus] = useState<MessageStudioDraftStatus>(row.status);

  useEffect(() => {
    setNextStatus(row.status);
  }, [row.status, row.id]);

  const applyStatus = () => {
    if (nextStatus === row.status) return;
    onError(null);
    if (nextStatus === "ARCHIVED" && !window.confirm("Archive this shared draft?")) return;
    const fd = new FormData();
    fd.set("serverDraftId", row.id);
    fd.set("nextStatus", nextStatus);
    startTransition(async () => {
      const res = await patchMessageStudioDraftWorkflowAction(fd);
      if (!res.ok) {
        onError(res.error);
        return;
      }
      onRefresh();
    });
  };

  const saveRevision = () => {
    const note = window.prompt("Revision note (stored in history only, no send):", "Review queue snapshot");
    if (note === null) return;
    onError(null);
    const fd = new FormData();
    fd.set("serverDraftId", row.id);
    fd.set("revisionNote", note.trim() || "Snapshot");
    startTransition(async () => {
      const res = await createMessageDraftRevisionAction(fd);
      if (!res.ok) {
        onError(res.error);
        return;
      }
      onRefresh();
    });
  };

  const archive = () => {
    if (!window.confirm("Archive this shared draft on the server?")) return;
    onError(null);
    const fd = new FormData();
    fd.set("serverDraftId", row.id);
    startTransition(async () => {
      const res = await archiveServerMessageDraftAction(fd);
      if (!res.ok) {
        onError(res.error);
        return;
      }
      onRefresh();
    });
  };

  return (
    <li className="rounded border border-violet-200/70 bg-white/95 p-2 shadow-sm">
      <p className="font-heading text-[11px] font-bold text-kelly-navy">{row.title || "Untitled"}</p>
      <p className="mt-0.5 text-[9px] text-kelly-muted">
        Type: <span className="font-semibold">{row.draftType || "—"}</span>
      </p>
      <p className="text-[9px] text-kelly-muted">Updated {formatShort(row.updatedAt)}</p>
      <p className="text-[9px] text-kelly-muted">Owner: {row.createdByLabel ?? "—"}</p>
      <p className="text-[9px] text-kelly-muted">Reviewer: {row.assignedReviewerLabel ?? "—"}</p>
      {row.reviewedByLabel ? (
        <p className="text-[9px] text-kelly-muted">Governance sign-off: {row.reviewedByLabel}</p>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-1">
        <button
          type="button"
          disabled={busy}
          onClick={() => onOpen(row.id)}
          className="rounded border border-emerald-400/50 bg-emerald-50/90 px-2 py-0.5 text-[9px] font-bold text-emerald-950 disabled:opacity-50"
        >
          Open draft
        </button>
        <Link
          href={`${MS_PATH}#send-packet-builder`}
          className="rounded border border-kelly-navy/25 bg-kelly-fog/80 px-2 py-0.5 text-[9px] font-bold text-kelly-navy"
        >
          Send packet
        </Link>
        <Link
          href={`/admin/workbench/email-command-center/send-execution?draftId=${encodeURIComponent(row.id)}#ops`}
          className="rounded border border-violet-300/60 bg-violet-50/90 px-2 py-0.5 text-[9px] font-bold text-violet-950"
        >
          Send execution
        </Link>
      </div>

      <div className="mt-2 flex flex-wrap items-end gap-1 border-t border-violet-100/80 pt-2">
        <label className="font-body text-[9px] text-kelly-text/75">
          Status
          <select
            className="mt-0.5 block max-w-[11rem] rounded border border-kelly-text/15 px-1 py-0.5 text-[10px]"
            value={nextStatus}
            onChange={(e) => setNextStatus(e.target.value as MessageStudioDraftStatus)}
            disabled={row.status === "ARCHIVED"}
          >
            {(Object.keys(STATUS_LABELS) as MessageStudioDraftStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={busy || row.status === "ARCHIVED" || nextStatus === row.status}
          onClick={applyStatus}
          className="rounded border border-violet-500/50 bg-violet-600/90 px-2 py-0.5 text-[9px] font-bold text-white disabled:opacity-40"
        >
          Update status
        </button>
        <button
          type="button"
          disabled={busy || row.status === "ARCHIVED"}
          onClick={saveRevision}
          className="rounded border border-kelly-text/20 bg-kelly-page px-2 py-0.5 text-[9px] font-semibold text-kelly-navy disabled:opacity-40"
        >
          Revision
        </button>
        <button
          type="button"
          disabled={busy || row.status === "ARCHIVED"}
          onClick={archive}
          className="rounded border border-rose-300/60 bg-rose-50/90 px-2 py-0.5 text-[9px] font-semibold text-rose-950 disabled:opacity-40"
        >
          Archive
        </button>
      </div>
    </li>
  );
}

export function MessageStudioSharedDraftReviewQueue({ rows, onOpenDraft, pending }: MessageStudioSharedDraftReviewQueueProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<MessageStudioDraftStatus | "ALL">("ALL");
  const [draftType, setDraftType] = useState<string>("");
  const [recent, setRecent] = useState<"ALL" | "24h" | "7d" | "30d">("ALL");
  const [ownerQuery, setOwnerQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const draftTypes = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) {
      if (r.draftType?.trim()) s.add(r.draftType.trim());
    }
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filtered = useMemo(() => {
    let out = rows;
    if (!showArchived) {
      out = out.filter((r) => r.status !== "ARCHIVED");
    }
    if (statusFilter !== "ALL") {
      out = out.filter((r) => r.status === statusFilter);
    }
    if (draftType) {
      out = out.filter((r) => (r.draftType || "").trim() === draftType);
    }
    if (recent !== "ALL") {
      out = out.filter((r) => withinRecent(r.updatedAt, recent));
    }
    const q = ownerQuery.trim().toLowerCase();
    if (q) {
      out = out.filter((r) => {
        const hay = [r.createdByLabel, r.assignedReviewerLabel, r.reviewedByLabel]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return out;
  }, [rows, showArchived, statusFilter, draftType, recent, ownerQuery]);

  const byStatus = useMemo(() => {
    const m = new Map<MessageStudioDraftStatus, MessageStudioDraftListRow[]>();
    for (const s of GROUP_ORDER) m.set(s, []);
    for (const r of filtered) {
      const list = m.get(r.status);
      if (list) list.push(r);
    }
    return m;
  }, [filtered]);

  const visibleGroups = useMemo(
    () => GROUP_ORDER.filter((s) => s !== "ARCHIVED" || showArchived),
    [showArchived],
  );

  const refresh = () => {
    setError(null);
    router.refresh();
  };

  return (
    <div id="review-queue" className="mt-4 scroll-mt-24 rounded-lg border border-violet-300/60 bg-white/90 p-3 shadow-sm">
      <div className="border-b border-violet-200/70 pb-2">
        <h3 className="font-heading text-sm font-bold text-kelly-navy">Review queue — shared drafts</h3>
        <p className="mt-1 font-body text-[10px] text-kelly-text/80">
          EMAIL-MESSAGE-STUDIO-REVIEW-QUEUE-1.0 — group by workflow status, filter, and quick actions. Still{" "}
          <strong>no send</strong>, no provider calls.
        </p>
      </div>

      {error ? (
        <p className="mt-2 rounded border border-rose-300/60 bg-rose-50 px-2 py-1 text-[10px] text-rose-950" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <label className="font-body text-[10px] text-kelly-text/80">
          Status
          <select
            className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as MessageStudioDraftStatus | "ALL")}
          >
            <option value="ALL">All (respect archived toggle)</option>
            {GROUP_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="font-body text-[10px] text-kelly-text/80">
          Draft type
          <select
            className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
            value={draftType}
            onChange={(e) => setDraftType(e.target.value)}
          >
            <option value="">All types</option>
            {draftTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="font-body text-[10px] text-kelly-text/80">
          Updated
          <select
            className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
            value={recent}
            onChange={(e) => setRecent(e.target.value as typeof recent)}
          >
            <option value="ALL">Any time</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </label>
        <label className="font-body text-[10px] text-kelly-text/80 sm:col-span-2">
          Owner / reviewer contains
          <input
            value={ownerQuery}
            onChange={(e) => setOwnerQuery(e.target.value)}
            placeholder="email fragment or name"
            className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
          />
        </label>
        <label className="flex items-end gap-2 font-body text-[10px] text-kelly-text/80">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="mt-1" />
          <span>Show archived in queue</span>
        </label>
      </div>

      <div
        className={cn(
          "mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2",
          visibleGroups.length >= 5 ? "lg:grid-cols-5" : "lg:grid-cols-4",
        )}
      >
        {visibleGroups.map((status) => {
          const list = byStatus.get(status) ?? [];
          return (
            <div key={status} className="min-w-0 rounded border border-violet-200/50 bg-violet-50/40 p-2">
              <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-violet-950">
                {STATUS_LABELS[status]}
                <span className="ml-1 tabular-nums text-kelly-navy">({list.length})</span>
              </p>
              <ul className="mt-2 max-h-[min(320px,42vh)] space-y-2 overflow-y-auto pr-0.5">
                {list.length === 0 ? (
                  <li className="rounded border border-dashed border-violet-200/80 bg-white/60 px-2 py-2 text-[9px] text-kelly-muted">
                    Nothing in this lane with current filters.
                    {status === "NEEDS_REVIEW" ? " Move a draft here from Draft or update status after editorial." : null}
                  </li>
                ) : (
                  list.map((row) => (
                    <DraftCard
                      key={row.id}
                      row={row}
                      pending={pending}
                      onOpen={onOpenDraft}
                      onError={setError}
                      onRefresh={refresh}
                    />
                  ))
                )}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-3 font-body text-[9px] text-kelly-muted">
        Send packet opens the anchor on this page — load the draft first so the builder reflects the right copy. Send execution
        links to <strong>#ops</strong> with <code className="text-[9px]">draftId</code> prefilled when approved.
      </p>
    </div>
  );
}
