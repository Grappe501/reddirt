import Link from "next/link";
import type { EmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";

const ECC = "/admin/workbench/email-command-center";
const SEND_EXECUTION = `${ECC}/send-execution`;
const card =
  "rounded-lg border border-kelly-text/12 bg-gradient-to-b from-white/95 to-kelly-page/90 px-3 py-2.5 shadow-sm";
const h3 = "font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/50";
const badge =
  "rounded-full border border-kelly-text/15 bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-kelly-slate";

export type AnalyticsDeliverabilityViewProps = {
  snapshot: EmailCommandCenterSnapshot;
  suppressionByType: Array<{ type: string; count: number }>;
};

function CheckRow({ label, ok, note }: { label: string; ok: boolean | "manual"; note?: string }) {
  const labelText =
    ok === true ? "Ready" : ok === "manual" ? "Manual" : ok === false ? "Pending" : "—";
  const cls =
    ok === true
      ? "text-emerald-800"
      : ok === "manual"
        ? "text-amber-900"
        : ok === false
          ? "text-kelly-text/70"
          : "text-kelly-text/55";
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-2 border-b border-kelly-text/8 py-1.5 font-body text-[11px] text-kelly-text/90 last:border-0">
      <span className="font-semibold text-kelly-navy">{label}</span>
      <span className={`shrink-0 text-[10px] font-bold uppercase ${cls}`}>{labelText}</span>
      {note ? <span className="w-full text-[10px] text-kelly-text/65">{note}</span> : null}
    </li>
  );
}

