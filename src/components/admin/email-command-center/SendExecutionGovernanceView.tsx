import Link from "next/link";
import type { ReactNode } from "react";
import { EccOperatorPageChrome } from "@/components/admin/email-command-center/ecc-operator-ux";
import type { EmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";

const ECC = "/admin/workbench/email-command-center";
const badge =
  "rounded-full border border-kelly-text/15 bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-kelly-slate";
const card = "rounded-lg border border-kelly-text/12 bg-gradient-to-b from-white/95 to-kelly-page/90 px-3 py-2.5 shadow-sm";
const h3 = "font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/50";

type GateStatus = "ready" | "partial" | "blocked" | "future";

function gateBadge(s: GateStatus) {
  const m: Record<GateStatus, string> = {
    ready: "bg-emerald-100 text-emerald-900",
    partial: "bg-amber-100 text-amber-950",
    blocked: "bg-rose-100 text-rose-950",
    future: "bg-kelly-muted/40 text-kelly-slate",
  };
  const label = s === "ready" ? "Ready" : s === "partial" ? "Partial" : s === "blocked" ? "Blocked" : "Future";
  return <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${m[s]}`}>{label}</span>;
}

const SEND_RAILS: {
  title: string;
  status: string;
  prerequisites: string[];
  sourceData: string;
  approvalGate: string;
  suppressionGate: string;
  risk: "Low" | "Medium" | "High";
  futurePacket: string;
}[] = [
  {
    title: "Gmail one-to-one response",
    status: "Future — human send rail not wired from Email OS queue",
    prerequisites: [
      "Staff Gmail OAuth with governed scopes (workbench composer path today is separate from queue send).",
      "Queue or thread context approved for reply.",
    ],
    sourceData: "EmailWorkflowItem + METADATA provenance; bodies stay in Gmail until explicit ingest policy.",
    approvalGate: "Comms lead + queue policy; sensitive threads may need counsel.",
    suppressionGate: "Recipient preference + bounce/spam signals if mirrored into profile graph (future).",
    risk: "Medium",
    futurePacket: "Gmail send-from-queue or workbench-composer integration packet (explicit).",
  },
  {
    title: "SendGrid broadcast",
    status: "Governed — operator console on this route (explicit final confirmation)",
    prerequisites: [
      "Shared Message Studio draft in APPROVED_FOR_SEND_GOVERNANCE with sendPacketJson.",
      "ACTIVE EmailAudienceDefinition + SYNCED SendGridContactSyncRun for the same cohort.",
      "SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME, numeric SENDGRID_UNSUBSCRIBE_GROUP_ID (ASM).",
    ],
    sourceData: "EmailSendExecution + EmailSendRecipient audit rows; suppression exclusions before submit.",
    approvalGate: "Test send reviewed → READY_FOR_FINAL_APPROVAL → FINAL_SEND_APPROVAL record → typed SEND APPROVED.",
    suppressionGate: "SendGridSuppression exclusions mandatory; broadcast blocked without ASM posture.",
    risk: "High",
    futurePacket: "SendGrid event → recipient reconciliation; hosted DB verification for prod sends.",
  },
  {
    title: "SendGrid test send",
    status: "Governed — single explicit operator-entered address only",
    prerequisites: ["Execution READY_FOR_TEST.", "SendGrid env for mail send (key + from + name)."],
    sourceData: "Same draft copy as broadcast path; one personalization to test inbox only.",
    approvalGate: "Operator enters test address each time — no list send.",
    suppressionGate: "Broadcast suppression rules apply to final send; test uses one recipient only.",
    risk: "Medium",
    futurePacket: "Additional test cohort policies if needed.",
  },
  {
    title: "Internal review send",
    status: "Future — staff-only routing",
    prerequisites: ["Internal recipient roster.", "No PII leakage to external ESP without policy."],
    sourceData: "Draft snapshot + diff vs approved facts (future tooling).",
    approvalGate: "Comms lead + optional counsel for issue/donor language.",
    suppressionGate: "N/A for internal-only; still log for audit.",
    risk: "Low",
    futurePacket: "EMAIL-SEND-EXECUTION-1.0 (staff roster mode) or comms-workbench packet (steering).",
  },
  {
    title: "Future automated send",
    status: "Blocked — automation activation not shipped",
    prerequisites: ["Automation Studio policies + human approval hooks.", "Telemetry + rollback (future)."],
    sourceData: "Triggers from queue/Audience (governed); no silent execution.",
    approvalGate: "Policy packet + tier gate; human final approval per playbook.",
    suppressionGate: "Mandatory pre-send suppression job against SendGridSuppression + import flags.",
    risk: "High",
    futurePacket: "EMAIL-AUTOMATION-STUDIO-1.1 + governed execution sequencing TBD.",
  },
];

const PRECHECK_ROWS: {
  label: string;
  status: GateStatus;
  why: string;
  verify: ReactNode;
}[] = [
  {
    label: "Hosted canonical DB verified",
    status: "partial",
    why: "Wrong DB = wrong suppressions and wrong audiences.",
    verify: (
      <>
        <Link href={`${ECC}/readiness`} className="font-bold underline">
          Readiness
        </Link>{" "}
        + run <code className="text-[9px]">npm run email:db:diagnose</code> / import gate on <strong>that</strong>{" "}
        <code className="text-[9px]">DATABASE_URL</code> (operator).
      </>
    ),
  },
  {
    label: "Audience approved",
    status: "partial",
    why: "Draft definitions are not send authorization.",
    verify: (
      <Link href={`${ECC}/audiences`} className="font-bold underline">
        Audience Studio
      </Link>
    ),
  },
  {
    label: "Contact import source / consent reviewed",
    status: "partial",
    why: "Imports are not assumed opted-in for marketing.",
    verify: (
      <Link href={`${ECC}/imports`} className="font-bold underline">
        Contact imports
      </Link>
    ),
  },
  {
    label: "Suppression scan completed",
    status: "partial",
    why: "SendGridSuppression rows must gate any future broadcast recipient set.",
    verify: (
      <>
        <Link href={`${ECC}/sendgrid`} className="font-bold underline">
          SendGrid Foundation
        </Link>{" "}
        +{" "}
        <Link href={`${ECC}/analytics`} className="font-bold underline">
          Analytics
        </Link>{" "}
        (suppression breakdown when DB healthy).
      </>
    ),
  },
  {
    label: "Message drafted",
    status: "partial",
    why: "Execution attaches to frozen copy.",
    verify: (
      <Link href={`${ECC}/message-studio`} className="font-bold underline">
        Message Studio
      </Link>
    ),
  },
  {
    label: "Send packet prepared",
    status: "partial",
    why: "A governed execution packet should attach to an explicit operator-built review artifact (copy + checklists), not ad-hoc notes.",
    verify: (
      <>
        <Link href={`${ECC}/message-studio#send-packet-builder`} className="font-bold underline">
          Send Packet Builder
        </Link>{" "}
        (export/copy only — no send).
      </>
    ),
  },
  {
    label: "Message approved",
    status: "partial",
    why: "Separate from queue status APPROVED — shared server draft must be APPROVED_FOR_SEND_GOVERNANCE.",
    verify: (
      <>
        <Link href={`${ECC}/message-studio#shared-drafts`} className="font-bold underline">
          Shared drafts
        </Link>{" "}
        + Send Execution console preflight.
      </>
    ),
  },
  {
    label: "Legal / compliance review if needed",
    status: "future",
    why: "Donor, legal, opponent-adjacent copy needs counsel workflow.",
    verify: <>Policy outside this route — document decision in future packet.</>,
  },
  {
    label: "Sender identity configured",
    status: "partial",
    why: "From-address / name must match authenticated domain posture.",
    verify: (
      <>
        Readiness + SendGrid dashboard (env names only here: <code className="text-[9px]">SENDGRID_FROM_EMAIL</code>).
      </>
    ),
  },
  {
    label: "Domain authentication confirmed",
    status: "partial",
    why: "Deliverability + fraud prevention.",
    verify: <>Manual SendGrid checklist — not auto-verified by this app today.</>,
  },
  {
    label: "Test send reviewed",
    status: "partial",
    why: "Human confirms rendering + links in inbox.",
    verify: (
      <Link href={`${ECC}/send-execution#ops`} className="font-bold underline">
        Send Execution — test send panel
      </Link>
    ),
  },
  {
    label: "Final operator approval",
    status: "partial",
    why: "Last human gate before provider API — distinct from queue APPROVED.",
    verify: (
      <>
        <Link href={`${ECC}/send-execution#ops`} className="font-bold underline">
          Send Execution — final approval + typed confirmation
        </Link>{" "}
        (not the email queue).
      </>
    ),
  },
];

