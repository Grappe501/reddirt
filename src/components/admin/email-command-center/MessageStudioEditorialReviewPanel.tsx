"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  CLAIM_SOURCE_ITEMS,
  COMPLIANCE_REMINDER_ITEMS,
  computeEditorialBlockers,
  computeEditorialReadinessTier,
  EDITORIAL_REVIEW_OWNER_OPTIONS,
  EDITORIAL_REVIEW_STATUS_OPTIONS,
  inferFutureSendRail,
  VOICE_AUDIENCE_ITEMS,
  type EditorialClaimSourceStatus,
  type EditorialReadinessTier,
  type EditorialVoiceAudienceStatus,
  type MessageStudioEditorialReviewOwner,
  type MessageStudioEditorialReviewStatus,
} from "@/lib/email-command-center/message-studio-editorial-review-model";
import type { MessageStudioLocalDraft } from "@/components/admin/email-command-center/message-studio-local-drafts";
import { AUDIENCE_FRAMES, ISSUE_FRAMES, TONE_PROFILES } from "@/lib/email-command-center/campaign-voice";
import { getTemplateById, MESSAGE_TEMPLATE_CATEGORY_LABELS } from "@/lib/email-command-center/message-templates";

const CLAIM_STATUS_OPTIONS: { value: EditorialClaimSourceStatus; label: string }[] = [
  { value: "clear", label: "Clear" },
  { value: "needs_source", label: "Needs source" },
  { value: "remove", label: "Remove" },
  { value: "needs_approval", label: "Needs approval" },
];

const VOICE_STATUS_OPTIONS: { value: EditorialVoiceAudienceStatus; label: string }[] = [
  { value: "clear", label: "Clear" },
  { value: "needs_attention", label: "Needs attention" },
  { value: "n_a", label: "N/A" },
];

function tierLabel(t: EditorialReadinessTier): string {
  switch (t) {
    case "missing_basics":
      return "Missing basics";
    case "needs_review":
      return "Needs review";
    case "review_ready":
      return "Review-ready";
    case "send_governance_ready":
      return "Send-governance-ready";
    default:
      return t;
  }
}

function tierClass(t: EditorialReadinessTier): string {
  switch (t) {
    case "send_governance_ready":
      return "border-emerald-400/60 bg-emerald-50/90 text-emerald-950";
    case "review_ready":
      return "border-kelly-forest/35 bg-emerald-50/60 text-emerald-950";
    case "needs_review":
      return "border-amber-300/70 bg-amber-50/90 text-amber-950";
    default:
      return "border-rose-200/70 bg-rose-50/80 text-rose-950";
  }
}

type Props = {
  activeDraft: MessageStudioLocalDraft;
  patchActive: (patch: Partial<MessageStudioLocalDraft>) => void;
};

