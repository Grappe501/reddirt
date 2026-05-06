import Link from "next/link";
import type { ReactNode } from "react";
import type { EmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";
import { HostedDbReadinessAssistantView } from "@/components/admin/email-command-center/HostedDbReadinessAssistantView";

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

export function EmailCommandCenterReadinessView({ snapshot }: { snapshot: EmailCommandCenterSnapshot }) {
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
    "Canonical Kelly / Supabase DATABASE_URL is not verified from this UI — run the same CLI gates on hosted DB before production imports.";

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

  return (
    <div className="min-w-0 max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={ECC} className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate">
          ← Email Command Center
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
      </div>

      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Email Command Center — Readiness checklist</h1>
        <p className="max-w-3xl font-body text-sm text-kelly-text/85">
          EMAIL-COMMAND-CENTER-FINAL-POLISH-1.0 +{" "}
          <span className="font-semibold">EMAIL-HOSTED-DB-READINESS-ASSISTANT-1.0</span> — operator-facing truth for tonight:
          what is safe to use, what needs work, and what stays intentionally blocked. Statuses derive from this request&apos;s
          snapshot where possible. The embedded Hosted DB readiness assistant (below) shows{" "}
          <code className="text-[10px]">DATABASE_URL</code>/<code className="text-[10px]">DIRECT_URL</code> presence + parse +
          host classification <strong>without printing secrets</strong>. For a guided start-of-day queue, open the{" "}
          <Link href={`${ECC}/daily`} className="font-bold text-kelly-forest underline">
            Daily Operator Console
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

      <ChecklistSection
        title="Local development readiness"
        rows={[
          {
            label: "Postgres reachable + ECC migrations",
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
            safety: "npm run check does not apply migrations.",
          },
        ]}
      />

      <ChecklistSection
        title="Hosted Supabase / Kelly-Grappe-App readiness"
        rows={[
          {
            label: "Canonical production database",
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
            owner: "Operator with ADMIN_ACTOR_USER_EMAIL set",
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
            safety: "POST /api/gmail/pubsub stores notification metadata only.",
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
            owner: "Operator / cron — EMAIL-GMAIL-PRODUCTION-WATCH-HARDENING-1.0",
            safety: "Default CLI is dry-run; execute requires GMAIL_WATCH_RENEWAL_EXECUTE=1 and --execute — users.watch only, no mail send.",
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
                before trusting history.list
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
            owner: "Migrate deploy on target DB when steering allows",
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
                OPENAI_API_KEY present: {oa.openaiApiKeyPresent ? "yes" : "no"} · rows with analysis:{" "}
                {oa.emailAiQueueItemsAnalyzedCount}
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
            safety: "No SendGrid sync execution in this lane.",
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
            safety: "No server persistence until EMAIL-MESSAGE-STUDIO-1.1; no send.",
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
            owner: "Operator reads tiers/triggers before requesting automation packets",
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
            label: "SendGrid broadcast from queue / Command Center",
            status: "future",
            verify: "EMAIL-SEND-EXECUTION-1.0 style packet (not shipped)",
            owner: "Policy + comms + counsel",
            safety: "Intentionally blocked — EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM remains false.",
          },
          {
            label: "Gmail send-from-queue",
            status: "future",
            verify: "Separate governed Gmail send packet",
            owner: "Policy + OAuth scopes + human composer path",
            safety: "No Gmail send from Command Center routes tonight.",
          },
        ]}
      />

      <section className="rounded-lg border-2 border-kelly-forest/25 bg-kelly-fog/40 px-3 py-2.5">
        <h2 className="font-heading text-[10px] font-bold uppercase text-kelly-navy">Governance reminder</h2>
        <p className="mt-1 font-body text-[11px] text-kelly-navy/95">
          This checklist is <strong>visibility only</strong>. It does not change env, run migrations, or enable sends. When in doubt,
          open the{" "}
          <Link href={`${ECC}/map`} className="font-bold underline">
            route map
          </Link>{" "}
          and the smoke test doc in the repo: <code className="text-[10px]">docs/email-command-center-operator-smoke-test.md</code>.
        </p>
      </section>
    </div>
  );
}