const APPROVAL_ROLES: { role: string; scope: string }[] = [
  { role: "Operator", scope: "Day-to-day triage, draft prep, checklist execution." },
  { role: "Comms lead", scope: "Message framing, audience fit, escalation routing." },
  { role: "Finance / fundraising review", scope: "Donor-facing asks, contribution disclaimers, FEC-sensitive timing." },
  { role: "Legal / compliance", scope: "Issue ads, opponent-adjacent claims, consent posture." },
  { role: "Candidate / principal", scope: "Sensitive or high-visibility sends (policy-defined)." },
  { role: "Final send operator", scope: "Executes provider send only after all gates — future role binding in execution packet." },
];

export type SendExecutionGovernanceViewProps = {
  snapshot: EmailCommandCenterSnapshot;
};

export function SendExecutionGovernanceView({ snapshot }: SendExecutionGovernanceViewProps) {
  const og = snapshot.operatorGate;
  const canSend = snapshot.governance.canSendFromEmailWorkflowItem;
  const ms = snapshot.messageStudioSharedDrafts;
  const sharedDraftPrecheckStatus: GateStatus =
    !ms.dbReachable ? "partial" : ms.approvedForSendGovernance > 0 ? "ready" : ms.totalActiveSharedDrafts > 0 ? "partial" : "future";

  const sendPacketBlocked: string[] = [];
  if (ms.dbReachable && ms.approvedForSendGovernance === 0) {
    sendPacketBlocked.push(
      "No shared draft is APPROVED_FOR_SEND_GOVERNANCE — build send packet in Message Studio (#send-packet-builder) after editorial sign-off.",
    );
  }

  return (
    <div className="min-w-0 max-w-5xl space-y-4">
      <EccOperatorPageChrome
        snapshot={snapshot}
        surface="send_execution"
        nextStripTone="amber"
        extraBlockedReasons={sendPacketBlocked}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Link href={ECC} className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate">
          ← Communication Command Center
        </Link>
        <Link href={`${ECC}/message-studio`} className="text-xs text-kelly-text/60 hover:underline">
          Message Studio
        </Link>
        <Link href={`${ECC}/analytics`} className="text-xs text-kelly-text/60 hover:underline">
          Analytics
        </Link>
        <Link href={`${ECC}/sendgrid`} className="text-xs text-kelly-text/60 hover:underline">
          SendGrid Foundation
        </Link>
        <Link href={`${ECC}/audiences`} className="text-xs text-kelly-text/60 hover:underline">
          Audience Studio
        </Link>
        <Link href={`${ECC}/automation`} className="text-xs text-kelly-text/60 hover:underline">
          Automation Studio
        </Link>
        <Link href={`${ECC}/map`} className="text-xs text-kelly-text/60 hover:underline">
          Route map
        </Link>
        <Link href={`${ECC}/readiness`} className="text-xs text-kelly-text/60 hover:underline">
          Readiness
        </Link>
      </div>

      {!og.cockpitDbReachable ? (
        <div
          className="rounded-lg border border-amber-400/50 bg-amber-50/90 px-3 py-2 font-body text-[11px] text-amber-950"
          role="status"
        >
          <strong>Database unreachable</strong> — governance copy below is still valid; live verification links may show
          degraded counts elsewhere until <code className="text-[10px]">DATABASE_URL</code> responds.
        </div>
      ) : null}

      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Send Execution Governance</h1>
        <p className="max-w-3xl font-body text-sm text-kelly-text/85">
          EMAIL-SEND-EXECUTION-1.0 — review the <strong>gates</strong> before any Gmail or SendGrid send. The{" "}
          <strong>governance sections below</strong> stay doctrine-first (no buttons there). The{" "}
          <strong>operator console</strong> on this same route (<code className="text-[9px]">#ops</code>) wires{" "}
          <strong>explicit</strong> admin actions only: preflight, single-address test send, final approval, and final
          SendGrid broadcast after typed confirmation — <strong>no automation, no queue send</strong>. Assemble send packets
          in{" "}
          <Link href={`${ECC}/message-studio`} className="font-bold underline">
            Message Studio
          </Link>{" "}
          and promote shared drafts for staff-visible copy.
        </p>
        <div className="flex flex-wrap gap-1.5">
          <span className={badge}>No live sends</span>
          <span className={badge}>Approval required</span>
          <span className={badge}>Suppression-gated</span>
          <span className={badge}>Governed execution console</span>
          <span className={badge}>Human final approval</span>
        </div>
        <p className="font-body text-[10px] text-kelly-text/70">
          <code className="text-[9px]">EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM</code> ={" "}
          <strong>{String(canSend)}</strong> — queue triage never implies provider send permission.
        </p>
        <p className="rounded border border-amber-200/80 bg-amber-50/90 px-2 py-2 font-body text-[10px] text-amber-950">
          When the responsible operator is away, treat test and final SendGrid actions as <strong>off-limits</strong> even
          though the UI remains wired — no unattended or overnight sends.
        </p>
      </header>

      <section className={`${card} border-rose-200/60 bg-rose-50/75`}>
        <h2 className={`${h3} text-rose-950`}>Still blocked / unsafe by default</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 font-body text-[11px] text-rose-950/95">
          <li>No Gmail send-from-queue and no queue-triggered SendGrid from this messaging cockpit.</li>
          <li>
            No background sends — the console below only sends when an operator submits a form action (test or final).
          </li>
          <li>
            Queue status <strong>APPROVED</strong> (workflow) is <strong>not</strong> the same as send approval — see
            pre-send checklist and final approval panel.
          </li>
          <li>
            Broadcast remains <strong>suppression + ASM gated</strong> — missing unsubscribe group env blocks broadcast
            preflight even when test send is possible.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className={h3}>Send rails (future execution)</h2>
        <div className="grid gap-2 md:grid-cols-2">
          {SEND_RAILS.map((r) => (
            <article key={r.title} className={card}>
              <p className="font-heading text-sm font-bold text-kelly-navy">{r.title}</p>
              <p className="mt-1 font-body text-[10px] font-semibold text-kelly-forest">{r.status}</p>
              <dl className="mt-2 space-y-1.5 font-body text-[10px] text-kelly-text/88">
                <div>
                  <dt className="font-bold text-kelly-navy">Prerequisites</dt>
                  <dd>
                    <ul className="mt-0.5 list-inside list-disc">
                      {r.prerequisites.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-kelly-navy">Source data</dt>
                  <dd>{r.sourceData}</dd>
                </div>
                <div>
                  <dt className="font-bold text-kelly-navy">Approval gate</dt>
                  <dd>{r.approvalGate}</dd>
                </div>
                <div>
                  <dt className="font-bold text-kelly-navy">Suppression / compliance gate</dt>
                  <dd>{r.suppressionGate}</dd>
                </div>
                <div>
                  <dt className="font-bold text-kelly-navy">Risk level</dt>
                  <dd>{r.risk}</dd>
                </div>
                <div>
                  <dt className="font-bold text-kelly-forest">Future packet</dt>
                  <dd>{r.futurePacket}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className={card}>
        <h2 className={h3}>Pre-send checklist</h2>
        <p className="mt-1 font-body text-[10px] text-kelly-text/70">
          Rows are posture for tonight — statuses are not persisted; operators update reality in linked routes + CLIs.
        </p>
        <ul className="mt-2 divide-y divide-kelly-text/10 rounded border border-kelly-text/10">
          {PRECHECK_ROWS.map((row) => (
            <li key={row.label} className="px-2 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-heading text-[11px] font-bold text-kelly-navy">{row.label}</span>
                {gateBadge(row.status)}
              </div>
              <p className="mt-1 font-body text-[10px] text-kelly-text/80">
                <span className="font-semibold">Why it matters:</span> {row.why}
              </p>
              <p className="mt-0.5 font-body text-[10px] text-kelly-text/75">
                <span className="font-semibold">Verify:</span> {row.verify}
              </p>
            </li>
          ))}
          <li className="px-2 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-heading text-[11px] font-bold text-kelly-navy">Shared draft saved / reviewed</span>
              {gateBadge(sharedDraftPrecheckStatus)}
            </div>
            <p className="mt-1 font-body text-[10px] text-kelly-text/80">
              <span className="font-semibold">Why it matters:</span> Future send packets should attach to a durable,
              staff-visible draft — not only one browser&apos;s localStorage.
            </p>
            <p className="mt-0.5 font-body text-[10px] text-kelly-text/75">
              <span className="font-semibold">Verify:</span>{" "}
              <Link href={`${ECC}/message-studio#shared-drafts`} className="font-bold underline">
                Message Studio — Shared drafts
              </Link>
              . Active shared drafts (server): <strong>{ms.totalActiveSharedDrafts}</strong>; approved for send governance:{" "}
              <strong>{ms.approvedForSendGovernance}</strong>
              {!ms.dbReachable ? " — DB unreachable for counts on this request." : "."} Still <strong>no send</strong>.
            </p>
          </li>
        </ul>
      </section>

      <section className={card}>
        <h2 className={h3}>Send decision tree (text)</h2>
        <pre className="mt-2 overflow-x-auto rounded border border-kelly-text/12 bg-kelly-page/60 p-3 font-mono text-[10px] leading-relaxed text-kelly-navy">
{`Audience definition OR Queue item (context)
    ↓
Message Studio draft (local browser + optional shared server draft)
    ↓
Review (comms + optional counsel)
    ↓
Approval (distinct from queue APPROVED)
    ↓
Suppression check (SendGridSuppression + consent flags)
    ↓
Test send (future — human verifies rendering)
    ↓
Final operator approval
    ↓
Governed SendGrid execution  ← operator console (#ops) on this route
    ↓
Analytics (events, bounces, complaints)`}
        </pre>
        <p className="mt-2 font-body text-[10px] text-kelly-text/70">
          No branch on this page triggers execution — tree is for operator training and steering only.
        </p>
      </section>

      <section className={`${card} border-kelly-navy/20`}>
        <h2 className={h3}>Suppression gate</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 font-body text-[11px] text-kelly-text/90">
          <li>
            <strong>SendGridSuppression</strong> (and related event rows) must be consulted before any future broadcast to
            an address — unsubscribes, bounces, spam complaints, and invalid addresses block sends.
          </li>
          <li>
            <strong>Imported contacts</strong> are not assumed marketing-opted-in — provenance lives on{" "}
            <code className="text-[9px]">EmailContactProfileFact</code> with <code className="text-[9px]">CONTACT_IMPORT</code>{" "}
            and import batch review.
          </li>
          <li>
            <strong>Suppression overrides audience membership</strong> — a recipient in a saved definition must still be
            removed if suppressed.
          </li>
        </ul>
      </section>

      <section className={card}>
        <h2 className={h3}>Approval roles (static map)</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[280px] border-collapse font-body text-[10px]">
            <thead>
              <tr className="border-b border-kelly-text/15 text-left text-kelly-text/60">
                <th className="py-1 pr-2 font-heading font-bold uppercase">Role</th>
                <th className="py-1 font-heading font-bold uppercase">Scope</th>
              </tr>
            </thead>
            <tbody>
              {APPROVAL_ROLES.map((r) => (
                <tr key={r.role} className="border-b border-kelly-text/8 align-top">
                  <td className="py-1.5 pr-2 font-bold text-kelly-navy">{r.role}</td>
                  <td className="py-1.5 text-kelly-text/85">{r.scope}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
