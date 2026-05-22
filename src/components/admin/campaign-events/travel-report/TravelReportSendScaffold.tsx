"use client";

import {
  EMAIL_SEND_DISABLED_NOTICE,
  campaignManagerEmail,
  getCandidateApprovalRecipientList,
} from "@/lib/campaign-events/approval-recipients";

export function TravelReportSendScaffold({ month }: { month: string }) {
  const candidates = getCandidateApprovalRecipientList();

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
        <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-slate">Send to Candidate (scaffold)</p>
        <p className="mt-1 font-body text-xs text-kelly-muted">{EMAIL_SEND_DISABLED_NOTICE}</p>
        <ul className="mt-3 space-y-1 font-body text-sm">
          {candidates.map((email) => (
            <li key={email}>
              <span className="text-kelly-muted">To:</span> {email}
            </li>
          ))}
        </ul>
        <button
          type="button"
          disabled
          title="Email not built"
          className="mt-4 cursor-not-allowed rounded-full border border-kelly-text/15 px-4 py-2 text-sm font-bold text-kelly-text/40"
        >
          Send {month} travel report to candidate
        </button>
      </div>

      <div className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
        <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-slate">Send to Campaign Manager (scaffold)</p>
        <p className="mt-1 font-body text-xs text-kelly-muted">{EMAIL_SEND_DISABLED_NOTICE}</p>
        {campaignManagerEmail ? (
          <p className="mt-3 font-body text-sm">
            <span className="text-kelly-muted">To:</span> {campaignManagerEmail}
          </p>
        ) : (
          <p className="mt-3 font-body text-sm text-kelly-muted">Campaign manager email not configured yet.</p>
        )}
        <button
          type="button"
          disabled
          title="Email not built"
          className="mt-4 cursor-not-allowed rounded-full border border-kelly-text/15 px-4 py-2 text-sm font-bold text-kelly-text/40"
        >
          Send {month} travel report to campaign manager
        </button>
      </div>
    </section>
  );
}
