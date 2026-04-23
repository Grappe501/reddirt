"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CommunicationDraftStatus,
  CommunicationSendStatus,
  CommunicationSendType,
  CommunicationVariantStatus,
} from "@prisma/client";
import { queueCommunicationSendAction, unqueueCommunicationSendAction } from "@/app/admin/comms-workbench-send-queue-actions";
import {
  executeNextQueuedCommunicationSendInPlanAction,
  executeQueuedCommunicationSendAction,
} from "@/app/admin/comms-workbench-send-execution-actions";
import { retryCommunicationSendAction } from "@/app/admin/comms-workbench-send-retry-actions";
import {
  cancelCommunicationSendAction,
  createCommunicationSendAction,
  updateCommunicationSendAction,
} from "@/app/admin/comms-workbench-send-actions";
import { COMMS_WORKBENCH_CHANNELS, isExecutableCommsWorkbenchChannel } from "@/lib/comms-workbench/constants";
import { MAX_COMMS_SEND_OPERATOR_RETRIES } from "@/lib/comms-workbench/send-retry-policy";
import type { CommunicationDraftDetail, CommunicationPlanOpsSummary, CommunicationSendListItem } from "@/lib/comms-workbench/dto";
import { CommsStatusBadge } from "@/components/admin/comms-workbench/CommsStatusBadge";
import { COMMS_EMPTY } from "@/lib/comms-workbench/comms-section-copy";
import { getSendStatusDisplay } from "@/lib/comms-workbench/status-display";
import { formatCommsOperatorRetryStateLine, formatCommsOutcomeSummaryLine } from "@/lib/comms-workbench/outcome-display";
import { PLANNING_COMMUNICATION_SEND_STATUSES } from "@/lib/comms-workbench/send-schemas";
import { formatCommsFieldLabel } from "@/lib/comms-workbench/ui-labels";

const label = "mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55";
const input = "w-full rounded border border-deep-soil/15 bg-white px-2 py-1.5 text-sm text-deep-soil";
const btnPrimary =
  "rounded border border-civic-slate/30 bg-civic-slate/10 px-2 py-1 text-xs font-semibold text-civic-slate disabled:cursor-not-allowed disabled:opacity-50";
const btnSecondary =
  "rounded border border-deep-soil/15 bg-white px-2 py-1 text-xs font-semibold text-deep-soil/80 disabled:cursor-not-allowed disabled:opacity-50";
const h3 = "font-heading text-xs font-bold text-deep-soil";

const SEND_TYPE_OPTIONS = Object.values(CommunicationSendType);

type AssetKey = `draft:${string}` | `variant:${string}`;

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

