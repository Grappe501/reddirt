import Link from "next/link";
import {
  reconcileRecentSendGridEventsAction,
  reconcileSendGridEventAction,
} from "@/app/admin/sendgrid-event-reconciliation-actions";
import { AnalyticsOperatorDrilldownPanels } from "@/components/admin/email-command-center/AnalyticsOperatorDrilldownPanels";
import { EccOperatorPageChrome } from "@/components/admin/email-command-center/ecc-operator-ux";
import type { EmailAnalyticsOperatorDrilldown } from "@/lib/email-command-center/analytics-operator-drilldown";
import type { EmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";

const ECC = "/admin/workbench/email-command-center";
const SEND_EXECUTION = `${ECC}/send-execution`;
const card =
  "rounded-lg border border-kelly-text/12 bg-gradient-to-b from-white/95 to-kelly-page/90 px-3 py-2.5 shadow-sm";
const h3 = "font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-subtle";
const badge =
  "rounded-full border border-kelly-text/15 bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-kelly-slate";

export type AnalyticsDeliverabilityViewProps = {
  snapshot: EmailCommandCenterSnapshot;
  analyticsOperatorDrilldown: EmailAnalyticsOperatorDrilldown;
  suppressionByType: Array<{ type: string; count: number }>;
  reconcileNotice?: string;
  reconcileError?: string;
};

function CheckRow({ label, ok, note }: { label: string; ok: boolean | "manual"; note?: string }) {
  const labelText =
    ok === true ? "Ready" : ok === "manual" ? "Manual" : ok === false ? "Pending" : "—";
  const cls =
    ok === true
      ? "text-emerald-800"
      : ok === "manual"
        ? "text-amber-900"
        : ok === false
          ? "text-kelly-muted"
          : "text-kelly-muted";
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-2 border-b border-kelly-text/8 py-1.5 font-body text-[11px] text-kelly-text/90 last:border-0">
      <span className="font-semibold text-kelly-navy">{label}</span>
      <span className={`shrink-0 text-[10px] font-bold uppercase ${cls}`}>{labelText}</span>
      {note ? <span className="w-full text-[10px] text-kelly-muted">{note}</span> : null}
    </li>
  );
}

