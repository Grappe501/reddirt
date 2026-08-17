"use client";

import { useState, useTransition } from "react";
import type { ApprovalPackagePayload } from "@/lib/campaign-events/approval-package";
import type { ApprovalPackageToken } from "@/lib/campaign-events/approval-email/approval-token-store";
import { applyApprovalTokenDecisionAction } from "@/app/campaign-events/approval/approval-token-actions";

const ACTION_LABELS: Record<string, string> = {
  approve: "Approve event",
  deny: "Deny event",
  hold: "Place on hold",
  request_info: "Request more information",
  review: "Review package",
};

export function ApprovalTokenPublicClient({
  token,
  payload,
  canDecide,
}: {
  token: ApprovalPackageToken;
  payload: ApprovalPackagePayload;
  canDecide: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    startTransition(async () => {
      setError(null);
      const res = await applyApprovalTokenDecisionAction(token.id, note);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setDone(true);
    });
  };

  if (token.status === "expired") {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 font-body">
        <h1 className="font-heading text-2xl font-bold">Link expired</h1>
        <p className="mt-4 text-sm">Ask the campaign team for a new approval package email.</p>
      </main>
    );
  }

  if (done) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 font-body">
        <h1 className="font-heading text-2xl font-bold text-emerald-900">Decision recorded</h1>
        <p className="mt-4 text-sm">Your response was saved on the campaign event ledger. Google Calendar was not updated.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12 font-body">
      <p className="text-xs font-bold uppercase tracking-wider text-kelly-slate">Kelly Grappe for Secretary of State</p>
      <h1 className="mt-2 font-heading text-2xl font-bold">{ACTION_LABELS[token.action] ?? "Event approval"}</h1>
      <p className="mt-2 text-sm text-kelly-muted">
        <strong>{payload.eventSummary.title}</strong> · {payload.eventSummary.dateYmd} {payload.eventSummary.timeLabel}
      </p>

      <section className="mt-6 rounded-2xl border border-kelly-text/10 bg-white p-4 text-sm shadow-sm">
        <p>{payload.emailAssist.shortSummary}</p>
        <p className="mt-2 text-xs text-amber-900">{payload.emailAssist.missingInfoLanguage}</p>
        <p className="mt-2 text-xs">{payload.emailAssist.riskNote}</p>
        <p className="mt-3 text-sm font-semibold">{payload.emailAssist.recommendedAction}</p>
        <p className="mt-3 text-xs text-kelly-muted">Google Calendar promotion is not enabled yet.</p>
      </section>

      {canDecide ? (
        <section className="mt-6 space-y-3">
          <label className="grid gap-1 text-xs">
            Optional note
            <textarea
              className="min-h-[80px] rounded-lg border border-kelly-text/15 p-2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <button
            type="button"
            disabled={pending}
            onClick={submit}
            className="w-full rounded-full bg-kelly-navy py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            Confirm {token.action.replaceAll("_", " ")}
          </button>
          {error ? <p className="text-xs text-red-800">{error}</p> : null}
        </section>
      ) : token.action === "review" && payload.tokenLinks ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {payload.tokenLinks.approve ? (
            <a href={payload.tokenLinks.approve} className="rounded-full bg-emerald-800 px-4 py-2 text-xs font-bold text-white">
              Approve
            </a>
          ) : null}
          {payload.tokenLinks.hold ? (
            <a href={payload.tokenLinks.hold} className="rounded-full border px-4 py-2 text-xs font-bold">
              Hold
            </a>
          ) : null}
          {payload.tokenLinks.deny ? (
            <a href={payload.tokenLinks.deny} className="rounded-full border border-red-800/40 px-4 py-2 text-xs font-bold text-red-900">
              Deny
            </a>
          ) : null}
          {payload.tokenLinks.requestInfo ? (
            <a href={payload.tokenLinks.requestInfo} className="rounded-full border px-4 py-2 text-xs font-bold">
              Request info
            </a>
          ) : null}
          <p className="w-full text-xs text-kelly-muted">Each link records your decision on the campaign ledger only — not Google Calendar.</p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-kelly-muted">
          {token.status === "used"
            ? "This decision link was already used."
            : token.action === "review"
              ? "Use the Approve, Hold, or Deny links from your email to record a decision."
              : "A decision is already on file for this event."}
        </p>
      )}

      <p className="mt-10 text-center text-[10px] text-kelly-subtle">Paid for by The Committee to Elect Kelly Grappe</p>
    </main>
  );
}
