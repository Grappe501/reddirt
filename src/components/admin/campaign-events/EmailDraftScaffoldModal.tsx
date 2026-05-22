"use client";

import { useState, useTransition } from "react";
import type { CampaignEventEmailDraft, EmailDraftType } from "@/lib/campaign-events/review-meta";
import type { EventReviewFormState } from "@/lib/campaign-events/review-form";
import { buildEmailDraftAction } from "@/app/admin/(board)/campaign-events/actions";
import {
  EMAIL_SEND_DISABLED_NOTICE,
  getCandidateApprovalToLine,
} from "@/lib/campaign-events/approval-recipients";

const DRAFT_TYPES: Array<{ id: EmailDraftType; label: string }> = [
  { id: "confirm_event_details", label: "Confirm event details" },
  { id: "ask_address_location", label: "Ask for address / location" },
  { id: "ask_host_contact", label: "Ask for host contact" },
  { id: "ask_speaking_slot", label: "Ask about speaking slot" },
  { id: "ask_table_materials", label: "Ask about table / materials" },
  { id: "ask_volunteer_logistics", label: "Ask volunteer logistics" },
  { id: "ask_attendance_audience", label: "Ask attendance / audience" },
];

export function EmailDraftScaffoldModal({
  recordId,
  form,
  onClose,
  audience = "host",
}: {
  recordId: string;
  form: EventReviewFormState;
  onClose: () => void;
  /** Host logistics vs candidate approval package (prefills Kelly addresses). */
  audience?: "host" | "candidate_approval";
}) {
  const [pending, startTransition] = useTransition();
  const [draftType, setDraftType] = useState<EmailDraftType>("confirm_event_details");
  const [draft, setDraft] = useState<CampaignEventEmailDraft | null>(null);
  const defaultTo =
    audience === "candidate_approval" ? getCandidateApprovalToLine() : form.hostName ? "" : "";
  const [to, setTo] = useState(defaultTo);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-kelly-text/40 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-kelly-text/10 bg-kelly-page p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-slate">Email scaffold — not sent</p>
            <h3 className="font-heading text-xl font-bold text-kelly-text">Request info / confirmation</h3>
            <p className="mt-1 font-body text-sm text-kelly-muted">
              Draft is saved on the event record for future automation. {EMAIL_SEND_DISABLED_NOTICE}
            </p>
          </div>
          <button type="button" className="font-body text-sm font-bold text-kelly-navy" onClick={onClose}>
            Close
          </button>
        </div>

        <label className="mt-4 grid gap-1 font-body text-sm">
          <span className="text-xs font-semibold text-kelly-muted">Email purpose</span>
          <select
            className="rounded-lg border border-kelly-text/15 px-3 py-2"
            value={draftType}
            onChange={(e) => setDraftType(e.target.value as EmailDraftType)}
          >
            {DRAFT_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-3 grid gap-1 font-body text-sm">
          <span className="text-xs font-semibold text-kelly-muted">To (optional)</span>
          <input
            className="rounded-lg border border-kelly-text/15 px-3 py-2"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Add recipient email to send later"
          />
        </label>

        {audience === "candidate_approval" ? (
          <p className="mt-2 rounded-lg border border-kelly-navy/15 bg-kelly-navy/[0.04] px-3 py-2 font-body text-xs text-kelly-muted">
            Candidate approval package default recipients — editable before future send.
          </p>
        ) : !to.trim() ? (
          <p className="mt-2 rounded-lg border border-amber-600/25 bg-amber-50 px-3 py-2 font-body text-sm text-amber-950">
            Add host recipient email to send later.
          </p>
        ) : null}

        <button
          type="button"
          disabled={pending}
          className="mt-4 rounded-full bg-kelly-navy px-4 py-2 font-body text-sm font-bold text-white disabled:opacity-50"
          onClick={() => {
            startTransition(async () => {
              const result = await buildEmailDraftAction(recordId, draftType, {
                ...form,
                hostName: form.hostName,
              });
              if (result.draft) {
                setDraft({ ...result.draft, to: to || result.draft.to });
              }
            });
          }}
        >
          Generate draft
        </button>

        {draft ? (
          <div className="mt-4 grid gap-3 rounded-2xl border border-kelly-text/10 bg-kelly-wash p-4">
            <p className="font-body text-xs text-kelly-muted">
              Related: <strong>{draft.relatedEventTitle}</strong>
            </p>
            <p className="font-body text-sm">
              <strong>Subject:</strong> {draft.subject}
            </p>
            <pre className="whitespace-pre-wrap font-body text-sm text-kelly-text/80">{draft.body}</pre>
            {draft.missingChecklist.length ? (
              <ul className="list-disc pl-5 font-body text-xs text-kelly-muted">
                {draft.missingChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            <p className="font-body text-xs text-kelly-slate">Saved to record at {new Date(draft.savedAt).toLocaleString()}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
