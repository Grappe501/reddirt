"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import type { MessageStudioLocalDraft } from "@/components/admin/email-command-center/message-studio-local-drafts";
import type { MessageStudioDraftListRow } from "@/lib/email-command-center/message-studio-drafts";
import type { MessageStudioDraftStatus } from "@prisma/client";
import { MessageStudioSharedDraftReviewQueue } from "@/components/admin/email-command-center/MessageStudioSharedDraftReviewQueue";
import {
  createMessageDraftRevisionAction,
  loadMessageStudioServerDraftPayloadAction,
  saveLocalDraftToServerAction,
  updateServerMessageDraftAction,
} from "@/app/admin/message-studio-draft-actions";

const STATUS_LABELS: Record<MessageStudioDraftStatus, string> = {
  DRAFT: "Draft",
  NEEDS_REVIEW: "Needs review",
  IN_REVIEW: "In review",
  APPROVED_FOR_SEND_GOVERNANCE: "Approved for send governance",
  ARCHIVED: "Archived",
};

export type MessageStudioSharedDraftsPanelProps = {
  initialServerRows: MessageStudioDraftListRow[];
  activeDraft: MessageStudioLocalDraft | null;
  editorDirty: boolean;
  onMergeLoadedLocalDraft: (draft: MessageStudioLocalDraft) => void;
  onAttachLinkedServerId: (serverDraftId: string) => void;
};

