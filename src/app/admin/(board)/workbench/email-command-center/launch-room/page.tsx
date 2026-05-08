import Link from "next/link";
import { EccOperatorPageChrome } from "@/components/admin/email-command-center/ecc-operator-ux";
import { getEmailLaunchRoomSnapshot } from "@/lib/email-command-center/launch-room";
import { getEmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";

export const dynamic = "force-dynamic";

const card = "rounded-lg border border-kelly-text/12 bg-white/90 px-3 py-2 shadow-sm";
const h2 = "font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-text/55";

export default async function EmailLaunchRoomPage() {
  const [snap, ecc] = await Promise.all([getEmailLaunchRoomSnapshot(), getEmailCommandCenterSnapshot()]);

  return (
    <div className="min-w-0 max-w-5xl space-y-4">
      <EccOperatorPageChrome snapshot={ecc} surface="launch_room" />

      <div className="flex flex-wrap gap-2 text-[10px]">
        <Link className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 font-semibold" href="/admin/workbench/email-command-center">
          ← Email Command Center
        </Link>
        <Link className="rounded border border-kelly-forest/30 bg-emerald-50/70 px-2 py-0.5 font-bold text-kelly-navy" href="/admin/workbench/email-command-center/audiences">
          Audience Studio
        </Link>
        <Link className="rounded border border-kelly-navy/20 px-2 py-0.5" href="/admin/workbench/email-command-center/sendgrid">
          SendGrid sync
        </Link>
        <Link className="rounded border border-kelly-navy/20 px-2 py-0.5" href="/admin/workbench/email-command-center/message-studio">
          Message Studio
        </Link>
        <Link className="rounded border border-kelly-navy/20 px-2 py-0.5" href="/admin/workbench/email-command-center/send-execution#ops">
          Send Execution
        </Link>
        <Link className="rounded border border-sky-300/50 bg-sky-50/80 px-2 py-0.5 font-semibold text-sky-950" href="/admin/workbench/communication-intelligence">
          Communication Intelligence
        </Link>
      </div>

      <header>
        <h1 className="font-heading text-xl font-bold text-kelly-navy">Email Launch Room</h1>
        <p className="mt-1 max-w-3xl font-body text-sm text-kelly-text/85">
          Read-only operator runbook for the governed <strong>SendGrid broadcast</strong> path. This page does not send, sync, approve, or mutate data — it only summarizes status and deep-links to governed tools.
        </p>
      </header>

      <section className={`${card} border-emerald-300/50 bg-emerald-50/60`}>
        <p className={h2}>Operator next step</p>
        <p className="mt-1 font-heading text-sm font-bold text-emerald-950">{snap.nextStep.label}</p>
        <p className="mt-0.5 text-[11px] text-emerald-950/90">{snap.nextStep.reason}</p>
        <p className="mt-2">
          <Link href={snap.nextStep.href} className="inline-flex rounded border border-emerald-600/40 bg-white px-2 py-1 text-[11px] font-bold text-emerald-950 underline">
            Go →
          </Link>
        </p>
      </section>

      <section className={card}>
        <p className={h2}>1. Distribution path status</p>
        <ul className="mt-1 grid gap-1 font-body text-[11px] text-kelly-text/85 sm:grid-cols-2">
          <li>
            <strong>Audience</strong> — ACTIVE: {snap.audienceActiveCount}, DRAFT: {snap.audienceDraftCount}{" "}
            <Link className="text-kelly-forest underline" href="/admin/workbench/email-command-center/audiences">
              Studio
            </Link>
          </li>
          <li>
            <strong>SendGrid sync</strong> — recent runs listed below; need SYNCED per cohort.{" "}
            <Link className="text-kelly-forest underline" href="/admin/workbench/email-command-center/sendgrid">
              Open sync
            </Link>
          </li>
          <li>
            <strong>Message draft</strong> — approved: {snap.governance.approvedDraftCount}, needs governance:{" "}
            {snap.governance.draftsNeedingGovernanceCount}{" "}
            <Link className="text-kelly-forest underline" href="/admin/workbench/email-command-center/message-studio">
              Message Studio
            </Link>
          </li>
          <li>
            <strong>Send packet / preflight / test / final</strong> — use Send Execution (preflight is authoritative).{" "}
            <Link className="text-kelly-forest underline" href="/admin/workbench/email-command-center/send-execution#ops">
              Send Execution #ops
            </Link>
          </li>
          <li>
            <strong>Broadcast env gate</strong> —{" "}
            {snap.sendGridMail.broadcastAllowed ? (
              <span className="text-emerald-800">broadcast env checklist green</span>
            ) : (
              <span className="text-amber-900">broadcast not allowed until required env + ASM group satisfied</span>
            )}
          </li>
        </ul>
      </section>

      <section className={card}>
        <p className={h2}>2. Audience readiness</p>
        <p className="mt-1 text-[11px] text-kelly-text/80">
          Volunteer-related (name or <code className="text-[9px]">VOLUNTEER_TRIGGER</code>): ACTIVE {snap.volunteerActiveAudienceCount}, DRAFT{" "}
          {snap.volunteerDraftAudienceCount}
        </p>
        <ul className="mt-2 space-y-1 text-[10px]">
          {snap.latestAudiences.map((a) => (
            <li key={a.id} className="flex flex-wrap gap-1 border-t border-kelly-text/10 pt-1">
              <span className="font-semibold">{a.name}</span>
              <span className="rounded bg-kelly-fog px-1 text-[9px] font-bold uppercase">{a.status}</span>
              {a.volunteerRelated ? <span className="text-[9px] text-kelly-forest">volunteer lane</span> : null}
              <Link className="ml-auto text-kelly-forest underline" href="/admin/workbench/email-command-center/audiences">
                Studio
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={card}>
        <p className={h2}>3. SendGrid readiness (names only)</p>
        <ul className="mt-1 text-[11px] text-kelly-text/85">
          <li>API key present: {snap.sendGridEnv.sendgridApiKeyPresent ? "yes" : "no"}</li>
          <li>From email/name: {snap.sendGridEnv.sendgridFromEmailPresent && snap.sendGridEnv.sendgridFromNamePresent ? "yes" : "no"}</li>
          <li>ASM / unsubscribe group id (SENDGRID_UNSUBSCRIBE_GROUP_ID): {snap.asmConfigured ? "set" : "missing"}</li>
          {snap.missingSendgridEnvNames.length ? (
            <li className="text-rose-900">
              Missing: {snap.missingSendgridEnvNames.join(", ")}
            </li>
          ) : null}
        </ul>
      </section>

      <section className={card}>
        <p className={h2}>4. Governance readiness</p>
        <p className="text-[11px] text-kelly-text/80">
          Approved drafts: {snap.governance.approvedDraftCount}. Drafts still in review pipeline: {snap.governance.draftsNeedingGovernanceCount}. Send packet lives on each draft — open Message Studio send packet builder.
        </p>
      </section>

      <section className={card}>
        <p className={h2}>5. Send Execution readiness</p>
        <ul className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 font-mono text-[10px] text-kelly-text/85 sm:grid-cols-3">
          <li>Need preflight: {snap.sendExecution.needPreflightCount}</li>
          <li>Preflight failed: {snap.sendExecution.preflightFailedCount}</li>
          <li>READY_FOR_TEST: {snap.sendExecution.readyForTestCount}</li>
          <li>TEST_SENT: {snap.sendExecution.testSentCount}</li>
          <li>READY_FOR_FINAL: {snap.sendExecution.readyForFinalApprovalCount}</li>
          <li>FINAL_APPROVED: {snap.sendExecution.finalApprovedCount}</li>
          <li>SENT: {snap.sendExecution.sentCount}</li>
          <li>FAILED: {snap.sendExecution.failedCount}</li>
        </ul>
        <p className="mt-2 text-[10px] text-kelly-text/60">Latest executions (updated):</p>
        <ul className="font-mono text-[9px] text-kelly-text/75">
          {snap.latestExecutions.map((e) => (
            <li key={e.id}>
              {e.id.slice(0, 10)}… {e.status}
            </li>
          ))}
        </ul>
      </section>

      <section className={card}>
        <p className={h2}>6. Suppression / compliance snapshot</p>
        <p className="text-[11px] text-kelly-text/80">
          Local SendGridSuppression rows (approx): {snap.suppressionCount}. Last webhook row stored at:{" "}
          {snap.lastSendGridEventCreatedAt ? snap.lastSendGridEventCreatedAt.toISOString() : "—"}.
        </p>
        <p className="mt-1 text-[10px] text-kelly-text/65">Send Execution preflight remains authoritative for overlap, consent, and import gates.</p>
      </section>

      <section className={card}>
        <p className={h2}>7. Hosted DB proof (production contract)</p>
        <p className={`text-[11px] ${snap.hostedDbProofOk ? "text-emerald-900" : "text-amber-950"}`}>
          {snap.hostedDbProofOk ? "Proof summary reports OK for this environment." : "Proof not green — review Readiness / hosted DB assistant."}
        </p>
        <p className="mt-1 text-[10px] text-kelly-text/70">{snap.hostedDbProofNote}</p>
      </section>

      <section className={card}>
        <p className={h2}>Recent sync runs</p>
        <ul className="mt-1 font-mono text-[9px] text-kelly-text/80">
          {snap.latestSyncRuns.map((r) => (
            <li key={r.id}>
              {r.status} · audience {r.audienceDefinitionId?.slice(0, 8) ?? "—"}…
            </li>
          ))}
        </ul>
      </section>

      <p className="text-[10px] text-kelly-text/60">
        Launch Room uses a bounded email snapshot plus small Prisma slices — open Readiness or the main Command Center for the full ECC read-model.
      </p>
    </div>
  );
}