function toIsoFromLocal(local: string): string | undefined {
  if (!local.trim()) return undefined;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

type Props = {
  planId: string;
  sends: CommunicationSendListItem[];
  drafts: CommunicationDraftDetail[];
  opsSummary: CommunicationPlanOpsSummary;
};

export function CommsPlanSendsPanel({ planId, sends: initialSends, drafts, opsSummary }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  /** One-shot destination for admin test execution; not stored on the send. */
  const [runDestBySendId, setRunDestBySendId] = useState<Record<string, string>>({});

  const [createAsset, setCreateAsset] = useState<AssetKey | "">("");

  const [cChannel, setCChannel] = useState(COMMS_WORKBENCH_CHANNELS[0]!);
  const [cSendType, setCSendType] = useState<CommunicationSendType | "">("");
  const [cSegment, setCSegment] = useState("");
  const [cSchedule, setCSchedule] = useState("");

  const approvedDrafts = useMemo(
    () => drafts.filter((d) => d.status === CommunicationDraftStatus.APPROVED),
    [drafts]
  );
  const approvedVariants = useMemo(
    () =>
      drafts.flatMap((d) =>
        d.variants
          .filter((v) => v.status === CommunicationVariantStatus.APPROVED)
          .map((v) => ({ v, draft: d }))
      ),
    [drafts]
  );

  const resolveAsset = useCallback(
    (key: AssetKey) => {
      if (key.startsWith("draft:")) {
        const id = key.slice(6);
        const d = approvedDrafts.find((x) => x.id === id);
        if (d) {
          return { kind: "draft" as const, draft: d, variant: null };
        }
      } else {
        const id = key.slice(8);
        const found = approvedVariants.find(({ v }) => v.id === id);
        if (found) {
          return { kind: "variant" as const, draft: found.draft, variant: found.v };
        }
      }
      return null;
    },
    [approvedDrafts, approvedVariants]
  );

  const onCreateAssetChange = (key: AssetKey | "") => {
    setCreateAsset(key);
    if (!key) return;
    const r = resolveAsset(key);
    if (!r) return;
    if (r.kind === "draft") {
      setCChannel(r.draft.channel);
      setCSegment("");
    } else {
      setCChannel(r.variant.channelOverride ?? r.draft.channel);
      setCSegment(r.variant.targetSegmentId ?? "");
    }
  };

  const refresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!createAsset) {
      setError("Select an approved draft or variant.");
      return;
    }
    const scheduledIso = cSchedule ? toIsoFromLocal(cSchedule) : undefined;
    if (cSchedule && !scheduledIso) {
      setError("Invalid date/time for schedule.");
      return;
    }
    const payload: Record<string, unknown> = {
      communicationPlanId: planId,
      channel: cChannel,
      sendType: cSendType || undefined,
      targetSegmentId: cSegment.trim() || undefined,
      scheduledAt: scheduledIso,
    };
    if (createAsset.startsWith("draft:")) {
      payload.communicationDraftId = createAsset.slice(6);
    } else {
      payload.communicationVariantId = createAsset.slice(8);
    }
    const res = await createCommunicationSendAction(payload);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setCSchedule("");
    setCreateAsset("");
    setCSendType("");
    setCSegment("");
    refresh();
  };

  const nonEditStatuses = new Set<CommunicationSendStatus>([
    CommunicationSendStatus.SENT,
    CommunicationSendStatus.PARTIALLY_SENT,
    CommunicationSendStatus.FAILED,
    CommunicationSendStatus.CANCELED,
  ]);

  const canEditSend = (s: CommunicationSendListItem) =>
    !nonEditStatuses.has(s.status) && s.status !== CommunicationSendStatus.SENDING;

  const canCancelSend = (s: CommunicationSendListItem) =>
    !(
      s.status === CommunicationSendStatus.SENT ||
      s.status === CommunicationSendStatus.PARTIALLY_SENT ||
      s.status === CommunicationSendStatus.FAILED ||
      s.status === CommunicationSendStatus.CANCELED
    );

  const canQueueSend = (s: CommunicationSendListItem) =>
    s.status === CommunicationSendStatus.DRAFT || s.status === CommunicationSendStatus.SCHEDULED;

  const canUnqueueSend = (s: CommunicationSendListItem) => s.status === CommunicationSendStatus.QUEUED;

  const canRunExecution = (s: CommunicationSendListItem) =>
    (s.status === CommunicationSendStatus.QUEUED || s.status === CommunicationSendStatus.SENDING) &&
    isExecutableCommsWorkbenchChannel(s.channel);

  const noQueueToRun = opsSummary.queuedSendCount === 0;
  const cannotCreate = !opsSummary.hasApprovedAssetForSend;

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-sm text-amber-900" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={btnSecondary}
          title={
            noQueueToRun
              ? COMMS_EMPTY.noQueuedToRun
              : "Claim and execute the oldest QUEUED send in this plan (same rules as Run execution)"
          }
          disabled={isPending || noQueueToRun}
          onClick={async () => {
            setError(null);
            const r = await executeNextQueuedCommunicationSendInPlanAction({ communicationPlanId: planId });
            if (!r.ok) {
              setError(r.error);
              return;
            }
            refresh();
          }}
        >
          Run next queued in this plan
        </button>
        {noQueueToRun ? (
          <span className="text-[10px] text-deep-soil/50">{COMMS_EMPTY.noQueuedToRun}</span>
        ) : null}
      </div>

      <p className="text-xs text-deep-soil/70">
        A planned send is created from <span className="font-semibold">one approved</span> draft or variant. Use{" "}
        <span className="font-semibold">Queue for execution</span> to mark a send as ready, then <span className="font-semibold">Run
        execution</span> to deliver via the configured provider for <span className="font-semibold">EMAIL</span> and{" "}
        <span className="font-semibold">SMS</span> (other channels are planning-only). Set a destination via{" "}
        <code className="rounded bg-cream-canvas px-0.5">metadata.commsExecution</code> (thread or TEST direct
        address) or use the one-shot field on &quot;Run execution&quot; for admin tests.
      </p>
      {cannotCreate ? (
        <p className="rounded border border-amber-100 bg-amber-50/50 px-3 py-2 text-sm text-amber-950" role="status">
          {COMMS_EMPTY.noApprovedForSend}
        </p>
      ) : null}

      <form onSubmit={onCreate} className="rounded border border-deep-soil/10 bg-cream-canvas/20 p-3 space-y-2">
        <p className={h3}>Create planned send</p>
        <div>
          <span className={label}>From approved asset</span>
          <select
            className={input}
            value={createAsset}
            onChange={(e) => onCreateAssetChange((e.target.value as AssetKey) || "")}
            disabled={isPending || cannotCreate}
          >
            <option value="">{cannotCreate ? "(approve a draft or variant first)" : "Select draft or variant…"}</option>
            {approvedDrafts.map((d) => (
              <option key={`d-${d.id}`} value={`draft:${d.id}` as AssetKey}>
                Draft — {d.title?.trim() || formatCommsFieldLabel(d.channel)} ({formatCommsFieldLabel(d.channel)}) ·
                ready
              </option>
            ))}
            {approvedVariants.map(({ v, draft: d }) => (
              <option key={`v-${v.id}`} value={`variant:${v.id}` as AssetKey}>
                Variant — {v.targetSegmentLabel?.trim() || "segment"} (base: {d.title?.trim() || "draft"}) · ready
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <span className={label}>Channel</span>
            <select
              className={input}
              value={cChannel}
              onChange={(e) => setCChannel(e.target.value as (typeof COMMS_WORKBENCH_CHANNELS)[number])}
              disabled={isPending}
            >
              {COMMS_WORKBENCH_CHANNELS.map((ch) => (
                <option key={ch} value={ch}>
                  {formatCommsFieldLabel(ch)}
                </option>
              ))}
            </select>
            <p className="mt-0.5 text-[10px] text-deep-soil/45">Prefilled from the asset; adjust only if the plan needs a different label.</p>
          </div>
          <div>
            <span className={label}>Send type (optional)</span>
            <select
              className={input}
              value={cSendType}
              onChange={(e) => setCSendType((e.target.value as CommunicationSendType) || ("" as const))}
              disabled={isPending}
            >
              <option value="">(none)</option>
              {SEND_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {formatCommsFieldLabel(t)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <span className={label}>Target segment id (optional)</span>
            <input
              className={input}
              value={cSegment}
              onChange={(e) => setCSegment(e.target.value)}
              disabled={isPending}
              placeholder="Opaque key / external id"
            />
          </div>
          <div>
            <span className={label}>Schedule (optional)</span>
            <input
              type="datetime-local"
              className={input}
              value={cSchedule}
              onChange={(e) => setCSchedule(e.target.value)}
              disabled={isPending}
            />
            <p className="mt-0.5 text-[10px] text-deep-soil/45">
              Leave empty for a planning DRAFT send. A future time becomes SCHEDULED.
            </p>
          </div>
        </div>
        <button
          type="submit"
          className={btnPrimary}
          title={cannotCreate ? COMMS_EMPTY.cannotCreateSend : undefined}
          disabled={isPending || cannotCreate || (opsSummary.hasApprovedAssetForSend && !createAsset)}
        >
          {isPending ? "…" : "Create planned send"}
        </button>
        {cannotCreate ? <p className="text-[10px] text-deep-soil/50">{COMMS_EMPTY.cannotCreateSend}</p> : null}
      </form>

      {opsSummary.hasExecutionFailures ? (
        <p className="rounded border border-rose-100/60 bg-rose-50/30 px-2 py-1.5 text-xs text-rose-950/90" role="status">
          {opsSummary.failedSendOperatorRetryableCount} failed send{opsSummary.failedSendOperatorRetryableCount === 1 ? "" : "s"}{" "}
          can be re-queued under policy. {opsSummary.failedSendOperatorRetriesExhaustedCount} hit the max operator retry
          limit ({MAX_COMMS_SEND_OPERATOR_RETRIES} re-queues). Fix recipients or content before re-queuing when blocked.
        </p>
      ) : null}

      {initialSends.length === 0 ? (
        <p className="rounded border border-dashed border-deep-soil/15 bg-cream-canvas/50 px-3 py-3 text-sm text-deep-soil/60">
          {COMMS_EMPTY.noSends}
        </p>
      ) : (
        <div className="space-y-2">
          <p className={h3}>Planned sends</p>
          <ul className="space-y-2">
            {initialSends.map((s) => {
              const outcomeLine = formatCommsOutcomeSummaryLine(s.outcomeSummaryJson, { includeWebhookPending: true });
              return (
              <li key={s.id} className="rounded border border-deep-soil/10 bg-white p-2 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-deep-soil">
                    {s.sourceKind === "variant" ? "Variant" : "Draft"} — {s.draftTitle?.trim() || "—"}
                    {s.variantLabel ? <span className="ml-1 text-xs font-normal text-deep-soil/70">({s.variantLabel})</span> : null}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {s.status === CommunicationSendStatus.QUEUED ? (
                      <span
                        className="rounded border border-civic-slate/25 bg-civic-slate/8 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-civic-slate"
                        title="Execution-ready; use Run execution for EMAIL/SMS"
                      >
                        Queued
                      </span>
                    ) : null}
                    <CommsStatusBadge segment="send" status={s.status} />
                  </div>
                </div>
                {s.queuedAt ? (
                  <p className="text-[10px] text-deep-soil/55">
                    Queued for execution: {new Date(s.queuedAt).toLocaleString()}
                    {s.queuedBy
                      ? ` · by ${(s.queuedBy.nameLabel ?? s.queuedBy.email) || s.queuedBy.email}`
                      : null}
                  </p>
                ) : null}
                {s.status === CommunicationSendStatus.QUEUED && !isExecutableCommsWorkbenchChannel(s.channel) ? (
                  <p className="text-[10px] text-amber-900/90">
                    This channel is planning-only here — no provider run for {formatCommsFieldLabel(s.channel)}. Unqueue if you
                    intended a different channel.
                  </p>
                ) : null}
                <p className="text-xs text-deep-soil/65">
                  {formatCommsFieldLabel(s.channel)}
                  {s.sendType ? ` · ${formatCommsFieldLabel(s.sendType)}` : ""}
                  {s.targetSegmentId ? ` · segment ${s.targetSegmentId}` : ""}
                </p>
                <p className="text-xs text-deep-soil/55">
                  Scheduled: {s.scheduledAt ? new Date(s.scheduledAt).toLocaleString() : "—"} · Sent:{" "}
                  {s.sentAt ? new Date(s.sentAt).toLocaleString() : "—"}
                </p>
                {s.providerMessageId ? (
                  <p className="text-[10px] text-deep-soil/50" title="Provider message id">
                    Provider: {s.providerMessageId}
                  </p>
                ) : null}
                {outcomeLine ? <p className="text-[10px] text-deep-soil/50">Outcome: {outcomeLine}</p> : null}
                {s.status === CommunicationSendStatus.FAILED || s.retryCount > 0 ? (
                  <p className="text-[10px] text-deep-soil/55" title="Packet 12A operator retry policy">
                    {formatCommsOperatorRetryStateLine(s.operatorRetry)}
                  </p>
                ) : null}
                {canRunExecution(s) ? (
                  <div className="mt-1 space-y-0.5 rounded border border-deep-soil/8 bg-cream-canvas/30 p-1.5">
                    <span className={label}>One-shot test destination (optional)</span>
                    <div className="flex flex-wrap gap-1.5">
                      <input
                        className={`${input} max-w-xs flex-1`}
                        placeholder={s.channel === "EMAIL" ? "to@email.com" : s.channel === "SMS" ? "Phone" : "N/A"}
                        value={runDestBySendId[s.id] ?? ""}
                        onChange={(e) => setRunDestBySendId((m) => ({ ...m, [s.id]: e.target.value }))}
                        disabled={isPending}
                      />
                      <button
                        type="button"
                        className={btnPrimary}
                        title="Claim and send via provider (idempotent; requires recipient metadata or this override)"
                        disabled={isPending}
                        onClick={async () => {
                          setError(null);
                          const raw = (runDestBySendId[s.id] ?? "").trim();
                          const payload: { communicationSendId: string; toEmail?: string; toPhone?: string } = {
                            communicationSendId: s.id,
                          };
                          if (raw) {
                            if (s.channel === "EMAIL") payload.toEmail = raw;
                            else if (s.channel === "SMS") payload.toPhone = raw;
                          }
                          const r = await executeQueuedCommunicationSendAction(payload);
                          if (!r.ok) {
                            setError(r.error);
                            return;
                          }
                          setRunDestBySendId((m) => {
                            const n = { ...m };
                            delete n[s.id];
                            return n;
                          });
                          refresh();
                        }}
                      >
                        Run execution
                      </button>
                    </div>
                  </div>
                ) : null}
                <div className="mt-1 flex flex-wrap gap-1">
                  {canQueueSend(s) ? (
                    <button
                      type="button"
                      className={btnPrimary}
                      title="Mark as ready for a future delivery layer (idempotent; does not send)"
                      disabled={isPending}
                      onClick={async () => {
                        setError(null);
                        const r = await queueCommunicationSendAction({ communicationSendId: s.id });
                        if (!r.ok) {
                          setError(r.error);
                          return;
                        }
                        refresh();
                      }}
                    >
                      Queue for execution
                    </button>
                  ) : null}
                  {canUnqueueSend(s) ? (
                    <button
                      type="button"
                      className={btnSecondary}
                      title="Back to planning (not execution-ready)"
                      disabled={isPending}
                      onClick={async () => {
                        setError(null);
                        const r = await unqueueCommunicationSendAction({ communicationSendId: s.id });
                        if (!r.ok) {
                          setError(r.error);
                          return;
                        }
                        refresh();
                      }}
                    >
                      Unqueue
                    </button>
                  ) : null}
                  {canEditSend(s) ? (
                    <button
                      type="button"
                      className={btnSecondary}
                      onClick={() => {
                        setError(null);
                        setEditingId((id) => (id === s.id ? null : s.id));
                      }}
                    >
                      {editingId === s.id ? "Close" : "Edit plan"}
                    </button>
                  ) : null}
                  {canCancelSend(s) ? (
                    <button
                      type="button"
                      className={btnSecondary}
                      disabled={isPending}
                      onClick={async () => {
                        setError(null);
                        const r = await cancelCommunicationSendAction({ communicationSendId: s.id });
                        if (!r.ok) {
                          setError(r.error);
                          return;
                        }
                        refresh();
                      }}
                    >
                      Cancel send
                    </button>
                  ) : null}
                  {s.status === CommunicationSendStatus.FAILED ? (
                    <button
                      type="button"
                      className={btnSecondary}
                      title={
                        s.operatorRetry.canRetry
                          ? `${COMMS_EMPTY.requeueAfterFix} Re-queues to QUEUED with retry tracking.`
                          : s.operatorRetry.retryBlockedReason || "Retry is not available."
                      }
                      disabled={isPending || !s.operatorRetry.canRetry}
                      onClick={async () => {
                        setError(null);
                        const r = await retryCommunicationSendAction({ communicationSendId: s.id });
                        if (!r.ok) {
                          setError(r.error);
                          return;
                        }
                        refresh();
                      }}
                    >
                      Re-queue (retry)
                    </button>
                  ) : null}
                </div>
                {editingId === s.id && canEditSend(s) ? (
                  <EditSendForm
                    send={s}
                    disabled={isPending}
                    onDone={(r) => {
                      if (r) refresh();
                    }}
                    onError={setError}
                    onClose={() => setEditingId(null)}
                  />
                ) : null}
              </li>
            );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function EditSendForm({
  send,
  disabled,
  onDone,
  onError,
  onClose,
}: {
  send: CommunicationSendListItem;
  disabled: boolean;
  onDone: (ok: boolean) => void;
  onError: (m: string | null) => void;
  onClose: () => void;
}) {
  const [schedule, setSchedule] = useState(() => toLocalInput(send.scheduledAt));
  const [seg, setSeg] = useState(send.targetSegmentId ?? "");
  const [stype, setStype] = useState<CommunicationSendType | "">(send.sendType ?? "");
  const [st, setSt] = useState(send.status);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    let scheduledAt: string | null;
    if (schedule.trim() === "") {
      scheduledAt = null;
    } else {
      const schedIso = toIsoFromLocal(schedule);
      if (!schedIso) {
        onError("Invalid date/time for schedule.");
        return;
      }
      scheduledAt = schedIso;
    }
    const r = await updateCommunicationSendAction({
      communicationSendId: send.id,
      scheduledAt,
      targetSegmentId: seg.trim() || null,
      sendType: stype || null,
      status: st,
    });
    if (!r.ok) {
      onError(r.error);
      return;
    }
    onDone(true);
    onClose();
  };

  return (
    <form onSubmit={submit} className="mt-2 space-y-2 border-t border-deep-soil/8 pt-2">
      <p className="text-[10px] font-bold uppercase text-deep-soil/45">Source asset is fixed; only plan fields are editable.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <span className={label}>Status</span>
          <select className={input} value={st} onChange={(e) => setSt(e.target.value as CommunicationSendStatus)} disabled={disabled}>
            {PLANNING_COMMUNICATION_SEND_STATUSES.map((v) => (
              <option key={v} value={v}>
                {getSendStatusDisplay(v).label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className={label}>Send type</span>
          <select
            className={input}
            value={stype}
            onChange={(e) => setStype((e.target.value as CommunicationSendType) || ("" as const))}
            disabled={disabled}
          >
            <option value="">(none)</option>
            {SEND_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {formatCommsFieldLabel(t)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <span className={label}>Schedule</span>
        <input
          type="datetime-local"
          className={input}
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
          disabled={disabled}
        />
        <p className="text-[10px] text-deep-soil/45">Clear to store an unscheduled DRAFT (status will move to DRAFT if needed).</p>
      </div>
      <div>
        <span className={label}>Target segment id</span>
        <input className={input} value={seg} onChange={(e) => setSeg(e.target.value)} disabled={disabled} />
      </div>
      <div className="flex gap-1">
        <button type="submit" className={btnPrimary} disabled={disabled}>
          Save
        </button>
        <button type="button" className={btnSecondary} onClick={onClose} disabled={disabled}>
          Dismiss
        </button>
      </div>
    </form>
  );
}
