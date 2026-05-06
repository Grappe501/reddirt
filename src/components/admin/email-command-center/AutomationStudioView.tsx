import Link from "next/link";

const ECC = "/admin/workbench/email-command-center";
const card =
  "rounded-lg border border-kelly-text/12 bg-gradient-to-b from-white/95 to-kelly-page/90 px-3 py-2.5 shadow-sm";
const h3 = "font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/50";
const badge =
  "rounded-full border border-kelly-text/15 bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-kelly-slate";
const cell = "border border-kelly-text/10 bg-white/80 px-2 py-1.5 font-body text-[10px] text-kelly-text/90";

type AutomationStudioViewProps = {
  /** When false, show a thin DB banner; automation map is still static. */
  cockpitDbReachable: boolean;
};

const TRIGGER_ROWS: {
  name: string;
  status: "live" | "partial" | "planned";
  sourceRoute: string;
  sourceLabel: string;
  policyGate: string;
  allowedActionsToday: string;
}[] = [
  {
    name: "New Gmail metadata item",
    status: "live",
    sourceRoute: `${ECC}/gmail/review`,
    sourceLabel: "Gmail review",
    policyGate: "Operator opens review list; METADATA only.",
    allowedActionsToday: "Manual create queue item from review row.",
  },
  {
    name: "Gmail Pub/Sub notification",
    status: "partial",
    sourceRoute: "/api/gmail/pubsub",
    sourceLabel: "POST receiver",
    policyGate: "Verification token + topic env; notification metadata only.",
    allowedActionsToday: "Log envelope metadata — no auto-fetch, no bodies.",
  },
  {
    name: "Queue item created",
    status: "live",
    sourceRoute: "/admin/workbench/email-queue",
    sourceLabel: "Email queue",
    policyGate: "Human or manual bridge from Gmail review.",
    allowedActionsToday: "Triage, assign, interpret, AI analysis (manual trigger).",
  },
  {
    name: "AI analysis completed",
    status: "live",
    sourceRoute: "/admin/workbench/email-queue",
    sourceLabel: "Queue item detail",
    policyGate: "OPENAI_API_KEY; advisory JSON only.",
    allowedActionsToday: "Store metadataJson.emailAiAnalysis; no auto-status.",
  },
  {
    name: "Profile suggestion approved",
    status: "live",
    sourceRoute: `${ECC}/profiles`,
    sourceLabel: "Profile review",
    policyGate: "Operator approval required for facts.",
    allowedActionsToday: "Write EmailContactProfileFact (governed).",
  },
  {
    name: "Audience draft created",
    status: "live",
    sourceRoute: `${ECC}/audiences`,
    sourceLabel: "Audience Studio",
    policyGate: "Definitions over ACTIVE facts; no SendGrid sync.",
    allowedActionsToday: "Save draft definition; preview runs.",
  },
  {
    name: "Contact import batch approved",
    status: "live",
    sourceRoute: `${ECC}/imports`,
    sourceLabel: "Imports",
    policyGate: "Validate → approve → commit; no assumed opt-in.",
    allowedActionsToday: "Commit writes profiles + CONTACT_IMPORT facts only.",
  },
  {
    name: "SendGrid event received",
    status: "partial",
    sourceRoute: "/api/sendgrid/events",
    sourceLabel: "Event webhook",
    policyGate: "Signed webhook in prod; DB tables when migrated.",
    allowedActionsToday: "Ingest SendGridEvent / suppression mapping.",
  },
  {
    name: "Suppression event received",
    status: "partial",
    sourceRoute: "/api/sendgrid/events",
    sourceLabel: "Event webhook",
    policyGate: "Honor before any future send packet.",
    allowedActionsToday: "Record SendGridSuppression rows when configured.",
  },
  {
    name: "Stale queue item",
    status: "planned",
    sourceRoute: "/admin/workbench/email-queue",
    sourceLabel: "Queue (heuristic)",
    policyGate: "EMAIL-AUTOMATION-ANALYTICS-SHELL-1.0 — no auto-escalation.",
    allowedActionsToday: "Operator follow-up only; cockpit shows stale heuristic on Command Center.",
  },
];