export function AnalyticsDeliverabilityView({ snapshot, suppressionByType }: AnalyticsDeliverabilityViewProps) {
  const q = snapshot.queueHealth;
  const pg = snapshot.profileGraph;
  const au = snapshot.audienceStudio;
  const sg = snapshot.sendgridEnv;
  const sgF = snapshot.sendGridFoundation;
  const ci = snapshot.contactImport;
  const oa = snapshot.openAi;
  const og = snapshot.operatorGate;
  const dbOk = og.cockpitDbReachable && ci.dbSliceReachable;

  const checklistDomainAuth: boolean | "manual" = "manual";
  const checklistSender =
    sg.sendgridFromEmailPresent && sg.sendgridFromNamePresent ? true : (false as boolean);
  const checklistWebhook = sg.sendgridWebhookVerificationKeyPresent;
  const checklistSuppressions = sgF.dbReachable && sgF.suppressionCount >= 0;
  const checklistTestSend = false;
  const checklistAudience = au.activeAudienceDefinitions > 0 || au.draftAudienceDefinitions > 0;
  const checklistMessage = false;
  const checklistLegal = "manual" as const;
  const checklistOperator = false;

  return (
    <div className="min-w-0 max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={ECC} className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate">
          ← Email Command Center
        </Link>
        <Link href={`${ECC}/sendgrid`} className="text-xs text-kelly-text/60 hover:underline">
          SendGrid Foundation
        </Link>
        <Link href={`${ECC}/audiences`} className="text-xs text-kelly-text/60 hover:underline">
          Audience Studio
        </Link>
        <Link href={`${ECC}/imports`} className="text-xs text-kelly-text/60 hover:underline">
          Contact imports
        </Link>
        <Link href={`${ECC}/automation`} className="text-xs text-kelly-text/60 hover:underline">
          Automation Studio
        </Link>
        <Link href={`${ECC}/message-studio`} className="text-xs text-kelly-text/60 hover:underline">
          Message Studio
        </Link>
        <Link href={`${ECC}/map`} className="text-xs text-kelly-text/60 hover:underline">
          Route map
        </Link>
        <Link href={SEND_EXECUTION} className="text-xs text-kelly-text/60 hover:underline">
          Send execution governance
        </Link>
        <Link href={`${ECC}/readiness`} className="text-xs text-kelly-text/60 hover:underline">
          Readiness
        </Link>
      </div>

      {!og.cockpitDbReachable ? (
        <div className="rounded-lg border border-rose-400/50 bg-rose-50/90 px-3 py-2 font-body text-[11px] text-rose-950" role="alert">
          <strong>Database unreachable</strong> — queue, intelligence, import, and SendGrid table counts below may read as zero.
          Restore <code className="text-[10px]">DATABASE_URL</code> and run <code className="text-[10px]">{og.dbDiagnoseCliHint}</code>.
        </div>
      ) : null}

      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Analytics &amp; Deliverability</h1>
        <p className="max-w-3xl font-body text-sm text-kelly-text/85">
          Track readiness, queue health, audience growth, and suppression signals <strong>before</strong> campaign sends.
          EMAIL-AUTOMATION-ANALYTICS-SHELL-1.0 — read-only aggregates from the Command Center snapshot; no sends, no mutations, no new schema.
        </p>
        <div className="flex flex-wrap gap-1.5">
          <span className={badge}>No production sends yet</span>
          <span className={badge}>Suppressions honored</span>
          <span className={badge}>Readiness-first</span>
          <span className={badge}>SendGrid future</span>
        </div>
      </header>

      {og.cockpitDbReachable && q.total === 0 ? (
        <div className="rounded-lg border border-kelly-text/12 bg-kelly-fog/45 px-3 py-2 font-body text-[11px] text-kelly-navy" role="status">
          <p className="font-semibold">Quiet queue snapshot</p>
          <p className="mt-1 text-[10px] text-kelly-text/85">
            Counts are zero because this database has no EmailWorkflowItem rows yet — charts below are truthful, not broken.
            Seed work via{" "}
            <Link href="/admin/workbench/email-command-center/gmail/review" className="font-bold underline">
              Gmail review
            </Link>{" "}
            or{" "}
            <Link href="/admin/workbench/email-queue#create-manual" className="font-bold underline">
              manual queue item
            </Link>
            .
          </p>
          <p className="mt-1 text-[10px] text-kelly-forest/90">
            <strong>Safety:</strong> this page never sends mail.
          </p>
        </div>
      ) : null}

      <section className={card}>
        <h2 className={h3}>Queue analytics</h2>
        <p className="mt-1 font-body text-[10px] text-kelly-text/65">
          Same signals as the Command Center cockpit — deep links go to the email queue filters.
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total queue", value: q.total, href: "/admin/workbench/email-queue" },
            { label: "Needs attention", value: q.needsAttentionCount, href: "/admin/workbench/email-queue" },
            { label: "New", value: q.newCount, href: "/admin/workbench/email-queue?status=NEW" },
            { label: "Ready to respond", value: q.readyToRespondCount, href: "/admin/workbench/email-queue?status=READY_TO_RESPOND" },
            { label: "Approved (workflow)", value: q.approvedCount, href: "/admin/workbench/email-queue?status=APPROVED" },
            { label: "Escalated", value: q.escalatedCount, href: "/admin/workbench/email-queue?status=ESCALATED" },
            { label: "Unassigned", value: q.unassignedCount, href: "/admin/workbench/email-queue?assignee=unassigned" },
          ].map((x) => (
            <Link
              key={x.label}
              href={x.href}
              className="rounded-md border border-kelly-text/10 bg-white/90 px-2 py-2 transition hover:border-kelly-forest/30"
            >
              <p className="font-heading text-[9px] font-bold uppercase tracking-wide text-kelly-text/55">{x.label}</p>
              <p className="mt-0.5 font-heading text-xl font-bold tabular-nums text-kelly-navy">{x.value}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className={card}>
        <h2 className={h3}>Intelligence analytics</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Stat href="/admin/workbench/email-queue" label="Queue items with AI analysis" value={oa.emailAiQueueItemsAnalyzedCount} sub="metadataJson.emailAiAnalysis" />
          <Stat href={pg.profilesReviewPath} label="Pending profile suggestions" value={pg.pendingProfileFactSuggestions} />
          <Stat href={pg.profilesReviewPath} label="Pending audience hints" value={pg.pendingAudienceHints} />
          <Stat href={pg.profilesReviewPath} label="Approved profile facts (active)" value={pg.approvedActiveFacts} />
          <Stat href={au.path} label="Audience building blocks (approved triples)" value={au.buildingBlockApprovedTriples} sub={au.dbSliceReachable ? undefined : "Studio tables not verified"} />
        </div>
      </section>

      <section className={card}>
        <h2 className={h3}>Contact import analytics</h2>
        {!dbOk ? (
          <p className="mt-2 rounded border border-amber-200/80 bg-amber-50/80 px-2 py-2 font-body text-[11px] text-amber-950">
            Import batch counts unavailable or not trustworthy on this request — open{" "}
            <Link href={ci.path} className="font-bold underline">
              imports
            </Link>{" "}
            after DB + migration gates pass ({og.preflightCliHint}).
          </p>
        ) : null}
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Stat href={ci.path} label="Open import batches" value={ci.openImportBatchCount} sub="Non-terminal (excludes committed + archived)" />
          <Stat href={ci.path} label="Pending approval" value={ci.pendingApprovalCount} sub="VALIDATED + READY_FOR_APPROVAL" />
          <Stat href={ci.path} label="Committed batches" value={ci.committedBatchCount} />
          <Stat href={ci.path} label="Consent warnings (Σ batches)" value={ci.consentWarningRowsSummed} />
        </div>
      </section>

      <section className={card}>
        <h2 className={h3}>Audience analytics</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Stat href={au.path} label="Draft audience definitions" value={au.draftAudienceDefinitions} />
          <Stat href={au.path} label="Approved fact triples (building blocks)" value={au.buildingBlockApprovedTriples} />
          <Stat href={au.path} label="Non-archived audience definitions" value={au.activeAudienceDefinitions} />
          <Stat href={au.path} label="Audience preview runs" value="—" sub="See Audience Studio per definition" />
          <Stat href={au.path} label="Synced to SendGrid" value={0} sub="Not synced — foundation rails only" />
        </div>
      </section>

      <section className={card}>
        <h2 className={h3}>SendGrid deliverability foundation</h2>
        <p className="mt-1 font-body text-[10px] text-kelly-text/70">Env presence only — never values. Table counts require applied migrations + healthy DB.</p>
        <ul className="mt-2 space-y-1 font-body text-[11px] text-kelly-text/90">
          <li>
            <strong>SENDGRID_API_KEY</strong> configured:{" "}
            <span className="font-semibold">{sg.sendgridApiKeyPresent ? "yes" : "no"}</span>
          </li>
          <li>
            <strong>SENDGRID_FROM_EMAIL</strong> configured:{" "}
            <span className="font-semibold">{sg.sendgridFromEmailPresent ? "yes" : "no"}</span>
          </li>
          <li>
            <strong>SENDGRID_FROM_NAME</strong> configured:{" "}
            <span className="font-semibold">{sg.sendgridFromNamePresent ? "yes" : "no"}</span>
          </li>
          <li>
            Webhook verification key present:{" "}
            <span className="font-semibold">{sg.sendgridWebhookVerificationKeyPresent ? "yes" : "no"}</span> (
            <code className="text-[10px]">SENDGRID_WEBHOOK_VERIFICATION_KEY</code> or{" "}
            <code className="text-[10px]">SENDGRID_WEBHOOK_PUBLIC_KEY</code>)
          </li>
          <li>
            SendGrid events ingested (rows):{" "}
            <span className="font-semibold">{sgF.dbReachable ? sgF.recentSendGridEventsCount : "— (DB)"}</span> —{" "}
            <Link href={`${ECC}/sendgrid`} className="font-bold text-kelly-forest underline">
              Foundation surface
            </Link>
          </li>
          <li>
            Suppressions (local table):{" "}
            <span className="font-semibold">{sgF.dbReachable ? sgF.suppressionCount : "—"}</span>
          </li>
          <li>
            <strong>Production send from Command Center:</strong>{" "}
            <span className="font-semibold text-rose-800">blocked</span> — execution remains future governed packets.
          </li>
        </ul>
        {suppressionByType.length ? (
          <div className="mt-3">
            <p className={h3}>Suppression categories (local)</p>
            <ul className="mt-1 grid gap-1 sm:grid-cols-2">
              {suppressionByType.map((s) => (
                <li key={s.type} className="rounded border border-kelly-text/10 bg-kelly-page/50 px-2 py-1 text-[10px]">
                  <span className="font-mono text-kelly-navy">{s.type}</span> ·{" "}
                  <span className="font-bold tabular-nums">{s.count}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-3 text-[10px] text-kelly-text/60">
            No suppression-type breakdown (empty table or DB unreachable). Events still route through{" "}
            <code className="text-[10px]">POST /api/sendgrid/events</code> when configured.
          </p>
        )}
        <div className="mt-3 rounded border border-kelly-text/12 bg-kelly-fog/40 px-2 py-2">
          <p className="font-heading text-[9px] font-bold uppercase text-kelly-text/55">Domain authentication (manual)</p>
          <ul className="mt-1 list-inside list-disc text-[10px] text-kelly-text/85">
            <li>Confirm SPF/DKIM/DMARC in SendGrid + DNS host — not inferred from this app.</li>
            <li>Link tracking and click domain settings remain operator choices in SendGrid.</li>
            <li>Branded link / dedicated sending domains follow counsel + comms policy.</li>
          </ul>
        </div>
      </section>

      <section className={card}>
        <h2 className={h3}>Deliverability launch checklist</h2>
        <ul className="mt-2 space-y-0.5">
          <CheckRow
            label="Domain authentication confirmed (SendGrid + DNS)"
            ok={checklistDomainAuth}
            note="Operator confirms in SendGrid dashboard — this UI does not probe DNS."
          />
          <CheckRow label="Sender identity (from email + from name env)" ok={checklistSender} />
          <CheckRow
            label="Unsubscribe / suppression handling confirmed"
            ok={checklistWebhook && checklistSuppressions}
            note="Webhook verification + local suppression table when migrations applied."
          />
          <CheckRow label="Test send plan approved" ok={checklistTestSend} note="Future comms packet — not from this route." />
          <CheckRow label="Audience approved / defined" ok={checklistAudience} note="Heuristic: at least one draft or active definition." />
          <CheckRow label="Message approved" ok={checklistMessage} note="Message Studio 1.1 + workflow TBD." />
          <CheckRow label="Legal / compliance review (if mass-send)" ok={checklistLegal} />
          <CheckRow label="Operator final approval" ok={checklistOperator} note="Explicit sign-off outside this dashboard." />
        </ul>
      </section>

      <section className="rounded-lg border-2 border-rose-300/45 bg-rose-50/80 px-3 py-2.5">
        <h2 className={`${h3} text-rose-950`}>Governance panel</h2>
        <ul className="mt-2 list-inside list-disc space-y-0.5 font-body text-[11px] text-rose-950/95">
          <li>Analytics views do not grant permission to send.</li>
          <li>Suppression table must gate future sends — honor before any broadcast packet.</li>
          <li>No SendGrid broadcast exists from this route.</li>
          <li>No Gmail send exists from this route.</li>
        </ul>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  sub,
}: {
  label: string;
  value: number | string;
  href: string;
  sub?: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-md border border-kelly-text/10 bg-white/90 px-2 py-2 transition hover:border-kelly-forest/30"
    >
      <p className="font-heading text-[9px] font-bold uppercase tracking-wide text-kelly-text/55">{label}</p>
      <p className="mt-0.5 font-heading text-xl font-bold tabular-nums text-kelly-navy">{value}</p>
      {sub ? <p className="mt-0.5 text-[9px] text-kelly-text/65">{sub}</p> : null}
    </Link>
  );
}
