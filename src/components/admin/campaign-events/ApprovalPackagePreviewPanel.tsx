"use client";

import Link from "next/link";
import type { ApprovalPackagePayload } from "@/lib/campaign-events/approval-package";
import { APPROVAL_STATUS_LABELS } from "@/lib/campaign-events/approval-timeline";
import { ApprovalRecipientsBanner } from "./ApprovalRecipientsBanner";
import { ApprovalPackageSendPanel } from "./ApprovalPackageSendPanel";
import { AiObservationsPanel } from "./AiObservationsPanel";
import { EMAIL_SEND_DISABLED_NOTICE } from "@/lib/campaign-events/approval-recipients";
import type { AiObservationEntry } from "@/lib/campaign-events/ai-tools/observations";

export function ApprovalPackagePreviewPanel({
  payload,
  recordId,
  compact,
  observations = [],
}: {
  payload: ApprovalPackagePayload;
  recordId?: string;
  compact?: boolean;
  observations?: AiObservationEntry[];
}) {
  const sendNotice = payload.emailConfig.disabledReason ?? EMAIL_SEND_DISABLED_NOTICE;

  return (
    <section className={`rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] ${compact ? "p-4" : "p-6"}`}>
      <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-slate">
        Approval package · {payload.emailConfig.readyToSend ? "send ready" : "preview / gated send"}
      </p>
      {!compact ? (
        <div className="mt-3 space-y-2">
          <ApprovalRecipientsBanner compact />
          <p className="font-body text-xs text-kelly-muted">{sendNotice}</p>
          <p className="font-mono text-xs text-kelly-muted">Package To: {payload.candidateApprovalTo}</p>
        </div>
      ) : (
        <p className="mt-1 font-body text-xs text-kelly-muted">To: {payload.candidateApprovalTo}</p>
      )}

      <div className={`mt-3 grid gap-3 ${compact ? "" : "lg:grid-cols-2"}`}>
        <div className="rounded-xl border border-kelly-text/10 bg-kelly-page p-3 font-body text-sm">
          <strong>{payload.eventSummary.title}</strong>
          <p className="mt-1 text-kelly-muted">
            {payload.eventSummary.dateYmd} {payload.eventSummary.timeLabel}
          </p>
          <p className="mt-1 text-xs">
            {payload.eventSummary.eventType}
            {payload.eventSummary.city ? ` · ${payload.eventSummary.city}` : ""}
            {payload.eventSummary.county ? ` · ${payload.eventSummary.county}` : ""}
          </p>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-kelly-page p-3 font-body text-sm">
          <p>{payload.travelEstimate.line}</p>
          {payload.travelEstimate.reimbursementDisplay ? <p>{payload.travelEstimate.reimbursementDisplay}</p> : null}
        </div>
      </div>

      <p className="mt-3 font-body text-sm">
        <strong>AI summary:</strong> {payload.emailAssist.shortSummary}
      </p>
      {payload.missingFields.length ? (
        <p className="mt-2 font-body text-xs">Missing: {payload.missingFields.join(" · ")}</p>
      ) : null}
      {payload.conflicts.length ? (
        <p className="mt-2 font-body text-xs text-red-900">
          Conflicts: {payload.conflicts.map((c) => c.label).join(", ")}
        </p>
      ) : null}

      <p className="mt-3 font-body text-sm">
        <strong>Recommended:</strong> {payload.recommendedDecision}
      </p>

      {!compact ? (
        <ol className="mt-4 space-y-1 font-body text-xs">
          {payload.approvalStatusTimeline.map((t) => (
            <li key={t.status}>
              {APPROVAL_STATUS_LABELS[t.status]}
              {t.at ? ` · ${new Date(t.at).toLocaleString()}` : ""}
            </li>
          ))}
        </ol>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {payload.actions.map((a) =>
          a.disabled ? (
            <span
              key={a.id}
              title={a.hint}
              className="cursor-not-allowed rounded-full border px-3 py-1 text-xs font-bold opacity-40"
            >
              {a.label}
            </span>
          ) : (
            <Link
              key={a.id}
              href={
                a.id === "approve"
                  ? payload.tokenLinks?.approve ?? "#"
                  : a.id === "deny"
                    ? payload.tokenLinks?.deny ?? "#"
                    : a.id === "hold"
                      ? payload.tokenLinks?.hold ?? "#"
                      : payload.tokenLinks?.requestInfo ?? "#"
              }
              className="rounded-full border border-kelly-navy/30 bg-kelly-navy/10 px-3 py-1 text-xs font-bold text-kelly-navy"
            >
              {a.label}
            </Link>
          ),
        )}
      </div>

      <p className="mt-3 font-body text-xs">
        <Link href={payload.links.workbenchUrl} className="font-semibold text-kelly-navy underline">
          Workbench
        </Link>
        {" · "}
        <Link href={payload.links.drilldownUrl} className="underline">
          Drilldown
        </Link>
        {payload.tokenLinks?.review ? (
          <>
            {" · "}
            <a href={payload.tokenLinks.review} className="underline">
              Secure review
            </a>
          </>
        ) : (
          <span className="text-kelly-subtle"> · {payload.links.secureTokenPlaceholder}</span>
        )}
      </p>

      {recordId ? <ApprovalPackageSendPanel recordId={recordId} payload={payload} /> : null}
      {!compact && recordId ? <AiObservationsPanel observations={observations} compact /> : null}
    </section>
  );
}
