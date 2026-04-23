"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CommsWorkbenchChannel,
  SocialMessageTacticMode,
  SocialMessageToneMode,
} from "@prisma/client";
import { createCommunicationDraftAction, updateCommunicationDraftAction } from "@/app/admin/comms-workbench-actions";
import { CommsWorkbenchReviewBlock } from "@/components/admin/comms-workbench/CommsWorkbenchReviewBlock";
import { COMMS_WORKBENCH_CHANNELS } from "@/lib/comms-workbench/constants";
import { COMMS_EMPTY } from "@/lib/comms-workbench/comms-section-copy";
import type { CommunicationDraftDetail } from "@/lib/comms-workbench/dto";
import { formatCommsFieldLabel } from "@/lib/comms-workbench/ui-labels";

const TONE_OPTIONS = Object.values(SocialMessageToneMode);
const TACTIC_OPTIONS = Object.values(SocialMessageTacticMode);

const label = "mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55";
const input = "w-full rounded border border-deep-soil/15 bg-white px-2 py-1.5 text-sm text-deep-soil";
const h3 = "font-heading text-xs font-bold text-deep-soil";
const subCard = "rounded border border-deep-soil/10 bg-cream-canvas/30 p-2";

function showEmailFields(ch: CommsWorkbenchChannel) {
  return ch === CommsWorkbenchChannel.EMAIL;
}
function showShortProminent(ch: CommsWorkbenchChannel) {
  return ch === CommsWorkbenchChannel.SMS;
}

type Props = { planId: string; drafts: CommunicationDraftDetail[] };

