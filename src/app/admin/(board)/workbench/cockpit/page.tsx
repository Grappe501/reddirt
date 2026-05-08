import Link from "next/link";
import { getCockpitSnapshot } from "@/lib/workbench/cockpit";
import { getSendGridEnvStatus } from "@/lib/sendgrid/config";
import { isGoogleCalendarConfigured } from "@/lib/calendar/env";
import { getCommunicationIntelligenceSnapshot } from "@/lib/communications/intelligence-snapshot";

export const dynamic = "force-dynamic";

const card = "rounded-lg border border-kelly-text/12 bg-white/90 px-3 py-2 shadow-sm";
const h2 = "font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-text/55";

export default async function WorkbenchCockpitPage() {
  const snap = await getCockpitSnapshot();
  const intel = await getCommunicationIntelligenceSnapshot().catch(() => null);
  const sg = getSendGridEnvStatus();

  return (
    <div className="min-w-0 max-w-5xl space-y-4 px-1 py-2 md:px-2">
      <header className="flex flex-col gap-2 border-b border-kelly-text/10 pb-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-kelly-navy">Cockpit</h1>
          <p className="mt-0.5 max-w-2xl font-body text-[12px] text-kelly-text/80">
            Morning command view — read-only composition of Email Launch Room, Calendar readiness, and light comms queue hints. No sends, no external writes, no mutations from this page.
          </p>
        </div>
        <div className="flex flex-wrap gap-1 text-[10px]">
          <Link className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 font-semibold" href="/admin/workbench">
            ← Workbench
          </Link>
          <Link className="rounded border border-kelly-forest/30 bg-emerald-50/80 px-2 py-0.5 font-bold" href="/admin/workbench/email-command-center/launch-room">
            Email Launch Room
          </Link>
          <Link className="rounded border border-kelly-navy/20 px-2 py-0.5" href="/admin/workbench/calendar/requests">
            Calendar requests
          </Link>
        </div>
      </header>

      <section className={`${card} border-emerald-200/60 bg-emerald-50/50`}>
        <p className={h2}>Today&apos;s command stack (top 5)</p>
        <ol className="mt-2 list-decimal space-y-2 pl-4 text-[11px] text-kelly-text/90">
          {snap.commandStack.map((a) => (
            <li key={a.rank}>
              <Link href={a.href} className="font-bold text-kelly-forest underline">
                {a.label}
              </Link>
              <p className="text-[10px] text-kelly-text/70">{a.why}</p>
            </li>
          ))}
        </ol>
      </section>

      {intel ? (
        <section className={card}>
          <p className={h2}>Communication intelligence (ingest memory)</p>
          <ul className="mt-1 grid gap-1 text-[11px] text-kelly-text/85 sm:grid-cols-2">
            <li>Gmail rows ingested: {intel.gmailMessageCount}</li>
            <li>Google contacts rows: {intel.googleContactCount}</li>
            <li>Calendar rows ingested: {intel.googleCalendarEventIngestCount}</li>
            <li>Identities needing review: {intel.identityNeedsReview}</li>
            <li>Pending profile matches: {intel.pendingMatchCandidates}</li>
          </ul>
          <p className="mt-2 text-[10px] text-kelly-text/60">
            <Link href="/admin/workbench/communication-intelligence" className="font-bold text-kelly-forest underline">
              Open Communication Intelligence Center
            </Link>{" "}
            — read-only ingest; no sends; no Google writes.
          </p>
        </section>
      ) : null}

      <section className={card}>
        <p className={h2}>Email distribution</p>
        <ul className="mt-1 grid gap-1 text-[11px] text-kelly-text/85 sm:grid-cols-2">
          <li>ACTIVE audiences: {snap.email.audienceActiveCount}</li>
          <li>DRAFT audiences: {snap.email.audienceDraftCount}</li>
          <li>Approved drafts: {snap.email.governance.approvedDraftCount}</li>
          <li>Send executions needing preflight: {snap.email.sendExecution.needPreflightCount}</li>
          <li>READY_FOR_TEST: {snap.email.sendExecution.readyForTestCount}</li>
          <li>Volunteer ACTIVE audiences: {snap.email.volunteerActiveAudienceCount}</li>
        </ul>
        <p className="mt-2 text-[10px] text-kelly-text/60">
          Blocker summary: follow <Link href="/admin/workbench/email-command-center/launch-room">Launch Room next step</Link>.
        </p>
      </section>

      <section className={card}>
        <p className={h2}>Calendar + events</p>
        <ul className="mt-1 text-[11px] text-kelly-text/85">
          <li>New event-like requests: {snap.calendarPipeline.newCount}</li>
          <li>Needs follow-up: {snap.calendarPipeline.followUpCount}</li>
          <li>In review (pipeline): {snap.calendarPipeline.reviewedCount}</li>
          <li>Converted intakes (tracked): {snap.calendarPipeline.draftedCount}</li>
          <li>Proposed/draft workflow events: {snap.calendar.proposedDraftWorkflowCount}</li>
          <li>Google env (OAuth client/secret/redirect): {snap.calendar.googleEnvConfigured ? "configured" : "not configured"}</li>
        </ul>
        <p className="mt-2 flex flex-wrap gap-2 text-[10px]">
          <Link href="/admin/workbench/calendar" className="font-bold text-kelly-forest underline">
            Calendar HQ
          </Link>
          <Link href="/admin/workbench/calendar/requests" className="font-bold text-kelly-navy underline">
            Calendar requests
          </Link>
        </p>
      </section>

      <section className={card}>
        <p className={h2}>County intelligence (RedDirt)</p>
        <p className="mt-1 text-[11px] text-kelly-text/80">
          County workbench integration is not wired in this cockpit slice — use existing RedDirt admin routes.
        </p>
        <p className="mt-1 text-[10px]">
          <Link href="/admin/county-intelligence" className="text-kelly-forest underline">
            County intelligence
          </Link>{" "}
          ·{" "}
          <Link href="/admin/county-profiles" className="text-kelly-forest underline">
            County profiles
          </Link>
        </p>
      </section>

      <section className={card}>
        <p className={h2}>Field / GOTV</p>
        <p className="text-[11px] text-kelly-text/80">
          Assignment automation is not enabled from Cockpit — open GOTV for read models and plans.
        </p>
        <Link href="/admin/gotv" className="mt-1 inline-block text-[11px] font-bold text-kelly-forest underline">
          GOTV read models
        </Link>
      </section>

      <section className={card}>
        <p className={h2}>Comms / inbox hints</p>
        <p className="text-[11px] text-kelly-text/80">
          Queue needs-attention: {snap.queueNeedsAttention}. New workflow items (email queue summary): {snap.commsNewThreadsApprox}.
        </p>
        <Link href="/admin/workbench/email-queue" className="mt-1 inline-block text-[11px] font-bold text-kelly-forest underline">
          Email queue
        </Link>
      </section>

      <section className={card}>
        <p className={h2}>System gates</p>
        <ul className="mt-1 list-inside list-disc text-[10px] text-kelly-text/80">
          <li>Run <code className="text-[9px]">npm run check</code> locally before shipping — last CI result is not stored here.</li>
          <li>Hosted DB proof (this request): {snap.email.hostedDbProofOk ? "green per proof helper" : "not green — see note in Launch Room"}</li>
          <li>SendGrid API key present: {sg.sendgridApiKeyPresent ? "yes" : "no"} (name-only check)</li>
          <li>Google Calendar OAuth env: {isGoogleCalendarConfigured() ? "present" : "incomplete"}</li>
        </ul>
      </section>

      <section className={card}>
        <p className={h2}>Quick links</p>
        <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-semibold">
          <Link className="text-sky-800 underline" href="/admin/workbench/communication-intelligence">
            Communication Intelligence
          </Link>
          <Link className="text-kelly-forest underline" href="/admin/workbench/email-command-center/message-studio">
            Message Studio
          </Link>
          <Link className="text-kelly-forest underline" href="/admin/workbench/email-command-center/send-execution#ops">
            Send Execution
          </Link>
          <Link className="text-kelly-forest underline" href="/admin/workbench/email-command-center/audiences">
            Audience Studio
          </Link>
        </div>
      </section>

      <p className="text-[10px] text-kelly-text/65">
        Cockpit uses bounded email/calendar snapshots plus the email workflow queue summary — open Email Command Center for the full ECC aggregate.
      </p>
    </div>
  );
}
