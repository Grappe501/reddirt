import Link from "next/link";
import { EccOperatorPageChrome } from "@/components/admin/email-command-center/ecc-operator-ux";
import { getEmailLaunchRoomSnapshot } from "@/lib/email-command-center/launch-room";
import { getEmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";

export const dynamic = "force-dynamic";

const card = "rounded-lg border border-kelly-text/12 bg-white/90 px-3 py-2 shadow-sm";
const h2 = "font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-muted";
const yes = "rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-900";
const no = "rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-rose-950";
const wait = "rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-950";

function GateRow({
  label,
  ok,
  detail,
  href,
  action,
}: {
  label: string;
  ok: boolean;
  detail: string;
  href?: string;
  action?: string;
}) {
  return (
    <li className="rounded border border-kelly-text/10 bg-white/80 px-2 py-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-heading text-[11px] font-bold text-kelly-navy">{label}</span>
        <span className={ok ? yes : no}>{ok ? "green" : "blocked"}</span>
      </div>
      <p className="mt-1 font-body text-[10px] leading-snug text-kelly-text/80">{detail}</p>
      {href || action ? (
        <p className="mt-1 font-body text-[10px]">
          {href ? (
            <Link href={href} className="font-bold text-kelly-forest underline">
              {action ?? "Open"}
            </Link>
          ) : (
            <span className="font-semibold text-kelly-muted">{action}</span>
          )}
        </p>
      ) : null}
    </li>
  );
}

export default async function EmailLaunchRoomPage() {
  const [snap, ecc] = await Promise.all([getEmailLaunchRoomSnapshot(), getEmailCommandCenterSnapshot()]);
  const hostedDbLikely = ecc.operatorGate.databaseUrlHostKind === "hostname";
  const hostedDbGreen = hostedDbLikely && snap.hostedDbProofOk && ecc.operatorGate.governedSendExecutionDbReady;
  const audienceGreen = snap.audienceActiveCount > 0;
  const syncGreen = snap.latestSyncRuns.some((run) => run.status === "SYNCED");
  const draftGreen = snap.governance.approvedDraftCount > 0;
  const testReady = snap.sendExecution.readyForTestCount > 0;
  const finalApproved = snap.sendExecution.finalApprovedCount > 0;
  const sendgridTestEnvGreen =
    snap.sendGridEnv.sendgridApiKeyPresent &&
    snap.sendGridEnv.sendgridFromEmailPresent &&
    snap.sendGridEnv.sendgridFromNamePresent;
  const broadcastEnvGreen = snap.sendGridMail.broadcastAllowed;
  const finalSendReady =
    hostedDbGreen &&
    audienceGreen &&
    syncGreen &&
    draftGreen &&
    broadcastEnvGreen &&
    finalApproved;
  const operatorPresentRequired =
    "Operator must be present for test send/final broadcast. Do not send while unattended; final broadcast still requires the exact typed phrase SEND APPROVED.";

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
          Production go/no-go board for the governed <strong>SendGrid broadcast</strong> path. This page does not send,
          sync, approve, or mutate data — it tells the operator what is green, what is blocked, and where to fix it.
        </p>
      </header>

      <section className={`${card} ${finalSendReady ? "border-emerald-400/60 bg-emerald-50/80" : "border-amber-400/60 bg-amber-50/85"}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={h2}>Launch decision</p>
            <p className={`mt-1 font-heading text-lg font-bold ${finalSendReady ? "text-emerald-950" : "text-amber-950"}`}>
              {finalSendReady ? "Ready for operator final-send checkpoint" : "Not ready for final broadcast"}
            </p>
            <p className="mt-1 max-w-3xl font-body text-[11px] leading-snug text-kelly-text/85">
              {finalSendReady
                ? "All dashboard gates are green. The operator still must be present, verify the test, and type SEND APPROVED in Send Execution."
                : "Use the gate list below. A local green does not equal hosted production green, and no broadcast should happen until every blocked row is resolved."}
            </p>
          </div>
          <span className={finalSendReady ? yes : wait}>{finalSendReady ? "go checkpoint" : "hold"}</span>
        </div>
        <p className="mt-2 rounded border border-kelly-text/10 bg-white/75 px-2 py-1 font-body text-[10px] font-semibold text-kelly-navy">
          {operatorPresentRequired}
        </p>
      </section>

      <section className={card}>
        <p className={h2}>Production launch gates</p>
        <ul className="mt-2 grid gap-2 md:grid-cols-2">
          <GateRow
            label="Hosted DB and migrations"
            ok={hostedDbGreen}
            detail={
              hostedDbLikely
                ? `Host shape is production-like and proof says: ${snap.hostedDbProofOk ? "OK" : "not green"}. Send-execution tables: ${ecc.operatorGate.governedSendExecutionDbReady ? "ready" : "not verified"}.`
                : "This environment is loopback/local. Do not treat these counts as production readiness."
            }
            href="/admin/workbench/email-command-center/readiness/hosted-db"
            action="Open hosted DB assistant"
          />
          <GateRow
            label="SendGrid identity and test env"
            ok={sendgridTestEnvGreen}
            detail={`API key: ${snap.sendGridEnv.sendgridApiKeyPresent ? "set" : "missing"}; from email/name: ${
              snap.sendGridEnv.sendgridFromEmailPresent && snap.sendGridEnv.sendgridFromNamePresent ? "set" : "missing"
            }.`}
            href="/admin/workbench/email-command-center/readiness"
            action="Open readiness"
          />
          <GateRow
            label="Broadcast compliance env"
            ok={broadcastEnvGreen}
            detail={`ASM / unsubscribe group: ${snap.asmConfigured ? "set" : "missing"}. Required for final broadcast; not required for one-recipient test send.`}
            href="/admin/workbench/email-command-center/readiness"
            action="Review SendGrid env"
          />
          <GateRow
            label="Active audience"
            ok={audienceGreen}
            detail={`ACTIVE audiences: ${snap.audienceActiveCount}; volunteer-related ACTIVE: ${snap.volunteerActiveAudienceCount}.`}
            href="/admin/workbench/email-command-center/audiences"
            action="Open Audience Studio"
          />
          <GateRow
            label="SYNCED SendGrid contact run"
            ok={syncGreen}
            detail={`Recent synced run present: ${syncGreen ? "yes" : "no"}. SYNCED means contacts only; it is not an email send.`}
            href="/admin/workbench/email-command-center/sendgrid#contact-sync"
            action="Open SendGrid sync"
          />
          <GateRow
            label="Approved Message Studio draft"
            ok={draftGreen}
            detail={`APPROVED_FOR_SEND_GOVERNANCE drafts: ${snap.governance.approvedDraftCount}; drafts needing governance: ${snap.governance.draftsNeedingGovernanceCount}.`}
            href="/admin/workbench/email-command-center/message-studio#shared-drafts"
            action="Open Message Studio"
          />
          <GateRow
            label="Preflight / test status"
            ok={testReady || snap.sendExecution.testSentCount > 0 || snap.sendExecution.readyForFinalApprovalCount > 0 || finalApproved}
            detail={`READY_FOR_TEST: ${snap.sendExecution.readyForTestCount}; TEST_SENT: ${snap.sendExecution.testSentCount}; READY_FOR_FINAL: ${snap.sendExecution.readyForFinalApprovalCount}.`}
            href="/admin/workbench/email-command-center/send-execution#ops"
            action="Open Send Execution"
          />
          <GateRow
            label="Final approval"
            ok={finalApproved}
            detail={`FINAL_APPROVED executions: ${snap.sendExecution.finalApprovedCount}. Final send is still blocked until typed confirmation by a present operator.`}
            href="/admin/workbench/email-command-center/send-execution#ops"
            action="Open final approval"
          />
        </ul>
      </section>

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
        <p className="mt-2 text-[10px] text-kelly-muted">Latest executions (updated):</p>
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
        <p className="mt-1 text-[10px] text-kelly-muted">Send Execution preflight remains authoritative for overlap, consent, and import gates.</p>
      </section>

      <section className={card}>
        <p className={h2}>7. Hosted DB proof (production contract)</p>
        <p className={`text-[11px] ${snap.hostedDbProofOk ? "text-emerald-900" : "text-amber-950"}`}>
          {snap.hostedDbProofOk ? "Proof summary reports OK for this environment." : "Proof not green — review Readiness / hosted DB assistant."}
        </p>
        <p className="mt-1 text-[10px] text-kelly-muted">{snap.hostedDbProofNote}</p>
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

      <p className="text-[10px] text-kelly-muted">
        Launch Room uses a bounded email snapshot plus small Prisma slices — open Readiness or the main Command Center for the full ECC read-model.
      </p>
    </div>
  );
}
