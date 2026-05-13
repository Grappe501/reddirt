import Link from "next/link";
import type { ReactNode } from "react";
import type { EmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";

const card =
  "rounded-lg border border-kelly-text/12 bg-gradient-to-b from-white/95 to-kelly-page/90 px-3 py-2.5 shadow-sm";
const h3 = "font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/50";

function boolChip(ok: boolean, yes = "Ready", no = "Needs setup") {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
        ok ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"
      }`}
    >
      {ok ? yes : no}
    </span>
  );
}

function CardShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={card}>
      <h2 className={h3}>{title}</h2>
      <div className="mt-2 space-y-1.5 font-body text-[11px] text-kelly-navy/90">{children}</div>
    </section>
  );
}

const MESSAGE_STUDIO_PATH = "/admin/workbench/email-command-center/message-studio";
const AUDIENCES_PATH = "/admin/workbench/email-command-center/audiences";
const IMPORTS_PATH = "/admin/workbench/email-command-center/imports";
const SEND_EXEC_PATH = "/admin/workbench/email-command-center/send-execution";
const GMAIL_MONITOR_PATH = "/admin/workbench/email-command-center/gmail";
const GMAIL_REVIEW_PATH = "/admin/workbench/email-command-center/gmail/review";

export function EmailCommandCenterTodayView({
  snapshot,
  query = {},
}: {
  snapshot: EmailCommandCenterSnapshot;
  query?: { gmail?: string; gmail_error?: string; missing?: string };
}) {
  const og = snapshot.operatorGate;
  const g = snapshot.gmail;
  const sg = snapshot.sendgridEnv;
  const sgF = snapshot.sendGridFoundation;
  const ci = snapshot.contactImport;
  const au = snapshot.audienceStudio;
  const al = snapshot.audienceListHealth;
  const se = snapshot.sendExecution;
  const ms = snapshot.messageStudioSharedDrafts;
  const gp = snapshot.gmailProductionWatch;

  const sendgridConfiguredForSend = sg.sendgridApiKeyPresent && sg.sendgridFromEmailPresent;
  const migrationOk = og.allEmailCommandCenterMigrationsApplied === true;
  const dbOk = og.cockpitDbReachable;
  const gmailLinked = g.commandSurfacePhase === "connected";
  const gmailSyncOk = g.monitorInboxSync === "metadata_sync_ready";
  const watchHealthy = g.gmailWatchDisplayStatus === "ACTIVE" && !g.gmailWatchPushIncomplete;
  const suppressionListReady = sgF.dbReachable;

  const nextImportAction =
    !migrationOk || !ci.dbSliceReachable
      ? "Finish database setup, then open imports."
      : ci.pendingApprovalCount > 0
        ? "Review and approve a staged batch."
        : ci.openImportBatchCount > 0
          ? "Validate or commit open import batches."
          : "Upload a CSV on the imports page.";

  const topPreflightBlocker = se.preflightFailedTopBlockers[0]?.id ?? null;

  return (
    <div className="space-y-3">
      <div
        className="rounded-lg border border-kelly-forest/30 bg-emerald-50/70 px-3 py-2 font-body text-[11px] text-emerald-950"
        role="status"
      >
        <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-emerald-950/90">Today</p>
        <p className="mt-1 leading-snug">
          Five steps below: readiness, import, audience, draft, then governed send on{" "}
          <Link href={`${SEND_EXEC_PATH}#ops`} className="font-bold underline">
            Send execution
          </Link>
          . Queue and automation paths do not send by themselves.
        </p>
      </div>

      {query.gmail_error ? (
        <div className="rounded-lg border border-rose-300/60 bg-rose-50/80 px-3 py-2 font-body text-[11px] text-rose-950" role="alert">
          <span className="font-bold">Gmail OAuth:</span> {query.gmail_error}
          {query.missing ? (
            <>
              {" "}
              — check env: <code className="text-[10px]">{query.missing}</code>
            </>
          ) : null}
        </div>
      ) : null}

      {!dbOk ? (
        <div className="rounded-lg border border-rose-400/50 bg-rose-50/90 px-3 py-2 font-body text-[11px] text-rose-950" role="alert">
          Database unreachable — fix connectivity then re-open this page.{" "}
          <code className="text-[10px]">{og.dbDiagnoseCliHint}</code>
        </div>
      ) : null}

      {og.migrationGateNote && migrationOk === false ? (
        <div className="rounded-lg border border-amber-400/50 bg-amber-50/90 px-3 py-2 font-body text-[11px] text-amber-950" role="status">
          {og.migrationGateNote}
        </div>
      ) : null}

      <div className="grid gap-2 lg:grid-cols-2">
        <CardShell title="1. System ready">
          <p className="text-[10px] text-kelly-text/80">
            Gmail watch: <span className="font-semibold">{g.gmailWatchDisplayStatus.replaceAll("_", " ")}</span>
            {gp.watchesExpiringWithin48hCount > 0 ? (
              <span className="text-amber-900"> · renew within 48h ({gp.watchesExpiringWithin48hCount})</span>
            ) : null}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {boolChip(dbOk, "DB connected", "DB")}
            {boolChip(migrationOk, "Workspace migrated", "Migrations")}
            {boolChip(sendgridConfiguredForSend && Boolean(sgF.dbReachable), "SendGrid env", "SendGrid")}
            {boolChip(gmailLinked && gmailSyncOk, "Gmail sync", "Gmail sync")}
            {boolChip(Boolean(g.pubsubReceiverConfigured) && watchHealthy, "Push watch", "Push watch")}
            {boolChip(suppressionListReady, "Suppression DB", "Suppression")}
          </div>
          <p className="text-[10px] text-kelly-text/75">
            Preflight CLI: <code className="text-[9px]">{og.preflightCliHint}</code>
            {topPreflightBlocker ? (
              <>
                {" "}
                · Last preflight blocker (sample): <span className="font-mono text-[9px]">{topPreflightBlocker}</span>
              </>
            ) : null}
          </p>
          <details className="rounded border border-kelly-text/10 bg-white/60 px-2 py-1 text-[10px] text-kelly-text/80">
            <summary className="cursor-pointer font-semibold text-kelly-navy">Details</summary>
            <ul className="mt-1 list-inside list-disc">
              <li>Send test/final broadcast (production): migrations + send-execution tables must be live.</li>
              <li>Gmail token encryption: set GMAIL_TOKEN_ENCRYPTION_KEY when using staff Gmail.</li>
              <li>Pub/Sub: GOOGLE_PUBSUB_TOPIC + verification token for push.</li>
              <li>
                Inbound replies (queue): {snapshot.queueHealth.inboundEmailCount} ·{" "}
                <Link href={GMAIL_REVIEW_PATH} className="font-semibold underline">
                  Review
                </Link>{" "}
                ·{" "}
                <Link href={GMAIL_MONITOR_PATH} className="font-semibold underline">
                  Monitor
                </Link>{" "}
                · CLI {gp.dryRunRenewalCli}
              </li>
            </ul>
          </details>
        </CardShell>

        <CardShell title="2. Import contacts">
          <p>
            <Link href={IMPORTS_PATH} className="font-bold text-kelly-forest underline">
              Import contacts
            </Link>{" "}
            (CSV upload)
          </p>
          <ul className="list-inside list-disc text-[10px] text-kelly-text/85">
            <li>Rows in staging: {ci.dbSliceReachable ? ci.stagedRowCount : "—"}</li>
            <li>Committed from imports: {ci.dbSliceReachable ? ci.committedImportRows : "—"}</li>
            <li>Invalid / duplicate (staging): {ci.dbSliceReachable ? ci.invalidOrDuplicateStagingRows : "—"}</li>
            <li>Batches awaiting approval: {ci.pendingApprovalCount}</li>
            <li>
              Latest batch:{" "}
              {ci.latestBatches[0] ? (
                <Link className="font-semibold underline" href={`${IMPORTS_PATH}/${ci.latestBatches[0].id}`}>
                  {ci.latestBatches[0].name}
                </Link>
              ) : (
                "—"
              )}
            </li>
          </ul>
          <p className="text-[10px] font-semibold text-kelly-forest">Next: {nextImportAction}</p>
        </CardShell>

        <CardShell title="3. Pick audience">
          <ul className="list-inside list-disc text-[10px] text-kelly-text/85">
            <li>Reachable emails (profile list): {al.dbReachable ? al.profilesWithValidEmail : "—"}</li>
            <li>Opt-out / global unsubscribe (linked prefs): {al.dbReachable ? al.profilesWithMarketingOptOut : "—"}</li>
            <li>Missing email on profile: {al.dbReachable ? al.profilesMissingEmail : "—"}</li>
            <li>Duplicate email groups: {al.dbReachable ? al.duplicatePrimaryEmailGroups : "—"}</li>
            <li>Active audience definitions: {au.activeAudienceDefinitions}</li>
          </ul>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Link
              href={AUDIENCES_PATH}
              className="rounded border border-kelly-forest/35 bg-kelly-fog/60 px-2 py-0.5 text-[10px] font-bold text-kelly-navy"
            >
              Audience studio
            </Link>
            <Link
              href={`${AUDIENCES_PATH}#audience-preview`}
              className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-[10px] font-semibold text-kelly-slate"
            >
              Preview first 25
            </Link>
          </div>
        </CardShell>

        <CardShell title="4. Write email">
          <p>
            <Link href={MESSAGE_STUDIO_PATH} className="font-bold text-kelly-forest underline">
              Message studio
            </Link>{" "}
            — subject, preview, body, from/reply-to, compliance review.
          </p>
          <ul className="list-inside list-disc text-[10px] text-kelly-text/85">
            <li>Shared drafts (server): {ms.totalActiveSharedDrafts}</li>
            <li>Approved for send governance: {ms.approvedForSendGovernance}</li>
            <li>SendGrid mail test env: {se.sendGridMailTestReady ? "Ready" : "Needs setup"}</li>
            <li>Broadcast env (incl. ASM): {se.sendGridMailBroadcastReady ? "Ready" : "Needs setup"}</li>
          </ul>
          <p className="text-[10px] text-kelly-text/70">Send a test only from Send execution after preflight.</p>
        </CardShell>

        <CardShell title="5. Send today">
          <p className="text-[10px] leading-snug">
            Governed SendGrid lane: preflight → test to one address → approvals → typed confirmation. Provider batches up
            to 900 recipients per request (no BCC list).
          </p>
          <ul className="list-inside list-disc text-[10px] text-kelly-text/85">
            <li>Executions on file: {se.dbReachable ? se.totalExecutions : "—"}</li>
            <li>Need preflight / failed: {se.needPreflightCount + se.preflightFailedCount}</li>
            <li>Test sent: {se.testSentCount}</li>
            <li>Final approved (ready to send): {se.finalApprovedCount}</li>
            <li>Sent / sending / failed: {se.sentCount} / {se.sendingCount} / {se.failedCount}</li>
            <li>
              Production gate:{" "}
              {og.governedSendExecutionDbReady ? (
                <span className="text-emerald-800">OK</span>
              ) : (
                <span className="text-amber-900">Run migrations on this DB</span>
              )}
            </li>
          </ul>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Link
              href={`${SEND_EXEC_PATH}#ops`}
              className="rounded border border-kelly-navy/35 bg-kelly-navy/10 px-2 py-0.5 text-[10px] font-bold text-kelly-navy"
            >
              Open send console
            </Link>
          </div>
          <p className="text-[9px] text-kelly-text/60">
            Pause / resume: stop before final approval; there is no mid-flight pause once provider send starts.
          </p>
        </CardShell>
      </div>
    </div>
  );
}