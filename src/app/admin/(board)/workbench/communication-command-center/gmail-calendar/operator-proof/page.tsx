import Link from "next/link";
import { getGmailCalendarOperatorProof } from "@/lib/communication-command-center/gmail-calendar-operator-proof";

export const dynamic = "force-dynamic";

const WORKBENCH = "/admin/workbench";
const READINESS = "/admin/workbench/communication-command-center/readiness";
const GMAIL_CAL = "/admin/workbench/communication-command-center/gmail-calendar";

export default async function GmailCalendarOperatorProofPage() {
  const p = await getGmailCalendarOperatorProof();

  const gmailReady = p.gmail.connectionStatus === "ready_for_operator_connection";
  const calReady = p.calendar.connectionStatus === "ready_for_operator_connection";
  const gmailStatusLabel = !p.ok ? "Waiting on readiness gates" : gmailReady ? "Ready to connect" : "Routes need attention";

  return (
    <div className="min-w-0 max-w-2xl space-y-6 px-1 py-2">
      <div className="flex flex-wrap gap-2">
        <Link href={WORKBENCH} className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate">
          ← Workbench
        </Link>
        <Link href={READINESS} className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate">
          Communication readiness
        </Link>
        <Link href={GMAIL_CAL} className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate">
          Gmail + Calendar summary
        </Link>
      </div>

      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Gmail and Calendar — connection proof</h1>
        <p className="font-body text-sm text-kelly-text/85">
          Use this page when the three hosted readiness checks are green. You will sign in to Google for the <strong>campaign inbox</strong>{" "}
          and <strong>calendar</strong>. Nothing here turns on mass email, text messages, or automatic sends.
        </p>
      </header>

      <div
        className={`rounded-lg border px-3 py-2 font-body text-sm ${
          p.ok ? "border-emerald-400/60 bg-emerald-50/90 text-emerald-950" : "border-amber-400/60 bg-amber-50/95 text-amber-950"
        }`}
        role="status"
      >
        {p.ok
          ? "You may start with Gmail, then Calendar. Sending from tools stays off."
          : "One or more readiness checks are still red. Finish those first, then return here."}
      </div>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-4 shadow-sm">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">1. Gmail connection proof</h2>
        <p className="mt-1 font-body text-xs text-kelly-text/80">
          <span className="font-semibold text-kelly-text">Status:</span> {gmailStatusLabel}
        </p>
        <p className="mt-3 font-body text-xs text-kelly-text/85">
          <span className="font-semibold text-kelly-forest">Action:</span> Connect the campaign inbox
        </p>
        <div className="mt-2">
          <Link
            href={p.gmail.oauthStartUrl}
            className="inline-flex rounded border border-kelly-forest/40 bg-kelly-forest/10 px-3 py-1.5 text-xs font-bold text-kelly-forest hover:bg-kelly-forest/15"
          >
            Connect Gmail (sign-in with Google)
          </Link>
        </div>
        <p className="mt-3 rounded bg-kelly-page/60 px-2 py-1.5 font-body text-[11px] text-kelly-text/90">
          <span className="font-semibold text-kelly-navy">Safety note:</span> This step does not send email. After sign-in, staff tools
          can confirm metadata and headers — not a blast to supporters.
        </p>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-4 shadow-sm">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">2. Gmail metadata proof</h2>
        <p className="mt-1 font-body text-xs text-kelly-text/80">
          <span className="font-semibold text-kelly-text">Status:</span> After OAuth, verify read-only access in the Gmail monitor area.
        </p>
        <p className="mt-2 font-body text-xs text-kelly-text/85">
          There is no message-body blast, no send from this proof, and no import of contact lists. If something asks to send mail, stop
          and ask headquarters.
        </p>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-4 shadow-sm">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">3. Calendar connection proof</h2>
        <p className="mt-1 font-body text-xs text-kelly-text/80">
          <span className="font-semibold text-kelly-text">Status:</span> {calReady ? "Ready to connect" : "Waiting on routes or readiness"}
        </p>
        <p className="mt-3 font-body text-xs text-kelly-text/85">
          <span className="font-semibold text-kelly-forest">Action:</span> Open the calendar workspace and connect Google
        </p>
        <div className="mt-2">
          <Link
            href="/admin/workbench/calendar"
            className="inline-flex rounded border border-sky-700/35 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-950 hover:bg-sky-100"
          >
            Open Calendar workspace
          </Link>
        </div>
        <p className="mt-3 rounded bg-kelly-page/60 px-2 py-1.5 font-body text-[11px] text-kelly-text/90">
          <span className="font-semibold text-kelly-navy">Safety note:</span> Calendar proof starts with reading and syncing. Bulk
          changes to events are a later, separate approval.
        </p>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-4 shadow-sm">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">4. Safety locks</h2>
        <ul className="mt-2 space-y-1.5 font-body text-xs text-kelly-text/90">
          <li>Gmail sending from campaign tools: {p.safety.noSendPosture && !p.safety.gmailSendApproved ? "Locked" : "Review"}</li>
          <li>SendGrid live delivery: {p.safety.sendgridLiveSendApproved ? "Unlocked — review" : "Locked"}</li>
          <li>Twilio text messages: {p.safety.twilioSmsApproved ? "Unlocked — review" : "Locked"}</li>
          <li>Contact import: {p.safety.contactImportApproved ? "Unlocked — review" : "Locked"}</li>
          <li>Automation workers: {p.safety.automationWorkersApproved ? "Unlocked — review" : "Locked"}</li>
          <li>Calendar event writes (bulk or automated): {p.safety.calendarEventWriteApproved ? "Unlocked — review" : "Locked"}</li>
        </ul>
      </section>

      <section className="rounded-lg border border-kelly-text/10 bg-kelly-page/50 p-4">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">5. Operator checklist</h2>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 font-body text-xs text-kelly-text/88">
          <li>If the diagnostics password was ever pasted into chat or a ticket, set a new one in Netlify and deploy.</li>
          <li>Confirm the latest site build is live.</li>
          <li>Open Gmail sign-in and finish consent for the campaign inbox.</li>
          <li>Confirm you return to the site without an error (callback success).</li>
          <li>Open Calendar, connect Google, and finish consent.</li>
          <li>Confirm you can see calendar information in the staff tools (read-first).</li>
          <li>Write a short redacted note for the runbook (no secrets, no tokens).</li>
        </ol>
        <p className="mt-3 font-body text-[11px] text-kelly-text/75">{p.nextRecommendedStep}</p>
        <p className="mt-2 font-body text-[10px] text-kelly-text/65">
          Staff guide: <span className="font-medium">docs/gmail-calendar-operator-proof.md</span>
        </p>
      </section>
    </div>
  );
}