export function CommsPlanDraftsPanel({ planId, drafts: initialDrafts }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(initialDrafts[0]?.id ?? null);
  const [showAdd, setShowAdd] = useState(initialDrafts.length === 0);

  const refresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  const editing = initialDrafts.find((d) => d.id === editingId) ?? null;

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-sm text-amber-900" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Drafts (edit)</h2>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setShowAdd((v) => !v);
          }}
          className="rounded border border-civic-slate/30 bg-civic-slate/10 px-2 py-1 text-xs font-semibold text-civic-slate"
        >
          {showAdd ? "Close add form" : "Add draft"}
        </button>
      </div>

      {initialDrafts.length > 0 ? (
        <p className="text-[10px] text-deep-soil/50">
          Primary = one per channel. Marking a draft primary clears primary on other drafts in the same channel.
        </p>
      ) : null}

      {showAdd ? (
        <AddDraftForm
          planId={planId}
          disabled={isPending}
          onDone={(ok, newId) => {
            if (!ok) return;
            setError(null);
            setShowAdd(false);
            if (newId) setEditingId(newId);
            refresh();
          }}
          onError={setError}
        />
      ) : null}

      {initialDrafts.length === 0 && !showAdd ? (
        <p className="rounded border border-dashed border-deep-soil/15 bg-cream-canvas/50 px-3 py-3 text-sm text-deep-soil/60">
          {COMMS_EMPTY.noDrafts} Select <span className="font-semibold">Add draft</span> when you are ready.
        </p>
      ) : null}

      {initialDrafts.length > 0 ? (
        <div className="space-y-2">
          <p className={h3}>Select a draft to edit</p>
          <div className="flex flex-wrap gap-1">
            {initialDrafts.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setEditingId(d.id);
                  setError(null);
                }}
                className={`rounded border px-2 py-1 text-left text-xs font-medium transition ${
                  editingId === d.id
                    ? "border-civic-slate/50 bg-civic-slate/10 text-civic-slate"
                    : "border-deep-soil/10 bg-white text-deep-soil/80 hover:border-deep-soil/25"
                }`}
              >
                {d.title?.trim() || formatCommsFieldLabel(d.channel)}
                <span className="ml-1 text-[10px] text-deep-soil/45">
                  {formatCommsFieldLabel(d.channel)} {d.isPrimary ? "· primary" : ""}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {editing ? (
        <div className={subCard}>
          <p className="mb-1 text-[10px] text-deep-soil/50">Editing draft · {editing.id}</p>
          <CommsWorkbenchReviewBlock
            kind="draft"
            entityId={editing.id}
            status={editing.status}
            reviewDecision={editing.reviewDecision}
            reviewNotes={editing.reviewNotes}
            reviewRequestedAt={editing.reviewRequestedAt}
            reviewRequestedBy={editing.reviewRequestedBy}
            reviewedAt={editing.reviewedAt}
            reviewedBy={editing.reviewedBy}
            disabled={isPending}
          />
          <EditDraftForm
            key={editing.id}
            draft={editing}
            disabled={isPending}
            onDone={(ok) => {
              if (!ok) return;
              setError(null);
              refresh();
            }}
            onError={setError}
          />
          <div className="mt-2 rounded border border-deep-soil/8 bg-white/50 p-2 text-xs text-deep-soil/75">
            <p className="text-[10px] font-bold uppercase text-deep-soil/45">Read-only preview</p>
            {showEmailFields(editing.channel) && editing.subjectLine ? (
              <p className="mt-0.5 font-medium">Subject: {editing.subjectLine}</p>
            ) : null}
            <p className="mt-1 max-h-24 overflow-y-auto whitespace-pre-wrap">{editing.bodyCopy || "—"}</p>
            {editing.shortCopy ? (
              <p className="mt-1 text-deep-soil/60">
                <span className="font-semibold">Short: </span>
                {editing.shortCopy}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AddDraftForm({
  planId,
  disabled,
  onDone,
  onError,
}: {
  planId: string;
  disabled: boolean;
  onDone: (ok: boolean, newDraftId?: string) => void;
  onError: (e: string | null) => void;
}) {
  const [channel, setChannel] = useState<CommsWorkbenchChannel>(CommsWorkbenchChannel.EMAIL);
  return (
    <form
      className="space-y-2 rounded border border-civic-slate/20 bg-cream-canvas/50 p-3"
      onSubmit={async (e) => {
        e.preventDefault();
        onError(null);
        const fd = new FormData(e.currentTarget);
        const bodyCopy = String(fd.get("bodyCopy") ?? "").trim();
        const isPrimary = fd.get("isPrimary") === "on";
        const toneR = String(fd.get("messageToneMode") ?? "").trim();
        const tacR = String(fd.get("messageTacticMode") ?? "").trim();
        const res = await createCommunicationDraftAction({
          communicationPlanId: planId,
          channel: String(fd.get("channel") ?? "EMAIL") as CommsWorkbenchChannel,
          title: String(fd.get("title") ?? "") || undefined,
          subjectLine: String(fd.get("subjectLine") ?? "") || undefined,
          previewText: String(fd.get("previewText") ?? "") || undefined,
          bodyCopy,
          shortCopy: String(fd.get("shortCopy") ?? "") || undefined,
          messageToneMode: (toneR || undefined) as SocialMessageToneMode | undefined,
          messageTacticMode: (tacR || undefined) as SocialMessageTacticMode | undefined,
          isPrimary,
        });
        if (!res.ok) {
          onError(res.error);
          onDone(false);
          return;
        }
        onDone(true, res.draftId);
      }}
    >
      <p className="font-heading text-sm font-bold text-deep-soil">New draft</p>
      <div>
        <label className={label} htmlFor="new-channel">
          Channel
        </label>
        <select
          id="new-channel"
          name="channel"
          className={input}
          value={channel}
          onChange={(e) => setChannel(e.target.value as CommsWorkbenchChannel)}
          disabled={disabled}
        >
          {COMMS_WORKBENCH_CHANNELS.map((c) => (
            <option key={c} value={c}>
              {formatCommsFieldLabel(c)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={label} htmlFor="new-title">
          Title (optional)
        </label>
        <input id="new-title" name="title" className={input} disabled={disabled} />
      </div>
      {showEmailFields(channel) ? (
        <>
          <div>
            <label className={label} htmlFor="new-subj">
              Subject line
            </label>
            <input id="new-subj" name="subjectLine" className={input} disabled={disabled} />
          </div>
          <div>
            <label className={label} htmlFor="new-prev">
              Preview text
            </label>
            <input id="new-prev" name="previewText" className={input} disabled={disabled} />
          </div>
        </>
      ) : null}
      {showShortProminent(channel) ? (
        <div>
          <label className={label} htmlFor="new-short">
            Short copy (SMS)
          </label>
          <input id="new-short" name="shortCopy" className={input} disabled={disabled} maxLength={480} />
        </div>
      ) : null}
      <div>
        <label className={label} htmlFor="new-body">
          Body
        </label>
        <textarea id="new-body" name="bodyCopy" className={`${input} min-h-[120px] font-mono text-xs`} required disabled={disabled} />
      </div>
      <ToneTacticRow disabled={disabled} />
      <label className="flex items-center gap-2 text-sm text-deep-soil">
        <input type="checkbox" name="isPrimary" disabled={disabled} />
        Set as primary for this channel
      </label>
      <button
        type="submit"
        disabled={disabled}
        className="rounded border border-civic-slate/40 bg-civic-slate/15 px-3 py-1.5 text-sm font-semibold text-civic-slate"
      >
        Create draft
      </button>
    </form>
  );
}

function ToneTacticRow({ disabled, tone, tactic }: { disabled: boolean; tone?: string; tactic?: string }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <div>
        <label className={label} htmlFor="tone">
          Tone
        </label>
        <select id="tone" name="messageToneMode" className={input} defaultValue={tone ?? ""} disabled={disabled}>
          <option value="">(none)</option>
          {TONE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {formatCommsFieldLabel(t)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={label} htmlFor="tactic">
          Tactic
        </label>
        <select id="tactic" name="messageTacticMode" className={input} defaultValue={tactic ?? ""} disabled={disabled}>
          <option value="">(none)</option>
          {TACTIC_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {formatCommsFieldLabel(t)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function EditDraftForm({
  draft,
  disabled,
  onDone,
  onError,
}: {
  draft: CommunicationDraftDetail;
  disabled: boolean;
  onDone: (ok: boolean) => void;
  onError: (e: string | null) => void;
}) {
  const ch = draft.channel;
  return (
    <form
      className="space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        onError(null);
        const fd = new FormData(e.currentTarget);
        const bodyCopy = String(fd.get("bodyCopy") ?? "");
        const toneR = String(fd.get("messageToneMode") ?? "").trim();
        const tacR = String(fd.get("messageTacticMode") ?? "").trim();
        const res = await updateCommunicationDraftAction({
          id: draft.id,
          title: String(fd.get("title") ?? "") || undefined,
          subjectLine: String(fd.get("subjectLine") ?? "") || undefined,
          previewText: String(fd.get("previewText") ?? "") || undefined,
          bodyCopy,
          shortCopy: String(fd.get("shortCopy") ?? "") || undefined,
          messageToneMode: (toneR ? toneR : null) as SocialMessageToneMode | null,
          messageTacticMode: (tacR ? tacR : null) as SocialMessageTacticMode | null,
          isPrimary: fd.get("isPrimary") === "on",
        });
        if (!res.ok) {
          onError(res.error);
          onDone(false);
          return;
        }
        onDone(true);
      }}
    >
      <input type="hidden" name="id" value={draft.id} />
      <div>
        <label className={label} htmlFor="ed-title">
          Title
        </label>
        <input id="ed-title" name="title" className={input} defaultValue={draft.title ?? ""} disabled={disabled} />
      </div>
      {showEmailFields(ch) ? (
        <>
          <div>
            <label className={label} htmlFor="ed-subj">
              Subject line
            </label>
            <input
              id="ed-subj"
              name="subjectLine"
              className={input}
              defaultValue={draft.subjectLine ?? ""}
              disabled={disabled}
            />
          </div>
          <div>
            <label className={label} htmlFor="ed-prev">
              Preview text
            </label>
            <input
              id="ed-prev"
              name="previewText"
              className={input}
              defaultValue={draft.previewText ?? ""}
              disabled={disabled}
            />
          </div>
        </>
      ) : null}
      {showShortProminent(ch) ? (
        <div>
          <label className={label} htmlFor="ed-short">
            Short copy
          </label>
          <input
            id="ed-short"
            name="shortCopy"
            className={input}
            defaultValue={draft.shortCopy ?? ""}
            disabled={disabled}
            maxLength={480}
          />
        </div>
      ) : null}
      <div>
        <label className={label} htmlFor="ed-body">
          Body
        </label>
        <textarea
          id="ed-body"
          name="bodyCopy"
          className={`${input} min-h-[160px] font-mono text-xs`}
          defaultValue={draft.bodyCopy}
          required
          disabled={disabled}
        />
      </div>
      <ToneTacticRow
        disabled={disabled}
        tone={draft.messageToneMode ?? ""}
        tactic={draft.messageTacticMode ?? ""}
      />
      <p className="text-[10px] text-deep-soil/55">
        Status and review lifecycle are controlled with the <strong>Review</strong> panel above (request, approve, reject, request
        changes).
      </p>
      <label className="flex items-center gap-2 text-sm text-deep-soil">
        <input type="checkbox" name="isPrimary" defaultChecked={draft.isPrimary} disabled={disabled} />
        Primary for this channel
      </label>
      <button
        type="submit"
        disabled={disabled}
        className="rounded border border-civic-slate/40 bg-civic-slate/15 px-3 py-1.5 text-sm font-semibold text-civic-slate"
      >
        Save draft
      </button>
    </form>
  );
}
