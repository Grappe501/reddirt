"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CommunicationVariantType, CommsWorkbenchChannel } from "@prisma/client";
import {
  createCommunicationVariantAction,
  deleteCommunicationVariantAction,
  updateCommunicationVariantAction,
} from "@/app/admin/comms-workbench-variant-actions";
import { CommsWorkbenchReviewBlock } from "@/components/admin/comms-workbench/CommsWorkbenchReviewBlock";
import { COMMS_WORKBENCH_CHANNELS } from "@/lib/comms-workbench/constants";
import type { CommunicationDraftDetail, CommunicationVariantListItem } from "@/lib/comms-workbench/dto";
import { CommsStatusBadge } from "@/components/admin/comms-workbench/CommsStatusBadge";
import { COMMS_EMPTY } from "@/lib/comms-workbench/comms-section-copy";
import { formatCommsFieldLabel } from "@/lib/comms-workbench/ui-labels";

const VARIANT_TYPES = Object.values(CommunicationVariantType);

const label = "mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55";
const input = "w-full rounded border border-deep-soil/15 bg-white px-2 py-1.5 text-sm text-deep-soil";
const h3 = "font-heading text-xs font-bold text-deep-soil";
const subCard = "rounded border border-deep-soil/10 bg-cream-canvas/40 p-3";

type Props = { planId: string; drafts: CommunicationDraftDetail[] };

function draftLabel(d: CommunicationDraftDetail): string {
  return d.title?.trim() || formatCommsFieldLabel(d.channel);
}

function overrideSummary(v: CommunicationVariantListItem): string {
  const bits: string[] = [];
  if (v.subjectLineOverride) bits.push("subject");
  if (v.bodyCopyOverride) bits.push("body");
  if (v.ctaOverride) bits.push("cta");
  return bits.length ? bits.join(", ") : "none (uses draft)";
}

function effectiveChannel(d: CommunicationDraftDetail, v: CommunicationVariantListItem): string {
  return formatCommsFieldLabel(v.channelOverride ?? d.channel);
}