const ACTION_ROWS: {
  name: string;
  status: "live" | "partial" | "planned";
  manual: "yes" | "partial" | "no";
  automatic: "no" | "partial";
  sendRisk: "none" | "low" | "medium" | "high";
  governanceNote: string;
}[] = [
  {
    name: "Create queue item",
    status: "live",
    manual: "yes",
    automatic: "no",
    sendRisk: "none",
    governanceNote: "Gmail review bridge or manual form — explicit operator.",
  },
  {
    name: "Assign item",
    status: "live",
    manual: "yes",
    automatic: "no",
    sendRisk: "none",
    governanceNote: "Queue UI only.",
  },
  {
    name: "Run AI analysis",
    status: "live",
    manual: "yes",
    automatic: "no",
    sendRisk: "none",
    governanceNote: "Advisory JSON; no auto-merge or send.",
  },
  {
    name: "Suggest profile fact",
    status: "live",
    manual: "partial",
    automatic: "no",
    sendRisk: "low",
    governanceNote: "AI suggests; stages PENDING until operator approves.",
  },
  {
    name: "Approve profile fact",
    status: "live",
    manual: "yes",
    automatic: "no",
    sendRisk: "low",
    governanceNote: "Profile review route — governed writes only.",
  },
  {
    name: "Create audience hint",
    status: "live",
    manual: "partial",
    automatic: "no",
    sendRisk: "low",
    governanceNote: "Staging only — not a SendGrid segment.",
  },
  {
    name: "Build audience preview",
    status: "live",
    manual: "yes",
    automatic: "no",
    sendRisk: "none",
    governanceNote: "SQL preview over ACTIVE facts; cap-limited.",
  },
  {
    name: "Prepare draft",
    status: "live",
    manual: "yes",
    automatic: "no",
    sendRisk: "none",
    governanceNote: "Message Studio — browser-only until 1.1 persistence.",
  },
  {
    name: "Flag suppression",
    status: "partial",
    manual: "partial",
    automatic: "partial",
    sendRisk: "none",
    governanceNote: "Webhook path ingests suppressions — no send from this lane.",
  },
  {
    name: "Notify operator",
    status: "planned",
    manual: "yes",
    automatic: "no",
    sendRisk: "none",
    governanceNote: "In-app / email digests — future packet.",
  },
  {
    name: "Schedule review",
    status: "planned",
    manual: "yes",
    automatic: "no",
    sendRisk: "none",
    governanceNote: "Workflow scheduling — future packet.",
  },
];

