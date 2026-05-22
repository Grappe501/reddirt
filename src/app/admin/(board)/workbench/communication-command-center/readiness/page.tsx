import Link from "next/link";
import {
  COMMUNICATION_COMMAND_CENTER_ROUTE_KEYS,
  COMMUNICATION_COMMAND_CENTER_ROUTE_LABELS,
  COMMUNICATION_COMMAND_CENTER_TABLE_KEYS,
  COMMUNICATION_COMMAND_CENTER_TABLE_LABELS,
  getCommunicationCommandCenterReadiness,
} from "@/lib/communication-command-center/readiness";

export const dynamic = "force-dynamic";

const WORKBENCH = "/admin/workbench";
const ECC = "/admin/workbench/email-command-center";

export default async function CommunicationCommandCenterReadinessPage() {
  const readiness = await getCommunicationCommandCenterReadiness();

  const row = (label: string, ok: boolean) => (
    <div className="flex items-center justify-between gap-2 border-b border-kelly-text/10 py-1.5 font-body text-[11px] last:border-0">
      <span className="text-kelly-text/90">{label}</span>
      <span className={ok ? "font-bold text-emerald-800" : "font-bold text-rose-800"}>{ok ? "Yes" : "No"}</span>
    </div>
  );

  /** For flags where false / off is the safe, expected posture. */
  const rowLocked = (label: string, locked: boolean) => (
    <div className="flex items-center justify-between gap-2 border-b border-kelly-text/10 py-1.5 font-body text-[11px] last:border-0">
      <span className="text-kelly-text/90">{label}</span>
      <span className={locked ? "font-bold text-emerald-800" : "font-bold text-amber-900"}>
        {locked ? "Locked (expected)" : "Unlocked — review"}
      </span>
    </div>
  );

  return (
    <div className="min-w-0 max-w-4xl space-y-5 px-1 py-2">
      <div className="flex flex-wrap gap-2">
        <Link
          href={WORKBENCH}
          className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate"
        >
          ← Workbench
        </Link>
        <Link href={ECC} className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate">
          Communication Command Center
        </Link>
        <Link href={`${ECC}/readiness`} className="text-xs font-bold text-kelly-forest hover:underline">
          Workspace readiness
        </Link>
        <Link
          href="/admin/workbench/communication-command-center/gmail-calendar/operator-proof"
          className="text-xs font-bold text-emerald-900 hover:underline"
        >
          Gmail + Calendar connection proof
        </Link>
        <Link
          href="/admin/workbench/communication-command-center/gmail-calendar"
          className="text-xs font-bold text-emerald-800/90 hover:underline"
        >
          Gmail + Calendar summary
        </Link>
        <Link
          href="/admin/workbench/communication-command-center/email-sandbox"
          className="text-xs font-bold text-violet-900 hover:underline"
        >
          Sandbox email proof
        </Link>
        <Link
          href="/admin/workbench/communication-command-center/text-reach"
          className="text-xs font-bold text-sky-900 hover:underline"
        >
          Text + Reach
        </Link>
      </div>

      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Communication Command Center — hosted diagnostics</h1>
        <p className="max-w-3xl font-body text-sm text-kelly-text/85">
          Read-only connection and safety snapshot for staff. Live email, Gmail send, SendGrid delivery, Twilio SMS, social
          posting, imports, and background workers stay <strong>turned off</strong> until headquarters enables each lane. For
          scripted checks, the same read-only JSON is available from the server route used for hosted database diagnostics
          (diagnostics bearer token — never commit or paste tokens).
        </p>
      </header>

      <div
        className={`rounded-lg border px-3 py-2 font-body text-sm ${
          readiness.ok ? "border-emerald-400/60 bg-emerald-50/90 text-emerald-950" : "border-amber-400/60 bg-amber-50/95 text-amber-950"
        }`}
        role="status"
      >
        <strong>Overall:</strong>{" "}
        {readiness.ok
          ? "Ready for controlled connection checks — sending remains safely locked."
          : "Not fully green — review the sections below and fix any red items before go-live checks."}
      </div>

      <section className="rounded-lg border border-emerald-300/55 bg-emerald-50/85 p-3 shadow-sm">
        <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-emerald-950/85">Gmail + Calendar connection</h2>
        <p className="mt-1 font-body text-[11px] text-emerald-950/90">
          Ready for operator connection proof. Sending remains locked.
        </p>
        <div className="mt-2">
          <Link
            href="/admin/workbench/communication-command-center/gmail-calendar/operator-proof"
            className="inline-flex rounded border border-emerald-800/35 bg-white px-2 py-1 text-[11px] font-bold text-emerald-950 hover:bg-emerald-100"
          >
            Open connection proof
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-sky-300/55 bg-sky-50/85 p-3 shadow-sm">
        <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-sky-950/85">Text + Relational Organizing</h2>
        <p className="mt-1 font-body text-[11px] text-sky-950/90">
          Foundation ready. Sending and imports remain locked — plan text messaging and volunteer-led outreach before any go-live.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href="/admin/workbench/communication-command-center/text-reach"
            className="inline-flex rounded border border-sky-800/35 bg-white px-2 py-1 text-[11px] font-bold text-sky-950 hover:bg-sky-100"
          >
            Open Text + Reach
          </Link>
          <Link
            href="/admin/workbench/people/relational-organizing"
            className="inline-flex rounded border border-violet-700/30 bg-violet-50 px-2 py-1 text-[11px] font-bold text-violet-950 hover:bg-violet-100"
          >
            RedDirt Reach preview
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-3 shadow-sm">
        <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-kelly-muted">Database (hosted check)</h2>
        <div className="mt-2">
          {row("Reachable", readiness.database.reachable)}
          {row("Live campaign database contract satisfied", readiness.database.productionCanonical)}
        </div>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-3 shadow-sm">
        <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-kelly-muted">Core tables present</h2>
        <div className="mt-2">
          {COMMUNICATION_COMMAND_CENTER_TABLE_KEYS.map((k) => row(COMMUNICATION_COMMAND_CENTER_TABLE_LABELS[k], readiness.tables[k]))}
        </div>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-3 shadow-sm">
        <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-kelly-muted">API routes present (bundle)</h2>
        <div className="mt-2">
          {COMMUNICATION_COMMAND_CENTER_ROUTE_KEYS.map((k) =>
            row(COMMUNICATION_COMMAND_CENTER_ROUTE_LABELS[k], readiness.routes[k]),
          )}
        </div>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-3 shadow-sm">
        <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-kelly-muted">Safety posture</h2>
        <p className="mb-1 font-body text-[10px] text-kelly-muted">
          Green means the safe, default campaign posture. If something shows “Unlocked,” treat it as a deliberate headquarters
          decision — not the default for launch.
        </p>
        <div className="mt-2">
          {row("Queue send safely off (no send from queue items)", readiness.safety.noSendPosture)}
          {rowLocked("Live mass email sending", !readiness.safety.liveSendApproved)}
          {rowLocked("Gmail send from tools", !readiness.safety.gmailSendApproved)}
          {rowLocked("SendGrid live delivery", !readiness.safety.sendgridLiveSendApproved)}
          {rowLocked("Twilio SMS", !readiness.safety.twilioSmsApproved)}
          {rowLocked("Social posting automation", !readiness.safety.socialPostingApproved)}
          {rowLocked("Bulk contact import", !readiness.safety.contactImportApproved)}
          {rowLocked("Automation workers", !readiness.safety.automationWorkersApproved)}
        </div>
      </section>

      <section className="rounded-lg border border-kelly-text/10 bg-kelly-page/50 p-3">
        <h2 className="font-heading text-xs font-bold uppercase text-kelly-navy">Next recommended step</h2>
        <p className="mt-1 font-body text-sm text-kelly-text/90">{readiness.nextRecommendedStep}</p>
        <p className="mt-2 font-body text-[10px] text-kelly-muted">
          Staff reference: <span className="font-medium">docs/communication-command-center-readiness.md</span> (in the repo).
        </p>
      </section>
    </div>
  );
}
