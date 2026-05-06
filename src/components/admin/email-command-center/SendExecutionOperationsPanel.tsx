import Link from "next/link";
import {
  approveEmailSendExecutionFinalAction,
  archiveEmailSendExecutionAction,
  createEmailSendExecutionDraftAction,
  executeEmailSendGridFinalAction,
  markEmailSendExecutionReadyForFinalApprovalAction,
  runEmailSendExecutionPreflightAction,
  sendEmailSendGridTestAction,
} from "@/app/admin/email-send-execution-actions";
import { EMAIL_SEND_FINAL_CONFIRMATION_PHRASE } from "@/lib/email-command-center/send-execution";
import type { EmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";
import type { MessageStudioDraftListRow } from "@/lib/email-command-center/message-studio-drafts";
import type { EmailSendExecution, EmailSendRecipient, MessageStudioDraftStatus } from "@prisma/client";

const card =
  "rounded-lg border border-kelly-text/12 bg-gradient-to-b from-white/95 to-kelly-page/90 px-3 py-2.5 shadow-sm";
const h3 = "font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/50";

type AudienceOption = { id: string; name: string; status: string };
type SyncRunOption = { id: string; audienceDefinitionId: string | null; candidateCount: number; createdAt: string };

export type SendExecutionOperationsPanelProps = {
  snapshot: EmailCommandCenterSnapshot;
  executions: (EmailSendExecution & {
    emailAudienceDefinition: { id: string; name: string } | null;
    messageStudioDraft: { id: string; title: string | null } | null;
    sendGridContactSyncRun: { id: string; status: string } | null;
  })[];
  drafts: MessageStudioDraftListRow[];
  audiences: AudienceOption[];
  syncedRuns: SyncRunOption[];
  detail: (EmailSendExecution & {
    recipients: EmailSendRecipient[];
    messageStudioDraft: { id: string; title: string | null; status: MessageStudioDraftStatus } | null;
    emailAudienceDefinition: { id: string; name: string; status: string } | null;
    sendGridContactSyncRun: { id: string; status: string } | null;
  }) | null;
  query: {
    draftId?: string;
    audienceDefinitionId?: string;
    sendGridContactSyncRunId?: string;
    id?: string;
    error?: string;
    notice?: string;
  };
};

function parsePreflightChecks(preflightJson: unknown): { id: string; ok: boolean; detail: string }[] {
  if (!preflightJson || typeof preflightJson !== "object" || Array.isArray(preflightJson)) return [];
  const checks = (preflightJson as { checks?: unknown }).checks;
  if (!Array.isArray(checks)) return [];
  return checks
    .map((c) => {
      if (!c || typeof c !== "object") return null;
      const o = c as { id?: unknown; ok?: unknown; detail?: unknown };
      const id = typeof o.id === "string" ? o.id : "?";
      const ok = o.ok === true;
      const detail = typeof o.detail === "string" ? o.detail : "";
      return { id, ok, detail };
    })
    .filter((x): x is { id: string; ok: boolean; detail: string } => x !== null);
}

function noticeLabel(notice: string): string {
  const m: Record<string, string> = {
    created: "Draft execution created — run preflight next.",
    preflight: "Preflight completed — review checklist and recipient counts.",
    "test-sent": "Test email submitted to SendGrid for the operator address you entered.",
    "ready-final": "Marked ready for final approval.",
    "final-approved": "Final approval recorded — use the final send panel with typed confirmation only when ready.",
    sent: "Final SendGrid broadcast submitted — review provider result and Analytics (events still authoritative).",
    archived: "Execution archived.",
  };
  return m[notice] ?? notice;
}

export function SendExecutionOperationsPanel({
  snapshot,
  executions,
  drafts,
  audiences,
  syncedRuns,
  detail,
  query,
}: SendExecutionOperationsPanelProps) {
  const se = snapshot.sendExecution;
  const og = snapshot.operatorGate;
  const defaultDraftId = query.draftId ?? "";
  const defaultAudienceId = query.audienceDefinitionId ?? "";
  const defaultSyncRunId = query.sendGridContactSyncRunId ?? "";

  return (
    <div id="ops" className="min-w-0 max-w-5xl scroll-mt-24 space-y-4">
      <section className={`${card} border-kelly-navy/20`}>
        <h2 className={h3}>EMAIL-SEND-EXECUTION-1.0 — operator console</h2>
        <p className="mt-1 font-body text-[11px] text-kelly-text/85">
          Governed SendGrid execution only: <strong>no automation</strong>, <strong>no queue send</strong>,{" "}
          <strong>no background sends</strong>. Broadcast requires numeric{" "}
          <code className="text-[9px]">SENDGRID_UNSUBSCRIBE_GROUP_ID</code> (ASM) and suppression exclusions. Final send
          requires status <code className="text-[9px]">FINAL_APPROVED</code> and typing{" "}
          <code className="text-[9px]">{EMAIL_SEND_FINAL_CONFIRMATION_PHRASE}</code> exactly.
        </p>
        <p className="mt-1 font-body text-[10px] text-kelly-text/70">
          Snapshot: executions tracked {se.dbReachable ? "live" : "unavailable"} on this DB.{" "}
          <code className="text-[9px]">EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM</code> ={" "}
          <strong>{String(snapshot.governance.canSendFromEmailWorkflowItem)}</strong> (unchanged).
        </p>
      </section>

      {query.error ? (
        <p className="rounded border border-rose-300/60 bg-rose-50 px-2 py-1 font-body text-[11px] text-rose-950" role="alert">
          {query.error}
        </p>
      ) : null}
      {query.notice ? (
        <p className="rounded border border-emerald-300/60 bg-emerald-50 px-2 py-1 font-body text-[11px] text-emerald-950" role="status">
          {noticeLabel(query.notice)}
        </p>
      ) : null}

      {!og.cockpitDbReachable || !se.dbReachable ? (
        <div className="rounded-lg border border-amber-400/50 bg-amber-50/90 px-3 py-2 font-body text-[11px] text-amber-950" role="alert">
          <strong>Database or execution tables unreachable</strong> — fix <code className="text-[10px]">DATABASE_URL</code>, run{" "}
          <code className="text-[10px]">{og.dbDiagnoseCliHint}</code> and <code className="text-[10px]">npx prisma migrate deploy</code> before
          creating executions.
        </div>
      ) : null}

      <section className={card}>
        <h2 className={h3}>1. Execution list</h2>
        <p className="mt-1 font-body text-[10px] text-kelly-text/70">Open an execution to run preflight, test send, approvals, and final send.</p>
        <div className="mt-2 max-h-72 overflow-auto rounded border border-kelly-text/10">
          <table className="w-full border-collapse text-left font-body text-[10px]">
            <thead className="sticky top-0 bg-kelly-fog/90 text-[9px] uppercase text-kelly-text/60">
              <tr>
                <th className="border-b border-kelly-text/10 px-2 py-1">Status</th>
                <th className="border-b border-kelly-text/10 px-2 py-1">Type</th>
                <th className="border-b border-kelly-text/10 px-2 py-1">Subject</th>
                <th className="border-b border-kelly-text/10 px-2 py-1">Audience</th>
                <th className="border-b border-kelly-text/10 px-2 py-1">Counts</th>
                <th className="border-b border-kelly-text/10 px-2 py-1">Updated</th>
                <th className="border-b border-kelly-text/10 px-2 py-1"> </th>
              </tr>
            </thead>
            <tbody>
              {executions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2 py-3 text-kelly-text/60">
                    No executions yet — create one from an approved shared draft below.
                  </td>
                </tr>
              ) : (
                executions.map((ex) => (
                  <tr key={ex.id} className="border-b border-kelly-text/8 align-top">
                    <td className="px-2 py-1.5 font-bold text-kelly-navy">{ex.status}</td>
                    <td className="px-2 py-1.5 text-kelly-text/80">{ex.sendType}</td>
                    <td className="px-2 py-1.5 text-kelly-text/85">{ex.subject?.slice(0, 80) || "—"}</td>
                    <td className="px-2 py-1.5 text-kelly-text/80">{ex.emailAudienceDefinition?.name ?? "—"}</td>
                    <td className="px-2 py-1.5 tabular-nums text-kelly-text/75">
                      cand {ex.candidateRecipientCount} · sup {ex.suppressedRecipientCount} · final {ex.finalRecipientCount}
                    </td>
                    <td className="px-2 py-1.5 text-[9px] text-kelly-text/65">{ex.updatedAt.toISOString().slice(0, 16)}</td>
                    <td className="px-2 py-1.5">
                      <Link
                        href={`/admin/workbench/email-command-center/send-execution?id=${encodeURIComponent(ex.id)}#ops`}
                        className="font-bold text-kelly-forest underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={card}>
        <h2 className={h3}>2. Create execution from shared draft</h2>
        <p className="mt-1 font-body text-[10px] text-kelly-text/75">
          Links from{" "}
          <Link href="/admin/workbench/email-command-center/message-studio#shared-drafts" className="font-bold underline">
            Message Studio shared drafts
          </Link>{" "}
          can prefill <code className="text-[9px]">draftId</code>. Choose an <strong>ACTIVE</strong> audience and a{" "}
          <strong>SYNCED</strong> contact sync run for broadcast preflight.
        </p>
        <form action={createEmailSendExecutionDraftAction} className="mt-2 grid gap-2 sm:grid-cols-2">
          <label className="text-[10px] text-kelly-text/80 sm:col-span-2">
            Shared draft (Message Studio)
            <select
              name="messageStudioDraftId"
              required
              defaultValue={defaultDraftId}
              className="mt-0.5 w-full rounded border px-2 py-1 text-[11px]"
            >
              <option value="">Select draft…</option>
              {drafts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title || "Untitled"} — {d.status}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[10px] text-kelly-text/80 sm:col-span-2">
            Active audience
            <select
              name="emailAudienceDefinitionId"
              required
              defaultValue={defaultAudienceId}
              className="mt-0.5 w-full rounded border px-2 py-1 text-[11px]"
            >
              <option value="">Select audience…</option>
              {audiences.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.status})
                </option>
              ))}
            </select>
          </label>
          <label className="text-[10px] text-kelly-text/80 sm:col-span-2">
            SendGrid contact sync run (SYNCED — optional only for early drafts; required at preflight for broadcast)
            <select
              name="sendGridContactSyncRunId"
              defaultValue={defaultSyncRunId}
              className="mt-0.5 w-full rounded border px-2 py-1 text-[11px]"
            >
              <option value="">None selected</option>
              {syncedRuns.map((r) => (
                <option key={r.id} value={r.id}>
                  …{r.id.slice(-8)} · {r.candidateCount} candidates · audience {r.audienceDefinitionId?.slice(-8) ?? "—"}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="sm:col-span-2 rounded border border-kelly-navy/35 bg-kelly-fog/90 px-3 py-1.5 text-[11px] font-bold text-kelly-navy"
          >
            Create draft execution (no send)
          </button>
        </form>
      </section>

      {detail ? (
        <>
          <section className={card}>
            <h2 className={h3}>Selected execution</h2>
            <dl className="mt-2 grid gap-1 font-body text-[10px] text-kelly-text/85 sm:grid-cols-2">
              <div>
                <dt className="font-bold text-kelly-navy">Id</dt>
                <dd className="font-mono text-[9px]">{detail.id}</dd>
              </div>
              <div>
                <dt className="font-bold text-kelly-navy">Status</dt>
                <dd>{detail.status}</dd>
              </div>
              <div>
                <dt className="font-bold text-kelly-navy">Draft</dt>
                <dd>{detail.messageStudioDraft?.title ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-bold text-kelly-navy">Audience</dt>
                <dd>{detail.emailAudienceDefinition?.name ?? "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-bold text-kelly-navy">Subject</dt>
                <dd>{detail.subject || "—"}</dd>
              </div>
            </dl>
          </section>

          <section className={card}>
            <h2 className={h3}>3. Preflight</h2>
            <p className="mt-1 font-body text-[10px] text-kelly-text/75">
              Allowed from <code className="text-[9px]">DRAFT</code>, <code className="text-[9px]">PREFLIGHT_FAILED</code>, or{" "}
              <code className="text-[9px]">READY_FOR_TEST</code> (re-scan before test).
            </p>
            <form action={runEmailSendExecutionPreflightAction} className="mt-2">
              <input type="hidden" name="sendExecutionId" value={detail.id} />
              <button
                type="submit"
                className="rounded border border-kelly-forest/40 bg-emerald-50/90 px-3 py-1 text-[10px] font-bold text-kelly-navy"
              >
                Run preflight
              </button>
            </form>
            <ul className="mt-2 space-y-1 rounded border border-kelly-text/10 bg-white/80 p-2 font-body text-[10px]">
              {parsePreflightChecks(detail.preflightJson).length === 0 ? (
                <li className="text-kelly-text/60">No preflight record yet — run preflight.</li>
              ) : (
                parsePreflightChecks(detail.preflightJson).map((c) => (
                  <li key={c.id} className={c.ok ? "text-emerald-900" : "text-rose-900"}>
                    <span className="font-bold">{c.ok ? "PASS" : "FAIL"}</span> · {c.id}: {c.detail}
                  </li>
                ))
              )}
            </ul>
            <p className="mt-2 font-body text-[10px] text-kelly-text/70">
              Candidate {detail.candidateRecipientCount} · suppressed {detail.suppressedRecipientCount} · final{" "}
              {detail.finalRecipientCount}
              {detail.errorSafe ? (
                <>
                  {" "}
                  · <span className="font-semibold text-rose-900">Error:</span> {detail.errorSafe}
                </>
              ) : null}
            </p>
          </section>

          <section className={card}>
            <h2 className={h3}>4. Test send (one explicit address)</h2>
            <p className="mt-1 font-body text-[10px] text-kelly-text/75">
              Sends <strong>one</strong> email to the address you type. Available only when status is{" "}
              <code className="text-[9px]">READY_FOR_TEST</code>.
            </p>
            <form action={sendEmailSendGridTestAction} className="mt-2 flex flex-wrap items-end gap-2">
              <input type="hidden" name="sendExecutionId" value={detail.id} />
              <label className="flex min-w-[14rem] flex-1 flex-col text-[10px] text-kelly-text/80">
                Test recipient email
                <input
                  name="testRecipientEmail"
                  type="email"
                  required
                  placeholder="operator@example.com"
                  className="mt-0.5 rounded border px-2 py-1 text-[11px]"
                />
              </label>
              <button
                type="submit"
                disabled={detail.status !== "READY_FOR_TEST"}
                className="rounded border border-kelly-navy/35 bg-kelly-fog/90 px-3 py-1 text-[10px] font-bold text-kelly-navy disabled:opacity-40"
              >
                Send test via SendGrid
              </button>
            </form>
          </section>

          <section className={card}>
            <h2 className={h3}>5. Final approval (separate from test)</h2>
            <ol className="mt-1 list-inside list-decimal font-body text-[10px] text-kelly-text/85">
              <li>Review test inbox rendering and links.</li>
              <li>Mark ready for final approval (broadcast only).</li>
              <li>Record final send approval below.</li>
            </ol>
            <div className="mt-2 flex flex-wrap gap-2">
              <form action={markEmailSendExecutionReadyForFinalApprovalAction}>
                <input type="hidden" name="sendExecutionId" value={detail.id} />
                <button
                  type="submit"
                  disabled={detail.status !== "TEST_SENT" || detail.sendType !== "SENDGRID_BROADCAST"}
                  className="rounded border border-kelly-navy/30 bg-white px-2 py-1 text-[10px] font-bold text-kelly-navy disabled:opacity-40"
                >
                  Mark ready for final approval
                </button>
              </form>
              <form action={approveEmailSendExecutionFinalAction} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="sendExecutionId" value={detail.id} />
                <label className="text-[10px] text-kelly-text/80">
                  Note (optional)
                  <input name="note" className="mt-0.5 rounded border px-2 py-1 text-[11px]" />
                </label>
                <button
                  type="submit"
                  disabled={detail.status !== "READY_FOR_FINAL_APPROVAL"}
                  className="rounded border border-emerald-700/40 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-950 disabled:opacity-40"
                >
                  Approve final send
                </button>
              </form>
            </div>
          </section>

          <section className={`${card} border-rose-200/70 bg-rose-50/40`}>
            <h2 className={`${h3} text-rose-950`}>6. Final SendGrid broadcast</h2>
            <p className="mt-1 font-body text-[10px] text-rose-950/95">
              This will send email through SendGrid to <strong>{detail.finalRecipientCount}</strong> READY recipients (after
              suppression re-check at submit). Production requires hosted DB verification gate (see action).
            </p>
            <form action={executeEmailSendGridFinalAction} className="mt-2 grid gap-2 sm:grid-cols-2">
              <input type="hidden" name="sendExecutionId" value={detail.id} />
              <label className="text-[10px] text-kelly-text/80 sm:col-span-2">
                Type exactly: <code className="text-[9px]">{EMAIL_SEND_FINAL_CONFIRMATION_PHRASE}</code>
                <input
                  name="confirmText"
                  required
                  autoComplete="off"
                  placeholder={EMAIL_SEND_FINAL_CONFIRMATION_PHRASE}
                  className="mt-0.5 w-full rounded border px-2 py-1 text-[11px]"
                />
              </label>
              <button
                type="submit"
                disabled={detail.status !== "FINAL_APPROVED"}
                className="rounded border border-rose-600/50 bg-rose-100 px-3 py-1.5 text-[11px] font-bold text-rose-950 disabled:opacity-40"
              >
                Execute final SendGrid send
              </button>
            </form>
            {detail.providerResultJson && typeof detail.providerResultJson === "object" ? (
              <pre className="mt-2 max-h-40 overflow-auto rounded border border-kelly-text/10 bg-white/90 p-2 font-mono text-[9px] text-kelly-navy">
                {JSON.stringify(detail.providerResultJson, null, 2)}
              </pre>
            ) : null}
          </section>

          <section className={card}>
            <h2 className={h3}>7. Governance reminders</h2>
            <ul className="mt-1 list-inside list-disc font-body text-[10px] text-kelly-text/85">
              <li>Queue approval ≠ send approval.</li>
              <li>Send packet ≠ send approval.</li>
              <li>Audience approval ≠ send approval.</li>
              <li>Contact sync run SYNCED ≠ email send.</li>
              <li>Final operator confirmation + typed phrase required for broadcast.</li>
              <li>No automation activation from this route.</li>
            </ul>
            <form action={archiveEmailSendExecutionAction} className="mt-2">
              <input type="hidden" name="sendExecutionId" value={detail.id} />
              <button type="submit" className="rounded border border-kelly-text/20 bg-white px-2 py-1 text-[10px] text-kelly-text/80">
                Archive execution
              </button>
            </form>
          </section>

          <section className={card}>
            <h2 className={h3}>Recipient audit (snapshot)</h2>
            <div className="mt-1 max-h-48 overflow-auto rounded border border-kelly-text/10 font-mono text-[9px]">
              <table className="w-full text-left">
                <thead className="bg-kelly-fog/80 text-kelly-text/60">
                  <tr>
                    <th className="px-1 py-0.5">Email</th>
                    <th className="px-1 py-0.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.recipients.slice(0, 200).map((r) => (
                    <tr key={r.id} className="border-t border-kelly-text/8">
                      <td className="px-1 py-0.5">{r.email}</td>
                      <td className="px-1 py-0.5">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {detail.recipients.length > 200 ? (
                <p className="p-1 text-[9px] text-kelly-text/60">Showing first 200 rows.</p>
              ) : null}
            </div>
          </section>
        </>
      ) : query.id ? (
        <p className="font-body text-[11px] text-kelly-text/70">Execution not found for this id.</p>
      ) : (
        <p className="font-body text-[11px] text-kelly-text/70">Select an execution from the list (Manage) to run preflight and sends.</p>
      )}
    </div>
  );
}