export function CommsPlanVariantsPanel({ planId, drafts }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const refresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  const variantCount = useMemo(() => drafts.reduce((n, d) => n + d.variants.length, 0), [drafts]);

  if (drafts.length === 0) {
    return (
      <div className="space-y-2">
        <p className="rounded border border-dashed border-deep-soil/15 bg-cream-canvas/50 px-3 py-3 text-sm text-deep-soil/60">
          Add at least one message draft before creating audience or channel variants.
        </p>
        <p className="text-[10px] text-deep-soil/45">plan: {planId}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-sm text-amber-900" role="alert">
          {error}
        </p>
      ) : null}

      <p className="text-[10px] leading-relaxed text-deep-soil/55">
        <strong className="text-deep-soil/70">Draft vs variant:</strong> the draft is the authored message. Each variant is a
        targeting/derivation row (audience, channel override, copy tweaks). Empty override fields mean “use the base draft” at
        read time—no merge engine in this packet.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] text-deep-soil/50">
          {variantCount} variant{variantCount === 1 ? "" : "s"} across {drafts.length} draft{drafts.length === 1 ? "" : "s"}.
        </p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setShowAdd((v) => !v);
          }}
          className="rounded border border-civic-slate/30 bg-civic-slate/10 px-2 py-1 text-xs font-semibold text-civic-slate"
        >
          {showAdd ? "Close add form" : "Add variant"}
        </button>
      </div>

      {showAdd ? (
        <AddVariantForm
          drafts={drafts}
          disabled={isPending}
          onDone={(ok) => {
            if (!ok) return;
            setError(null);
            setShowAdd(false);
            refresh();
          }}
          onError={setError}
        />
      ) : null}

      <div className="space-y-4">
        {drafts.map((d) => (
          <div key={d.id} className={subCard}>
            <p className={h3}>
              Base draft: {draftLabel(d)} · {formatCommsFieldLabel(d.channel)}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-deep-soil/45">{d.id}</p>
            {d.variants.length === 0 ? (
              <p className="mt-2 text-xs text-deep-soil/55">{COMMS_EMPTY.noVariants}</p>
            ) : (
              <ul className="mt-2 space-y-3">
                {d.variants.map((v) => (
                  <li key={v.id}>
                    <VariantEditCard draft={d} variant={v} disabled={isPending} onError={setError} onSaved={refresh} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AddVariantForm({
  drafts,
  disabled,
  onDone,
  onError,
}: {
  drafts: CommunicationDraftDetail[];
  disabled: boolean;
  onDone: (ok: boolean) => void;
  onError: (e: string | null) => void;
}) {
  const [draftId, setDraftId] = useState(drafts[0]?.id ?? "");

  return (
    <form
      className={`${subCard} space-y-2`}
      onSubmit={async (e) => {
        e.preventDefault();
        onError(null);
        const fd = new FormData(e.currentTarget);
        const ch = String(fd.get("channelOverride") ?? "").trim();
        const res = await createCommunicationVariantAction({
          communicationDraftId: String(fd.get("communicationDraftId") ?? "").trim(),
          variantType: String(fd.get("variantType") ?? "") as CommunicationVariantType,
          targetSegmentId: String(fd.get("targetSegmentId") ?? "").trim() || undefined,
          targetSegmentLabel: String(fd.get("targetSegmentLabel") ?? "").trim() || undefined,
          channelOverride: ch ? (ch as CommsWorkbenchChannel) : null,
          subjectLineOverride: String(fd.get("subjectLineOverride") ?? "").trim() || undefined,
          bodyCopyOverride: String(fd.get("bodyCopyOverride") ?? "").trim() || undefined,
          ctaOverride: String(fd.get("ctaOverride") ?? "").trim() || undefined,
        });
        if (!res.ok) {
          onError(res.error);
          onDone(false);
          return;
        }
        onDone(true);
      }}
    >
      <p className="font-heading text-sm font-bold text-deep-soil">New variant</p>
      <div>
        <label className={label} htmlFor="nv-draft">
          Base draft
        </label>
        <select
          id="nv-draft"
          name="communicationDraftId"
          className={input}
          value={draftId}
          onChange={(e) => setDraftId(e.target.value)}
          required
          disabled={disabled}
        >
          {drafts.map((d) => (
            <option key={d.id} value={d.id}>
              {draftLabel(d)} · {formatCommsFieldLabel(d.channel)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={label} htmlFor="nv-type">
          Variant type
        </label>
        <select id="nv-type" name="variantType" className={input} required disabled={disabled}>
          {VARIANT_TYPES.map((t) => (
            <option key={t} value={t}>
              {formatCommsFieldLabel(t)}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="nv-seg">
            Target segment id (optional)
          </label>
          <input id="nv-seg" name="targetSegmentId" className={input} disabled={disabled} placeholder="Opaque id / key" />
        </div>
        <div>
          <label className={label} htmlFor="nv-lab">
            Audience label (optional)
          </label>
          <input id="nv-lab" name="targetSegmentLabel" className={input} disabled={disabled} placeholder="e.g. North county volunteers" />
        </div>
      </div>
      <div>
        <label className={label} htmlFor="nv-ch">
          Channel override (optional)
        </label>
        <select id="nv-ch" name="channelOverride" className={input} disabled={disabled} defaultValue="">
          <option value="">— use draft channel —</option>
          {COMMS_WORKBENCH_CHANNELS.map((c) => (
            <option key={c} value={c}>
              {formatCommsFieldLabel(c)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={label} htmlFor="nv-subj">
          Subject override (optional)
        </label>
        <input id="nv-subj" name="subjectLineOverride" className={input} disabled={disabled} />
      </div>
      <div>
        <label className={label} htmlFor="nv-body">
          Body override (optional)
        </label>
        <textarea id="nv-body" name="bodyCopyOverride" className={`${input} min-h-[80px] font-mono text-xs`} disabled={disabled} />
      </div>
      <div>
        <label className={label} htmlFor="nv-cta">
          CTA override (optional)
        </label>
        <textarea id="nv-cta" name="ctaOverride" className={`${input} min-h-[48px] font-mono text-xs`} disabled={disabled} />
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="rounded border border-civic-slate/40 bg-civic-slate/15 px-3 py-1.5 text-sm font-semibold text-civic-slate"
      >
        Create variant
      </button>
    </form>
  );
}

function VariantEditCard({
  draft,
  variant: v,
  disabled,
  onError,
  onSaved,
}: {
  draft: CommunicationDraftDetail;
  variant: CommunicationVariantListItem;
  disabled: boolean;
  onError: (e: string | null) => void;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="rounded border border-deep-soil/12 bg-white p-2 text-sm">
      <CommsWorkbenchReviewBlock
        kind="variant"
        entityId={v.id}
        status={v.status}
        reviewDecision={v.reviewDecision}
        reviewNotes={v.reviewNotes}
        reviewRequestedAt={v.reviewRequestedAt}
        reviewRequestedBy={v.reviewRequestedBy}
        reviewedAt={v.reviewedAt}
        reviewedBy={v.reviewedBy}
        disabled={disabled}
      />
      <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-deep-soil">
            <span>{formatCommsFieldLabel(v.variantType)}</span>
            <CommsStatusBadge segment="variant" status={v.status} />
          </p>
          <p className="text-[10px] text-deep-soil/55">
            Target: {v.targetSegmentLabel?.trim() || "—"}{" "}
            {v.targetSegmentId ? <span className="font-mono">· id: {v.targetSegmentId}</span> : null}
          </p>
          <p className="text-[10px] text-deep-soil/55">
            Effective channel: {effectiveChannel(draft, v)} {" · "}Overrides: {overrideSummary(v)}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => {
              onError(null);
              setEditing((e) => !e);
            }}
            className="rounded border border-deep-soil/15 bg-cream-canvas px-2 py-0.5 text-xs font-semibold text-deep-soil"
          >
            {editing ? "Close" : "Edit"}
          </button>
        </div>
      </div>

      {editing ? (
        <form
          className="mt-2 space-y-2 border-t border-deep-soil/10 pt-2"
          onSubmit={async (e) => {
            e.preventDefault();
            onError(null);
            const fd = new FormData(e.currentTarget);
            const ch = String(fd.get("channelOverride") ?? "").trim();
            const res = await updateCommunicationVariantAction({
              id: v.id,
              variantType: String(fd.get("variantType") ?? "") as CommunicationVariantType,
              targetSegmentId: emptyToNullish(String(fd.get("targetSegmentId") ?? "")),
              targetSegmentLabel: emptyToNullish(String(fd.get("targetSegmentLabel") ?? "")),
              channelOverride: ch === "" ? null : (ch as CommsWorkbenchChannel),
              subjectLineOverride: emptyToNullish(String(fd.get("subjectLineOverride") ?? "")),
              bodyCopyOverride: emptyToNullish(String(fd.get("bodyCopyOverride") ?? "")),
              ctaOverride: emptyToNullish(String(fd.get("ctaOverride") ?? "")),
            });
            if (!res.ok) {
              onError(res.error);
              return;
            }
            setEditing(false);
            onSaved();
          }}
        >
          <div>
            <label className={label}>Variant type</label>
            <select name="variantType" className={input} defaultValue={v.variantType} required disabled={disabled}>
              {VARIANT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {formatCommsFieldLabel(t)}
                </option>
              ))}
            </select>
            <p className="mt-0.5 text-[10px] text-deep-soil/45">Status and review are managed in the review panel above.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className={label}>Target segment id</label>
              <input name="targetSegmentId" className={input} defaultValue={v.targetSegmentId ?? ""} disabled={disabled} />
            </div>
            <div>
              <label className={label}>Audience label</label>
              <input name="targetSegmentLabel" className={input} defaultValue={v.targetSegmentLabel ?? ""} disabled={disabled} />
            </div>
          </div>
          <div>
            <label className={label}>Channel override</label>
            <select name="channelOverride" className={input} defaultValue={v.channelOverride ?? ""} disabled={disabled}>
              <option value="">— use draft channel —</option>
              {COMMS_WORKBENCH_CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {formatCommsFieldLabel(c)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Subject override</label>
            <input name="subjectLineOverride" className={input} defaultValue={v.subjectLineOverride ?? ""} disabled={disabled} />
          </div>
          <div>
            <label className={label}>Body override</label>
            <textarea
              name="bodyCopyOverride"
              className={`${input} min-h-[80px] font-mono text-xs`}
              defaultValue={v.bodyCopyOverride ?? ""}
              disabled={disabled}
            />
          </div>
          <div>
            <label className={label}>CTA override</label>
            <textarea
              name="ctaOverride"
              className={`${input} min-h-[48px] font-mono text-xs`}
              defaultValue={v.ctaOverride ?? ""}
              disabled={disabled}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={disabled}
              className="rounded border border-civic-slate/40 bg-civic-slate/15 px-3 py-1 text-sm font-semibold text-civic-slate"
            >
              Save
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={async () => {
                if (!window.confirm("Delete this variant?")) return;
                onError(null);
                const res = await deleteCommunicationVariantAction({ id: v.id });
                if (!res.ok) {
                  onError(res.error);
                  return;
                }
                onSaved();
              }}
              className="rounded border border-red-900/20 bg-red-50 px-3 py-1 text-sm font-semibold text-red-900"
            >
              Delete
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

/** Map form string to `null` when clearing; use `undefined` only when you need “omit” in patch (not used here). */
function emptyToNullish(s: string): string | null {
  const t = s.trim();
  return t.length ? t : null;
}