export function AnalyticsDeliverabilityView({
  snapshot,
  analyticsOperatorDrilldown,
  suppressionByType,
  reconcileNotice,
  reconcileError,
}: AnalyticsDeliverabilityViewProps) {
  const q = snapshot.queueHealth;
  const pg = snapshot.profileGraph;
  const au = snapshot.audienceStudio;
  const sg = snapshot.sendgridEnv;
  const sgF = snapshot.sendGridFoundation;
  const sc = snapshot.sendGridContactSync;
  const se = snapshot.sendExecution;
  const sgr = snapshot.sendGridReconciliation;
  const ci = snapshot.contactImport;
  const oa = snapshot.openAi;
  const og = snapshot.operatorGate;
  const ms = snapshot.messageStudioSharedDrafts;
  const dbOk = og.cockpitDbReachable && ci.dbSliceReachable;

  const checklistDomainAuth: boolean | "manual" = "manual";
  const checklistSender =
    sg.sendgridFromEmailPresent && sg.sendgridFromNamePresent ? true : (false as boolean);
  const checklistWebhook = sg.sendgridWebhookVerificationKeyPresent;
  const checklistSuppressions = sgF.dbReachable && sgF.suppressionCount >= 0;
  const checklistTestSend = se.dbReachable && se.testSentCount > 0;
  const checklistAudience = au.activeAudienceDefinitions > 0 || au.draftAudienceDefinitions > 0;
  const checklistMessage = ms.dbReachable && ms.approvedForSendGovernance > 0;
  const checklistLegal = "manual" as const;
  const checklistOperator =
    se.dbReachable && (se.finalApprovedCount > 0 || se.sentCount > 0 || se.readyForFinalApprovalCount > 0);

  return (
    <div className="min-w-0 max-w-5xl space-y-4">
      <EccOperatorPageChrome snapshot={snapshot} surface="analytics" />

      <div className="flex flex-wrap items-center gap-2">
        <Link href={ECC} className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate">
          ← Communication Command Center
        </Link>
        <Link href={`${ECC}/sendgrid`} className="text-xs text-kelly-muted hover:underline">
          SendGrid Foundation
        </Link>
        <Link href={`${ECC}/audiences`} className="text-xs text-kelly-muted hover:underline">
          Audience Studio
        </Link>
        <Link href={`${ECC}/imports`} className="text-xs text-kelly-muted hover:underline">
          Contact imports
        </Link>
        <Link href={`${ECC}/automation`} className="text-xs text-kelly-muted hover:underline">
          Automation Studio
        </Link>
        <Link href={`${ECC}/message-studio`} className="text-xs text-kelly-muted hover:underline">
          Message Studio
        </Link>
        <Link href={`${ECC}/map`} className="text-xs text-kelly-muted hover:underline">
          Route map
        </Link>
        <Link href={SEND_EXECUTION} className="text-xs text-kelly-muted hover:underline">
          Send execution governance
        </Link>
        <Link href={`${ECC}/readiness`} className="text-xs text-kelly-muted hover:underline">
          Readiness
        </Link>
      </div>

      {!og.cockpitDbReachable ? (
        <div className="rounded-lg border border-rose-400/50 bg-rose-50/90 px-3 py-2 font-body text-[11px] text-rose-950" role="alert">
          <strong>Database unreachable</strong> — queue, intelligence, import, and SendGrid table counts below may read as zero.
          Restore <code className="text-[10px]">DATABASE_URL</code> and run <code className="text-[10px]">{og.dbDiagnoseCliHint}</code>.
        </div>
      ) : null}
      {reconcileError ? (
        <div className="rounded-lg border border-rose-400/50 bg-rose-50/90 px-3 py-2 font-body text-[11px] text-rose-950" role="alert">
          {reconcileError}
        </div>
      ) : null}
      {reconcileNotice ? (
        <div className="rounded-lg border border-emerald-400/50 bg-emerald-50/90 px-3 py-2 font-body text-[11px] text-emerald-950" role="status">
          {reconcileNotice}
        </div>
      ) : null}

      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Analytics &amp; Deliverability</h1>
        <p className="max-w-3xl font-body text-sm text-kelly-text/85">
          Track readiness, queue health, audience growth, and suppression signals <strong>before</strong> campaign sends.
          EMAIL-AUTOMATION-ANALYTICS-SHELL-1.0 + <strong>EMAIL-ANALYTICS-DRILLDOWN-1.0</strong> — read-only aggregates and bounded drilldown tables from the Command Center snapshot; no sends, no provider calls from this page, no new schema.
        </p>
        <div className="flex flex-wrap gap-1.5">
          <span className={badge}>No production sends yet</span>
          <span className={badge}>Suppressions honored</span>
          <span className={badge}>Readiness-first</span>
          <span className={badge}>SendGrid future</span>
        </div>
      </header>

      {og.cockpitDbReachable && q.total === 0 ? (
        <div className="rounded-lg border border-kelly-text/12 bg-kelly-fog/45 px-3 py-2 font-body text-[11px] text-kelly-navy" role="status">
          <p className="font-semibold">Quiet queue snapshot</p>
          <p className="mt-1 text-[10px] text-kelly-text/85">
            Counts are zero because this database has no EmailWorkflowItem rows yet — charts below are truthful, not broken.
            Seed work via{" "}
            <Link href="/admin/workbench/email-command-center/gmail/review" className="font-bold underline">
              Gmail review
            </Link>{" "}
            or{" "}
            <Link href="/admin/workbench/email-queue#create-manual" className="font-bold underline">
              manual queue item
            </Link>
            .
          </p>
          <p className="mt-1 text-[10px] text-kelly-forest/90">
            <strong>Safety:</strong> this page never sends mail.
          </p>
        </div>
      ) : null}

      <AnalyticsOperatorDrilldownPanels snapshot={snapshot} drilldown={analyticsOperatorDrilldown} />

      <section className={card}>
        <h2 className={h3}>Intelligence analytics</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Stat href="/admin/workbench/email-queue" label="Queue items with AI analysis" value={oa.emailAiQueueItemsAnalyzedCount} sub="metadataJson.emailAiAnalysis" />
          <Stat href={pg.profilesReviewPath} label="Pending profile suggestions" value={pg.pendingProfileFactSuggestions} />
          <Stat href={pg.profilesReviewPath} label="Pending audience hints" value={pg.pendingAudienceHints} />
          <Stat href={pg.profilesReviewPath} label="Approved profile facts (active)" value={pg.approvedActiveFacts} />
          <Stat href={au.path} label="Audience building blocks (approved triples)" value={au.buildingBlockApprovedTriples} sub={au.dbSliceReachable ? undefined : "Studio tables not verified"} />
        </div>
      </section>

      <section className={card}>
        <h2 className={h3}>Contact import analytics</h2>
        {!dbOk ? (
          <p className="mt-2 rounded border border-amber-200/80 bg-amber-50/80 px-2 py-2 font-body text-[11px] text-amber-950">
            Import batch counts unavailable or not trustworthy on this request — open{" "}
            <Link href={ci.path} className="font-bold underline">
              imports
            </Link>{" "}
            after DB + migration gates pass ({og.preflightCliHint}).
          </p>
        ) : null}
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Stat href={ci.path} label="Open import batches" value={ci.openImportBatchCount} sub="Non-terminal (excludes committed + archived)" />
          <Stat href={ci.path} label="Pending approval" value={ci.pendingApprovalCount} sub="VALIDATED + READY_FOR_APPROVAL" />
          <Stat href={ci.path} label="Committed batches" value={ci.committedBatchCount} />
          <Stat href={ci.path} label="Consent warnings (Σ batches)" value={ci.consentWarningRowsSummed} />
        </div>
      </section>

      <section className={card}>
        <h2 className={h3}>Audience analytics</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Stat href={au.path} label="Draft audience definitions" value={au.draftAudienceDefinitions} />
          <Stat href={au.path} label="Approved fact triples (building blocks)" value={au.buildingBlockApprovedTriples} />
          <Stat href={au.path} label="Non-archived audience definitions" value={au.activeAudienceDefinitions} />
          <Stat href={au.path} label="Audience preview runs" value="—" sub="See Audience Studio per definition" />
          <Stat
            href={sc.path}
            label="SendGrid contact sync runs (preview+approved)"
            value={sc.dbReachable ? sc.runsPreviewedCount + sc.runsApprovedCount : "—"}
            sub="1.2 adds governed Marketing Contacts upsert (no sends)"
          />
        </div>
      </section>

      <section id="contact-sync-health" className={`${card} scroll-mt-20`}>
        <h2 className={h3}>SendGrid contact sync — health summary</h2>
        <p className="mt-1 font-body text-[10px] text-kelly-muted">
          EMAIL-SENDGRID-SYNC-RECONCILIATION-POLISH-1.0 — snapshot from <code className="text-[9px]">SendGridContactSyncRun</code> only. Σ suppression / warnings sum{" "}
          <strong>non-archived</strong> run rows (preview pipeline; not SendGrid Marketing API totals). <strong>No sends.</strong>
        </p>
        {!sc.dbReachable ? (
          <p className="mt-2 rounded border border-amber-200/80 bg-amber-50/80 px-2 py-2 text-[10px] text-amber-950">
            Sync run slice not live — verify migrations include{" "}
            <code className="text-[9px]">20260509120000_sendgrid_contact_sync_run</code> and rerun{" "}
            <code className="text-[9px]">{og.preflightCliHint}</code>.
          </p>
        ) : null}
        {sc.readinessWarningsSample.length ? (
          <ul className="mt-2 list-inside list-disc font-body text-[10px] text-amber-950">
            {sc.readinessWarningsSample.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        ) : null}
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Stat href={sc.path} label="PREVIEWED runs" value={sc.runsPreviewedCount} sub="Operator-saved previews" />
          <Stat
            href={sc.path}
            label="Approved awaiting execution"
            value={sc.runsApprovedAwaitingExecutionCount}
            sub="APPROVED rows — Marketing Contacts upsert only; no send"
          />
          <Stat href={sc.path} label="SYNCED runs" value={sc.runsSyncedCount} sub="Marketing upsert completed" />
          <Stat
            href={sc.path}
            label="FAILED runs (needs review)"
            value={sc.runsFailedCount}
            sub="Inspect safeError in resultJson on SendGrid Foundation"
          />
          <Stat href={sc.path} label="ARCHIVED runs" value={sc.runsArchivedCount} sub="Historical / cleared rows" />
          <Stat
            href={sc.path}
            label="Σ suppressed (non-archived runs)"
            value={sc.sumExcludedSuppressedNonArchived}
            sub="Preview exclusions vs local suppression table"
          />
          <Stat
            href={sc.path}
            label="Σ consent / source warnings"
            value={sc.sumWarningCountNonArchived}
            sub="Per-run warningCount from preview"
          />
          <Stat
            href={sc.path}
            label="Latest FAILED (UTC)"
            value={sc.latestFailedAtIso ? sc.latestFailedAtIso.slice(0, 19) : "—"}
            sub="Most recent FAILED row updatedAt"
          />
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Stat
            href={sc.path}
            label="Last sync (UTC)"
            value={sc.latestSyncedAtIso ? sc.latestSyncedAtIso.slice(0, 19) : "—"}
            sub={sc.latestSyncedProviderStatus ? `Provider status: ${sc.latestSyncedProviderStatus}` : "No SYNCED rows yet"}
          />
          <Stat
            href={sc.path}
            label="Last provider job id"
            value={sc.latestSyncedProviderJobId ? `…${sc.latestSyncedProviderJobId.slice(-8)}` : "—"}
            sub="From latest SYNCED resultJson"
          />
          <Stat href={sgF.path} label="Suppressions (local table rows)" value={sgF.dbReachable ? sgF.suppressionCount : "—"} sub="Honored in preview + execute" />
        </div>
      </section>

      <section id="send-execution-preflight" className={`${card} scroll-mt-20`}>
        <h2 className={h3}>Send execution analytics</h2>
        <p className="mt-1 font-body text-[10px] text-kelly-muted">
          EMAIL-SEND-EXECUTION-1.0 — Postgres counts only.{" "}
          <strong>EMAIL-SENDGRID-EVENT-RECIPIENT-RECONCILIATION-1.0</strong> (below) links webhook{" "}
          <code className="text-[9px]">SendGridEvent</code> rows to <code className="text-[9px]">EmailSendRecipient</code> for
          delivered/bounce/unsubscribe/spam and engagement metadata — no provider send from this page.
        </p>
        {!se.dbReachable ? (
          <p className="mt-2 rounded border border-amber-200/80 bg-amber-50/80 px-2 py-2 text-[10px] text-amber-950">
            Execution table not reachable on this request — apply{" "}
            <code className="text-[9px]">20260510140000_email_send_execution</code> and rerun migrate.
          </p>
        ) : null}
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Stat href={SEND_EXECUTION} label="Total executions" value={se.totalExecutions} />
          <Stat
            href={SEND_EXECUTION}
            label="Need preflight (DRAFT + failed)"
            value={se.needPreflightCount}
            sub="Operator must run preflight before test send"
          />
          <Stat href={SEND_EXECUTION} label="Test sends recorded" value={se.testSentCount} sub="Operator-address tests only" />
          <Stat href={SEND_EXECUTION} label="Final sends completed" value={se.sentCount} sub="SendGrid submit batches" />
          <Stat href={SEND_EXECUTION} label="Failed / partial" value={se.failedCount + se.partialFailureCount} />
          <Stat href={SEND_EXECUTION} label="Preflight failed" value={se.preflightFailedCount} />
          <Stat href={SEND_EXECUTION} label="Ready for test" value={se.readyForTestCount} />
          <Stat href={SEND_EXECUTION} label="Final approval pending" value={se.readyForFinalApprovalCount} />
          <Stat href={SEND_EXECUTION} label="Archived" value={se.archivedCount} />
        </div>
        {se.dbReachable && se.preflightFailedCount > 0 ? (
          <div className="mt-3 rounded border border-rose-200/70 bg-rose-50/80 px-2 py-2 font-body text-[10px] text-rose-950">
            <p className="font-heading text-[9px] font-bold uppercase text-rose-900/80">Preflight failure rollup (first failed check id)</p>
            {se.preflightFailedTopBlockers.length === 0 ? (
              <p className="mt-1 text-[9px] text-rose-900/85">No parseable preflight rows — open Send Execution and re-run preflight to store hardened checklist JSON.</p>
            ) : (
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                {se.preflightFailedTopBlockers.map((b) => (
                  <li key={b.id}>
                    <span className="font-mono font-bold">{b.id}</span> — {b.count} execution(s) with this first failure
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2">
              <Link href={`${SEND_EXECUTION}#ops`} className="font-bold text-kelly-forest underline">
                Open Send Execution → run preflight
              </Link>{" "}
              (no send from Analytics).
            </p>
          </div>
        ) : null}
      </section>

      <section id="reconciliation" className={`${card} scroll-mt-20`}>
        <h2 className={h3}>SendGrid event → recipient reconciliation</h2>
        <p className="mt-1 font-body text-[10px] text-kelly-text/75">
          EMAIL-SENDGRID-EVENT-RECIPIENT-RECONCILIATION-1.0 — read-only toward SendGrid API. Operators may batch-link webhook
          events to           <code className="text-[9px]">EmailSendRecipient</code> / rollups (matched by <code className="text-[9px]">custom_args</code> from
          governed sends, <code className="text-[9px]">sg_message_id</code>, or email + sent window). Opens/clicks increment{" "}
          <code className="text-[9px]">metadataJson.eccEngagement</code> when matched. <strong>No sends</strong> from this surface.
        </p>
        {!sgr.dbReachable ? (
          <p className="mt-2 text-[10px] text-amber-950">Reconciliation slice unavailable — check database connectivity.</p>
        ) : (
          <>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Stat href="#reconciliation" label="SendGrid events (total rows)" value={sgr.totalEvents} />
              <Stat href="#reconciliation" label="Reconciled (matched)" value={sgr.matchedCount} sub="Linked to a recipient row" />
              <Stat href="#reconciliation" label="Pending reconciliation" value={sgr.pendingReconciliationCount} sub="No eccReconciliation meta yet" />
              <Stat href="#reconciliation" label="Unmatched (review)" value={sgr.unmatchedCount} sub="No recipient found for rules" />
              <Stat href="#reconciliation" label="Skipped" value={sgr.skippedCount} sub="Engagement w/o recipient, etc." />
              <Stat href="#reconciliation" label="Last reconciled (UTC)" value={sgr.lastReconciledAtIso ? sgr.lastReconciledAtIso.slice(0, 19) : "—"} />
              <Stat href="#reconciliation" label="Bounce-ish events (rows)" value={sgr.bounceEventsApprox} sub="bounce / dropped" />
              <Stat href="#reconciliation" label="Unsubscribe events (rows)" value={sgr.unsubscribeEventsApprox} />
              <Stat href="#reconciliation" label="Spam report events (rows)" value={sgr.spamEventsApprox} />
            </div>
            <div className="mt-3 rounded border border-kelly-text/10 bg-kelly-page/50 px-2 py-2">
              <p className="font-heading text-[9px] font-bold uppercase text-kelly-muted">EmailSendRecipient status (all executions)</p>
              <ul className="mt-1 flex flex-wrap gap-2 font-mono text-[9px] text-kelly-navy">
                {Object.entries(sgr.recipientByStatus).length === 0 ? (
                  <li className="text-kelly-muted">No recipient rows yet.</li>
                ) : (
                  Object.entries(sgr.recipientByStatus).map(([k, v]) => (
                    <li key={k} className="rounded border border-kelly-text/10 bg-white/90 px-1.5 py-0.5">
                      {k}: <span className="font-bold tabular-nums">{v}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <form action={reconcileRecentSendGridEventsAction} className="flex flex-wrap items-end gap-2">
                <label className="text-[10px] text-kelly-text/80">
                  Batch size
                  <input
                    type="number"
                    name="limit"
                    min={5}
                    max={120}
                    defaultValue={40}
                    className="mt-0.5 w-20 rounded border px-2 py-1 text-[11px]"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded border border-kelly-forest/40 bg-emerald-50/90 px-3 py-1 text-[10px] font-bold text-kelly-navy"
                >
                  Reconcile recent events
                </button>
              </form>
            </div>
            <div className="mt-3 max-h-56 overflow-auto rounded border border-kelly-text/10">
              <table className="w-full text-left font-mono text-[9px] text-kelly-navy">
                <thead className="sticky top-0 bg-kelly-fog/90 text-kelly-muted">
                  <tr>
                    <th className="px-1 py-1">When (UTC)</th>
                    <th className="px-1 py-1">Type</th>
                    <th className="px-1 py-1">Email</th>
                    <th className="px-1 py-1">Recon</th>
                    <th className="px-1 py-1">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sgr.recentEvents.map((ev) => (
                    <tr key={ev.id} className="border-t border-kelly-text/8">
                      <td className="px-1 py-0.5">{ev.occurredAtIso.slice(0, 19)}</td>
                      <td className="px-1 py-0.5">{ev.eventType}</td>
                      <td className="px-1 py-0.5">{ev.email ?? "—"}</td>
                      <td className="px-1 py-0.5">{ev.reconciliationState ?? "—"}</td>
                      <td className="px-1 py-0.5">
                        <form action={reconcileSendGridEventAction} className="inline">
                          <input type="hidden" name="eventId" value={ev.id} />
                          <button
                            type="submit"
                            className="rounded border border-kelly-text/20 bg-white px-1 py-0.5 text-[8px] font-bold text-kelly-navy hover:bg-kelly-fog/80"
                          >
                            Reconcile one
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section className={card}>
        <h2 className={h3}>SendGrid deliverability foundation</h2>
        <p className="mt-1 font-body text-[10px] text-kelly-muted">Env presence only — never values. Table counts require applied migrations + healthy DB.</p>
        <ul className="mt-2 space-y-1 font-body text-[11px] text-kelly-text/90">
          <li>
            <strong>SENDGRID_API_KEY</strong> configured:{" "}
            <span className="font-semibold">{sg.sendgridApiKeyPresent ? "yes" : "no"}</span>
          </li>
          <li>
            <strong>SENDGRID_FROM_EMAIL</strong> configured:{" "}
            <span className="font-semibold">{sg.sendgridFromEmailPresent ? "yes" : "no"}</span>
          </li>
          <li>
            <strong>SENDGRID_FROM_NAME</strong> configured:{" "}
            <span className="font-semibold">{sg.sendgridFromNamePresent ? "yes" : "no"}</span>
          </li>
          <li>
            Webhook verification key present:{" "}
            <span className="font-semibold">{sg.sendgridWebhookVerificationKeyPresent ? "yes" : "no"}</span> (
            <code className="text-[10px]">SENDGRID_WEBHOOK_VERIFICATION_KEY</code> or{" "}
            <code className="text-[10px]">SENDGRID_WEBHOOK_PUBLIC_KEY</code>)
          </li>
          <li>
            SendGrid events ingested (rows):{" "}
            <span className="font-semibold">{sgF.dbReachable ? sgF.recentSendGridEventsCount : "— (DB)"}</span> —{" "}
            <Link href={`${ECC}/sendgrid`} className="font-bold text-kelly-forest underline">
              Foundation surface
            </Link>
          </li>
          <li>
            Suppressions (local table):{" "}
            <span className="font-semibold">{sgF.dbReachable ? sgF.suppressionCount : "—"}</span>
          </li>
          <li>
            <strong>Production SendGrid broadcast:</strong>{" "}
            <span className="font-semibold text-kelly-navy">governed</span> — only from{" "}
            <Link href={SEND_EXECUTION} className="font-bold underline">
              Send Execution (#ops)
            </Link>{" "}
            after preflight, test send, final approval, typed confirmation, and hosted DB gate in production.
          </li>
        </ul>
        {suppressionByType.length ? (
          <div className="mt-3">
            <p className={h3}>Suppression categories (local)</p>
            <ul className="mt-1 grid gap-1 sm:grid-cols-2">
              {suppressionByType.map((s) => (
                <li key={s.type} className="rounded border border-kelly-text/10 bg-kelly-page/50 px-2 py-1 text-[10px]">
                  <span className="font-mono text-kelly-navy">{s.type}</span> ·{" "}
                  <span className="font-bold tabular-nums">{s.count}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-3 text-[10px] text-kelly-muted">
            No suppression-type breakdown (empty table or DB unreachable). Events still route through{" "}
            <code className="text-[10px]">POST /api/sendgrid/events</code> when configured.
          </p>
        )}
        <div className="mt-3 rounded border border-kelly-text/12 bg-kelly-fog/40 px-2 py-2">
          <p className="font-heading text-[9px] font-bold uppercase text-kelly-muted">Domain authentication (manual)</p>
          <ul className="mt-1 list-inside list-disc text-[10px] text-kelly-text/85">
            <li>Confirm SPF/DKIM/DMARC in SendGrid + DNS host — not inferred from this app.</li>
            <li>Link tracking and click domain settings remain operator choices in SendGrid.</li>
            <li>Branded link / dedicated sending domains follow counsel + comms policy.</li>
          </ul>
        </div>
      </section>

      <section className={card}>
        <h2 className={h3}>Deliverability launch checklist</h2>
        <ul className="mt-2 space-y-0.5">
          <CheckRow
            label="Domain authentication confirmed (SendGrid + DNS)"
            ok={checklistDomainAuth}
            note="Operator confirms in SendGrid dashboard — this UI does not probe DNS."
          />
          <CheckRow label="Sender identity (from email + from name env)" ok={checklistSender} />
          <CheckRow
            label="Unsubscribe / suppression handling confirmed"
            ok={checklistWebhook && checklistSuppressions}
            note="Webhook verification + local suppression table when migrations applied."
          />
          <CheckRow
            label="Test send plan approved"
            ok={checklistTestSend}
            note="Heuristic: at least one governed test send row exists — review content in inbox."
          />
          <CheckRow label="Audience approved / defined" ok={checklistAudience} note="Heuristic: at least one draft or active definition." />
          <CheckRow
            label="Message approved"
            ok={checklistMessage}
            note="Heuristic: shared drafts in APPROVED_FOR_SEND_GOVERNANCE (Message Studio server drafts)."
          />
          <CheckRow label="Legal / compliance review (if mass-send)" ok={checklistLegal} />
          <CheckRow
            label="Operator final approval"
            ok={checklistOperator}
            note="Heuristic: execution in final-approval pipeline or completed — verify in Send Execution console."
          />
        </ul>
      </section>

      <section className="rounded-lg border-2 border-rose-300/45 bg-rose-50/80 px-3 py-2.5">
        <h2 className={`${h3} text-rose-950`}>Governance panel</h2>
        <ul className="mt-2 list-inside list-disc space-y-0.5 font-body text-[11px] text-rose-950/95">
          <li>Analytics views do not grant permission to send.</li>
          <li>Suppression table must gate future sends — honor before any broadcast packet.</li>
          <li>No SendGrid send from this Analytics route — governed sends live under Send Execution (#ops) only.</li>
          <li>No Gmail send exists from this route.</li>
        </ul>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  sub,
}: {
  label: string;
  value: number | string;
  href: string;
  sub?: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-md border border-kelly-text/10 bg-white/90 px-2 py-2 transition hover:border-kelly-forest/30"
    >
      <p className="font-heading text-[9px] font-bold uppercase tracking-wide text-kelly-muted">{label}</p>
      <p className="mt-0.5 font-heading text-xl font-bold tabular-nums text-kelly-navy">{value}</p>
      {sub ? <p className="mt-0.5 text-[9px] text-kelly-muted">{sub}</p> : null}
    </Link>
  );
}