function statusPill(s: "live" | "partial" | "planned") {
  const cls =
    s === "live"
      ? "bg-emerald-100 text-emerald-900"
      : s === "partial"
        ? "bg-amber-100 text-amber-950"
        : "bg-kelly-muted/35 text-kelly-slate";
  return <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${cls}`}>{s}</span>;
}

export function AutomationStudioView({ cockpitDbReachable }: AutomationStudioViewProps) {
  return (
    <div className="min-w-0 max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={ECC} className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate">
          ← Email Command Center
        </Link>
        <Link href={`${ECC}/message-studio`} className="text-xs text-kelly-text/60 hover:underline">
          Message Studio
        </Link>
        <Link href="/admin/workbench/email-queue" className="text-xs text-kelly-text/60 hover:underline">
          Email queue
        </Link>
        <Link href={`${ECC}/audiences`} className="text-xs text-kelly-text/60 hover:underline">
          Audience Studio
        </Link>
        <Link href={`${ECC}/sendgrid`} className="text-xs text-kelly-text/60 hover:underline">
          SendGrid Foundation
        </Link>
        <Link href={`${ECC}/analytics`} className="text-xs text-kelly-text/60 hover:underline">
          Analytics &amp; Deliverability
        </Link>
        <Link href={`${ECC}/map`} className="text-xs text-kelly-text/60 hover:underline">
          Route map
        </Link>
        <Link href={`${ECC}/readiness`} className="text-xs text-kelly-text/60 hover:underline">
          Readiness
        </Link>
        <Link href={`${ECC}/send-execution`} className="text-xs text-kelly-text/60 hover:underline">
          Send execution governance
        </Link>
      </div>

      {!cockpitDbReachable ? (
        <div
          className="rounded-lg border border-amber-400/50 bg-amber-50/90 px-3 py-2 font-body text-[11px] text-amber-950"
          role="status"
        >
          <strong>Database unreachable</strong> — tier and trigger descriptions below are still accurate; live counts on
          Analytics route may be zero until <code className="text-[10px]">DATABASE_URL</code> responds.
        </div>
      ) : null}

      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Automation Studio</h1>
        <p className="max-w-3xl font-body text-sm text-kelly-text/85">
          Plan and govern campaign email automation <strong>without enabling auto-send</strong>. EMAIL-AUTOMATION-ANALYTICS-SHELL-1.0 — visibility and policy map only; no activation, no background jobs, no new triggers from this page.
        </p>
        <div className="flex flex-wrap gap-1.5">
          <span className={badge}>No auto-send</span>
          <span className={badge}>Human approval required</span>
          <span className={badge}>Queue-first</span>
          <span className={badge}>Policy-gated</span>
          <span className={badge}>Manual activation only</span>
        </div>
      </header>

      <div className="rounded-lg border border-kelly-text/12 bg-kelly-fog/50 px-3 py-2 font-body text-[11px] text-kelly-navy" role="note">
        <p className="font-semibold">This page is never “empty” — it is a static policy map.</p>
        <p className="mt-1 text-[10px] text-kelly-text/85">
          Use it when operators ask what could automate next; compare with the live{" "}
          <Link href={`${ECC}/readiness`} className="font-bold text-kelly-forest underline">
            Readiness checklist
          </Link>{" "}
          for environment truth. No switches here activate workers or sends.
        </p>
      </div>

      <section className={`${card} border-kelly-navy/20`}>
        <h2 className={h3}>Automation tiers</h2>
        <div className="mt-2 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              tier: "T0",
              title: "Manual queue",
              state: "live" as const,
              exists: "EmailWorkflowItem triage, filters, assignment, governance copy on queue detail.",
              blocked: "—",
              safety: "Nothing sends from queue item state alone.",
              href: "/admin/workbench/email-queue",
            },
            {
              tier: "T1",
              title: "Deterministic interpretation",
              state: "live" as const,
              exists: "E-2A interpretation actions on queue (fill summaries when empty).",
              blocked: "—",
              safety: "Interpretation does not approve or send.",
              href: "/admin/workbench/email-queue",
            },
            {
              tier: "T2",
              title: "Operator triage actions",
              state: "live" as const,
              exists: "Assign, status transitions, spam/escalation paths, AI panel trigger.",
              blocked: "—",
              safety: "Explicit operator clicks only.",
              href: "/admin/workbench/email-queue",
            },
            {
              tier: "T3",
              title: "External sync",
              state: "partial" as const,
              exists: "Gmail OAuth, manual metadata sync, watch start/renew, Pub/Sub POST scaffold, SendGrid webhook intake.",
              blocked: "No subscriber-side auto-fetch; no auto-queue from Pub/Sub; no list sync.",
              safety: "Tokens never shown; METADATA-only Gmail review bridge.",
              href: `${ECC}/gmail`,
            },
            {
              tier: "T4",
              title: "Policy-governed send automation",
              state: "planned" as const,
              exists: "Roadmap only — Message Studio + SendGrid execution packets.",
              blocked: "EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM remains false; no mass send from Command Center.",
              safety: "Requires explicit compliance + execution packet.",
              href: `${ECC}/message-studio`,
            },
          ].map((t) => (
            <div key={t.tier} className="rounded-md border border-kelly-text/12 bg-white/90 p-2.5">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <p className="font-heading text-xs font-bold text-kelly-navy">
                  {t.tier} {t.title}
                </p>
                {statusPill(t.state)}
              </div>
              <p className="mt-1.5 text-[10px] text-kelly-text/80">
                <span className="font-semibold text-kelly-navy">Today:</span> {t.exists}
              </p>
              <p className="mt-1 text-[10px] text-kelly-text/80">
                <span className="font-semibold text-kelly-navy">Blocked / gap:</span> {t.blocked}
              </p>
              <p className="mt-1 text-[10px] text-kelly-forest/95">
                <span className="font-semibold">Safety:</span> {t.safety}
              </p>
              <Link href={t.href} className="mt-2 inline-block text-[10px] font-bold text-kelly-forest underline">
                Open route →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className={card}>
        <h2 className={h3}>Trigger library</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-kelly-text/15">
                <th className={`${cell} font-heading text-[9px]`}>Trigger</th>
                <th className={`${cell} font-heading text-[9px]`}>Status</th>
                <th className={`${cell} font-heading text-[9px]`}>Source</th>
                <th className={`${cell} font-heading text-[9px]`}>Policy gate</th>
                <th className={`${cell} font-heading text-[9px]`}>Allowed actions today</th>
              </tr>
            </thead>
            <tbody>
              {TRIGGER_ROWS.map((r) => (
                <tr key={r.name} className="border-b border-kelly-text/8">
                  <td className={cell}>
                    <span className="font-semibold text-kelly-navy">{r.name}</span>
                  </td>
                  <td className={cell}>{statusPill(r.status)}</td>
                  <td className={cell}>
                    <Link href={r.sourceRoute} className="font-semibold text-kelly-forest underline">
                      {r.sourceLabel}
                    </Link>
                  </td>
                  <td className={cell}>{r.policyGate}</td>
                  <td className={cell}>{r.allowedActionsToday}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={card}>
        <h2 className={h3}>Action library</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-kelly-text/15">
                <th className={`${cell} font-heading text-[9px]`}>Action</th>
                <th className={`${cell} font-heading text-[9px]`}>Status</th>
                <th className={`${cell} font-heading text-[9px]`}>Manual?</th>
                <th className={`${cell} font-heading text-[9px]`}>Automatic?</th>
                <th className={`${cell} font-heading text-[9px]`}>Send risk</th>
                <th className={`${cell} font-heading text-[9px]`}>Governance</th>
              </tr>
            </thead>
            <tbody>
              {ACTION_ROWS.map((r) => (
                <tr key={r.name} className="border-b border-kelly-text/8">
                  <td className={`${cell} font-semibold text-kelly-navy`}>{r.name}</td>
                  <td className={cell}>{statusPill(r.status)}</td>
                  <td className={cell}>{r.manual}</td>
                  <td className={cell}>{r.automatic}</td>
                  <td className={cell}>{r.sendRisk}</td>
                  <td className={cell}>{r.governanceNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={card}>
        <h2 className={h3}>Automation playbooks (operator-readable)</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {[
            {
              title: "Gmail metadata → queue review",
              body: "Gmail review lists METADATA-only rows → operator creates EmailWorkflowItem when appropriate.",
              href: `${ECC}/gmail/review`,
            },
            {
              title: "Queue → AI analysis → profile suggestions",
              body: "Run AI on queue detail → review suggestions on profile route → approve facts.",
              href: "/admin/workbench/email-queue",
            },
            {
              title: "Approved facts → audience preview",
              body: "Audience Studio builds previews and definitions over ACTIVE facts only.",
              href: `${ECC}/audiences`,
            },
            {
              title: "Audience → Message Studio draft",
              body: "Optional audienceDefinitionId query into Message Studio for planning copy.",
              href: `${ECC}/message-studio`,
            },
            {
              title: "SendGrid event → suppression record",
              body: "Signed webhook → SendGridEvent + SendGridSuppression when DB + env ready.",
              href: `${ECC}/sendgrid`,
            },
            {
              title: "Contact import → approved facts",
              body: "Validate → approve → commit path writes CONTACT_IMPORT provenance only.",
              href: `${ECC}/imports`,
            },
            {
              title: "Stale queue item → operator follow-up",
              body: "Heuristic stale counts on Command Center — no auto-escalation in this shell.",
              href: ECC,
            },
          ].map((p) => (
            <div key={p.title} className="rounded-md border border-kelly-text/10 bg-kelly-page/50 p-2">
              <p className="font-heading text-[11px] font-bold text-kelly-navy">{p.title}</p>
              <p className="mt-1 text-[10px] text-kelly-text/85">{p.body}</p>
              <Link href={p.href} className="mt-1.5 inline-block text-[10px] font-bold text-kelly-forest underline">
                Related route
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className={card}>
        <h2 className={h3}>Future automation gates</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 font-body text-[11px] text-kelly-text/90">
          <li>Requires hosted DB verification (same migration + import gates on canonical DATABASE_URL).</li>
          <li>Requires SendGrid contact sync packet (governed list/segment sync — not this shell).</li>
          <li>Requires Message Studio persistence (EMAIL-MESSAGE-STUDIO-1.1).</li>
          <li>Requires send execution policy + comms alignment (EMAIL-SEND-EXECUTION-1.0 style).</li>
          <li>Requires audit logs for automated decisions affecting contacts or sends.</li>
          <li>Requires legal/compliance review when mass-send or microtargeting automation is proposed.</li>
        </ul>
      </section>

      <section className="rounded-lg border-2 border-kelly-forest/25 bg-kelly-fog/40 px-3 py-2.5">
        <h2 className={`${h3} text-kelly-navy`}>Governance panel</h2>
        <ul className="mt-2 list-inside list-disc space-y-0.5 font-body text-[11px] text-kelly-navy/95">
          <li>No auto-send from this route or from queue approval state.</li>
          <li>No auto-profile mutation to canonical User/VolunteerProfile from automation paths in this lane.</li>
          <li>No automatic contact sync to SendGrid.</li>
          <li>No hidden microtargeting — audience work stays visible in Audience Studio + definitions.</li>
          <li>No operator bypass of suppression or consent posture.</li>
          <li>Future activation of any automated send or sync requires an explicit steered packet.</li>
        </ul>
      </section>

      <section className={card}>
        <h2 className={h3}>Activated automation from this page</h2>
        <p className="mt-1 font-body text-[11px] text-kelly-text/85">
          <strong>None.</strong> This shell is read-only governance and navigation — it does not register workers, cron, or Pub/Sub consumers.
        </p>
      </section>
    </div>
  );
}
