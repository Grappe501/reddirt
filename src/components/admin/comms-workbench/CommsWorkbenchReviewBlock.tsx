"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  CommunicationDraftStatus,
  CommunicationReviewDecision,
  CommunicationVariantStatus,
} from "@prisma/client";
import {
  approveCommunicationDraftAction,
  approveCommunicationVariantAction,
  rejectCommunicationDraftAction,
  rejectCommunicationVariantAction,
  requestChangesCommunicationDraftAction,
  requestChangesCommunicationVariantAction,
  requestCommunicationDraftReviewAction,
  requestCommunicationVariantReviewAction,
} from "@/app/admin/comms-workbench-review-actions";
import { CommsStatusBadge } from "@/components/admin/comms-workbench/CommsStatusBadge";
import type { CommunicationUserSummary } from "@/lib/comms-workbench/dto";
import { getReviewDecisionDisplay, commsStatusBadgeClass } from "@/lib/comms-workbench/status-display";
import { formatCommsFieldLabel } from "@/lib/comms-workbench/ui-labels";

const btn =
  "rounded border px-2 py-1 text-xs font-semibold transition disabled:opacity-50";
const noteInput = "mt-1 w-full rounded border border-deep-soil/15 bg-white px-2 py-1.5 text-xs text-deep-soil";

function variantInReview(s: CommunicationVariantStatus): boolean {
  return s === "READY_FOR_REVIEW" || s === "READY";
}

type DraftProps = {
  kind: "draft";
  entityId: string;
  status: CommunicationDraftStatus;
  reviewDecision: CommunicationReviewDecision | null;
  reviewNotes: string | null;
  reviewRequestedAt: string | null;
  reviewRequestedBy: CommunicationUserSummary | null;
  reviewedAt: string | null;
  reviewedBy: CommunicationUserSummary | null;
};

type VariantProps = {
  kind: "variant";
  entityId: string;
  status: CommunicationVariantStatus;
  reviewDecision: CommunicationReviewDecision | null;
  reviewNotes: string | null;
  reviewRequestedAt: string | null;
  reviewRequestedBy: CommunicationUserSummary | null;
  reviewedAt: string | null;
  reviewedBy: CommunicationUserSummary | null;
};

type Props = (DraftProps | VariantProps) & {
  disabled?: boolean;
};

