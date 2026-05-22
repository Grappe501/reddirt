import Link from "next/link";

const ECC = "/admin/workbench/email-command-center";

const pill = (s: "live" | "partial" | "future") => {
  const c =
    s === "live"
      ? "bg-emerald-100 text-emerald-900"
      : s === "partial"
        ? "bg-amber-100 text-amber-950"
        : "bg-kelly-muted/35 text-kelly-slate";
  return <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${c}`}>{s}</span>;
};

const ROUTE_CARDS: {
  name: string;
  path: string;
  status: "live" | "partial" | "future";
  does: string;
  doesNot: string;
  upstream: string;
  downstream: string;
  safety: string;
}[] = [
  {
    name: "Main Command Center",
    path: ECC,
    status: "live",
    does: "Cockpit counts, gates, quick links, operator path, pipeline.",
    doesNot: "Send mail, run migrations, or activate automation.",
    upstream: "Workbench, admin actor, DATABASE_URL",
    downstream: "Every sub-route below",
    safety: "Queue-first; EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM stays false.",
  },
  {
    name: "Daily Operator Console",
    path: `${ECC}/daily`,
    status: "live",
    does: "Start-of-day priorities from snapshot + rule-based next actions + work queue links; local Message Studio draft summary (this browser).",
    doesNot: "Send mail, write DB, upload localStorage, or activate automation.",
    upstream: "getEmailCommandCenterSnapshot, browser localStorage (drafts only)",
    downstream: "Queue, Gmail review, profiles, imports, Message Studio, send governance",
    safety: "No demo mode; no sends; drafts never leave the browser.",
  },
  {
    name: "Gmail Monitor",
    path: `${ECC}/gmail`,
    status: "partial",
    does: "OAuth connect, manual metadata sync, watch start/renew, history preview.",
    doesNot: "Auto-fetch bodies, auto-create queue rows from Pub/Sub.",
    upstream: "OAuth env, StaffGmailAccount",
    downstream: "Gmail Review, queue (manual bridge)",
    safety: "Tokens never shown in UI.",
  },
  {
    name: "Gmail Review → Queue",
    path: `${ECC}/gmail/review`,
    status: "live",
    does: "METADATA-only INBOX list; manual Create queue item.",
    doesNot: "Store bodies, send mail, auto-queue.",
    upstream: "Gmail monitor + sync",
    downstream: "Email queue item detail",
    safety: "Duplicate guard on gmailMessageId provenance.",
  },
  {
    name: "Email Queue",
    path: "/admin/workbench/email-queue",
    status: "live",
    does: "Triage, filters, assignment, status, interpretation.",
    doesNot: "Provider send from approval state.",
    upstream: "Manual create, Gmail review, forms",
    downstream: "Queue detail, AI panel, Message Studio handoff",
    safety: "APPROVED = workflow only, not send authorization.",
  },
  {
    name: "Queue detail — AI Intelligence",
    path: "__QUEUE_ITEM__",
    status: "partial",
    does: "Advisory OpenAI json_object → metadataJson.emailAiAnalysis.",
    doesNot: "Auto-merge CRM, auto-send, auto-change status.",
    upstream: "Queue item + OPENAI_API_KEY",
    downstream: "Profile suggestions, Message Studio (manual paste)",
    safety: "AI suggests; humans decide.",
  },
  {
    name: "Profile & hint review",
    path: `${ECC}/profiles`,
    status: "live",
    does: "Approve profile fact suggestions; manage audience hints.",
    doesNot: "Auto-update User/VolunteerProfile; SendGrid segments.",
    upstream: "Queue AI suggestions (stored JSON)",
    downstream: "Audience Studio (ACTIVE facts)",
    safety: "Facts need explicit approval.",
  },
  {
    name: "Audience Studio",
    path: `${ECC}/audiences`,
    status: "live",
    does: "Previews, draft definitions, building blocks over approved facts.",
    doesNot: "SendGrid list sync, broadcast send.",
    upstream: "Approved EmailContactProfileFact",
    downstream: "Message Studio (?audienceDefinitionId=), SendGrid foundation previews",
    safety: "Pending hints are not broadcast-eligible.",
  },
  {
    name: "Contact Imports",
    path: `${ECC}/imports`,
    status: "live",
    does: "CSV staging, validate, approve, commit to profiles + CONTACT_IMPORT facts.",
    doesNot: "SendGrid sync, sends, assumed marketing consent.",
    upstream: "Operator CSV + migration gate",
    downstream: "Profiles, Audience Studio, Message Studio planning",
    safety: "Hosted production imports need same DB gates on canonical DATABASE_URL.",
  },
  {
    name: "SendGrid Foundation",
    path: `${ECC}/sendgrid`,
    status: "partial",
    does: "Env readiness, webhook path, local event + suppression tables, previews.",
    doesNot: "Mass send, automatic contact sync.",
    upstream: "SENDGRID_* env, POST /api/sendgrid/events",
    downstream: "Analytics (counts), future send gate",
    safety: "Suppressions must gate future sends.",
  },
  {
    name: "Hosted DB readiness assistant",
    path: `${ECC}/readiness/hosted-db`,
    status: "live",
    does: "EMAIL-HOSTED-DB-READINESS-ASSISTANT-1.0 — DATABASE_URL/DIRECT_URL presence + parse + host classification, DB reachability, migration + import gate snapshot, copyable CLI snippets (no secrets).",
    doesNot: "Edit env, run migrations, import CSV, or print connection string values.",
    upstream: "process.env DATABASE_URL/DIRECT_URL (names + parse only), getEmailCommandCenterSnapshot.operatorGate",
    downstream: "Operator shell gates on hosted Kelly-Grappe-App Supabase; docs/deployment.md",
    safety: "Wrong Supabase project ref = wrong DB — verify Reference ID in dashboard.",
  },
  {
    name: "Message Studio",
    path: `${ECC}/message-studio`,
    status: "live",
    does: "LOCAL-DRAFTS-1.1 — localStorage draft library, autosave, copy/export, content blocks insert; query chips.",
    doesNot: "Server persistence, OpenAI calls, send.",
    upstream: "Queue, audiences, imports (query params only)",
    downstream: "Send Execution Governance, future server drafts + execution",
    safety: "Drafts browser-local only; clearing site data loses drafts.",
  },
  {
    name: "Automation Studio",
    path: `${ECC}/automation`,
    status: "live",
    does: "Tier map, triggers, actions, playbooks, future gates (read-only).",
    doesNot: "Activate workers, cron, or auto-send.",
    upstream: "Policy + architecture docs",
    downstream: "Explicit future automation packets",
    safety: "No activation from this route.",
  },
  {
    name: "Analytics & Deliverability",
    path: `${ECC}/analytics`,
    status: "live",
    does: "One-page queue + intelligence + import + SendGrid signal + checklist.",
    doesNot: "Authorize sends or mutate data.",
    upstream: "getEmailCommandCenterSnapshot + suppression groupBy",
    downstream: "Operator decisions outside this app",
    safety: "Read-only; no SendGrid/Gmail send buttons.",
  },
  {
    name: "Send Execution Governance",
    path: `${ECC}/send-execution`,
    status: "live",
    does: "Future send rails, pre-send checklist, suppression + approval doctrine, decision tree (read-only).",
    doesNot: "Call Gmail/SendGrid send APIs, change queue send flag, persist approvals.",
    upstream: "Message Studio, Analytics, SendGrid Foundation, Audience, imports",
    downstream: "EMAIL-SEND-EXECUTION-1.0 (future governed execution)",
    safety: "No live sends; EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM unchanged.",
  },
];

export function EmailCommandCenterRouteMapView() {
  return (
    <div className="min-w-0 max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={ECC} className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate">
          ← Communication Command Center
        </Link>
        <Link href={`${ECC}/readiness`} className="text-xs font-bold text-kelly-forest hover:underline">
          Readiness checklist
        </Link>
        <Link href={`${ECC}/readiness/hosted-db`} className="text-xs font-bold text-violet-800 hover:underline">
          Hosted DB assistant
        </Link>
        <Link href={`${ECC}/send-execution`} className="text-xs text-kelly-muted hover:underline">
          Send execution governance
        </Link>
      </div>

      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Communication Command Center — Route map</h1>
        <p className="max-w-3xl font-body text-sm text-kelly-text/85">
          EMAIL-COMMAND-CENTER-FINAL-POLISH-1.0 — every operator surface in one map: paths, posture, upstream/downstream, and
          what each route <strong>does not</strong> do. No new automation or sends implied.
        </p>
      </header>

      <section className="rounded-lg border border-kelly-navy/20 bg-kelly-fog/30 px-3 py-3">
        <h2 className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-navy">How to use this map</h2>
        <ol className="mt-2 list-inside list-decimal space-y-1 font-body text-[11px] text-kelly-text/90">
          <li>
            Start at the{" "}
            <Link href={`${ECC}/daily`} className="font-bold text-kelly-forest underline">
              Daily Operator Console
            </Link>{" "}
            or the{" "}
            <Link href={ECC} className="font-bold text-kelly-forest underline">
              main cockpit
            </Link>{" "}
            for live counts and migration/DB banners.
          </li>
          <li>
            Open{" "}
            <Link href={`${ECC}/readiness`} className="font-bold text-kelly-forest underline">
              Readiness checklist
            </Link>{" "}
            before claiming production readiness.
          </li>
          <li>Follow a flow section below that matches your task (inbound, CSV, broadcast planning, webhooks).</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-kelly-muted">Route cards</h2>
        <div className="grid gap-2 md:grid-cols-2">
          {ROUTE_CARDS.map((r) => (
            <article
              key={r.name}
              className="rounded-lg border border-kelly-text/12 bg-white/95 p-3 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-heading text-sm font-bold text-kelly-navy">{r.name}</h3>
                {pill(r.status)}
              </div>
              <p className="mt-1 font-mono text-[10px] text-kelly-forest">
                {r.path === "__QUEUE_ITEM__" ? (
                  <>
                    <Link href="/admin/workbench/email-queue" className="font-bold underline">
                      /admin/workbench/email-queue
                    </Link>
                    <span className="text-kelly-muted"> → /admin/workbench/email-queue/[id]</span>
                  </>
                ) : (
                  <Link href={r.path} className="font-bold underline">
                    {r.path}
                  </Link>
                )}
              </p>
              <dl className="mt-2 space-y-1 font-body text-[10px] text-kelly-text/88">
                <div>
                  <dt className="font-bold text-kelly-navy">Does</dt>
                  <dd>{r.does}</dd>
                </div>
                <div>
                  <dt className="font-bold text-rose-900">Does not</dt>
                  <dd>{r.doesNot}</dd>
                </div>
                <div>
                  <dt className="font-bold text-kelly-navy">Upstream</dt>
                  <dd>{r.upstream}</dd>
                </div>
                <div>
                  <dt className="font-bold text-kelly-navy">Downstream</dt>
                  <dd>{r.downstream}</dd>
                </div>
                <div>
                  <dt className="font-bold text-kelly-forest">Safety</dt>
                  <dd>{r.safety}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-3">
        <h2 className="font-heading text-xs font-bold uppercase text-kelly-muted">1. Inbound email flow</h2>
        <p className="mt-2 font-body text-[11px] text-kelly-text/85">
          <Link href={`${ECC}/gmail`} className="font-semibold underline">
            Gmail
          </Link>{" "}
          →{" "}
          <Link href={`${ECC}/gmail/review`} className="font-semibold underline">
            Gmail Review
          </Link>{" "}
          →{" "}
          <Link href="/admin/workbench/email-queue" className="font-semibold underline">
            Queue
          </Link>{" "}
          →{" "}
          <Link href="/admin/workbench/email-queue" className="font-semibold underline">
            AI
          </Link>{" "}
          (on item detail) →{" "}
          <Link href={`${ECC}/profiles`} className="font-semibold underline">
            Profile suggestions
          </Link>{" "}
          →{" "}
          <Link href={`${ECC}/audiences`} className="font-semibold underline">
            Audience
          </Link>{" "}
          →{" "}
          <Link href={`${ECC}/message-studio`} className="font-semibold underline">
            Message Studio
          </Link>
        </p>
        <p className="mt-1 text-[10px] text-kelly-muted">Bodies stay in Gmail until a future governed ingest packet.</p>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-3">
        <h2 className="font-heading text-xs font-bold uppercase text-kelly-muted">2. Contact list flow</h2>
        <p className="mt-2 font-body text-[11px] text-kelly-text/85">
          <Link href={`${ECC}/imports`} className="font-semibold underline">
            CSV Import
          </Link>{" "}
          → Validate / dedupe → Approve / Commit →{" "}
          <Link href={`${ECC}/profiles`} className="font-semibold underline">
            Profile facts
          </Link>{" "}
          →{" "}
          <Link href={`${ECC}/audiences`} className="font-semibold underline">
            Audience Studio
          </Link>{" "}
          →{" "}
          <Link href={`${ECC}/message-studio`} className="font-semibold underline">
            Message Studio
          </Link>
        </p>
        <p className="mt-1 text-[10px] text-kelly-muted">No SendGrid sync on this path; production DB gate still operator-run.</p>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-3">
        <h2 className="font-heading text-xs font-bold uppercase text-kelly-muted">3. Broadcast future flow</h2>
        <p className="mt-2 font-body text-[11px] text-kelly-text/85">
          Audience Studio → <span className="text-kelly-muted">SendGrid contact sync (future)</span> → Message Studio →
          Approval →{" "}
          <Link href={`${ECC}/send-execution`} className="font-semibold underline">
            Send Execution Governance
          </Link>{" "}
          (doctrine) → <span className="text-kelly-muted">Provider execution (future)</span> → Analytics
        </p>
        <p className="mt-1 text-[10px] text-kelly-muted">
          Middle steps are <strong>not shipped</strong> in this lane — map shows intent only.
        </p>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-3">
        <h2 className="font-heading text-xs font-bold uppercase text-kelly-muted">4. Event / suppression flow</h2>
        <p className="mt-2 font-body text-[11px] text-kelly-text/85">
          SendGrid webhook (<code className="text-[9px]">POST /api/sendgrid/events</code>) → SendGridEvent / SendGridSuppression
          tables →{" "}
          <Link href={`${ECC}/analytics`} className="font-semibold underline">
            Analytics
          </Link>{" "}
          → future send gate (honor suppressions)
        </p>
        <p className="mt-1 text-[10px] text-kelly-muted">Signed webhooks in production; env verification key required.</p>
      </section>
    </div>
  );
}
