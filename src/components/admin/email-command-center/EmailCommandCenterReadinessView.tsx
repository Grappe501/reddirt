import Link from "next/link";
import type { ReactNode } from "react";
import type { EmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";
import type { CampaignMemoryReadinessSnapshot } from "@/lib/email-command-center/ai-campaign-memory-readiness";
import { HostedDbReadinessAssistantView } from "@/components/admin/email-command-center/HostedDbReadinessAssistantView";
import { MessageStudioCampaignMemoryPanel } from "@/components/admin/email-command-center/MessageStudioCampaignMemoryPanel";
import { EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM } from "@/lib/email-workflow/governance";

const ECC = "/admin/workbench/email-command-center";

type RowStatus = "ready" | "partial" | "blocked" | "future";

function statusBadge(s: RowStatus) {
  const m: Record<RowStatus, string> = {
    ready: "bg-emerald-100 text-emerald-900",
    partial: "bg-amber-100 text-amber-950",
    blocked: "bg-rose-100 text-rose-950",
    future: "bg-kelly-muted/40 text-kelly-slate",
  };
  const label = s === "ready" ? "Ready" : s === "partial" ? "Partial" : s === "blocked" ? "Blocked" : "Future";
  return <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${m[s]}`}>{label}</span>;
}

function ChecklistSection({
  title,
  rows,
}: {
  title: string;
  rows: {
    label: string;
    status: RowStatus;
    verify: ReactNode;
    owner: string;
    safety: string;
  }[];
}) {
  return (
    <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-3 shadow-sm">
      <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-kelly-text/55">{title}</h2>
      <ul className="mt-2 space-y-3">
        {rows.map((r) => (
          <li key={r.label} className="rounded border border-kelly-text/10 bg-kelly-page/40 px-2 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-heading text-[11px] font-bold text-kelly-navy">{r.label}</span>
              {statusBadge(r.status)}
            </div>
            <p className="mt-1 font-body text-[10px] text-kelly-text/85">
              <span className="font-semibold">Verify:</span> {r.verify}
            </p>
            <p className="mt-0.5 font-body text-[10px] text-kelly-text/75">
              <span className="font-semibold">Owner / action:</span> {r.owner}
            </p>
            <p className="mt-0.5 font-body text-[10px] text-kelly-forest/95">
              <span className="font-semibold">Safety:</span> {r.safety}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function EmailCommandCenterReadinessView({
  snapshot,
  campaignMemoryReadiness,
}: {
  snapshot: EmailCommandCenterSnapshot;
  campaignMemoryReadiness: CampaignMemoryReadinessSnapshot;
}) {
  const og = snapshot.operatorGate;
  const g = snapshot.gmail;
  const gp = snapshot.gmailProductionWatch;
  const sg = snapshot.sendgridEnv;
  const sgF = snapshot.sendGridFoundation;
  const oa = snapshot.openAi;
  const ci = snapshot.contactImport;
  const au = snapshot.audienceStudio;
  const dbOk = og.cockpitDbReachable;
  const migOk = og.allEmailCommandCenterMigrationsApplied === true;

  const localDev: RowStatus = dbOk && migOk ? "ready" : !dbOk ? "blocked" : "partial";

  const hostedNote =
    "This screen does not confirm the live campaign database by itself — run the same connection checks on the hosted environment before production contact imports.";

  const gmailOAuth: RowStatus =
    g.commandSurfacePhase === "connected"
      ? "ready"
      : g.commandSurfacePhase === "ready_to_connect"
        ? "partial"
        : g.commandSurfacePhase === "needs_actor"
          ? "partial"
          : "blocked";

  const gmailMeta: RowStatus = g.monitorInboxSync === "metadata_sync_ready" ? "ready" : "partial";

  const sendgridEnvRow: RowStatus =
    sg.sendgridApiKeyPresent && sg.sendgridFromEmailPresent && sg.sendgridFromNamePresent && sg.sendgridWebhookVerificationKeyPresent
      ? "ready"
      : "partial";

  const sendgridDb: RowStatus = !dbOk ? "blocked" : sgF.dbReachable ? "ready" : "blocked";

  const openai: RowStatus = oa.emailAiSafeAnalysisAvailable ? "ready" : "partial";

  const importRow: RowStatus =
    !dbOk ? "blocked" : og.localContactImportDbVerified ? "ready" : migOk ? "partial" : "blocked";

  const audienceRow: RowStatus = !dbOk ? "blocked" : au.dbSliceReachable ? "ready" : "blocked";

  const se = snapshot.sendExecution;
  const gov = snapshot.governance;
  const isProd = process.env.NODE_ENV === "production";
  const prodTestSendGateOk = !isProd || og.localContactImportDbVerified === true;
  const governedTestSendEnvReady = se.sendGridMailTestReady === true;
  const governedTestSendAvailable = governedTestSendEnvReady && prodTestSendGateOk;

  return (
    <div className="min-w-0 max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={ECC} className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate">
          ← Communication Command Center
        </Link>
        <Link href={`${ECC}/daily`} className="text-xs font-bold text-emerald-800 hover:underline">
          Daily console
        </Link>
        <Link href={`${ECC}/map`} className="text-xs font-bold text-kelly-forest hover:underline">
          Route map
        </Link>
        <Link href={`${ECC}/analytics`} className="text-xs text-kelly-text/60 hover:underline">
          Analytics
        </Link>
        <Link href={`${ECC}/send-execution`} className="text-xs text-kelly-text/60 hover:underline">
          Send execution governance
        </Link>
        <Link href={`${ECC}/readiness/hosted-db`} className="text-xs font-bold text-violet-800 hover:underline">
          Hosted DB assistant
        </Link>
        <Link
          href="/admin/workbench/communication-command-center/readiness"
          className="text-xs font-bold text-sky-900 hover:underline"
        >
          Hosted diagnostics (read-only)
        </Link>
      </div>

      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Communication Command Center — readiness checklist</h1>
        <p className="max-w-3xl font-body text-sm text-kelly-text/85">
          What is safe to use tonight, what needs attention, and what stays intentionally turned off. Statuses come from this
          page load where possible. The database helper below only shows whether connection settings are present and well-formed
          — never secret values. For start-of-day priorities, open the{" "}
          <Link href={`${ECC}/daily`} className="font-bold text-kelly-forest underline">
            daily command console
          </Link>
          .
        </p>
      </header>

      {!dbOk ? (
        <div className="rounded-lg border border-rose-400/50 bg-rose-50/90 px-3 py-2 font-body text-[11px] text-rose-950" role="alert">
          <strong>Database unreachable</strong> — many rows below will show blocked/partial until{" "}
          <code className="text-[10px]">DATABASE_URL</code> works. Run <code className="text-[10px]">{og.dbDiagnoseCliHint}</code> from{" "}
          <code className="text-[10px]">RedDirt/</code>.
        </div>
      ) : null}

      <section className="rounded-lg border border-kelly-navy/25 bg-gradient-to-br from-white via-kelly-page/40 to-emerald-50/50 p-4 shadow-sm">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">First platform email — governed test send only</h2>
        <p className="mt-2 max-w-3xl font-body text-xs text-kelly-text/90">
          This path lets an operator send <strong>one real email</strong> to an address they type, after preflight, using{" "}
          <strong>Send execution</strong>. The subject line is prefixed with <code className="text-[10px]">[TEST]</code> in code.{" "}
          <strong>This does not unlock bulk send</strong> and <strong>does not turn on queue-item send</strong> — the email
          workflow queue stays locked below.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded border border-kelly-text/10 bg-white/90 px-2 py-2 font-body text-[10px] text-kelly-navy">
            <span className="font-semibold">SendGrid API key present</span>
            <div className={sg.sendgridApiKeyPresent ? "font-bold text-emerald-800" : "font-bold text-rose-800"}>
              {sg.sendgridApiKeyPresent ? "Yes" : "No — set SENDGRID_API_KEY in hosting"}
            </div>
          </div>
          <div className="rounded border border-kelly-text/10 bg-white/90 px-2 py-2 font-body text-[10px] text-kelly-navy">
            <span className="font-semibold">SendGrid from email + name</span>
            <div
              className={
                sg.sendgridFromEmailPresent && sg.sendgridFromNamePresent ? "font-bold text-emerald-800" : "font-bold text-rose-800"
              }
            >
              {sg.sendgridFromEmailPresent && sg.sendgridFromNamePresent
                ? "Yes"
                : "Incomplete — set SENDGRID_FROM_EMAIL and SENDGRID_FROM_NAME"}
            </div>
          </div>
          <div className="rounded border border-kelly-text/10 bg-white/90 px-2 py-2 font-body text-[10px] text-kelly-navy">
            <span className="font-semibold">Governed test send (env ready)</span>
            <div className={governedTestSendEnvReady ? "font-bold text-emerald-800" : "font-bold text-amber-900"}>
              {governedTestSendEnvReady ? "Ready" : "Blocked — fix SendGrid env above"}
            </div>
          </div>
          <div className="rounded border border-kelly-text/10 bg-white/90 px-2 py-2 font-body text-[10px] text-kelly-navy">
            <span className="font-semibold">Production operator gate (hosted DB verified)</span>
            <div className={!isProd ? "font-bold text-kelly-text/80" : prodTestSendGateOk ? "font-bold text-emerald-800" : "font-bold text-rose-800"}>
              {!isProd
                ? "N/A on this build (not production)"
                : prodTestSendGateOk
                  ? "Pass — test send allowed from Send execution"
                  : "Blocked — complete hosted DB / import verification (see Hosted DB assistant)"}
            </div>
          </div>
          <div className="rounded border border-kelly-text/10 bg-white/90 px-2 py-2 font-body text-[10px] text-kelly-navy sm:col-span-2">
            <span className="font-semibold">Queue-from-item send</span>
            <div className="font-bold text-emerald-900">
              Locked (<code className="text-[9px]">EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM</code> = {String(EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM)})
              — same as snapshot flag {String(gov.canSendFromEmailWorkflowItem)}.
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Link
            href={`${ECC}/send-execution#ops`}
            className="inline-flex rounded border border-kelly-forest/40 bg-kelly-forest/15 px-3 py-1.5 text-xs font-bold text-kelly-forest hover:bg-kelly-forest/25"
          >
            Open Send execution
          </Link>
          <span
            className={`rounded px-2 py-1 text-[10px] font-bold ${
              governedTestSendAvailable ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"
            }`}
          >
            {governedTestSendAvailable ? "Test send path: available" : "Test send path: blocked — fix items in red above"}
          </span>
        </div>
        <p className="mt-2 font-body text-[10px] text-kelly-text/70">
          Do not use diagnostics <code className="text-[9px]">sandbox-send</code> for inbox proof — it keeps SendGrid sandbox mode on
          and does not deliver. Docs: docs/email-command-center-launch-hardening.md (queue vs Send execution).
        </p>
      </section>

      <section className="rounded-lg border border-sky-300/60 bg-sky-50/90 p-3 shadow-sm">
        <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-sky-950/80">
          Hosted diagnostics — read-only (sending stays off)
        </h2>
        <p className="mt-1 font-body text-[11px] text-sky-950/90">
          Dashboard plus the same read-only JSON your scripts can call with the diagnostics bearer. Confirms database reachability,
          core comms tables, webhook route files, and that <strong>sending stays safely locked</strong>. It does not enable Gmail,
          SendGrid delivery, Twilio SMS, imports, or background workers.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href="/admin/workbench/communication-command-center/readiness"
            className="rounded border border-sky-700/30 bg-white px-2 py-1 text-[11px] font-bold text-sky-950 hover:bg-sky-100"
          >
            Open hosted diagnostics
          </Link>
          <span className="self-center font-body text-[10px] text-sky-900/70">
            Reference: docs/communication-command-center-readiness.md
          </span>
        </div>
      </section>

      <section className="rounded-lg border border-emerald-300/60 bg-emerald-50/90 p-3 shadow-sm">
        <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-emerald-950/85">Gmail + Calendar connection</h2>
        <p className="mt-1 font-body text-[11px] text-emerald-950/90">
          Ready for operator connection proof. Sending remains locked — use when hosted diagnostics are green and you are ready to
          sign in the campaign inbox and calendar in production.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href="/admin/workbench/communication-command-center/gmail-calendar/operator-proof"
            className="inline-flex rounded border border-emerald-800/35 bg-white px-2 py-1 text-[11px] font-bold text-emerald-950 hover:bg-emerald-100"
          >
            Open connection proof
          </Link>
          <Link
            href="/admin/workbench/communication-command-center/gmail-calendar"
            className="inline-flex rounded border border-emerald-800/25 bg-emerald-100/50 px-2 py-1 text-[11px] font-semibold text-emerald-900 hover:bg-emerald-100"
          >
            Technical readiness summary
          </Link>
        </div>
        <p className="mt-2 font-body text-[10px] text-emerald-900/75">
          Guide: docs/gmail-calendar-operator-proof.md · Readiness API (bearer):{" "}
          <code className="rounded bg-white/80 px-0.5 text-[9px]">GET /api/admin/communication-command-center/gmail-calendar-readiness</code>{" "}
          · Operator proof API:{" "}
          <code className="rounded bg-white/80 px-0.5 text-[9px]">GET /api/admin/communication-command-center/gmail-calendar-operator-proof</code>
        </p>
      </section>

      <section className="rounded-lg border border-violet-300/60 bg-violet-50/90 p-3 shadow-sm">
        <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-violet-950/85">Sandbox email proof</h2>
        <p className="mt-1 font-body text-[11px] text-violet-950/90">
          Internal test path only — not list mail, not volunteer outreach. Requires green Gmail + Calendar proof first. Live
          sending stays locked until headquarters runs a separate approval slice.
        </p>
        <div className="mt-2">
          <Link
            href="/admin/workbench/communication-command-center/email-sandbox"
            className="inline-flex rounded border border-violet-800/35 bg-white px-2 py-1 text-[11px] font-bold text-violet-950 hover:bg-violet-100"
          >
            Open sandbox email readiness
          </Link>
        </div>
        <p className="mt-2 font-body text-[10px] text-violet-900/75">
          Guide: docs/email-sandbox-send-proof.md · API (bearer):{" "}
          <code className="rounded bg-white/80 px-0.5 text-[9px]">GET /api/admin/communication-command-center/email-sandbox-readiness</code>
        </p>
      </section>

      <section className="rounded-lg border border-sky-300/60 bg-sky-50/90 p-3 shadow-sm">
        <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-sky-950/85">Text + Relational Organizing</h2>
        <p className="mt-1 font-body text-[11px] text-sky-950/90">
          Foundation ready. Sending and imports remain locked — native texting and volunteer-led Reach are being built inside RedDirt.
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
        <p className="mt-2 font-body text-[10px] text-sky-900/75">
          Guides: docs/text-reach-foundation.md · Readiness API (bearer):{" "}
          <code className="rounded bg-white/80 px-0.5 text-[9px]">GET /api/admin/communication-command-center/text-reach-readiness</code>
        </p>
      </section>

      <ChecklistSection
        title="Local workspace readiness"
        rows={[
          {
            label: "Postgres reachable + workspace updates applied",
            status: localDev,
            verify: (
              <>
                <code className="text-[9px]">{og.preflightCliHint}</code> · cockpit DB banner on{" "}
                <Link href={ECC} className="font-bold underline">
                  Command Center
                </Link>
              </>
            ),
            owner: "Developer / operator on this machine",
            safety: "Running npm check alone does not apply pending database updates.",
          },
        ]}
      />

      <ChecklistSection
        title="Live campaign database (hosted Supabase)"
        rows={[
          {
            label: "Production database on hosted Supabase",
            status: "partial",
            verify: (
              <>
                <code className="text-[9px]">{og.importGateCliHint}</code> on the <strong>same</strong> hosted{" "}
                <code className="text-[9px]">DATABASE_URL</code> the app will use in prod
              </>
            ),
            owner: "Steve / operator — not inferred by this page",
            safety: hostedNote,
          },
        ]}
      />

      <HostedDbReadinessAssistantView gate={og} variant="embedded" />

      <div className="space-y-2">
        <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-indigo-950/80">
          AI knowledge / campaign memory readiness
        </h2>
        <p className="max-w-3xl font-body text-[10px] text-indigo-950/85">
          Same snapshot as Message Studio&apos;s panel: stored knowledge chunks, embedding coverage, and a clear boundary from
          drafting tools. Does not run new ingest jobs from here.
        </p>
        <MessageStudioCampaignMemoryPanel snapshot={campaignMemoryReadiness} showFullOperatorPasteList={false} />
      </div>

      <ChecklistSection
        title="Gmail readiness"
        rows={[
          {
            label: "OAuth + staff link",
            status: gmailOAuth,
            verify: (
              <>
                <Link href={g.monitorPath} className="font-bold underline">
                  Gmail monitor
                </Link>{" "}
                — phase: {g.commandSurfacePhase}
              </>
            ),
            owner: "Staff admin account linked for Gmail",
            safety: "Scopes default metadata-first; composer send optional via env.",
          },
          {
            label: "Metadata sync recorded",
            status: gmailMeta,
            verify: (
              <>
                Last sync: {g.lastMetadataSyncAtIso ?? "—"} · count: {g.lastMetadataSyncMessageCount ?? "—"}
              </>
            ),
            owner: "Operator runs safe sync on monitor",
            safety: "No bodies stored from sync.",
          },
          {
            label: "Push / Pub/Sub receiver",
            status: g.pubsubReceiverConfigured && !g.gmailWatchPushIncomplete ? "ready" : "partial",
            verify: `Pub/Sub receiver configured: ${g.pubsubReceiverConfigured ? "yes" : "no"} · watch: ${g.gmailWatchDisplayStatus}`,
            owner: "Operator — topic + verification token + Start/Renew watch",
            safety: "Inbox notifications only record metadata — not full message bodies.",
          },
          {
            label: "Production watch — renewal + CLI dry-run",
            status:
              !gp.dbReachable
                ? "blocked"
                : gp.missingPubsubTopic || gp.missingPubsubVerification
                  ? "partial"
                  : gp.accountsNeedingRenewalCount > 0 || gp.watchesExpiringWithin48hCount > 0
                    ? "partial"
                    : "ready",
            verify: (
              <>
                Accounts in renewal window: {gp.accountsNeedingRenewalCount} · watch expiring within 48h:{" "}
                {gp.watchesExpiringWithin48hCount} · dry-run:{" "}
                <code className="text-[9px]">{gp.dryRunRenewalCli}</code> from <code className="text-[9px]">RedDirt/</code>
              </>
            ),
            owner: "Staff or scheduled renewal job (see Gmail renewal runbook)",
            safety: "Renewal CLI defaults to dry-run; turning on execute is a deliberate step — renews inbox watch only, no mail send.",
          },
          {
            label: "Production watch — history cursor",
            status: !gp.dbReachable ? "blocked" : gp.accountsWithStaleHistoryCursorCount > 0 ? "partial" : "ready",
            verify: (
              <>
                Stale cursor accounts: {gp.accountsWithStaleHistoryCursorCount} · Pub/Sub signal without profile
                cursor: {gp.pendingPubsubSignalWithoutProfileCursorCount} ·{" "}
                <Link href={g.monitorPath} className="font-bold underline">
                  Run metadata sync
                </Link>{" "}
                before trusting full history sync
              </>
            ),
            owner: "Operator on Gmail monitor",
            safety: "Metadata sync does not store bodies; history preview remains counts-only.",
          },
        ]}
      />

      <ChecklistSection
        title="SendGrid readiness"
        rows={[
          {
            label: "Env + identity + webhook PEM",
            status: sendgridEnvRow,
            verify: (
              <>
                <Link href={`${ECC}/sendgrid`} className="font-bold underline">
                  SendGrid Foundation
                </Link>{" "}
                — API key / from / webhook PEM (names only in UI)
              </>
            ),
            owner: "Comms / infra — env vars only, never paste secrets in tickets",
            safety: "No mass send from foundation route.",
          },
          {
            label: "Foundation tables + webhook intake",
            status: sendgridDb,
            verify: (
              <>
                Events ingested (count): {sgF.dbReachable ? String(sgF.recentSendGridEventsCount) : "—"} ·{" "}
                <Link href={`${ECC}/analytics`} className="font-bold underline">
                  Analytics
                </Link>
              </>
            ),
            owner: "Apply agreed deploy checklist on the target database",
            safety: "Suppressions must gate future sends.",
          },
        ]}
      />

      <ChecklistSection
        title="OpenAI readiness"
        rows={[
          {
            label: "Queue AI advisory",
            status: openai,
            verify: (
              <>
                OPENAI_API_KEY present: {oa.openaiApiKeyPresent ? "yes" : "no"} · rows with queue AI analysis:{" "}
                {oa.emailAiQueueItemsAnalyzedCount} · rows with task intelligence:{" "}
                {oa.emailTaskIntelligenceQueueItemsCount}
              </>
            ),
            owner: "Infra sets server key; operators use queue item detail panel",
            safety: "Advisory only — no auto-send or auto-merge.",
          },
        ]}
      />

      <ChecklistSection
        title="Contact import readiness"
        rows={[
          {
            label: "Staging UI + batch gate",
            status: importRow,
            verify: (
              <>
                <Link href={ci.path} className="font-bold underline">
                  Imports
                </Link>{" "}
                · local verified: {String(og.localContactImportDbVerified)}
              </>
            ),
            owner: "Operator runs import gate on each target environment",
            safety: "Production imports blocked until hosted DB gate passes — not implied by local OK.",
          },
        ]}
      />

      <ChecklistSection
        title="Audience readiness"
        rows={[
          {
            label: "Audience Studio tables + previews",
            status: audienceRow,
            verify: (
              <>
                <Link href={au.path} className="font-bold underline">
                  Audience Studio
                </Link>{" "}
                · drafts: {au.draftAudienceDefinitions} · active: {au.activeAudienceDefinitions}
              </>
            ),
            owner: "Operator builds definitions over ACTIVE facts",
            safety: "No SendGrid bulk sync runs from this screen alone.",
          },
        ]}
      />

      <ChecklistSection
        title="Message Studio readiness"
        rows={[
          {
            label: "Planning surface",
            status: "partial",
            verify: (
              <>
                <Link href={`${ECC}/message-studio`} className="font-bold underline">
                  Message Studio
                </Link>{" "}
                — drafting UI live
              </>
            ),
            owner: "Operator drafts in browser tab",
            safety: "Shared drafts need database readiness green; no live send from this studio.",
          },
        ]}
      />

      <ChecklistSection
        title="Automation readiness"
        rows={[
          {
            label: "Governance map",
            status: "ready",
            verify: (
              <>
                <Link href={`${ECC}/automation`} className="font-bold underline">
                  Automation Studio
                </Link>
              </>
            ),
            owner: "Staff reads tiers and triggers before turning on any automation playbooks",
            safety: "No activation from this route.",
          },
        ]}
      />

      <ChecklistSection
        title="Analytics readiness"
        rows={[
          {
            label: "Readiness dashboard",
            status: dbOk ? "ready" : "partial",
            verify: (
              <>
                <Link href={`${ECC}/analytics`} className="font-bold underline">
                  Analytics & Deliverability
                </Link>
              </>
            ),
            owner: "Operator uses for one-page signal view",
            safety: "Does not grant send permission.",
          },
        ]}
      />

      <ChecklistSection
        title="Send execution readiness"
        rows={[
          {
            label: "SendGrid broadcast from queue",
            status: "future",
            verify: "Governed bulk send lane not shipped on this surface",
            owner: "Policy + comms + counsel",
            safety: "Intentionally blocked — queue-triggered mass send stays off.",
          },
          {
            label: "Gmail send-from-queue",
            status: "future",
            verify: "Separate governed Gmail send path when approved",
            owner: "Policy + OAuth scopes + human composer path",
            safety: "No Gmail send from these Command Center routes until that lane ships.",
          },
        ]}
      />

      <section className="rounded-lg border-2 border-kelly-forest/25 bg-kelly-fog/40 px-3 py-2.5">
        <h2 className="font-heading text-[10px] font-bold uppercase text-kelly-navy">Governance reminder</h2>
        <p className="mt-1 font-body text-[11px] text-kelly-navy/95">
          This checklist is <strong>read-only guidance</strong>. It does not change settings, apply database updates, or unlock
          sends. When in doubt, open the{" "}
          <Link href={`${ECC}/map`} className="font-bold underline">
            route map
          </Link>{" "}
          and your team&apos;s operator smoke-test checklist in the repo docs.
        </p>
      </section>
    </div>
  );
}
