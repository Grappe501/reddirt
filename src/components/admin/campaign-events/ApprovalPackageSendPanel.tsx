"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ApprovalPackagePayload } from "@/lib/campaign-events/approval-package";
import {
  dryRunApprovalEmailAction,
  previewApprovalEmailBodiesAction,
  sendApprovalPackageEmailAction,
} from "@/app/admin/(board)/campaign-events/approval-email-actions";
import { EMAIL_SEND_DISABLED_NOTICE } from "@/lib/campaign-events/approval-recipients";

export function ApprovalPackageSendPanel({
  recordId,
  payload,
}: {
  recordId: string;
  payload: ApprovalPackagePayload;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");

  const { emailConfig, lastEmailLog } = payload;
  const canSend = emailConfig.readyToSend;

  const runPreview = () => {
    startTransition(async () => {
      const res = await previewApprovalEmailBodiesAction(recordId);
      if (res.ok) setPreviewText(res.text ?? "");
      else setMessage("Could not build email preview.");
    });
  };

  const runSend = (testToSelf?: string) => {
    startTransition(async () => {
      setMessage(null);
      const res = await sendApprovalPackageEmailAction(recordId, testToSelf ? { testToSelf } : undefined);
      if (!res.ok) {
        setMessage("Send failed — record not found.");
        return;
      }
      const r = res.result;
      if (r.status === "sent") setMessage(`Sent to ${r.recipients.join(", ")}.`);
      else if (r.status === "skipped_disabled") setMessage(r.error ?? EMAIL_SEND_DISABLED_NOTICE);
      else if (r.status === "failed") setMessage(r.error ?? "Send failed.");
      else setMessage("Dry run logged.");
      router.refresh();
    });
  };

  const runDryRun = () => {
    startTransition(async () => {
      const res = await dryRunApprovalEmailAction(recordId);
      setMessage(res.ok ? "Dry-run log written (no email sent)." : "Dry run failed.");
      router.refresh();
    });
  };

  return (
    <section className="mt-4 rounded-xl border border-kelly-navy/20 bg-kelly-page p-4 font-body text-sm">
      <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-slate">Email send</h3>
      <p className="mt-2 text-xs text-kelly-muted">
        To: <strong>{payload.candidateApprovalTo}</strong>
        {emailConfig.fromEmail ? ` · From: ${emailConfig.fromEmail}` : ""}
      </p>
      <p className="mt-1 font-mono text-xs">Subject: {payload.emailAssist.subject}</p>

      {!canSend ? (
        <p className="mt-2 rounded-lg border border-amber-600/25 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          {emailConfig.disabledReason ?? EMAIL_SEND_DISABLED_NOTICE}
          {emailConfig.missingConfig.length ? (
            <span className="mt-1 block">Missing: {emailConfig.missingConfig.join("; ")}</span>
          ) : null}
        </p>
      ) : (
        <p className="mt-2 text-xs text-emerald-800">SendGrid transport ready when EMAIL_SEND_ENABLED=true.</p>
      )}

      {lastEmailLog ? (
        <p className="mt-2 text-xs">
          Last send: <strong>{lastEmailLog.status}</strong>
          {lastEmailLog.sentAt ? ` · ${new Date(lastEmailLog.sentAt).toLocaleString()}` : ""}
          {lastEmailLog.error ? ` · ${lastEmailLog.error}` : ""}
        </p>
      ) : null}

      {payload.tokenLinks?.review ? (
        <p className="mt-2 break-all text-xs">
          Review link:{" "}
          <a href={payload.tokenLinks.review} className="font-semibold text-kelly-navy underline">
            {payload.tokenLinks.review}
          </a>
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full border border-kelly-text/15 px-3 py-1.5 text-xs font-bold"
          disabled={pending}
          onClick={runPreview}
        >
          Preview body
        </button>
        <button
          type="button"
          className="rounded-full bg-kelly-navy px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
          disabled={pending || !canSend}
          onClick={() => runSend()}
        >
          Send approval package
        </button>
        <button
          type="button"
          className="rounded-full border border-kelly-navy/30 px-3 py-1.5 text-xs font-bold text-kelly-navy disabled:opacity-40"
          disabled={pending || !canSend}
          onClick={() => runSend()}
        >
          Resend
        </button>
        <button type="button" className="rounded-full border px-3 py-1.5 text-xs font-bold" disabled={pending} onClick={runDryRun}>
          Dry-run log only
        </button>
      </div>

      {canSend ? (
        <label className="mt-3 flex max-w-md flex-col gap-1 text-xs">
          Test send to one address (optional)
          <div className="flex gap-2">
            <input
              type="email"
              className="flex-1 rounded-lg border border-kelly-text/15 px-2 py-1.5"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <button
              type="button"
              className="rounded-full border px-3 py-1.5 font-bold disabled:opacity-40"
              disabled={pending || !testEmail.trim()}
              onClick={() => runSend(testEmail.trim())}
            >
              Test
            </button>
          </div>
        </label>
      ) : null}

      {message ? <p className="mt-2 text-xs font-semibold text-kelly-navy">{message}</p> : null}
      {previewText ? (
        <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-kelly-wash p-2 text-[10px] whitespace-pre-wrap">{previewText}</pre>
      ) : null}
    </section>
  );
}
