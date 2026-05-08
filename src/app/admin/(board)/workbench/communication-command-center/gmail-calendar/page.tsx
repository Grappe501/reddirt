import Link from "next/link";
import { getGmailCalendarOAuthReadiness } from "@/lib/communication-command-center/gmail-calendar-readiness";

export const dynamic = "force-dynamic";

const WORKBENCH = "/admin/workbench";
const READINESS = "/admin/workbench/communication-command-center/readiness";

export default async function GmailCalendarOAuthProofPage() {
  const r = await getGmailCalendarOAuthReadiness();

  const gmailStatus =
    r.gmail.oauthStartRoutePresent && r.gmail.oauthCallbackRoutePresent && r.gmail.pubsubRoutePresent
      ? "Ready for connection proof"
      : "Setup needed — routes missing";

  const calendarStatus =
    r.calendar.callbackRoutePresent && r.calendar.cronSyncRoutePresent && r.calendar.webhookRoutePresent
      ? "Ready for connection proof"
      : "Setup needed — routes missing";

  return (
    <div className="min-w-0 max-w-2xl space-y-6 px-1 py-2">
      <div className="flex flex-wrap gap-2">
        <Link href={WORKBENCH} className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate">
          ← Workbench
        </Link>
        <Link href={READINESS} className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate">
          Communication readiness
        </Link>
        <Link
          href="/admin/workbench/communication-command-center/gmail-calendar/operator-proof"
          className="rounded border border-kelly-forest/25 bg-kelly-forest/10 px-2 py-0.5 text-xs font-bold text-kelly-forest"
        >
          Operator connection proof
        </Link>
      </div>

      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Gmail and Calendar</h1>
        <p className="font-body text-sm text-kelly-text/85">
          Connect the campaign inbox and calendar when you are ready. This area is for <strong>connection checks only</strong> —
          nothing here turns on mass email, text blasts, or automatic sends.
        </p>
      </header>

      <div
        className={`rounded-lg border px-3 py-2 font-body text-sm ${
          r.ok ? "border-emerald-400/60 bg-emerald-50/90 text-emerald-950" : "border-amber-400/60 bg-amber-50/95 text-amber-950"
        }`}
        role="status"
      >
        {r.ok
          ? "Behind the scenes, the sign-in routes look good. You can start with Gmail, then Calendar — sending stays locked."
          : "Something still needs attention in the technical setup. Ask a developer to review before you connect accounts."}
      </div>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-4 shadow-sm">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">1. Gmail connection</h2>
        <p className="mt-1 font-body text-xs text-kelly-text/80">
          <span className="font-semibold text-kelly-text">Status:</span> {gmailStatus}
        </p>
        <p className="mt-3 font-body text-xs text-kelly-text/85">
          <span className="font-semibold text-kelly-forest">Action:</span> Connect the campaign inbox
        </p>
        <div className="mt-2">
          <Link
            href="/api/gmail/oauth/start"
            className="inline-flex rounded border border-kelly-forest/40 bg-kelly-forest/10 px-3 py-1.5 text-xs font-bold text-kelly-forest hover:bg-kelly-forest/15"
          >
            Start Gmail sign-in
          </Link>
        </div>
        <p className="mt-3 rounded bg-kelly-page/60 px-2 py-1.5 font-body text-[11px] text-kelly-text/90">
          <span className="font-semibold text-kelly-navy">Safety note:</span> No emails will be sent from this step. We only check
          that you can sign in and that the system can receive mail metadata safely.
        </p>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-4 shadow-sm">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">2. Calendar connection</h2>
        <p className="mt-1 font-body text-xs text-kelly-text/80">
          <span className="font-semibold text-kelly-text">Status:</span> {calendarStatus}
        </p>
        <p className="mt-3 font-body text-xs text-kelly-text/85">
          <span className="font-semibold text-kelly-forest">Action:</span> Connect the campaign calendar
        </p>
        <div className="mt-2">
          <Link
            href="/admin/workbench/calendar#google-calendar-live-preview"
            className="inline-flex rounded border border-sky-700/35 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-950 hover:bg-sky-100"
          >
            Open Calendar workspace
          </Link>
        </div>
        <p className="mt-3 rounded bg-kelly-page/60 px-2 py-1.5 font-body text-[11px] text-kelly-text/90">
          <span className="font-semibold text-kelly-navy">Safety note:</span> Calendar checks start read-only. Changing or creating
          events in bulk is a separate, deliberate step later.
        </p>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-4 shadow-sm">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">3. Safety locks</h2>
        <ul className="mt-2 space-y-1.5 font-body text-xs text-kelly-text/90">
          <li>Gmail sending from tools: {r.safety.noSendPosture && !r.safety.gmailSendApproved ? "Locked" : "Review"}</li>
          <li>SendGrid live sending: {r.safety.sendgridLiveSendApproved ? "Unlocked — review" : "Locked"}</li>
          <li>Twilio SMS: {r.safety.twilioSmsApproved ? "Unlocked — review" : "Locked"}</li>
          <li>Contact imports: {r.safety.contactImportApproved ? "Unlocked — review" : "Locked"}</li>
          <li>Automation workers: {r.safety.automationWorkersApproved ? "Unlocked — review" : "Locked"}</li>
        </ul>
        <p className="mt-2 font-body text-[10px] text-kelly-text/65">
          Staff guide: <span className="font-medium">docs/gmail-calendar-oauth-proof.md</span>
        </p>
      </section>

      <section className="rounded-lg border border-kelly-text/10 bg-kelly-page/50 p-4">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">4. Next steps</h2>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 font-body text-xs text-kelly-text/88">
          <li>Connect Gmail and confirm you land back in the dashboard without errors.</li>
          <li>Confirm inbox metadata looks right (no test blast required).</li>
          <li>Connect Calendar and confirm events can be viewed.</li>
          <li>When headquarters is ready, plan text messaging (Twilio) and RedDirt Reach together.</li>
        </ol>
        <p className="mt-3 font-body text-[11px] text-kelly-text/75">{r.nextRecommendedStep}</p>
      </section>
    </div>
  );
}