export function MessageStudioSharedDraftsPanel({
  initialServerRows,
  activeDraft,
  editorDirty,
  onMergeLoadedLocalDraft,
  onAttachLinkedServerId,
}: MessageStudioSharedDraftsPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [serverWorkflowStatus, setServerWorkflowStatus] = useState<MessageStudioDraftStatus>("DRAFT");
  const [revisionNoteAfterUpdate, setRevisionNoteAfterUpdate] = useState("");
  const [revisionOnlyNote, setRevisionOnlyNote] = useState("");

  const linkedRow = useMemo(
    () => initialServerRows.find((r) => r.id === activeDraft?.linkedServerDraftId) ?? null,
    [initialServerRows, activeDraft?.linkedServerDraftId],
  );

  useEffect(() => {
    if (linkedRow) setServerWorkflowStatus(linkedRow.status);
  }, [linkedRow]);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const handlePromoteLocal = () => {
    if (!activeDraft) return;
    setError(null);
    const fd = new FormData();
    fd.set("localDraftJson", JSON.stringify(activeDraft));
    startTransition(async () => {
      const res = await saveLocalDraftToServerAction(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onAttachLinkedServerId(res.serverDraftId);
      refresh();
    });
  };

  const handleLoadServer = (serverId: string) => {
    setError(null);
    if (
      editorDirty &&
      !window.confirm(
        "Replace the current local editor draft with this shared draft? You have local changes that are not yet saved to the shared copy.",
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await loadMessageStudioServerDraftPayloadAction(serverId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onMergeLoadedLocalDraft(res.draft);
      refresh();
    });
  };

  const handleUpdateLinked = () => {
    if (!activeDraft?.linkedServerDraftId) return;
    setError(null);
    const fd = new FormData();
    fd.set("serverDraftId", activeDraft.linkedServerDraftId);
    fd.set("localDraftJson", JSON.stringify(activeDraft));
    fd.set("serverWorkflowStatus", serverWorkflowStatus);
    if (revisionNoteAfterUpdate.trim()) fd.set("revisionNoteAfterUpdate", revisionNoteAfterUpdate.trim());
    startTransition(async () => {
      const res = await updateServerMessageDraftAction(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setRevisionNoteAfterUpdate("");
      refresh();
    });
  };

  const handleRevisionOnly = () => {
    if (!activeDraft?.linkedServerDraftId) return;
    setError(null);
    const fd = new FormData();
    fd.set("serverDraftId", activeDraft.linkedServerDraftId);
    fd.set("revisionNote", revisionOnlyNote.trim() || "Snapshot");
    startTransition(async () => {
      const res = await createMessageDraftRevisionAction(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setRevisionOnlyNote("");
      refresh();
    });
  };

  return (
    <div className="rounded-lg border border-violet-200/70 bg-violet-50/50 p-3 shadow-sm">
      <div className="border-b border-violet-200/60 pb-2">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">Shared drafts (server)</h2>
        <p className="mt-1 font-body text-[10px] text-kelly-text/80">
          EMAIL-MESSAGE-STUDIO-SERVER-DRAFTS-1.0 — campaign-visible drafts in Postgres.{" "}
          <strong>This still cannot send.</strong> Promote a local draft to share it with other operators and browsers.
        </p>
      </div>

      {error ? (
        <p className="mt-2 rounded border border-rose-300/60 bg-rose-50 px-2 py-1 font-body text-[10px] text-rose-950" role="alert">
          {error}
        </p>
      ) : null}

      <MessageStudioSharedDraftReviewQueue rows={initialServerRows} pending={pending} onOpenDraft={handleLoadServer} />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!activeDraft || pending}
          onClick={handlePromoteLocal}
          className="rounded border border-violet-400/60 bg-white px-2 py-1 text-[10px] font-bold text-violet-950 disabled:opacity-50"
        >
          Save current local draft to shared drafts
        </button>
        <p className="w-full font-body text-[9px] text-kelly-muted">
          This creates a shared campaign draft. It still cannot send.
        </p>
      </div>

      {initialServerRows.length === 0 ? (
        <p className="mt-3 rounded border border-violet-200/60 bg-violet-50/80 px-2 py-2 font-body text-[10px] text-kelly-navy" role="status">
          No shared drafts yet — promote a local draft below. The review queue will populate here for all operators.
        </p>
      ) : null}

      {activeDraft?.linkedServerDraftId ? (
        <div className="mt-3 space-y-2 rounded border border-violet-300/50 bg-white/95 p-2">
          <p className="font-heading text-[10px] font-bold uppercase text-violet-950">Linked shared draft</p>
          <p className="font-body text-[9px] text-kelly-muted">
            Server id <span className="font-mono">{activeDraft.linkedServerDraftId}</span> — update persists to the database
            for all operators (no send).
          </p>
          <label className="block font-body text-[10px] text-kelly-text/80">
            Server workflow status
            <select
              className="mt-0.5 w-full max-w-xs rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
              value={serverWorkflowStatus}
              onChange={(e) => setServerWorkflowStatus(e.target.value as MessageStudioDraftStatus)}
            >
              {(Object.keys(STATUS_LABELS) as MessageStudioDraftStatus[])
                .filter((s) => s !== "ARCHIVED")
                .map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
            </select>
          </label>
          <label className="block font-body text-[10px] text-kelly-text/80">
            Optional note stored with &quot;Update shared draft&quot; (creates revision)
            <input
              value={revisionNoteAfterUpdate}
              onChange={(e) => setRevisionNoteAfterUpdate(e.target.value)}
              className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
              placeholder="e.g. Applied comms feedback"
            />
          </label>
          <button
            type="button"
            disabled={pending}
            onClick={handleUpdateLinked}
            className="rounded border border-violet-500/50 bg-violet-600/90 px-2 py-1 text-[10px] font-bold text-white disabled:opacity-50"
          >
            Update shared draft
          </button>
          <div className="border-t border-violet-200/60 pt-2">
            <label className="block font-body text-[10px] text-kelly-text/80">
              Revision note (snapshot only)
              <input
                value={revisionOnlyNote}
                onChange={(e) => setRevisionOnlyNote(e.target.value)}
                className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
                placeholder="Short label for history"
              />
            </label>
            <button
              type="button"
              disabled={pending}
              onClick={handleRevisionOnly}
              className="mt-1 rounded border border-kelly-text/20 bg-kelly-page px-2 py-1 text-[10px] font-semibold text-kelly-navy disabled:opacity-50"
            >
              Save revision
            </button>
            <p className="mt-1 font-body text-[9px] text-kelly-muted">Revision is for review history only.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