export function CommsWorkbenchReviewBlock(props: Props) {
  const { kind, entityId, status, reviewDecision, reviewNotes, disabled: disabledProp } = props;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const disabled = Boolean(disabledProp) || pending;
  const [error, setError] = useState<string | null>(null);
  const [reqNote, setReqNote] = useState("");
  const [apprNote, setApprNote] = useState("");
  const [rejNote, setRejNote] = useState("");
  const [chgNote, setChgNote] = useState("");

  const refresh = () =>
    startTransition(() => {
      router.refresh();
    });

  const name = (u: CommunicationUserSummary | null) => u?.nameLabel ?? u?.email ?? "—";

  const showReadyBadge =
    kind === "draft" ? status === "APPROVED" : status === "APPROVED";
  const showGating = showReadyBadge;
  const decisionDisplay = reviewDecision != null ? getReviewDecisionDisplay(reviewDecision) : null;

  return (
    <div className="mt-2 space-y-2 rounded border border-deep-soil/10 bg-amber-50/40 p-2 text-sm">
      {error ? <p className="text-xs text-red-800">{error}</p> : null}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-deep-soil">
        <span className="font-bold text-deep-soil/70">Review</span>
        {kind === "draft" ? (
          <CommsStatusBadge segment="draft" status={status} />
        ) : (
          <CommsStatusBadge segment="variant" status={status} />
        )}
        {decisionDisplay ? (
          <span className={commsStatusBadgeClass(decisionDisplay.tone)} title={decisionDisplay.hint}>
            {decisionDisplay.label}
          </span>
        ) : null}
        {showGating ? (
          <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-900">
            Approved (not sent)
          </span>
        ) : null}
      </div>
      {props.reviewRequestedAt ? (
        <p className="text-[10px] text-deep-soil/65">
          Requested {new Date(props.reviewRequestedAt).toLocaleString()} · {name(props.reviewRequestedBy)}
        </p>
      ) : null}
      {props.reviewedAt ? (
        <p className="text-[10px] text-deep-soil/65">
          Last review {new Date(props.reviewedAt).toLocaleString()} · {name(props.reviewedBy)}
        </p>
      ) : null}
      {reviewNotes ? (
        <p className="whitespace-pre-wrap font-body text-xs text-deep-soil/80">
          <span className="font-semibold">Notes: </span>
          {reviewNotes}
        </p>
      ) : null}

      {kind === "draft" && (status === "DRAFT" || status === "REJECTED") ? (
        <div className="border-t border-deep-soil/10 pt-2">
          <p className="text-[10px] font-bold uppercase text-deep-soil/50">Request review</p>
          <textarea
            className={noteInput}
            rows={2}
            placeholder="Optional message to reviewers"
            value={reqNote}
            onChange={(e) => setReqNote(e.target.value)}
            disabled={disabled}
          />
          <button
            type="button"
            disabled={disabled}
            className={`${btn} border-civic-slate/30 bg-civic-slate/10 text-civic-slate mt-1`}
            onClick={async () => {
              setError(null);
              const r = await requestCommunicationDraftReviewAction({
                communicationDraftId: entityId,
                note: reqNote || undefined,
              });
              if (!r.ok) {
                setError(r.error);
                return;
              }
              setReqNote("");
              refresh();
            }}
          >
            Request review
          </button>
        </div>
      ) : null}

      {kind === "draft" && status === "READY_FOR_REVIEW" ? (
        <div className="space-y-2 border-t border-deep-soil/10 pt-2">
          <p className="text-[10px] font-bold uppercase text-deep-soil/50">Reviewer actions</p>
          <div>
            <span className="text-[10px] text-deep-soil/50">Approve (optional note)</span>
            <textarea className={noteInput} rows={1} value={apprNote} onChange={(e) => setApprNote(e.target.value)} disabled={disabled} />
            <button
              type="button"
              className={`${btn} border-emerald-300 bg-emerald-50 text-emerald-900 mt-1`}
              disabled={disabled}
              onClick={async () => {
                setError(null);
                const r = await approveCommunicationDraftAction({ communicationDraftId: entityId, note: apprNote || undefined });
                if (!r.ok) {
                  setError(r.error);
                  return;
                }
                setApprNote("");
                refresh();
              }}
            >
              Approve
            </button>
          </div>
          <div>
            <span className="text-[10px] text-deep-soil/50">Reject (note required)</span>
            <textarea className={noteInput} rows={2} value={rejNote} onChange={(e) => setRejNote(e.target.value)} disabled={disabled} required />
            <button
              type="button"
              className={`${btn} border-red-200 bg-red-50 text-red-900 mt-1`}
              disabled={disabled || !rejNote.trim()}
              title={!rejNote.trim() ? "Add a rejection note" : undefined}
              onClick={async () => {
                setError(null);
                const r = await rejectCommunicationDraftAction({ communicationDraftId: entityId, note: rejNote });
                if (!r.ok) {
                  setError(r.error);
                  return;
                }
                setRejNote("");
                refresh();
              }}
            >
              Reject
            </button>
          </div>
          <div>
            <span className="text-[10px] text-deep-soil/50">Request changes (note required)</span>
            <textarea className={noteInput} rows={2} value={chgNote} onChange={(e) => setChgNote(e.target.value)} disabled={disabled} required />
            <button
              type="button"
              className={`${btn} border-amber-200 bg-amber-50 text-amber-900 mt-1`}
              disabled={disabled || !chgNote.trim()}
              title={!chgNote.trim() ? "Add a note describing requested changes" : undefined}
              onClick={async () => {
                setError(null);
                const r = await requestChangesCommunicationDraftAction({ communicationDraftId: entityId, note: chgNote });
                if (!r.ok) {
                  setError(r.error);
                  return;
                }
                setChgNote("");
                refresh();
              }}
            >
              Request changes
            </button>
          </div>
        </div>
      ) : null}

      {kind === "variant" && (status === "DRAFT" || status === "REJECTED") ? (
        <div className="border-t border-deep-soil/10 pt-2">
          <p className="text-[10px] font-bold uppercase text-deep-soil/50">Request review</p>
          <textarea
            className={noteInput}
            rows={2}
            placeholder="Optional message to reviewers"
            value={reqNote}
            onChange={(e) => setReqNote(e.target.value)}
            disabled={disabled}
          />
          <button
            type="button"
            disabled={disabled}
            className={`${btn} border-civic-slate/30 bg-civic-slate/10 text-civic-slate mt-1`}
            onClick={async () => {
              setError(null);
              const r = await requestCommunicationVariantReviewAction({
                communicationVariantId: entityId,
                note: reqNote || undefined,
              });
              if (!r.ok) {
                setError(r.error);
                return;
              }
              setReqNote("");
              refresh();
            }}
          >
            Request review
          </button>
        </div>
      ) : null}

      {(kind === "draft" && status === "ARCHIVED") || (kind === "variant" && status === "ARCHIVED") ? (
        <p className="border-t border-deep-soil/10 pt-2 text-[10px] text-deep-soil/55">Archived in this workbench. Open a new draft or variant if you need a fresh review cycle.</p>
      ) : null}

      {kind === "variant" && variantInReview(status) ? (
        <div className="space-y-2 border-t border-deep-soil/10 pt-2">
          <p className="text-[10px] font-bold uppercase text-deep-soil/50">Reviewer actions</p>
          <div>
            <span className="text-[10px] text-deep-soil/50">Approve (optional note)</span>
            <textarea className={noteInput} rows={1} value={apprNote} onChange={(e) => setApprNote(e.target.value)} disabled={disabled} />
            <button
              type="button"
              className={`${btn} border-emerald-300 bg-emerald-50 text-emerald-900 mt-1`}
              disabled={disabled}
              onClick={async () => {
                setError(null);
                const r = await approveCommunicationVariantAction({
                  communicationVariantId: entityId,
                  note: apprNote || undefined,
                });
                if (!r.ok) {
                  setError(r.error);
                  return;
                }
                setApprNote("");
                refresh();
              }}
            >
              Approve
            </button>
          </div>
          <div>
            <span className="text-[10px] text-deep-soil/50">Reject (note required)</span>
            <textarea className={noteInput} rows={2} value={rejNote} onChange={(e) => setRejNote(e.target.value)} disabled={disabled} />
            <button
              type="button"
              className={`${btn} border-red-200 bg-red-50 text-red-900 mt-1`}
              disabled={disabled || !rejNote.trim()}
              title={!rejNote.trim() ? "Add a rejection note" : undefined}
              onClick={async () => {
                setError(null);
                const r = await rejectCommunicationVariantAction({ communicationVariantId: entityId, note: rejNote });
                if (!r.ok) {
                  setError(r.error);
                  return;
                }
                setRejNote("");
                refresh();
              }}
            >
              Reject
            </button>
          </div>
          <div>
            <span className="text-[10px] text-deep-soil/50">Request changes (note required)</span>
            <textarea className={noteInput} rows={2} value={chgNote} onChange={(e) => setChgNote(e.target.value)} disabled={disabled} />
            <button
              type="button"
              className={`${btn} border-amber-200 bg-amber-50 text-amber-900 mt-1`}
              disabled={disabled || !chgNote.trim()}
              title={!chgNote.trim() ? "Add a note describing requested changes" : undefined}
              onClick={async () => {
                setError(null);
                const r = await requestChangesCommunicationVariantAction({ communicationVariantId: entityId, note: chgNote });
                if (!r.ok) {
                  setError(r.error);
                  return;
                }
                setChgNote("");
                refresh();
              }}
            >
              Request changes
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
