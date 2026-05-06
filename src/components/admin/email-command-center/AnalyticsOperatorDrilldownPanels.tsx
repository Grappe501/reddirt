"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { EmailAnalyticsOperatorDrilldown } from "@/lib/email-command-center/analytics-operator-drilldown";
import type { EmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";

const ECC = "/admin/workbench/email-command-center";
const QUEUE = "/admin/workbench/email-queue";
const card = "rounded-lg border border-kelly-text/12 bg-gradient-to-b from-white/95 to-kelly-page/90 px-3 py-2.5 shadow-sm";
const h3 = "font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/50";

type ReadinessScores = {
  inboxReadiness: number;
  draftReadiness: number;
  audienceReadiness: number;
  sendReadiness: number;
  deliverabilityReadiness: number;
};

function computeReadinessScores(s: EmailCommandCenterSnapshot): ReadinessScores {
  const g = s.gmail;
  const gpw = s.gmailProductionWatch;
  const ms = s.messageStudioSharedDrafts;
  const au = s.audienceStudio;
  const se = s.sendExecution;
  const sg = s.sendgridEnv;
  const sgF = s.sendGridFoundation;
  const sgr = s.sendGridReconciliation;
  const sc = s.sendGridContactSync;
  const og = s.operatorGate;

  let inboxReadiness = 0;
  if (og.cockpitDbReachable) inboxReadiness += 15;
  if (g.commandSurfacePhase === "connected") inboxReadiness += 35;
  else if (g.commandSurfacePhase === "ready_to_connect") inboxReadiness += 25;
  else if (g.commandSurfacePhase === "needs_actor") inboxReadiness += 15;
  if (g.monitorInboxSync === "metadata_sync_ready") inboxReadiness += 25;
  else inboxReadiness += 5;
  if (!g.gmailWatchPushIncomplete) inboxReadiness += 25;
  else inboxReadiness += 5;
  if (gpw.accountsNeedingRenewalCount > 0) inboxReadiness -= 12;
  if (gpw.accountsWithStaleHistoryCursorCount > 0) inboxReadiness -= 8;
  inboxReadiness = Math.max(0, Math.min(100, inboxReadiness));

  let draftReadiness = 0;
  if (ms.dbReachable) draftReadiness += 40;
  if (ms.needsReview === 0) draftReadiness += 35;
  else draftReadiness += Math.max(0, 35 - Math.min(30, ms.needsReview * 3));
  if (ms.approvedForSendGovernance > 0) draftReadiness += 25;
  else draftReadiness += 10;
  draftReadiness = Math.max(0, Math.min(100, draftReadiness));

  let audienceReadiness = 0;
  if (au.dbSliceReachable) audienceReadiness += 40;
  if (au.activeAudienceDefinitions > 0) audienceReadiness += 35;
  else if (au.draftAudienceDefinitions > 0) audienceReadiness += 20;
  if (au.buildingBlockApprovedTriples > 0) audienceReadiness += 25;
  else audienceReadiness += 5;
  audienceReadiness = Math.max(0, Math.min(100, audienceReadiness));

  let sendReadiness = 0;
  if (se.dbReachable) sendReadiness += 35;
  if (se.sendGridMailTestReady) sendReadiness += 20;
  if (se.sendGridMailBroadcastReady) sendReadiness += 15;
  sendReadiness += Math.max(0, 30 - Math.min(30, se.preflightFailedCount * 4 + se.failedCount * 5));
  sendReadiness = Math.max(0, Math.min(100, sendReadiness));

  let deliverabilityReadiness = 0;
  if (sgF.dbReachable) deliverabilityReadiness += 25;
  if (sg.sendgridApiKeyPresent) deliverabilityReadiness += 20;
  if (sg.sendgridFromEmailPresent && sg.sendgridFromNamePresent) deliverabilityReadiness += 15;
  if (sg.sendgridWebhookVerificationKeyPresent) deliverabilityReadiness += 15;
  if (sgF.suppressionCount >= 0 && sgF.dbReachable) deliverabilityReadiness += 10;
  if (sgr.dbReachable && sgr.totalEvents > 0) {
    const pendingRatio = sgr.pendingReconciliationCount / Math.max(1, sgr.totalEvents);
    deliverabilityReadiness += Math.round(15 * (1 - Math.min(1, pendingRatio * 2)));
  } else {
    deliverabilityReadiness += 5;
  }
  if (sc.runsFailedCount > 0) deliverabilityReadiness -= Math.min(15, sc.runsFailedCount * 3);
  deliverabilityReadiness = Math.max(0, Math.min(100, deliverabilityReadiness));

  return {
    inboxReadiness,
    draftReadiness,
    audienceReadiness,
    sendReadiness,
    deliverabilityReadiness,
  };
}

function ScoreChip({ label, value }: { label: string; value: number }) {
  const tone =
    value >= 80 ? "border-emerald-300/80 bg-emerald-50/90 text-emerald-950" : value >= 55 ? "border-amber-200/80 bg-amber-50/90 text-amber-950" : "border-rose-200/80 bg-rose-50/90 text-rose-950";
  return (
    <div className={`rounded-lg border px-2 py-2 ${tone}`}>
      <p className="font-heading text-[9px] font-bold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-0.5 font-heading text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[8px] opacity-80">Heuristic 0–100 · snapshot only</p>
    </div>
  );
}

function DrillTable({
  rows,
  emptyNote,
}: {
  rows: { id: string; label: string; status: string; updatedAtIso: string; href: string }[];
  emptyNote: string;
}) {
  if (!rows.length) {
    return (
      <p className="mt-1 rounded border border-kelly-text/10 bg-kelly-fog/40 px-2 py-1.5 font-body text-[10px] text-kelly-text/70">
        {emptyNote}
      </p>
    );
  }
  return (
    <div className="mt-1 max-h-48 overflow-auto rounded border border-kelly-text/10">
      <table className="w-full text-left font-mono text-[9px] text-kelly-navy">
        <thead className="sticky top-0 bg-kelly-fog/95 text-kelly-text/60">
          <tr>
            <th className="px-1 py-1">Updated (UTC)</th>
            <th className="px-1 py-1">Status</th>
            <th className="px-1 py-1">Summary</th>
            <th className="px-1 py-1">Open</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-kelly-text/8">
              <td className="px-1 py-0.5 whitespace-nowrap">{r.updatedAtIso.slice(0, 19)}</td>
              <td className="px-1 py-0.5">{r.status}</td>
              <td className="px-1 py-0.5 break-all">{r.label}</td>
              <td className="px-1 py-0.5">
                <Link href={r.href} className="font-bold text-kelly-forest underline">
                  Source
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DrillBlock({
  id,
  title,
  nextAction,
  sourceHref,
  sourceLabel,
  children,
}: {
  id: string;
  title: string;
  nextAction: string;
  sourceHref: string;
  sourceLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`${card} scroll-mt-20`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className={h3}>{title}</h2>
        <Link href={sourceHref} className="shrink-0 text-[10px] font-bold text-kelly-forest underline">
          {sourceLabel} →
        </Link>
      </div>
      <p className="mt-2 rounded border border-indigo-200/60 bg-indigo-50/70 px-2 py-1.5 font-body text-[10px] text-indigo-950">
        <span className="font-bold">Next action:</span> {nextAction}
      </p>
      {children}
    </section>
  );
}

export type AnalyticsOperatorDrilldownPanelsProps = {
  snapshot: EmailCommandCenterSnapshot;
  drilldown: EmailAnalyticsOperatorDrilldown;
};

export function AnalyticsOperatorDrilldownPanels({ snapshot, drilldown }: AnalyticsOperatorDrilldownPanelsProps) {
  const scores = useMemo(() => computeReadinessScores(snapshot), [snapshot]);
  const dd = drilldown;
  const q = snapshot.queueHealth;
  const ah = snapshot.assignmentHealth;
  const ms = snapshot.messageStudioSharedDrafts;
  const se = snapshot.sendExecution;
  const sc = snapshot.sendGridContactSync;
  const sgF = snapshot.sendGridFoundation;
  const sgr = snapshot.sendGridReconciliation;
  const ape = snapshot.automationPolicyEval;
  const g = snapshot.gmail;
  const gpw = snapshot.gmailProductionWatch;
  const sg = snapshot.sendgridEnv;
  const au = snapshot.audienceStudio;
  const ci = snapshot.contactImport;

  const warnPolicies = ape.policies.filter((p) => p.status === "warn" || p.status === "alert");

  return (
    <div className="space-y-4">
      <nav className="rounded-lg border border-kelly-text/10 bg-kelly-fog/50 px-3 py-2 font-body text-[11px] text-kelly-navy">
        <span className="font-bold uppercase tracking-wide text-kelly-text/55">Drilldowns</span>
        <span className="mx-1 text-kelly-text/40">·</span>
        <a href="#analytics-readiness-scores" className="font-semibold text-kelly-forest underline">
          Scores
        </a>
        <span className="mx-1">·</span>
        <a href="#analytics-drilldown-queue" className="text-kelly-forest underline">
          Queue
        </a>
        <span className="mx-1">·</span>
        <a href="#analytics-drilldown-drafts" className="text-kelly-forest underline">
          Drafts
        </a>
        <span className="mx-1">·</span>
        <a href="#analytics-drilldown-send" className="text-kelly-forest underline">
          Send execution
        </a>
        <span className="mx-1">·</span>
        <a href="#analytics-drilldown-sync" className="text-kelly-forest underline">
          Contact sync
        </a>
        <span className="mx-1">·</span>
        <a href="#analytics-drilldown-suppression" className="text-kelly-forest underline">
          Suppression
        </a>
        <span className="mx-1">·</span>
        <a href="#analytics-drilldown-automation" className="text-kelly-forest underline">
          Automation policies
        </a>
        <span className="mx-1">·</span>
        <a href="#analytics-drilldown-gmail" className="text-kelly-forest underline">
          Gmail watch
        </a>
      </nav>

      <section id="analytics-readiness-scores" className={`${card} scroll-mt-20`}>
        <h2 className={h3}>Readiness scores (heuristic)</h2>
        <p className="mt-1 font-body text-[10px] text-kelly-text/70">
          EMAIL-ANALYTICS-DRILLDOWN-1.0 — derived from this page&apos;s snapshot only. Not legal or deliverability certification; use
          for triage ordering.
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <ScoreChip label="Inbox readiness" value={scores.inboxReadiness} />
          <ScoreChip label="Draft readiness" value={scores.draftReadiness} />
          <ScoreChip label="Audience readiness" value={scores.audienceReadiness} />
          <ScoreChip label="Send readiness" value={scores.sendReadiness} />
          <ScoreChip label="Deliverability readiness" value={scores.deliverabilityReadiness} />
        </div>
      </section>

      <section className={card}>
        <h2 className={h3}>Cross-surface attention (read-only samples)</h2>
        <p className="mt-1 text-[10px] text-kelly-text/70">
          Latest failed governed sends, stale queue rows, final-approval queue, import approvals, failed Marketing
          contact syncs, and unreconciled webhook events — each deep-links to its owning route.
        </p>
        {!dd.dbReachable ? (
          <p className="mt-2 text-[10px] text-amber-950">Drilldown row queries did not complete — tables may be empty or DB unreachable.</p>
        ) : null}
        <div className="mt-3 space-y-3">
          <div>
            <p className="font-heading text-[9px] font-bold uppercase text-kelly-text/55">Latest failed send executions</p>
            <DrillTable
              rows={dd.latestFailedSendExecutions}
              emptyNote="No FAILED / PREFLIGHT_FAILED / PARTIAL_FAILURE rows in the last fetched window."
            />
          </div>
          <div>
            <p className="font-heading text-[9px] font-bold uppercase text-kelly-text/55">Stale queue items (7d+ without update, not closed)</p>
            <DrillTable
              rows={dd.staleQueueItems}
              emptyNote="No stale open items — or queue tables unavailable."
            />
          </div>
          <div>
            <p className="font-heading text-[9px] font-bold uppercase text-kelly-text/55">Pending final approval (send executions)</p>
            <DrillTable
              rows={dd.pendingFinalApprovalExecutions}
              emptyNote="No executions waiting in READY_FOR_FINAL_APPROVAL."
            />
          </div>
          <div>
            <p className="font-heading text-[9px] font-bold uppercase text-kelly-text/55">Pending import approvals</p>
            <DrillTable
              rows={dd.pendingImportApprovals}
              emptyNote="No batches in VALIDATED / READY_FOR_APPROVAL."
            />
          </div>
          <div>
            <p className="font-heading text-[9px] font-bold uppercase text-kelly-text/55">Failed contact sync runs</p>
            <DrillTable
              rows={dd.failedContactSyncRuns}
              emptyNote="No FAILED SendGridContactSyncRun rows."
            />
          </div>
          <div>
            <p className="font-heading text-[9px] font-bold uppercase text-kelly-text/55">Unreconciled SendGrid events (sample)</p>
            <DrillTable
              rows={dd.unreconciledSendGridEvents}
              emptyNote="All recent sampled events already carry eccReconciliation metadata — or no events ingested."
            />
          </div>
        </div>
      </section>

      <DrillBlock
        id="analytics-drilldown-queue"
        title="Queue health"
        nextAction={
          q.needsAttentionCount > 0
            ? `Triage ${q.needsAttentionCount} needs-attention item(s) from the queue filters.`
            : ah.itemsNotUpdatedIn7DaysCount > 5
              ? `Review ${ah.itemsNotUpdatedIn7DaysCount} queue item(s) not updated in 7+ days (heuristic).`
              : "Keep monitoring queue depth; open Daily for rule-based next actions."
        }
        sourceHref={QUEUE}
        sourceLabel="Email queue"
      >
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total", value: q.total },
            { label: "Needs attention", value: q.needsAttentionCount },
            { label: "Unassigned", value: q.unassignedCount },
            { label: "Stale (7d+) count", value: ah.itemsNotUpdatedIn7DaysCount },
          ].map((x) => (
            <div key={x.label} className="rounded-md border border-kelly-text/10 bg-white/90 px-2 py-2">
              <p className="font-heading text-[9px] font-bold uppercase text-kelly-text/55">{x.label}</p>
              <p className="mt-0.5 font-heading text-xl font-bold tabular-nums">{x.value}</p>
            </div>
          ))}
        </div>
      </DrillBlock>

      <DrillBlock
        id="analytics-drilldown-drafts"
        title="Draft health (shared Message Studio)"
        nextAction={
          ms.needsReview > 0
            ? `Run editorial review on ${ms.needsReview} shared draft(s) in Needs review.`
            : ms.inReview > 0
              ? `${ms.inReview} draft(s) in review — close the loop with reviewers.`
              : "Promote local drafts when ready; shared drafts stay read-only here."
        }
        sourceHref={ms.path}
        sourceLabel="Message Studio"
      >
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active shared", value: ms.totalActiveSharedDrafts },
            { label: "Needs review", value: ms.needsReview },
            { label: "In review", value: ms.inReview },
            { label: "Approved for send governance", value: ms.approvedForSendGovernance },
          ].map((x) => (
            <div key={x.label} className="rounded-md border border-kelly-text/10 bg-white/90 px-2 py-2">
              <p className="font-heading text-[9px] font-bold uppercase text-kelly-text/55">{x.label}</p>
              <p className="mt-0.5 font-heading text-xl font-bold tabular-nums">{x.value}</p>
            </div>
          ))}
        </div>
      </DrillBlock>

      <DrillBlock
        id="analytics-drilldown-send"
        title="Send execution health"
        nextAction={
          se.preflightFailedCount > 0
            ? "Open Send Execution → run or fix preflight on DRAFT / PREFLIGHT_FAILED rows before test send."
            : se.needPreflightCount > 0
              ? `${se.needPreflightCount} execution(s) still need a successful preflight pass.`
              : "No preflight backlog detected from counts — verify env on Send Execution before any governed send."
        }
        sourceHref={se.path}
        sourceLabel="Send execution"
      >
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Need preflight", value: se.needPreflightCount },
            { label: "Preflight failed", value: se.preflightFailedCount },
            { label: "Ready for test", value: se.readyForTestCount },
            { label: "Failed / partial", value: se.failedCount + se.partialFailureCount },
          ].map((x) => (
            <div key={x.label} className="rounded-md border border-kelly-text/10 bg-white/90 px-2 py-2">
              <p className="font-heading text-[9px] font-bold uppercase text-kelly-text/55">{x.label}</p>
              <p className="mt-0.5 font-heading text-xl font-bold tabular-nums">{x.value}</p>
            </div>
          ))}
        </div>
      </DrillBlock>

      <DrillBlock
        id="analytics-drilldown-sync"
        title="SendGrid contact sync health"
        nextAction={
          sc.runsFailedCount > 0
            ? "Inspect FAILED runs on SendGrid Foundation — retry only after fixing safeError / env / audience."
            : sc.runsApprovedAwaitingExecutionCount > 0
              ? `${sc.runsApprovedAwaitingExecutionCount} APPROVED run(s) await governed upsert — confirm hosted DB gate.`
              : "Run previews from Audience Studio when changing definitions; no automatic sync from Analytics."
        }
        sourceHref={sc.path}
        sourceLabel="SendGrid Foundation"
      >
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "FAILED", value: sc.runsFailedCount },
            { label: "Approved awaiting", value: sc.runsApprovedAwaitingExecutionCount },
            { label: "SYNCED", value: sc.runsSyncedCount },
            { label: "Σ warnings (non-archived)", value: sc.sumWarningCountNonArchived },
          ].map((x) => (
            <div key={x.label} className="rounded-md border border-kelly-text/10 bg-white/90 px-2 py-2">
              <p className="font-heading text-[9px] font-bold uppercase text-kelly-text/55">{x.label}</p>
              <p className="mt-0.5 font-heading text-xl font-bold tabular-nums">{x.value}</p>
            </div>
          ))}
        </div>
      </DrillBlock>

      <DrillBlock
        id="analytics-drilldown-suppression"
        title="Suppression health"
        nextAction={
          sgF.suppressionCount > 0
            ? `Review suppression categories — ${sgF.suppressionCount} local row(s). Honor before governed broadcast.`
            : "Suppression table empty or unreachable — confirm webhook ingestion if you expect bounces/unsubs."
        }
        sourceHref={sgF.path}
        sourceLabel="SendGrid Foundation"
      >
        <ul className="mt-2 space-y-1 font-body text-[11px] text-kelly-text/90">
          <li>
            Webhook verification env: <strong>{sg.sendgridWebhookVerificationKeyPresent ? "present" : "missing"}</strong>
          </li>
          <li>
            Suppressions (rows): <strong>{sgF.dbReachable ? sgF.suppressionCount : "—"}</strong>
          </li>
          <li>
            Pending event reconciliation: <strong>{sgr.dbReachable ? sgr.pendingReconciliationCount : "—"}</strong> (
            <Link href={`${ECC}/analytics#reconciliation`} className="font-bold underline">
              reconciliation table
            </Link>
            )
          </li>
        </ul>
      </DrillBlock>

      <DrillBlock
        id="analytics-drilldown-automation"
        title="Automation policy warnings"
        nextAction={
          warnPolicies.length
            ? `Review ${warnPolicies.length} policy row(s) below — read-only; no activation from Analytics.`
            : "Policy snapshot clean on evaluated rules — still no background workers shipped."
        }
        sourceHref={`${ECC}/automation`}
        sourceLabel="Automation Studio"
      >
        <div className="mt-2 max-h-56 overflow-auto rounded border border-kelly-text/10">
          <table className="w-full text-left font-body text-[10px] text-kelly-navy">
            <thead className="sticky top-0 bg-kelly-fog/95 text-kelly-text/60">
              <tr>
                <th className="px-1 py-1">Policy</th>
                <th className="px-1 py-1">Status</th>
                <th className="px-1 py-1">Detail</th>
                <th className="px-1 py-1">Open</th>
              </tr>
            </thead>
            <tbody>
              {ape.policies.map((p) => (
                <tr key={p.id} className="border-t border-kelly-text/8">
                  <td className="px-1 py-0.5 font-semibold">{p.title}</td>
                  <td className="px-1 py-0.5 uppercase">{p.status}</td>
                  <td className="px-1 py-0.5 break-all">{p.detailSafe}</td>
                  <td className="px-1 py-0.5">
                    {p.href ? (
                      <Link href={p.href} className="font-bold text-kelly-forest underline">
                        Route
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DrillBlock>

      <DrillBlock
        id="analytics-drilldown-gmail"
        title="Gmail watch health"
        nextAction={
          gpw.accountsNeedingRenewalCount > 0
            ? `Plan watch renewal for ${gpw.accountsNeedingRenewalCount} account(s) — ${gpw.dryRunRenewalCli} (dry-run).`
            : g.gmailWatchPushIncomplete
              ? "Finish Pub/Sub topic + verification + active watch for push readiness."
              : "Watch posture acceptable from snapshot — still verify in Gmail monitor."
        }
        sourceHref={gpw.monitorPath}
        sourceLabel="Gmail monitor"
      >
        <ul className="mt-2 space-y-1 font-body text-[11px] text-kelly-text/90">
          <li>
            Watch display: <strong>{g.gmailWatchDisplayStatus}</strong>
          </li>
          <li>
            Accounts needing renewal: <strong>{gpw.accountsNeedingRenewalCount}</strong> · expiring 48h:{" "}
            <strong>{gpw.watchesExpiringWithin48hCount}</strong>
          </li>
          <li>
            Stale history cursors: <strong>{gpw.accountsWithStaleHistoryCursorCount}</strong>
          </li>
          <li>
            Last metadata sync: <strong>{g.lastMetadataSyncAtIso ? g.lastMetadataSyncAtIso.slice(0, 19) : "—"}</strong>
          </li>
        </ul>
      </DrillBlock>

      <section className={card}>
        <h2 className={h3}>Audience + import drill-through (counts)</h2>
        <p className="mt-1 text-[10px] text-kelly-text/70">
          Same numbers as lower sections — kept for operators who start from Audience / import posture.
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href={au.path}
            className="rounded-md border border-kelly-text/10 bg-white/90 px-2 py-2 hover:border-kelly-forest/30"
          >
            <p className="font-heading text-[9px] font-bold uppercase text-kelly-text/55">Active audiences</p>
            <p className="mt-0.5 font-heading text-xl font-bold tabular-nums">{au.activeAudienceDefinitions}</p>
          </Link>
          <Link
            href={au.path}
            className="rounded-md border border-kelly-text/10 bg-white/90 px-2 py-2 hover:border-kelly-forest/30"
          >
            <p className="font-heading text-[9px] font-bold uppercase text-kelly-text/55">Approved triples</p>
            <p className="mt-0.5 font-heading text-xl font-bold tabular-nums">{au.buildingBlockApprovedTriples}</p>
          </Link>
          <Link
            href={ci.path}
            className="rounded-md border border-kelly-text/10 bg-white/90 px-2 py-2 hover:border-kelly-forest/30"
          >
            <p className="font-heading text-[9px] font-bold uppercase text-kelly-text/55">Import pending approval</p>
            <p className="mt-0.5 font-heading text-xl font-bold tabular-nums">{ci.pendingApprovalCount}</p>
          </Link>
          <Link
            href={ci.path}
            className="rounded-md border border-kelly-text/10 bg-white/90 px-2 py-2 hover:border-kelly-forest/30"
          >
            <p className="font-heading text-[9px] font-bold uppercase text-kelly-text/55">Open import batches</p>
            <p className="mt-0.5 font-heading text-xl font-bold tabular-nums">{ci.openImportBatchCount}</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
