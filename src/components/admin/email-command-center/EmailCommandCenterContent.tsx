import Link from "next/link";
import type { EmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";

const card =
  "rounded-lg border border-kelly-text/12 bg-gradient-to-b from-white/95 to-kelly-page/90 px-3 py-2.5 shadow-sm";
const h3 = "font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/50";
const pill =
  "rounded-full border border-kelly-text/15 bg-white/80 px-2 py-0.5 text-[9px] font-semibold text-kelly-slate";

type StepState = "live" | "partial" | "designed" | "blocked_credentials" | "blocked_future";

const stepStyle: Record<StepState, string> = {
  live: "border-emerald-500/40 bg-emerald-50/80 text-emerald-900",
  partial: "border-amber-500/35 bg-amber-50/70 text-amber-950",
  designed: "border-kelly-text/20 bg-kelly-page text-kelly-text",
  blocked_credentials: "border-rose-400/40 bg-rose-50/80 text-rose-950",
  blocked_future: "border-kelly-muted/40 bg-kelly-muted/15 text-kelly-slate",
};

function PipelineStep({
  label,
  state,
  note,
  href,
}: {
  label: string;
  state: StepState;
  note: string;
  href?: string;
}) {
  const inner = (
    <>
      <p className="font-heading text-[10px] font-bold uppercase tracking-wide">{label}</p>
      <p className="mt-0.5 font-body text-[10px] leading-snug opacity-90">{note}</p>
    </>
  );
  const boxClass = `rounded-md border px-2 py-1.5 ${stepStyle[state]}`;
  if (href) {
    return (
      <Link href={href} className={`${boxClass} block transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1`}>
        {inner}
      </Link>
    );
  }
  return <div className={boxClass}>{inner}</div>;
}

function StatusCard({
  title,
  value,
  href,
  sub,
}: {
  title: string;
  value: number;
  href: string;
  sub?: string;
}) {
  return (
    <Link
      href={href}
      className={`${card} block transition hover:border-kelly-forest/30 hover:shadow-md`}
    >
      <p className={h3}>{title}</p>
      <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-kelly-navy">{value}</p>
      {sub ? <p className="mt-0.5 font-body text-[10px] text-kelly-text/60">{sub}</p> : null}
    </Link>
  );
}

const DAILY_OPERATOR_CONSOLE_PATH = "/admin/workbench/email-command-center/daily";
const MESSAGE_STUDIO_PATH = "/admin/workbench/email-command-center/message-studio";
const AUTOMATION_STUDIO_PATH = "/admin/workbench/email-command-center/automation";
const ANALYTICS_DELIVERABILITY_PATH = "/admin/workbench/email-command-center/analytics";
const ROUTE_MAP_PATH = "/admin/workbench/email-command-center/map";
const READINESS_CHECKLIST_PATH = "/admin/workbench/email-command-center/readiness";
const SEND_EXECUTION_GOVERNANCE_PATH = "/admin/workbench/email-command-center/send-execution";

type TonightPathStatus = "live" | "partial" | "future";

function TonightOperatorCard({
  title,
  status,
  href,
  safety,
}: {
  title: string;
  status: TonightPathStatus;
  href: string;
  safety: string;
}) {
  const statusLabel =
    status === "live" ? "Live" : status === "partial" ? "Partial" : "Future";
  const statusClass =
    status === "live"
      ? "border-emerald-400/50 bg-emerald-50/90 text-emerald-950"
      : status === "partial"
        ? "border-amber-400/45 bg-amber-50/85 text-amber-950"
        : "border-kelly-text/20 bg-kelly-page text-kelly-slate";
  return (
    <Link
      href={href}
      className={`block rounded-lg border px-2.5 py-2 transition hover:border-kelly-forest/35 hover:shadow-sm ${statusClass}`}
    >
      <p className="font-heading text-[9px] font-bold uppercase tracking-wide opacity-80">{statusLabel}</p>
      <p className="mt-0.5 font-heading text-xs font-bold text-kelly-navy">{title}</p>
      <p className="mt-1 font-body text-[10px] leading-snug opacity-90">{safety}</p>
    </Link>
  );
}

function IntegrationColumn({
  title,
  statusLabel,
  existsToday,
  missing,
  nextPacket,
  safetyGate,
}: {
  title: string;
  statusLabel: string;
  existsToday: string[];
  missing: string[];
  nextPacket: string;
  safetyGate: string;
}) {
  return (
    <div className={card}>
      <p className="font-heading text-xs font-bold text-kelly-navy">{title}</p>
      <p className="mt-1 font-body text-[10px] font-semibold text-kelly-forest">{statusLabel}</p>
      <div className="mt-2 space-y-1.5">
        <p className={h3}>What exists today</p>
        <ul className="list-inside list-disc font-body text-[10px] text-kelly-text/85">
          {existsToday.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <p className={h3}>Missing</p>
        <ul className="list-inside list-disc font-body text-[10px] text-kelly-text/85">
          {missing.length ? (
            missing.map((x) => (
              <li key={x}>{x}</li>
            ))
          ) : (
            <li className="list-none text-kelly-text/50">—</li>
          )}
        </ul>
        <p className="mt-1 font-body text-[10px] text-kelly-text/70">
          <span className="font-bold">Next packet:</span> {nextPacket}
        </p>
        <p className="rounded border border-kelly-forest/20 bg-kelly-fog/40 px-2 py-1 font-body text-[10px] text-kelly-navy">
          <span className="font-bold">Safety:</span> {safetyGate}
        </p>
      </div>
    </div>
  );
}

export function EmailCommandCenterContent({
  snapshot,
  query = {},
}: {
  snapshot: EmailCommandCenterSnapshot;
  query?: { gmail?: string; gmail_error?: string; missing?: string };
}) {
  const q = snapshot.queueHealth;
  const a = snapshot.assignmentHealth;
  const sg = snapshot.sendgridEnv;
  const oa = snapshot.openAi;
  const g = snapshot.gmail;
  const pg = snapshot.profileGraph;
  const au = snapshot.audienceStudio;
  const sgF = snapshot.sendGridFoundation;
  const ci = snapshot.contactImport;
  const og = snapshot.operatorGate;

  const sendgridConfiguredForSend = sg.sendgridApiKeyPresent && sg.sendgridFromEmailPresent;
  const dbUnreachable = !og.cockpitDbReachable;
  const migrationAttention =
    og.cockpitDbReachable &&
    (og.allEmailCommandCenterMigrationsApplied !== true || Boolean(og.migrationGateNote));

  return (
    <div className="min-w-0 space-y-4">
      <div
        className="rounded-lg border-2 border-kelly-navy/25 bg-kelly-navy/[0.04] px-3 py-2 font-body text-[11px] text-kelly-navy"
        role="note"
      >
        <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-navy/80">Do not send from here</p>
        <p className="mt-1 leading-snug">
          This cockpit coordinates triage, drafts, and readiness — <strong>no live sends</strong>, no SendGrid execution, no
          Gmail send-from-queue. <code className="text-[10px]">EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM</code> stays{" "}
          <strong>false</strong> until a future explicit packet changes it.
        </p>
        <p className="mt-2 leading-snug">
          <strong>Operator-ready, execution-gated:</strong> use this cockpit and the Daily console for real queue and draft
          work; provider sends, mass mail, and automation activation remain outside these routes until explicit future
          packets.
        </p>
      </div>

      <section className="rounded-lg border-2 border-emerald-400/40 bg-emerald-50/80 px-3 py-2.5 shadow-sm">
        <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-emerald-950">Operator start path — finish tonight</p>
        <ol className="mt-2 list-inside list-decimal space-y-1 font-body text-[11px] text-emerald-950/95">
          <li>
            Open the{" "}
            <Link href={DAILY_OPERATOR_CONSOLE_PATH} className="font-bold underline">
              Daily Operator Console
            </Link>{" "}
            — start-of-day priorities, work queue links, and next-best-action hints (still <strong>no send</strong>).
          </li>
          <li>
            Open the{" "}
            <Link href={READINESS_CHECKLIST_PATH} className="font-bold underline">
              Readiness checklist
            </Link>{" "}
            — align env + DB truth for <strong>this</strong> machine (hosted Supabase still operator-verified separately).
          </li>
          <li>
            Skim the{" "}
            <Link href={ROUTE_MAP_PATH} className="font-bold underline">
              Route map
            </Link>{" "}
            — know upstream/downstream for the surface you are about to use.
          </li>
          <li>
            Triage:{" "}
            <Link href="/admin/workbench/email-queue" className="font-bold underline">
              Email queue
            </Link>{" "}
            or{" "}
            <Link href="/admin/workbench/email-command-center/gmail/review" className="font-bold underline">
              Gmail review → queue
            </Link>
            .
          </li>
          <li>
            Intelligence: queue item → AI panel →{" "}
            <Link href="/admin/workbench/email-command-center/profiles" className="font-bold underline">
              Profiles
            </Link>{" "}
            →{" "}
            <Link href="/admin/workbench/email-command-center/audiences" className="font-bold underline">
              Audiences
            </Link>
            .
          </li>
          <li>
            Plan copy in{" "}
            <Link href={MESSAGE_STUDIO_PATH} className="font-bold underline">
              Message Studio
            </Link>
            ; review automation policy in{" "}
            <Link href={AUTOMATION_STUDIO_PATH} className="font-bold underline">
              Automation Studio
            </Link>
            ; confirm signals in{" "}
            <Link href={ANALYTICS_DELIVERABILITY_PATH} className="font-bold underline">
              Analytics
            </Link>
            .
          </li>
          <li>
            Read{" "}
            <Link href={SEND_EXECUTION_GOVERNANCE_PATH} className="font-bold underline">
              Send Execution Governance
            </Link>{" "}
            — future send rails, suppression gate, and approval map (still <strong>no live sends</strong>).
          </li>
          <li>
            QA script (repo):{" "}
            <span className="font-mono text-[10px]">docs/email-command-center-operator-smoke-test.md</span>
          </li>
        </ol>
      </section>

      <section className="grid gap-2 lg:grid-cols-2">
        <div className={`${card} border-emerald-200/60 bg-emerald-50/50`}>
          <h2 className={h3}>What is ready now?</h2>
          <ul className="mt-2 list-inside list-disc space-y-0.5 font-body text-[11px] text-kelly-navy/95">
            <li>Queue triage, assignment, and workflow statuses.</li>
            <li>Gmail metadata review → manual queue bridge (no bodies).</li>
            <li>Advisory AI analysis on queue detail when OPENAI_API_KEY is set.</li>
            <li>Profile suggestions + audience hints staging + approvals.</li>
            <li>Audience previews and draft definitions (no SendGrid sync).</li>
            <li>Contact import staging (validate → approve → commit) when DB + migrations gate passes locally.</li>
            <li>Message planning in Message Studio — <strong>localStorage</strong> draft library (this browser only).</li>
            <li>Automation planning map (read-only) in Automation Studio.</li>
            <li>Analytics readiness dashboard (read-only aggregates).</li>
            <li>Route map + readiness checklist routes.</li>
            <li>
              Send Execution Governance shell — doctrine for future Gmail/SendGrid sends (
              <Link href={SEND_EXECUTION_GOVERNANCE_PATH} className="font-bold underline">
                /send-execution
              </Link>
              ).
            </li>
          </ul>
        </div>
        <div className={`${card} border-rose-200/60 bg-rose-50/60`}>
          <h2 className={h3}>What is intentionally blocked?</h2>
          <ul className="mt-2 list-inside list-disc space-y-0.5 font-body text-[11px] text-rose-950/95">
            <li>Live SendGrid broadcast or mass send from Command Center surfaces.</li>
            <li>Gmail send-from-queue or auto-reply from these routes.</li>
            <li>Auto-send or auto-approval from AI output.</li>
            <li>Production hosted imports until the same migrate + import gate passes on canonical DATABASE_URL.</li>
            <li>Automatic CRM profile updates from AI or imports (commits stay on EmailContactProfile + governed facts).</li>
            <li>
              Provider execution — see{" "}
              <Link href={SEND_EXECUTION_GOVERNANCE_PATH} className="font-bold underline">
                Send Execution Governance
              </Link>{" "}
              for the gate map; <strong>EMAIL-SEND-EXECUTION-1.0</strong> still future.
            </li>
          </ul>
        </div>
      </section>

      <div
        className="rounded-lg border border-kelly-navy/25 bg-kelly-fog/40 px-3 py-2 font-body text-[11px] text-kelly-navy"
        role="note"
      >
        <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-navy/80">Blocked today — send step</p>
        <p className="mt-1 leading-snug">
          No Gmail or SendGrid execution from the Command Center. Open{" "}
          <Link href={SEND_EXECUTION_GOVERNANCE_PATH} className="font-bold text-kelly-forest underline">
            Send Execution Governance
          </Link>{" "}
          for the full pre-send checklist, suppression doctrine, and approval roles — operator training only.
        </p>
      </div>

          {query.gmail_error ? (
        <div className="rounded-lg border border-rose-300/60 bg-rose-50/80 px-3 py-2 font-body text-[11px] text-rose-950" role="alert">
          <span className="font-bold">Gmail OAuth:</span> {query.gmail_error}
          {query.missing ? (
            <>
              {" "}
              — check: <code className="text-[10px]">{query.missing}</code>
            </>
          ) : null}
        </div>
      ) : null}
      {query.gmail && !query.gmail_error ? (
        <div className="rounded-lg border border-emerald-300/50 bg-emerald-50/70 px-3 py-2 font-body text-[11px] text-emerald-950" role="status">
          Gmail connection updated — see{" "}
          <Link href={g.monitorPath} className="font-bold underline">
            Gmail monitor
          </Link>
          .
        </div>
      ) : null}

      {dbUnreachable ? (
        <div
          className="rounded-lg border border-rose-400/50 bg-rose-50/90 px-3 py-2 font-body text-[11px] text-rose-950"
          role="alert"
        >
          <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-rose-900">Database unreachable</p>
          <p className="mt-1 leading-snug">
            Cockpit could not load live counts for this request. Navigation and planning copy still work; fix{" "}
            <code className="text-[10px]">DATABASE_URL</code> connectivity, then run diagnostics from the RedDirt folder.
          </p>
          <ul className="mt-1.5 list-inside list-disc text-[10px] opacity-95">
            <li>
              <code className="text-[10px]">{og.dbDiagnoseCliHint}</code> — safe shape + connectivity (no secrets printed)
            </li>
            <li>
              <code className="text-[10px]">{og.preflightCliHint}</code> — env + DB checklist
            </li>
          </ul>
        </div>
      ) : migrationAttention ? (
        <div
          className="rounded-lg border border-amber-400/50 bg-amber-50/90 px-3 py-2 font-body text-[11px] text-amber-950"
          role="status"
        >
          <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-amber-900">
            Migrations / import gate
          </p>
          <p className="mt-1 leading-snug">
            {og.migrationGateNote ??
              "Run the CLI preflight to confirm the same database your app uses has all Email Command Center migrations applied."}
          </p>
          <ul className="mt-1.5 list-inside list-disc text-[10px] opacity-95">
            <li>
              <code className="text-[10px]">{og.preflightCliHint}</code> — full env + migration checklist
            </li>
            <li>
              Full import gate: <code className="text-[10px]">{og.importGateCliHint}</code>
            </li>
          </ul>
        </div>
      ) : (
        <div
          className="rounded-lg border border-emerald-300/45 bg-emerald-50/70 px-3 py-2 font-body text-[11px] text-emerald-950"
          role="status"
        >
          <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-emerald-900">
            Database / migration readiness
          </p>
          <p className="mt-1 leading-snug">
            This page reached Postgres and the listed Email Command Center migrations appear applied. Still run{" "}
            <code className="text-[10px]">{og.importGateCliHint}</code> before any bulk contact import —{" "}
            <code className="text-[10px]">npm run check</code> alone does not prove migrate state.
          </p>
        </div>
      )}

      <div className="rounded-lg border border-kelly-text/15 bg-white/90 px-3 py-2 font-body text-[11px] text-kelly-navy shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-text/60">Contact import</p>
            <p className="mt-1 font-semibold">{og.contactImportStatusLabel}</p>
            <p className="mt-0.5 text-[10px] text-kelly-text/80">
              Next: <span className="font-mono">{og.contactImportNextPacket}</span>
            </p>
            <p className="mt-1 text-[10px] text-kelly-text/70">
              Readiness doc (repo): <span className="font-mono">{og.readinessDocRepoPath}</span>
            </p>
            {og.localContactImportDbVerified ? (
              <p className="mt-1 text-[10px] font-semibold text-emerald-900">
                Local import DB slice verified for this request (migrations + import table query). Canonical Supabase DB /
                production is not implied — run the same gates on hosted <code className="text-[10px]">DATABASE_URL</code>{" "}
                before treating imports as production-ready.
              </p>
            ) : (
              <p className="mt-1 text-[10px] text-kelly-text/75">
                Import readiness is generic until migrations and import counts succeed on the DB this app uses.
              </p>
            )}
            <p className="mt-1 text-[10px] text-kelly-text/70">
              <strong>SendGrid:</strong> foundation + webhook intake exist; <strong>no</strong> list sync or broadcast send
              in this lane. Plan copy in{" "}
              <Link href={MESSAGE_STUDIO_PATH} className="font-semibold text-kelly-forest underline">
                Message Studio
              </Link>{" "}
              after audiences/imports are governed.
            </p>
          </div>
          <Link
            href={ci.path}
            className="shrink-0 rounded border border-kelly-forest/35 bg-kelly-fog/60 px-2 py-1 text-[10px] font-bold text-kelly-navy"
          >
            Open imports
          </Link>
        </div>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border border-kelly-text/10 bg-kelly-page/50 px-2 py-1">
            <p className={h3}>Pending approval</p>
            <p className="font-heading text-lg font-bold tabular-nums text-kelly-navy">{ci.pendingApprovalCount}</p>
          </div>
          <div className="rounded border border-kelly-text/10 bg-kelly-page/50 px-2 py-1">
            <p className={h3}>Committed batches</p>
            <p className="font-heading text-lg font-bold tabular-nums text-kelly-navy">{ci.committedBatchCount}</p>
          </div>
          <div className="rounded border border-kelly-text/10 bg-kelly-page/50 px-2 py-1">
            <p className={h3}>Consent warnings (Σ batches)</p>
            <p className="font-heading text-lg font-bold tabular-nums text-kelly-navy">{ci.consentWarningRowsSummed}</p>
          </div>
          <div className="rounded border border-kelly-text/10 bg-kelly-page/50 px-2 py-1">
            <p className={h3}>Latest batches</p>
            <ul className="mt-0.5 space-y-0.5 font-body text-[10px] text-kelly-text/85">
              {ci.latestBatches.length ? (
                ci.latestBatches.map((b) => (
                  <li key={b.id}>
                    <Link href={`${ci.path}/${b.id}`} className="font-semibold underline">
                      {b.name}
                    </Link>{" "}
                    <span className="text-kelly-text/55">· {b.status}</span>
                  </li>
                ))
              ) : (
                <li className="text-kelly-text/50">None yet</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-kelly-text/10 pb-3">
        <div>
          <Link
            href="/admin/workbench"
            className="mb-2 inline-block rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate"
          >
            ← Workbench
          </Link>
          <h1 className="font-heading text-xl font-bold tracking-tight text-kelly-navy md:text-2xl">
            Campaign Email Command Center
          </h1>
          <p className="mt-1 max-w-3xl font-body text-sm leading-snug text-kelly-text/85">
            Monitor, triage, organize, draft, segment, and govern campaign email from one place — cockpit for the full
            operating system.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className={pill}>Queue-first</span>
            <span className={pill}>No live sends from queue</span>
            <span className={pill}>Gmail metadata sync (partial)</span>
            <span className={pill}>
              SendGrid foundation {sgF.dbReachable ? "(rails + webhook path)" : "(DB migration not verified)"}
            </span>
            <span className={pill}>
              {oa.emailAiConfigured ? "OpenAI queue AI (advisory)" : "OpenAI queue AI not configured"}
            </span>
            <span className={pill}>Contact/profile graph (staged facts)</span>
            <span className={pill}>Audience Studio (preview — no SendGrid)</span>
            <span className={pill}>Contact import staging (CSV → profiles, no SendGrid)</span>
            <span className={pill}>Message Studio (local drafts — no send)</span>
            <span className={pill}>Automation Studio (governance map — no activation)</span>
            <span className={pill}>Analytics &amp; Deliverability (readiness shell)</span>
            <span className={pill}>Route map (`/map`)</span>
            <span className={pill}>Readiness checklist (`/readiness`)</span>
            <span className={pill}>Send Execution Governance (`/send-execution`)</span>
            <span className={pill}>Daily Operator Console (`/daily`)</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Link
              href={DAILY_OPERATOR_CONSOLE_PATH}
              className="rounded border border-emerald-400/45 bg-emerald-50/90 px-2 py-0.5 text-[10px] font-bold text-emerald-950"
            >
              Daily Operator Console
            </Link>
            <Link
              href={g.monitorPath}
              className="rounded border border-kelly-forest/35 bg-kelly-fog/60 px-2 py-0.5 text-[10px] font-bold text-kelly-navy"
            >
              Gmail monitor
            </Link>
            <Link
              href={pg.profilesReviewPath}
              className="rounded border border-kelly-navy/25 bg-white px-2 py-0.5 text-[10px] font-bold text-kelly-navy"
            >
              Profile &amp; hint review
            </Link>
            <Link
              href={MESSAGE_STUDIO_PATH}
              className="rounded border border-kelly-navy/35 bg-kelly-fog/80 px-2 py-0.5 text-[10px] font-bold text-kelly-navy"
            >
              Message Studio
            </Link>
            <Link
              href={au.path}
              className="rounded border border-kelly-forest/30 bg-emerald-50/60 px-2 py-0.5 text-[10px] font-bold text-kelly-navy"
            >
              Audience Studio
            </Link>
            <Link
              href={sgF.path}
              className="rounded border border-kelly-navy/25 bg-white px-2 py-0.5 text-[10px] font-bold text-kelly-navy"
            >
              SendGrid Foundation
            </Link>
            <Link
              href={g.gmailReviewPath}
              className="rounded border border-kelly-text/20 bg-white px-2 py-0.5 text-[10px] font-semibold text-kelly-slate"
            >
              Gmail review → queue
            </Link>
            <Link
              href={ci.path}
              className="rounded border border-kelly-forest/30 bg-amber-50/50 px-2 py-0.5 text-[10px] font-bold text-kelly-navy"
            >
              Contact imports
            </Link>
            <Link
              href={AUTOMATION_STUDIO_PATH}
              className="rounded border border-kelly-navy/30 bg-white px-2 py-0.5 text-[10px] font-bold text-kelly-navy"
            >
              Automation Studio
            </Link>
            <Link
              href={ANALYTICS_DELIVERABILITY_PATH}
              className="rounded border border-kelly-forest/25 bg-kelly-fog/70 px-2 py-0.5 text-[10px] font-bold text-kelly-navy"
            >
              Analytics &amp; Deliverability
            </Link>
            <Link
              href={ROUTE_MAP_PATH}
              className="rounded border border-kelly-navy/20 bg-white px-2 py-0.5 text-[10px] font-bold text-kelly-navy"
            >
              Route map
            </Link>
            <Link
              href={READINESS_CHECKLIST_PATH}
              className="rounded border border-emerald-300/50 bg-emerald-50/70 px-2 py-0.5 text-[10px] font-bold text-kelly-navy"
            >
              Readiness checklist
            </Link>
            <Link
              href={SEND_EXECUTION_GOVERNANCE_PATH}
              className="rounded border border-kelly-navy/30 bg-white px-2 py-0.5 text-[10px] font-bold text-kelly-navy"
            >
              Send execution governance
            </Link>
            {g.oauthConnectPipelineReady && g.currentActorUserResolved ? (
              <Link
                href={`${g.connectPath}?return=${encodeURIComponent("/admin/workbench/email-command-center")}`}
                className="rounded border border-kelly-text/20 bg-white px-2 py-0.5 text-[10px] font-semibold text-kelly-slate"
              >
                {g.currentActorHasActiveStaffGmail ? "Reconnect Gmail" : "Connect Gmail"}
              </Link>
            ) : null}
            <span className="font-body text-[10px] text-kelly-text/60">
              {g.commandSurfacePhase === "env_incomplete" && "OAuth env incomplete — see Gmail monitor for variable names."}
              {g.commandSurfacePhase === "needs_actor" && "Set ADMIN_ACTOR_USER_EMAIL User for connect flows."}
              {g.commandSurfacePhase === "ready_to_connect" && "OAuth ready — connect when you are."}
              {g.commandSurfacePhase === "connected" &&
                (g.monitorInboxSync === "metadata_sync_ready"
                  ? `Metadata sync: last ${g.lastMetadataSyncAtIso ?? "—"} · scanned ${g.lastMetadataSyncMessageCount ?? "—"} · profile history cursor ${g.lastProfileHistoryIdPresent ? "set" : "pending"}. Watch: ${g.gmailWatchDisplayStatus}${g.gmailWatchPushIncomplete ? " (push path incomplete — set topic + verification token + Start/Renew on monitor)" : ""}. Pub/Sub receiver: ${g.pubsubReceiverConfigured ? "verification + topic env OK (POST /api/gmail/pubsub)" : "needs GMAIL_PUBSUB_VERIFICATION_TOKEN + GOOGLE_PUBSUB_TOPIC"}.`
                  : g.pubsubTopicEnvPresent
                    ? "Connected; run first metadata sync on Gmail monitor · GOOGLE_PUBSUB_TOPIC set — use Start/Renew watch when OAuth + verification token are ready."
                    : "Connected; run first metadata sync on Gmail monitor · set GOOGLE_PUBSUB_TOPIC for users.watch.")}
            </span>
          </div>
        </div>
      </div>

      <section className="space-y-2">
        <Link
          href={DAILY_OPERATOR_CONSOLE_PATH}
          className={`${card} block border-emerald-300/50 bg-gradient-to-r from-emerald-50/90 to-white/95 transition hover:border-emerald-400/50 hover:shadow-md`}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className={h3}>Start here — Daily Operator Console</p>
              <p className="mt-1 font-heading text-base font-bold text-kelly-navy">Today&apos;s priorities + work queue</p>
              <p className="mt-1 max-w-2xl font-body text-[11px] text-kelly-text/85">
                EMAIL-DAILY-OPERATOR-CONSOLE-1.0 — queue, Gmail, imports, profiles, audiences, SendGrid signals, Message Studio
                draft summary (this browser), and rule-based next actions. <strong>No demo mode</strong>, <strong>no sends</strong>.
              </p>
            </div>
            <span className="rounded-full border border-emerald-400/40 bg-emerald-100/80 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-950">
              Open →
            </span>
          </div>
        </Link>
        <Link
          href={MESSAGE_STUDIO_PATH}
          className={`${card} block border-kelly-navy/25 bg-gradient-to-r from-kelly-fog/90 to-white/95 transition hover:border-kelly-forest/40 hover:shadow-md`}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className={h3}>Live now — Message Studio</p>
              <p className="mt-1 font-heading text-base font-bold text-kelly-navy">Drafting &amp; planning workspace</p>
              <p className="mt-1 max-w-2xl font-body text-[11px] text-kelly-text/85">
                EMAIL-MESSAGE-STUDIO-LOCAL-DRAFTS-1.1 — draft library, autosave to <strong>browser localStorage</strong>{" "}
                (not shared); draft types + content blocks above; <strong>no server persistence</strong>; <strong>no sends</strong>.
              </p>
            </div>
            <span className="rounded-full border border-kelly-forest/30 bg-emerald-50/80 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-900">
              Open →
            </span>
          </div>
        </Link>
      </section>

      <section className="grid gap-2 md:grid-cols-2">
        <Link
          href={AUTOMATION_STUDIO_PATH}
          className={`${card} block border-kelly-navy/20 bg-gradient-to-r from-white/95 to-kelly-fog/80 transition hover:border-kelly-forest/35 hover:shadow-md`}
        >
          <p className={h3}>Operator surface — Automation Studio</p>
          <p className="mt-1 font-heading text-sm font-bold text-kelly-navy">Tiers, triggers, actions, playbooks</p>
          <p className="mt-1 font-body text-[11px] text-kelly-text/85">
            EMAIL-AUTOMATION-ANALYTICS-SHELL-1.0 — roadmap and policy gates only. <strong>No</strong> automation activation,{" "}
            <strong>no</strong> background workers, <strong>no</strong> auto-send.
          </p>
          <p className="mt-2 text-[9px] font-bold uppercase text-kelly-forest">Open Automation Studio →</p>
        </Link>
        <Link
          href={ANALYTICS_DELIVERABILITY_PATH}
          className={`${card} block border-kelly-forest/25 bg-gradient-to-r from-emerald-50/60 to-white/95 transition hover:border-kelly-forest/40 hover:shadow-md`}
        >
          <p className={h3}>Operator surface — Analytics &amp; Deliverability</p>
          <p className="mt-1 font-heading text-sm font-bold text-kelly-navy">Queue + intelligence + SendGrid readiness</p>
          <p className="mt-1 font-body text-[11px] text-kelly-text/85">
            One dashboard for counts, suppressions, and launch checklist — <strong>read-only</strong>; does not authorize sends.
          </p>
          <p className="mt-2 text-[9px] font-bold uppercase text-kelly-forest">Open Analytics →</p>
        </Link>
      </section>

      <section className="space-y-2">
        <Link
          href={SEND_EXECUTION_GOVERNANCE_PATH}
          className={`${card} block border-kelly-navy/30 bg-gradient-to-r from-kelly-fog/90 to-white/95 transition hover:border-kelly-forest/40 hover:shadow-md`}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className={h3}>Operator surface — Send Execution Governance</p>
              <p className="mt-1 font-heading text-base font-bold text-kelly-navy">Future send rails + gates (no-send shell)</p>
              <p className="mt-1 max-w-3xl font-body text-[11px] text-kelly-text/85">
                EMAIL-SEND-EXECUTION-GOVERNANCE-SHELL-1.0 — Gmail vs SendGrid rails, pre-send checklist, suppression doctrine,
                approval roles, and decision tree. <strong>No provider APIs</strong>; live sending stays blocked until{" "}
                <strong>EMAIL-SEND-EXECUTION-1.0</strong>.
              </p>
            </div>
            <span className="rounded-full border border-kelly-navy/30 bg-white px-2 py-0.5 text-[9px] font-bold uppercase text-kelly-navy">
              Open →
            </span>
          </div>
        </Link>
      </section>

      <section className="space-y-2">
        <h2 className={h3}>Tonight&apos;s Operator Path</h2>
        <p className="font-body text-[10px] text-kelly-text/65">
          Suggested sequencing for tonight — each step stays non-destructive and send-free unless a future packet explicitly
          governs execution.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <TonightOperatorCard
            title="New inbound → Gmail Review → Queue"
            status="partial"
            href={g.gmailReviewPath}
            safety="Metadata-only review; manual bridge to EmailWorkflowItem."
          />
          <TonightOperatorCard
            title="Queue item → AI Intelligence → profile ideas"
            status="partial"
            href="/admin/workbench/email-queue"
            safety="OpenAI advisory on item detail — no auto-merge to CRM."
          />
          <TonightOperatorCard
            title="Profile suggestions → approve facts"
            status="partial"
            href={pg.profilesReviewPath}
            safety="Facts stay staged until operator approval."
          />
          <TonightOperatorCard
            title="Approved facts → Audience Studio"
            status="partial"
            href={au.path}
            safety="Previews over ACTIVE facts — no SendGrid sync."
          />
          <TonightOperatorCard
            title="Audience Studio → Message Studio"
            status="partial"
            href={MESSAGE_STUDIO_PATH}
            safety="Plan copy only; link optional audienceDefinitionId query when saving definitions."
          />
          <TonightOperatorCard
            title="Message Studio → Automation Studio"
            status="partial"
            href={AUTOMATION_STUDIO_PATH}
            safety="Read the trigger/action map before asking for any automation packet — still no activation here."
          />
          <TonightOperatorCard
            title="Analytics &amp; Deliverability (readiness)"
            status="partial"
            href={ANALYTICS_DELIVERABILITY_PATH}
            safety="Queue + graph + SendGrid foundation counts; suppression categories when DB healthy — not send authorization."
          />
          <TonightOperatorCard
            title="Send Execution Governance (doctrine map)"
            status="live"
            href={SEND_EXECUTION_GOVERNANCE_PATH}
            safety="Read-only gates checklist — no SendGrid/Gmail APIs; use before asking for EMAIL-SEND-EXECUTION-1.0."
          />
          <TonightOperatorCard
            title="Future governed SendGrid / Gmail send execution"
            status="future"
            href={SEND_EXECUTION_GOVERNANCE_PATH}
            safety="EMAIL-SEND-EXECUTION-1.0 not shipped — read governance page for suppression + approval path."
          />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className={h3}>Live now — queue &amp; graph counts</h2>
        {og.cockpitDbReachable && q.total === 0 ? (
          <div
            className="rounded-lg border border-kelly-text/15 bg-kelly-fog/50 px-3 py-2 font-body text-[11px] text-kelly-navy"
            role="status"
          >
            <p className="font-semibold">Queue is empty on this database snapshot.</p>
            <p className="mt-1 text-[10px] text-kelly-text/80">
              That can be normal for a fresh dev DB. Next: open{" "}
              <Link href="/admin/workbench/email-command-center/gmail/review" className="font-bold underline">
                Gmail review
              </Link>{" "}
              (after sync), use{" "}
              <Link href="/admin/workbench/email-queue#create-manual" className="font-bold underline">
                new manual item
              </Link>
              , or import staging — still <strong>no send</strong> from any of these paths.
            </p>
          </div>
        ) : null}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <StatusCard
            title="Needs attention"
            value={q.needsAttentionCount}
            href="/admin/workbench/email-queue"
            sub="NEW, ENRICHED, IN_REVIEW, ESCALATED"
          />
          <StatusCard title="New queue items" value={q.newCount} href="/admin/workbench/email-queue?status=NEW" />
          <StatusCard
            title="Unassigned"
            value={q.unassignedCount}
            href="/admin/workbench/email-queue?assignee=unassigned"
          />
          <StatusCard
            title="Escalated"
            value={q.escalatedCount}
            href="/admin/workbench/email-queue?status=ESCALATED"
          />
          <StatusCard
            title="Ready to respond"
            value={q.readyToRespondCount}
            href="/admin/workbench/email-queue?status=READY_TO_RESPOND"
          />
          <StatusCard
            title="Approved (queue state)"
            value={q.approvedCount}
            href="/admin/workbench/email-queue?status=APPROVED"
            sub="Not the same as sent — see governance"
          />
          <StatusCard
            title="Queue items with AI analysis"
            value={oa.emailAiQueueItemsAnalyzedCount}
            href="/admin/workbench/email-queue"
            sub="Open item → AI Email Intelligence panel (advisory)"
          />
          <StatusCard
            title="Pending profile suggestions"
            value={pg.pendingProfileFactSuggestions}
            href={pg.profilesReviewPath}
            sub="Approve → EmailContactProfileFact (governed)"
          />
          <StatusCard
            title="Pending audience hints"
            value={pg.pendingAudienceHints}
            href={pg.profilesReviewPath}
            sub="Not SendGrid segments — audit staging only"
          />
          <StatusCard
            title="Approved profile facts"
            value={pg.approvedActiveFacts}
            href={pg.profilesReviewPath}
            sub="Active facts on email contact profiles"
          />
          <StatusCard
            title="Audience building blocks (approved triples)"
            value={au.buildingBlockApprovedTriples}
            href={au.path}
            sub={au.dbSliceReachable ? "Distinct factType+key+value groups" : "DB / migration not verified"}
          />
          <StatusCard
            title="Draft audience definitions"
            value={au.draftAudienceDefinitions}
            href={au.path}
            sub="Saved criteria — not synced to SendGrid"
          />
          <StatusCard
            title="SendGrid events (ingested)"
            value={sgF.recentSendGridEventsCount}
            href={sgF.path}
            sub={sgF.dbReachable ? "SendGridEvent rows from POST /api/sendgrid/events" : "DB unreachable — migrate first"}
          />
          <StatusCard
            title="SendGrid suppressions (local)"
            value={sgF.suppressionCount}
            href={sgF.path}
            sub="SendGridSuppression — honor before future sends"
          />
          <StatusCard
            title="Audience defs (non-archived)"
            value={sgF.audienceDefinitionsNonArchived}
            href={au.path}
            sub="Future sync targets — not synced in this packet"
          />
        </div>
        <p className="font-body text-[10px] text-kelly-text/55">
          Total in queue filter (all statuses): <span className="font-semibold text-kelly-text">{q.total}</span>
          {" · "}
          Assigned items (computed): <span className="font-semibold text-kelly-text">{a.assignedCount}</span>
          {" · "}
          Your assigned items: <span className="font-semibold text-kelly-text">{a.currentActorAssignedItemCount}</span>
          {" · "}
          Heuristic stale (not updated 7+ days):{" "}
          <span className="font-semibold text-kelly-text">{a.itemsNotUpdatedIn7DaysCount}</span>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className={h3}>Integration readiness</h2>
        <div className="grid gap-2 lg:grid-cols-3">
          <IntegrationColumn
            title="Gmail monitor"
            statusLabel={
              g.commandSurfacePhase === "env_incomplete"
                ? "OAuth environment incomplete"
                : g.commandSurfacePhase === "needs_actor"
                  ? "Needs admin actor"
                  : g.commandSurfacePhase === "ready_to_connect"
                    ? "Ready to connect"
                    : g.monitorInboxSync === "metadata_sync_ready"
                      ? "Connected — manual watch start/renew + Pub/Sub receiver scaffold (no auto-fetch)"
                      : g.pubsubTopicEnvPresent
                        ? "Connected — OAuth live (run metadata sync)"
                        : "Connected — OAuth live (run metadata sync)"
            }
            existsToday={[
              "EMAIL-GMAIL-CONNECT-1.0 + EMAIL-GMAIL-SYNC-1.1 + EMAIL-GMAIL-WATCH-1.2: OAuth, encrypted tokens, manual INBOX metadata sync, manual users.watch start/renew, Pub/Sub POST scaffold (verification-gated), history preview counts",
              `Monitor: ${g.monitorPath}`,
              `OAuth pipeline ready: ${g.oauthConnectPipelineReady ? "yes" : "no"}`,
              `${g.staffGmailAccountsActive} active / ${g.staffGmailAccountsTotal} total StaffGmailAccount rows`,
              !g.currentActorUserResolved
                ? "Current admin actor not resolved — set ADMIN_ACTOR_USER_EMAIL when exercising staff Gmail flows"
                : g.currentActorHasActiveStaffGmail
                  ? g.actorStaffGmailSendAsDomainHint
                    ? `Current actor: Staff Gmail linked (domain …@${g.actorStaffGmailSendAsDomainHint})`
                    : "Current actor: Staff Gmail linked (send-as domain not parsed)"
                  : "Current actor: no active Staff Gmail link",
              g.monitorInboxSync === "metadata_sync_ready"
                ? `Last metadata sync: ${g.lastMetadataSyncAtIso ?? "—"} · messages metadata fetched: ${g.lastMetadataSyncMessageCount ?? "—"}`
                : "Metadata sync not recorded for this actor — use “Run safe metadata sync” on Gmail monitor",
              `Default OAuth scopes: gmail.metadata${g.composerSendScopeViaEnv ? " + gmail.send (GMAIL_OAUTH_INCLUDE_SEND_FOR_WORKBENCH=true)" : " only (monitor-first; composer send off)"}`,
              `Gmail metadata review → manual EmailWorkflowItem bridge: ${g.gmailReviewPath} (operator button; METADATA reads only — EMAIL-GMAIL-REVIEW-TO-QUEUE-1.4)`,
            ]}
            missing={[
              ...(g.oauthConnectPipelineReady ? [] : g.oauthMissingEnvVarLines),
              ...(g.monitorInboxSync === "metadata_sync_ready" ? [] : ["First successful manual metadata sync (Gmail monitor)"]),
              ...(g.gmailWatchPushIncomplete
                ? [
                    "Active non-expired Gmail push watch for admin actor (Start/Renew on monitor)",
                    ...(!g.pubsubTopicEnvPresent ? ["GOOGLE_PUBSUB_TOPIC for users.watch"] : []),
                    ...(!g.pubsubPushVerificationEnvPresent
                      ? ["GMAIL_PUBSUB_VERIFICATION_TOKEN (or GOOGLE_PUBSUB_VERIFICATION_TOKEN) for /api/gmail/pubsub"]
                      : []),
                  ]
                : [
                    "Automated watch renewal job + subscriber-side fetch/processing beyond notification metadata (governed packets)",
                  ]),
            ]}
            nextPacket="Governed subscriber-side processing / Gmail → queue automation (explicit policy packet)"
            safetyGate="No send from Command Center or queue; tokens never displayed; use monitor + Gmail review routes for Gmail status."
          />
          <IntegrationColumn
            title="SendGrid broadcast"
            statusLabel={
              sgF.dbReachable && sg.sendgridWebhookVerificationKeyPresent
                ? "Foundation rails — ingestion path ready when SendGrid POSTs"
                : sendgridConfiguredForSend
                  ? "Env keys partial — finish webhook PEM + DB migrate for Email OS intake"
                  : "Foundation scaffold — configure env + migrations"
            }
            existsToday={[
              "EMAIL-SENDGRID-FOUNDATION-1.0: POST /api/sendgrid/events → SendGridEvent + SendGridSuppression (signed in prod)",
              `Command Center surface: ${sgF.path}`,
              `SENDGRID_API_KEY set: ${sg.sendgridApiKeyPresent ? "yes" : "no"} (name only)`,
              `SENDGRID_FROM_EMAIL set: ${sg.sendgridFromEmailPresent ? "yes" : "no"}`,
              `SENDGRID_FROM_NAME set: ${sg.sendgridFromNamePresent ? "yes" : "no"}`,
              `Webhook PEM set: ${sg.sendgridWebhookVerificationKeyPresent ? "yes" : "no"} (SENDGRID_WEBHOOK_VERIFICATION_KEY or SENDGRID_WEBHOOK_PUBLIC_KEY)`,
              `Recent SendGridEvent rows: ${sgF.recentSendGridEventsCount} · suppressions: ${sgF.suppressionCount}`,
              "Comms legacy path still at /api/webhooks/sendgrid (separate)",
            ]}
            missing={[
              ...(sgF.dbReachable ? [] : ["`npx prisma migrate deploy` for SendGrid foundation tables"]),
              ...(sg.sendgridWebhookVerificationKeyPresent ? [] : ["Signed webhook PEM for production intake on /api/sendgrid/events"]),
              "EMAIL-SENDGRID-CONTACT-SYNC-1.1 — governed list/segment sync (future)",
              "EMAIL-SEND-EXECUTION-1.0 — broadcast execution (future)",
            ]}
            nextPacket="EMAIL-SENDGRID-CONTACT-SYNC-1.1 (sync) · EMAIL-MESSAGE-STUDIO-1.1 (persist drafts) — Message Studio route is live for planning only"
            safetyGate="No mass send from Command Center; suppressions must gate future sends; never expose API keys in UI."
          />
          <IntegrationColumn
            title="OpenAI intelligence"
            statusLabel={
              oa.emailAiSafeAnalysisAvailable
                ? `Queue AI ready — model ${oa.emailAiModelName} (env name only)`
                : "OPENAI_API_KEY not set — queue detail shows not configured"
            }
            existsToday={[
              "EMAIL-AI-INTELLIGENCE-1.0: advisory OpenAI analysis on email queue detail; stores JSON under metadataJson.emailAiAnalysis",
              "Server OpenAI client + json_object completions; no Gmail bodies in this lane",
              `OPENAI_API_KEY set: ${oa.openaiApiKeyPresent ? "yes" : "no"}`,
              `Queue rows with stored AI envelope: ${oa.emailAiQueueItemsAnalyzedCount}`,
            ]}
            missing={[
              ...(oa.emailAiSafeAnalysisAvailable ? [] : ["OPENAI_API_KEY for live model calls"]),
              "Deeper prompt registry / eval harness (future packet)",
              "No auto-send — send execution remains separate governed path",
            ]}
            nextPacket="Hardening / eval for email AI prompts, or profile graph — per steering"
            safetyGate="Advisory only — no send, no auto-status, no profile or audience writes from AI output; keys server-only."
          />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className={h3}>Email operating pipeline</h2>
        <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          <PipelineStep
            label="Automation readiness"
            state="partial"
            note={`Automation Studio — tiers + triggers + governance copy only: ${AUTOMATION_STUDIO_PATH}`}
            href={AUTOMATION_STUDIO_PATH}
          />
          <PipelineStep
            label="Gmail inbound"
            state={g.commandSurfacePhase === "connected" ? "partial" : "blocked_future"}
            note={
              g.commandSurfacePhase === "connected"
                ? g.monitorInboxSync === "metadata_sync_ready"
                  ? "OAuth + manual metadata sync + watch controls on Gmail monitor — bodies never stored."
                  : "OAuth linked — open Gmail monitor to run safe metadata sync (INBOX, headers only)."
                : "Connect Gmail from monitor when env is ready."
            }
          />
          <PipelineStep
            label="Queue (EmailWorkflowItem)"
            state="live"
            note="Triage, interpretation, assignment — /admin/workbench/email-queue"
          />
          <PipelineStep
            label="AI interpretation"
            state={oa.emailAiSafeAnalysisAvailable ? "partial" : "partial"}
            note={
              oa.emailAiSafeAnalysisAvailable
                ? "E-2A deterministic + OpenAI advisory on queue detail (EMAIL-AI-INTELLIGENCE-1.0) — drafts are not sent."
                : "E-2A deterministic on queue; set OPENAI_API_KEY for OpenAI advisory analysis on queue detail."
            }
          />
          <PipelineStep label="Profile suggestion" state="partial" note="EMAIL-CONTACT-PROFILE-GRAPH-1.0 — staged facts + hints; approve on profile review route." />
          <PipelineStep
            label="Audience / group"
            state="partial"
            note="EMAIL-AUDIENCE-STUDIO-1.0 + SendGrid foundation readiness — previews local; list sync still future."
          />
          <PipelineStep
            label="Draft"
            state="partial"
            note={`Message Studio — drafting foundation (no send): ${MESSAGE_STUDIO_PATH}`}
          />
          <PipelineStep label="Approval" state="partial" note="Queue approvals are not provider sends — governance copy on queue." />
          <PipelineStep
            label="Send (SendGrid / Gmail)"
            state={sendgridConfiguredForSend ? "blocked_future" : "blocked_credentials"}
            note={
              sendgridConfiguredForSend
                ? "Env hints OK; execution still gated — open Send Execution Governance for doctrine (no APIs on that route)."
                : "SendGrid from-address/key not both set — see readiness panel."
            }
            href={SEND_EXECUTION_GOVERNANCE_PATH}
          />
          <PipelineStep
            label="Engagement"
            state={sgF.dbReachable ? "partial" : "partial"}
            note="POST /api/sendgrid/events stores sanitized events + suppressions — open Analytics & Deliverability for one-page signal view."
            href={ANALYTICS_DELIVERABILITY_PATH}
          />
          <PipelineStep label="Profile update" state="designed" note="Governed merges from engagement — future packet." />
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-kelly-page/50 px-2 py-2">
          <p className={h3}>Coming next (not tonight)</p>
          <ul className="mt-1 list-inside list-disc font-body text-[10px] text-kelly-text/80">
            <li>
              <Link href={SEND_EXECUTION_GOVERNANCE_PATH} className="font-semibold underline">
                Send Execution Governance
              </Link>{" "}
              shell is live tonight — provider execution still future.
            </li>
            <li>Governed SendGrid broadcast execution + contact sync (explicit packets).</li>
            <li>Gmail human send rail from queue (separate approval + OAuth scopes).</li>
            <li>EMAIL-MESSAGE-STUDIO server persistence — shared draft review tied to audiences/queue items (future packet).</li>
            <li>Hosted canonical Postgres verification — operator-run CLI gates when steering returns to infra.</li>
          </ul>
        </div>
      </section>

      <section className={`${card} space-y-2`}>
        <h2 className={h3}>Queue operations</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/workbench/email-queue"
            className="rounded border border-kelly-forest/35 bg-kelly-fog/50 px-2 py-1 text-[11px] font-bold text-kelly-navy"
          >
            Open email queue
          </Link>
          <span className="self-center font-body text-[10px] text-kelly-text/60">
            AI analysis: open any item → AI Email Intelligence (advisory).
          </span>
          <Link
            href="/admin/workbench/email-queue#create-manual"
            className="rounded border border-kelly-text/15 bg-white px-2 py-1 text-[11px] font-semibold text-kelly-slate"
          >
            New manual item (form on queue page)
          </Link>
        </div>
        <p className="font-body text-[10px] text-kelly-text/65">
          Filters:{" "}
          <Link className="underline" href="/admin/workbench/email-queue?assignee=unassigned">
            Unassigned
          </Link>
          {" · "}
          <Link className="underline" href="/admin/workbench/email-queue?status=ESCALATED">
            Escalated
          </Link>
          {" · "}
          <Link className="underline" href="/admin/workbench/email-queue?status=READY_TO_RESPOND">
            Ready
          </Link>
          {" · "}
          <Link className="underline" href="/admin/workbench/email-queue?status=APPROVED">
            Approved
          </Link>
        </p>
      </section>

      <section className={card}>
        <h2 className={h3}>Audience / profile intelligence</h2>
        <p className="mt-1 font-body text-[11px] leading-relaxed text-kelly-text/85">
          <span className="font-bold">Contact graph:</span>{" "}
          <Link href={pg.profilesReviewPath} className="font-semibold text-kelly-navy underline">
            Profile &amp; hint review
          </Link>{" "}
          for PENDING suggestions from queue AI.{" "}
          <span className="font-bold">Audience Studio:</span>{" "}
          <Link href={au.path} className="font-semibold text-kelly-navy underline">
            /audiences
          </Link>{" "}
          previews microtargeting from <strong>ACTIVE</strong> facts; pending hints stay non-broadcast until governed.{" "}
          <Link href={MESSAGE_STUDIO_PATH} className="font-semibold text-kelly-navy underline">
            Message Studio
          </Link>{" "}
          is the drafting surface after audiences/imports are ready — still no send.
          SendGrid Foundation:{" "}
          <Link href={sgF.path} className="font-semibold text-kelly-navy underline">
            readiness + webhook intake
          </Link>{" "}
          — still <span className="font-bold">no</span> automatic list sync. One-page readiness:{" "}
          <Link href={ANALYTICS_DELIVERABILITY_PATH} className="font-semibold text-kelly-navy underline">
            Analytics &amp; Deliverability
          </Link>
          . Before any future send packet:{" "}
          <Link href={SEND_EXECUTION_GOVERNANCE_PATH} className="font-semibold text-kelly-navy underline">
            Send Execution Governance
          </Link>
          .
        </p>
      </section>

      <section className={card}>
        <h2 className={h3}>Automation control</h2>
        <ul className="grid gap-1 sm:grid-cols-2">
          {snapshot.automationTiers.map((t) => (
            <li
              key={t.tier}
              className="flex items-center justify-between rounded border border-kelly-text/10 bg-white/70 px-2 py-1"
            >
              <span className="font-body text-[10px] text-kelly-text">
                <span className="font-bold text-kelly-navy">{t.tier}</span> — {t.label}
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                  t.state === "live"
                    ? "bg-emerald-100 text-emerald-900"
                    : t.state === "partial"
                      ? "bg-amber-100 text-amber-950"
                      : "bg-kelly-muted/30 text-kelly-slate"
                }`}
              >
                {t.state}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 font-body text-[10px] text-kelly-text/60">
          Gmail sync, SendGrid contact sync at scale, structured send execution, and higher automation tiers remain roadmap
          items — queue OpenAI analysis is manual/advisory only. For the full operator-facing map (still no activation), open{" "}
          <Link href={AUTOMATION_STUDIO_PATH} className="font-bold text-kelly-forest underline">
            Automation Studio
          </Link>
          .
        </p>
      </section>

      <section className={`${card} space-y-2`}>
        <h2 className={h3}>Command Center routes (status)</h2>
        <p className="font-body text-[10px] text-kelly-text/65">
          EMAIL-AUTOMATION-ANALYTICS-SHELL-1.0 adds Automation + Analytics shells — governance visibility only.
        </p>
        <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "Cockpit", path: "/admin/workbench/email-command-center", status: "Live — counts + gates" },
            {
              name: "Daily Operator Console",
              path: DAILY_OPERATOR_CONSOLE_PATH,
              status: "Live — start-of-day priorities + work queue",
            },
            { name: "Email queue", path: "/admin/workbench/email-queue", status: "Live — triage + AI panel" },
            { name: "Gmail monitor", path: g.monitorPath, status: g.commandSurfacePhase === "connected" ? "Partial — push path may be incomplete" : "Partial — connect + sync" },
            { name: "Gmail review → queue", path: g.gmailReviewPath, status: "Live — manual bridge" },
            { name: "Profile & hints", path: pg.profilesReviewPath, status: "Live — approve facts" },
            { name: "Audience Studio", path: au.path, status: "Live — previews, no SendGrid sync" },
            { name: "Contact imports", path: ci.path, status: ci.dbSliceReachable ? "Live — staging" : "Degraded — DB" },
            { name: "SendGrid Foundation", path: sgF.path, status: sgF.dbReachable ? "Partial — webhook intake" : "Degraded — DB" },
            { name: "Message Studio", path: MESSAGE_STUDIO_PATH, status: "Live — localStorage drafts, no send" },
            { name: "Automation Studio", path: AUTOMATION_STUDIO_PATH, status: "Live — map only, no activation" },
            {
              name: "Analytics & Deliverability",
              path: ANALYTICS_DELIVERABILITY_PATH,
              status: og.cockpitDbReachable ? "Live — read-only aggregates" : "Degraded — DB unreachable",
            },
            { name: "Route map", path: ROUTE_MAP_PATH, status: "Live — system map" },
            { name: "Readiness checklist", path: READINESS_CHECKLIST_PATH, status: "Live — operator checklist" },
            {
              name: "Send Execution Governance",
              path: SEND_EXECUTION_GOVERNANCE_PATH,
              status: "Live — doctrine map, no provider send",
            },
          ].map((r) => (
            <li key={r.path} className="rounded border border-kelly-text/10 bg-white/80 px-2 py-1.5">
              <Link href={r.path} className="font-heading text-[11px] font-bold text-kelly-navy underline">
                {r.name}
              </Link>
              <p className="mt-0.5 font-body text-[9px] text-kelly-text/75">{r.status}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border-2 border-kelly-forest/25 bg-kelly-fog/35 px-3 py-2.5">
        <h2 className={`${h3} text-kelly-navy`}>Governance / safety</h2>
        <p className="mt-1 font-body text-[11px] font-semibold text-kelly-navy">
          canSendFromEmailWorkflowItem = {String(snapshot.governance.canSendFromEmailWorkflowItem)}
        </p>
        <ul className="mt-2 list-inside list-disc space-y-0.5 font-body text-[10px] text-kelly-text/90">
          {snapshot.governance.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <p className="mt-2 font-body text-[10px] text-kelly-navy/90">
          Secrets stay in environment variables only — never paste keys into tickets, docs, or screenshots.
        </p>
      </section>

      <section className={card}>
        <h2 className={h3}>Next build path</h2>
        <p className="font-body text-[11px] text-kelly-text/85">
          Choose based on priority: <span className="font-bold">EMAIL-GMAIL-CONNECT-1.0</span> if inbox monitoring is
          first; <span className="font-bold">EMAIL-SENDGRID-FOUNDATION-1.0</span> if broadcast and webhooks are first.
        </p>
        <ol className="mt-2 list-inside list-decimal space-y-0.5 font-body text-[10px] text-kelly-text/85">
          <li>EMAIL-GMAIL-CONNECT-1.0</li>
          <li>EMAIL-SENDGRID-FOUNDATION-1.0 (✓ rails — no send)</li>
          <li>EMAIL-SENDGRID-CONTACT-SYNC-1.1</li>
          <li>EMAIL-PROFILE-GRAPH-1.0</li>
          <li>EMAIL-AI-INTELLIGENCE-1.0 (✓ advisory queue AI — deepen/eval next)</li>
          <li>EMAIL-AUDIENCE-STUDIO-1.0 (✓ preview + draft definitions — no SendGrid)</li>
          <li>EMAIL-COMMAND-CENTER-TONIGHT-FINISH-1.0 (✓ Message Studio route)</li>
          <li>EMAIL-MESSAGE-STUDIO-LOCAL-DRAFTS-1.1 (✓ browser localStorage draft workspace — no DB)</li>
          <li>EMAIL-MESSAGE-STUDIO server 1.x (shared / server-persisted drafts + deeper tooling — future)</li>
          <li>EMAIL-AUTOMATION-ANALYTICS-SHELL-1.0 (✓ Automation + Analytics operator shells — no activation, no sends)</li>
          <li>EMAIL-AUTOMATION-STUDIO-1.0 (future — wire real automation engine + packets)</li>
          <li>EMAIL-SEND-EXECUTION-1.0</li>
          <li>EMAIL-ANALYTICS-DELIVERABILITY-1.0 (deep charts + scheduled reports — beyond this shell)</li>
        </ol>
      </section>
    </div>
  );
}