export function MessageStudioEditorialReviewPanel({ activeDraft, patchActive }: Props) {
  const tier = useMemo(() => computeEditorialReadinessTier(activeDraft), [activeDraft]);
  const blockers = useMemo(() => computeEditorialBlockers(activeDraft), [activeDraft]);
  const lastTemplate = useMemo(() => {
    const id = activeDraft.templateIdLastApplied?.trim();
    if (!id) return null;
    return getTemplateById(id) ?? null;
  }, [activeDraft.templateIdLastApplied]);

  const toneLabel = TONE_PROFILES.find((x) => x.id === activeDraft.campaignVoice.toneProfileId)?.label ?? "—";
  const issueLabel = ISSUE_FRAMES.find((x) => x.id === activeDraft.campaignVoice.issueFrameId)?.label ?? "—";
  const audienceLabel =
    AUDIENCE_FRAMES.find((f) => f.id === activeDraft.campaignVoice.audienceFrameId)?.label ?? "—";

  const setClaim = (id: string, value: EditorialClaimSourceStatus) => {
    patchActive({
      editorialClaimSourceChecklist: { ...activeDraft.editorialClaimSourceChecklist, [id]: value },
    });
  };

  const setVoice = (id: string, value: EditorialVoiceAudienceStatus) => {
    patchActive({
      editorialVoiceAudienceChecklist: { ...activeDraft.editorialVoiceAudienceChecklist, [id]: value },
    });
  };

  const toggleCompliance = (id: string) => {
    patchActive({
      editorialComplianceChecklist: {
        ...activeDraft.editorialComplianceChecklist,
        [id]: !activeDraft.editorialComplianceChecklist[id],
      },
    });
  };

  return (
    <section
      id="editorial-review-desk"
      className="rounded-lg border border-slate-300/80 bg-slate-50/90 p-3 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-200/80 pb-2">
        <div>
          <h2 className="font-heading text-sm font-bold text-slate-900">Editorial Review Desk</h2>
          <p className="mt-1 max-w-3xl font-body text-[10px] text-slate-700">
            EMAIL-EDITORIAL-REVIEW-DESK-1.0 — production review before{" "}
            <Link href="/admin/workbench/email-command-center/send-execution" className="font-bold underline">
              Send Execution Governance
            </Link>
            . <strong>No send</strong>, <strong>no DB</strong>, <strong>no legal compliance claim</strong> — operator
            discipline and local <code className="rounded bg-white/80 px-0.5 text-[9px]">localStorage</code> only.
          </p>
        </div>
        <div className={`rounded border px-2 py-1 text-center text-[10px] font-bold ${tierClass(tier)}`}>
          <div className="text-[8px] font-semibold uppercase tracking-wide opacity-80">Readiness</div>
          {tierLabel(tier)}
        </div>
      </div>

      <div className="mt-2 rounded border border-slate-200/80 bg-white/90 p-2 text-[10px] text-slate-800">
        <p className="font-bold text-slate-900">Campaign Voice (reference)</p>
        <p className="mt-1">
          <span className="font-semibold">Tone:</span> {toneLabel} ·<span className="font-semibold"> Issue:</span>{" "}
          {issueLabel} ·<span className="font-semibold"> Audience frame:</span> {audienceLabel}
        </p>
        <p className="mt-1 text-[9px] text-slate-600">
          Voice / audience checklists below should agree with these selections and the draft body.
        </p>
      </div>

      {lastTemplate ? (
        <div className="mt-2 rounded border border-violet-200/80 bg-violet-50/90 p-2 text-[10px] text-violet-950">
          <p className="font-bold text-violet-950">Production template (last applied)</p>
          <p className="mt-0.5">
            <span className="font-semibold">{lastTemplate.label}</span>{" "}
            <span className="font-mono text-[9px] opacity-80">({lastTemplate.id})</span>
          </p>
          <p className="mt-1 text-[9px] text-violet-900/90">
            {MESSAGE_TEMPLATE_CATEGORY_LABELS[lastTemplate.category]} · risk{" "}
            <span className="font-semibold">{lastTemplate.riskLevel}</span> · approver track{" "}
            <span className="font-semibold">{lastTemplate.approvalLevel.replace(/_/g, " ")}</span>
          </p>
          <p className="mt-1 text-[9px] leading-snug text-violet-900/85">
            <span className="font-semibold">Review:</span> {lastTemplate.reviewNotes}
          </p>
        </div>
      ) : null}

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="space-y-2 rounded border border-slate-200/80 bg-white/95 p-2">
          <h3 className="font-heading text-[10px] font-bold uppercase text-slate-600">1. Review status</h3>
          <label className="block text-[10px] text-slate-700">
            Status
            <select
              value={activeDraft.editorialReviewStatus}
              onChange={(e) =>
                patchActive({ editorialReviewStatus: e.target.value as MessageStudioEditorialReviewStatus })
              }
              className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1 text-[11px]"
            >
              {EDITORIAL_REVIEW_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[10px] text-slate-700">
            Review owner (routing)
            <select
              value={activeDraft.editorialReviewOwner}
              onChange={(e) =>
                patchActive({ editorialReviewOwner: e.target.value as MessageStudioEditorialReviewOwner })
              }
              className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1 text-[11px]"
            >
              {EDITORIAL_REVIEW_OWNER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[10px] text-slate-700">
            Review notes (saved on this draft)
            <textarea
              value={activeDraft.editorialReviewNotes}
              onChange={(e) => patchActive({ editorialReviewNotes: e.target.value })}
              rows={4}
              className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1 font-mono text-[11px]"
              placeholder="Internal editorial thread — not shared server-side."
            />
          </label>
        </div>

        <div className="space-y-2 rounded border border-slate-200/80 bg-white/95 p-2">
          <h3 className="font-heading text-[10px] font-bold uppercase text-slate-600">E. Send readiness (advisory)</h3>
          <p className="text-[9px] text-slate-600">
            Derived from subject, body, CTA, audience note, approval owner, governance acknowledgment, claim/source
            rows, voice rows, compliance acknowledgments, and editorial status. <strong>Not</strong> a legal signoff.
          </p>
          <ul className="list-inside list-disc text-[10px] text-slate-800">
            <li>
              <span className="font-semibold">Tier:</span> {tierLabel(tier)}
            </li>
            <li>
              <span className="font-semibold">Workflow approval status (draft):</span>{" "}
              {activeDraft.approvalStatus.replace(/_/g, " ")}
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-3 rounded border border-slate-200/80 bg-white/95 p-2">
        <h3 className="font-heading text-[10px] font-bold uppercase text-slate-600">B. Claim / source checklist</h3>
        <p className="mt-1 text-[9px] text-slate-600">
          No automated fact-checking — operators disposition each row. Use{" "}
          <span className="font-semibold">Needs source</span> until documentation exists.
        </p>
        <ul className="mt-2 space-y-2">
          {CLAIM_SOURCE_ITEMS.map((item) => (
            <li key={item.id} className="rounded border border-slate-100 bg-slate-50/80 px-2 py-1.5">
              <p className="font-semibold text-[10px] text-slate-900">{item.question}</p>
              <p className="mt-0.5 text-[9px] text-slate-600">{item.guidance}</p>
              <select
                value={activeDraft.editorialClaimSourceChecklist[item.id] ?? "clear"}
                onChange={(e) => setClaim(item.id, e.target.value as EditorialClaimSourceStatus)}
                className="mt-1 w-full max-w-xs rounded border border-slate-200 px-2 py-0.5 text-[10px]"
              >
                {CLAIM_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 rounded border border-slate-200/80 bg-white/95 p-2">
        <h3 className="font-heading text-[10px] font-bold uppercase text-slate-600">C. Voice / audience fit</h3>
        <ul className="mt-2 space-y-2">
          {VOICE_AUDIENCE_ITEMS.map((item) => (
            <li key={item.id} className="rounded border border-slate-100 bg-slate-50/80 px-2 py-1.5">
              <p className="font-semibold text-[10px] text-slate-900">{item.question}</p>
              <p className="mt-0.5 text-[9px] text-slate-600">{item.guidance}</p>
              <select
                value={activeDraft.editorialVoiceAudienceChecklist[item.id] ?? "clear"}
                onChange={(e) => setVoice(item.id, e.target.value as EditorialVoiceAudienceStatus)}
                className="mt-1 w-full max-w-xs rounded border border-slate-200 px-2 py-0.5 text-[10px]"
              >
                {VOICE_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 rounded border border-slate-200/80 bg-white/95 p-2">
        <h3 className="font-heading text-[10px] font-bold uppercase text-slate-600">D. Compliance / suppression reminders</h3>
        <p className="mt-1 text-[9px] text-slate-600">Acknowledge each item that applies before treating the draft as send-governance-ready.</p>
        <ul className="mt-2 space-y-1">
          {COMPLIANCE_REMINDER_ITEMS.map((item) => (
            <li key={item.id}>
              <label className="flex cursor-pointer items-start gap-2 rounded border border-transparent px-1 py-0.5 hover:bg-slate-50">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={activeDraft.editorialComplianceChecklist[item.id] === true}
                  onChange={() => toggleCompliance(item.id)}
                />
                <span className="text-[10px] text-slate-800">
                  <span className="font-semibold">{item.label}</span>
                  <span className="mt-0.5 block text-[9px] font-normal text-slate-600">{item.guidance}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 rounded border border-kelly-navy/25 bg-kelly-fog/50 p-2">
        <h3 className="font-heading text-[10px] font-bold uppercase text-kelly-navy">G. Send governance handoff</h3>
        <p className="mt-1 text-[9px] text-kelly-text/75">
          Summary for the next human step — still <strong>no send</strong> from Message Studio or Send Execution until
          future execution packets.
        </p>
        <dl className="mt-2 grid gap-1 text-[10px] text-kelly-navy sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-kelly-text/60">Title</dt>
            <dd>{activeDraft.title.trim() || "—"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-kelly-text/60">Draft type</dt>
            <dd>{activeDraft.draftType.trim() || "—"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-kelly-text/60">Approval status (draft)</dt>
            <dd>{activeDraft.approvalStatus.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="font-semibold text-kelly-text/60">Readiness tier</dt>
            <dd className="font-bold">{tierLabel(tier)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-semibold text-kelly-text/60">Future send rail (inferred)</dt>
            <dd>{inferFutureSendRail(activeDraft.draftType)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-semibold text-kelly-text/60">Blockers / next checks</dt>
            <dd>
              <ul className="mt-0.5 list-inside list-disc text-[9px]">
                {blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href="/admin/workbench/email-command-center/send-execution"
            className="inline-flex items-center rounded border border-kelly-navy/40 bg-kelly-navy/90 px-3 py-1.5 text-[11px] font-bold text-white hover:opacity-95"
          >
            Open Send Execution Governance
          </Link>
        </div>
      </div>
    </section>
  );
}
