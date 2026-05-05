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

function PipelineStep({ label, state, note }: { label: string; state: StepState; note: string }) {
  return (
    <div className={`rounded-md border px-2 py-1.5 ${stepStyle[state]}`}>
      <p className="font-heading text-[10px] font-bold uppercase tracking-wide">{label}</p>
      <p className="mt-0.5 font-body text-[10px] leading-snug opacity-90">{note}</p>
    </div>
  );
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

  const sendgridConfiguredForSend = sg.sendgridApiKeyPresent && sg.sendgridFromEmailPresent;

  return (
    <div className="min-w-0 space-y-4">
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
            <span className={pill}>SendGrid planned</span>
            <span className={pill}>
              {oa.emailAiConfigured ? "OpenAI queue AI (advisory)" : "OpenAI queue AI not configured"}
            </span>
            <span className={pill}>Contact/profile graph (staged facts)</span>
            <span className={pill}>Audience Studio (preview — no SendGrid)</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
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
              href={au.path}
              className="rounded border border-kelly-forest/30 bg-emerald-50/60 px-2 py-0.5 text-[10px] font-bold text-kelly-navy"
            >
              Audience Studio
            </Link>
            <Link
              href={g.gmailReviewPath}
              className="rounded border border-kelly-text/20 bg-white px-2 py-0.5 text-[10px] font-semibold text-kelly-slate"
            >
              Gmail review → queue
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
        <h2 className={h3}>Today&apos;s email command</h2>
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
            title="SendGrid list sync (this lane)"
            value={0}
            href={au.path}
            sub="Command Center + Audience Studio do not sync lists — foundation packet future"
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
            statusLabel={sendgridConfiguredForSend ? "Env keys present (send path may work elsewhere)" : "Not fully configured in env"}
            existsToday={[
              "Workbook + webhook route code paths exist in repo",
              `SENDGRID_API_KEY set: ${sg.sendgridApiKeyPresent ? "yes" : "no"} (name only)`,
              `SENDGRID_FROM_EMAIL set: ${sg.sendgridFromEmailPresent ? "yes" : "no"}`,
              `SENDGRID_FROM_NAME set: ${sg.sendgridFromNamePresent ? "yes" : "no"}`,
              `SENDGRID_WEBHOOK_VERIFICATION_KEY set: ${sg.sendgridWebhookVerificationKeyPresent ? "yes" : "no"} (prod signed webhooks)`,
            ]}
            missing={[
              "Command Center does not invoke sends — EMAIL-SENDGRID-FOUNDATION-1.0 + execution packet",
              "Suppression/unsubscribe automation at scale (governed)",
            ]}
            nextPacket="EMAIL-SENDGRID-FOUNDATION-1.0"
            safetyGate="Mass email requires suppression checks; webhook verification in production per `sendgrid` route."
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
            note="EMAIL-AUDIENCE-STUDIO-1.0 — Audience Studio previews from approved facts; SendGrid sync still future."
          />
          <PipelineStep label="Draft" state="partial" note="Comms / message studio patterns; Command Center is coordination." />
          <PipelineStep label="Approval" state="partial" note="Queue approvals are not provider sends — governance copy on queue." />
          <PipelineStep
            label="Send (SendGrid / Gmail)"
            state={sendgridConfiguredForSend ? "blocked_future" : "blocked_credentials"}
            note={
              sendgridConfiguredForSend
                ? "Env hints OK; execution still gated to comms packets — not from this dashboard."
                : "SendGrid from-address/key not both set — see readiness panel."
            }
          />
          <PipelineStep label="Engagement" state="partial" note="SendGrid webhook route exists; analytics packet future." />
          <PipelineStep label="Profile update" state="designed" note="Governed merges from engagement — future packet." />
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
          previews microtargeting from <strong>ACTIVE</strong> facts; pending hints stay non-broadcast until governed.
          SendGrid list sync remains <span className="font-bold">out of scope</span> here.
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
          Gmail sync, SendGrid webhooks at scale, structured send execution, and higher automation tiers remain roadmap
          items — queue OpenAI analysis is manual/advisory only; no automation engine on this page.
        </p>
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
          <li>EMAIL-SENDGRID-FOUNDATION-1.0</li>
          <li>EMAIL-PROFILE-GRAPH-1.0</li>
          <li>EMAIL-AI-INTELLIGENCE-1.0 (✓ advisory queue AI — deepen/eval next)</li>
          <li>EMAIL-AUDIENCE-STUDIO-1.0 (✓ preview + draft definitions — no SendGrid)</li>
          <li>EMAIL-MESSAGE-STUDIO-1.0</li>
          <li>EMAIL-AUTOMATION-STUDIO-1.0</li>
          <li>EMAIL-SEND-EXECUTION-1.0</li>
          <li>EMAIL-ANALYTICS-1.0</li>
        </ol>
      </section>
    </div>
  );
}
