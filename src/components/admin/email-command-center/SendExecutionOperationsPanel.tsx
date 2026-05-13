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
import { CopyPreflightSummaryButton } from "@/components/admin/email-command-center/CopyPreflightSummaryButton";
import { EccBlockedBecausePanel, EccEmptyState } from "@/components/admin/email-command-center/ecc-operator-ux";
import { EMAIL_SEND_FINAL_CONFIRMATION_PHRASE } from "@/lib/email-command-center/send-execution";
import {
  parsePreflightCheckRows,
  parsePreflightRecipientBreakdown,
} from "@/lib/email-command-center/send-execution-preflight-json";
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

function buildPreflightExportSummary(params: {
  executionId: string;
  status: string;
  checks: ReturnType<typeof parsePreflightCheckRows>;
  breakdown: ReturnType<typeof parsePreflightRecipientBreakdown>;
}): string {
  const lines = [
    "EMAIL-SEND-EXECUTION-PREFLIGHT-HARDENING-1.0",
    `Execution: ${params.executionId}`,
    `Status: ${params.status}`,
    "",
    "--- Checks ---",
    ...params.checks.map((c) => {
      const tail = [
        !c.ok && c.whyFailed ? `  Why: ${c.whyFailed}` : "",
        !c.ok && c.fixHref ? `  Fix: ${c.fixLabel ?? "Open"} → ${c.fixHref}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      return `${c.ok ? "PASS" : "FAIL"}\t${c.id}\t${c.detail}${tail ? `\n${tail}` : ""}`;
    }),
    "",
    "--- Recipient breakdown ---",
    params.breakdown
      ? [
          `Audience matched profiles: ${params.breakdown.audienceMatchedProfiles}`,
          `Candidates with valid email: ${params.breakdown.candidatesWithValidEmail}`,
          `Profiles missing email: ${params.breakdown.profilesMissingEmail}`,
          `Excluded (suppressed): ${params.breakdown.excludedSuppressed}`,
          `Excluded (import consent / source warning): ${params.breakdown.excludedMissingConsentSource}`,
          `Final eligible (READY): ${params.breakdown.finalEligible}`,
        ].join("\n")
      : "(no breakdown — run preflight)",
    "",
    "No send performed. Snapshot only.",
  ];
  return lines.join("\n");
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
  const testMailReady = se.sendGridMailTestReady;
  const broadcastMailReady = se.sendGridMailBroadcastReady;
  const isProdBuild = process.env.NODE_ENV === "production";
  /** Production blocks test send when migrations / execution tables are not verified. */
  const prodOperatorGateBlocksTestSend = isProdBuild && og.governedSendExecutionDbReady !== true;

  const preflightRows = detail ? parsePreflightCheckRows(detail.preflightJson) : [];
  const recipientBreakdown = detail ? parsePreflightRecipientBreakdown(detail.preflightJson) : null;
  const preflightExportText = detail
    ? buildPreflightExportSummary({
        executionId: detail.id,
        status: detail.status,
        checks: preflightRows,
        breakdown: recipientBreakdown,
      })
    : "";

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
        <p className="mt-2 rounded border border-amber-300/70 bg-amber-50/95 px-2 py-2 font-body text-[10px] font-semibold text-amber-950">
          Overnight / unattended safety: do <strong>not</strong> run SendGrid <strong>test</strong> sends or{" "}
          <strong>final</strong> broadcasts while the responsible operator is away. This build leaves explicit buttons
          only — every send still requires a live, deliberate click and (for final) typed confirmation. Resume when an
          operator is present.
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
                  <td colSpan={7} className="px-2 py-3">
                    <EccEmptyState
                      why="No EmailSendExecution rows yet"
                      next="Create a draft execution from a shared Message Studio draft in APPROVED_FOR_SEND_GOVERNANCE, an ACTIVE audience, and (for broadcast) a SYNCED contact sync run."
                      safety="Queue APPROVED does not send mail — only this governed console may call SendGrid after preflight + explicit approvals."
                      href="/admin/workbench/email-command-center/message-studio#shared-drafts"
                      linkLabel="Open Message Studio → shared drafts"
                    />
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
        <EccBlockedBecausePanel
          reasons={[
            ...(drafts.length === 0
              ? [
                  "No shared draft selected — promote or create a server draft in Message Studio (#shared-drafts) before execution can attach copy.",
                ]
              : []),
            ...(audiences.length === 0
              ? ["No audience selected — activate an EmailAudienceDefinition in Audience Studio (ACTIVE status)."]
              : []),
            ...(syncedRuns.length === 0
              ? [
                  "No SYNCED SendGrid contact sync run on file — broadcast preflight will block until a governed upsert completes on SendGrid Foundation.",
                ]
              : []),
          ]}
        />
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
            <ul className="mt-2 space-y-2 rounded border border-kelly-text/10 bg-white/80 p-2 font-body text-[10px]">
              {preflightRows.length === 0 ? (
                <li className="text-kelly-text/60">No preflight record yet — run preflight.</li>
              ) : (
                preflightRows.map((c) => (
                  <li key={c.id} className={`rounded border px-2 py-1 ${c.ok ? "border-emerald-200/80 text-emerald-950" : "border-rose-200/90 text-rose-950"}`}>
                    <div>
                      <span className="font-bold">{c.ok ? "PASS" : "FAIL"}</span> · <span className="font-mono text-[9px]">{c.id}</span>
                      <span className="text-kelly-text/85"> — {c.detail}</span>
                    </div>
                    {!c.ok && c.whyFailed ? <p className="mt-1 text-[9px] leading-snug text-rose-950/95">Why: {c.whyFailed}</p> : null}
                    {!c.ok && c.fixHref ? (
                      <p className="mt-1">
                        <Link href={c.fixHref} className="font-bold text-kelly-forest underline">
                          {c.fixLabel ?? "Open fix path"}
                        </Link>
                      </p>
                    ) : null}
                  </li>
                ))
              )}
            </ul>
            {recipientBreakdown ? (
              <div className="mt-2 rounded border border-kelly-text/10 bg-kelly-page/40 px-2 py-2 font-body text-[10px] text-kelly-navy">
                <p className="font-heading text-[9px] font-bold uppercase text-kelly-text/55">Recipient breakdown (preflight scan)</p>
                <ul className="mt-1 grid gap-0.5 sm:grid-cols-2">
                  <li>
                    Audience matched profiles: <span className="font-bold tabular-nums">{recipientBreakdown.audienceMatchedProfiles}</span>
                  </li>
                  <li>
                    Candidates (valid email): <span className="font-bold tabular-nums">{recipientBreakdown.candidatesWithValidEmail}</span>
                  </li>
                  <li>
                    Missing email: <span className="font-bold tabular-nums">{recipientBreakdown.profilesMissingEmail}</span>
                  </li>
                  <li>
                    Excluded (suppressed): <span className="font-bold tabular-nums">{recipientBreakdown.excludedSuppressed}</span>
                  </li>
                  <li>
                    Excluded (consent / source): <span className="font-bold tabular-nums">{recipientBreakdown.excludedMissingConsentSource}</span>
                  </li>
                  <li>
                    Final eligible (READY): <span className="font-bold tabular-nums">{recipientBreakdown.finalEligible}</span>
                  </li>
                </ul>
              </div>
            ) : null}
            <CopyPreflightSummaryButton text={preflightExportText} />
            <p className="mt-2 font-body text-[10px] text-kelly-text/70">
              DB counts (execution row): candidate {detail.candidateRecipientCount} · suppressed {detail.suppressedRecipientCount} · final{" "}
              {detail.finalRecipientCount}
              {detail.errorSafe ? (
                <>
                  {" "}
                  · <span className="font-semibold text-rose-900">Last error:</span> {detail.errorSafe}
                </>
              ) : null}
            </p>
          </section>

          <section className={card}>
            <h2 className={h3}>4. Test send (one explicit address)</h2>
            <p className="mt-1 font-body text-[10px] text-kelly-text/75">
              This is a <strong>governed test email only</strong>: <strong>one</strong> recipient address that you type here — not a list
              send, not the workflow queue, not bulk. The server prefixes the subject with <code className="text-[9px]">[TEST]</code>{" "}
              (your draft subject stays in the row; SendGrid sees <code className="text-[9px]">[TEST] …</code>). Available only when
              status is <code className="text-[9px]">READY_FOR_TEST</code> after preflight.
            </p>
            {prodOperatorGateBlocksTestSend ? (
              <p
                className="mt-2 rounded border border-rose-300/70 bg-rose-50/95 px-2 py-2 font-body text-[10px] font-semibold text-rose-950"
                role="alert"
              >
                <strong>Production operator gate — test send blocked.</strong> On production builds, SendGrid test send is disabled
                until Email Command Center migrations are applied and send-execution tables respond on this{" "}
                <code className="text-[9px]">DATABASE_URL</code> (see readiness + <code className="text-[9px]">npm run email:command-center:preflight</code>
                ). Fix that gate first; this is separate from missing SendGrid env vars.
              </p>
            ) : null}
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
                disabled={detail.status !== "READY_FOR_TEST" || !testMailReady || prodOperatorGateBlocksTestSend}
                className="rounded border border-kelly-navy/35 bg-kelly-fog/90 px-3 py-1 text-[10px] font-bold text-kelly-navy disabled:opacity-40"
              >
                Send test via SendGrid
              </button>
            </form>
            {detail.status === "READY_FOR_TEST" && !testMailReady ? (
              <p className="mt-2 font-body text-[10px] text-amber-950">
                Test send disabled until <code className="text-[9px]">SENDGRID_API_KEY</code>,{" "}
                <code className="text-[9px]">SENDGRID_FROM_EMAIL</code>, and <code className="text-[9px]">SENDGRID_FROM_NAME</code>{" "}
                are set on this host.
              </p>
            ) : null}
            {detail.status === "READY_FOR_TEST" && testMailReady && prodOperatorGateBlocksTestSend ? (
              <p className="mt-2 font-body text-[10px] text-rose-950">
                SendGrid mail env is present, but the <strong>production migration / send-execution verification gate</strong> still blocks
                this button — run <code className="text-[9px]">npx prisma migrate deploy</code> on the canonical database, then retry.
              </p>
            ) : null}
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
                disabled={
                  detail.status !== "FINAL_APPROVED" ||
                  !broadcastMailReady ||
                  detail.finalRecipientCount < 1
                }
                className="rounded border border-rose-600/50 bg-rose-100 px-3 py-1.5 text-[11px] font-bold text-rose-950 disabled:opacity-40"
              >
                Execute final SendGrid send
              </button>
            </form>
            {detail.status === "FINAL_APPROVED" && !broadcastMailReady ? (
              <p className="mt-2 font-body text-[10px] text-rose-900">
                Final send stays disabled until <code className="text-[9px]">SENDGRID_API_KEY</code>,{" "}
                <code className="text-[9px]">SENDGRID_FROM_EMAIL</code>, <code className="text-[9px]">SENDGRID_FROM_NAME</code>, and
                numeric <code className="text-[9px]">SENDGRID_UNSUBSCRIBE_GROUP_ID</code> (ASM) are configured.
              </p>
            ) : null}
            {detail.status === "FINAL_APPROVED" && broadcastMailReady && detail.finalRecipientCount < 1 ? (
              <p className="mt-2 font-body text-[10px] text-rose-900">
                No READY recipients on record — run preflight again after fixing audience or suppressions.
              </p>
            ) : null}
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
