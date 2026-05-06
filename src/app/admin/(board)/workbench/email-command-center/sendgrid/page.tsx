import Link from "next/link";
import {
  approveSendGridContactSyncRunAction,
  executeSendGridContactSyncRunAction,
  previewSendGridAudienceContactSyncAction,
} from "@/app/admin/sendgrid-contact-sync-actions";
import { getEmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";
import {
  buildSendGridContactExportPreview,
  getSendGridFoundationSnapshot,
  listRecentSendGridEvents,
  listSendGridAudienceReadiness,
  listSendGridSuppressionSummary,
  mapAudienceDefinitionToSendGridPayloadPreview,
} from "@/lib/email-command-center/sendgrid-foundation";
import {
  buildSendGridContactSyncPreview,
  getSendGridContactSyncReadiness,
  listSendGridContactSyncRuns,
} from "@/lib/email-command-center/sendgrid-contact-sync";

export const dynamic = "force-dynamic";

function summarizeRunResultJson(status: string, resultJson: unknown): string {
  if (!resultJson || typeof resultJson !== "object" || Array.isArray(resultJson)) return "—";
  const j = resultJson as Record<string, unknown>;
  if (status === "FAILED") {
    const err = typeof j.safeError === "string" ? j.safeError.slice(0, 120) : "failed";
    return err;
  }
  if (status === "SYNCED") {
    const jobs = Array.isArray(j.providerJobIds) ? (j.providerJobIds as unknown[]).filter((x) => typeof x === "string") : [];
    const jobHint = jobs.length ? `job …${String(jobs[jobs.length - 1]).slice(-8)}` : "no async job id";
    const st = typeof j.providerStatus === "string" ? j.providerStatus : "—";
    const sub = typeof j.submittedCount === "number" ? j.submittedCount : "?";
    return `${sub} submitted · ${jobHint} · status ${st}`;
  }
  return "—";
}

function labelHuman(
  k: "draft_only" | "preview_ready" | "active_preview_ready" | "archived"
): string {
  const m: Record<string, string> = {
    draft_only: "Draft only",
    preview_ready: "Preview-ready",
    active_preview_ready: "Active (not synced)",
    archived: "Archived",
  };
  return m[k] ?? k;
}

export default async function SendGridFoundationPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const previewId = typeof sp.preview === "string" ? sp.preview : undefined;
  const notice = typeof sp.notice === "string" ? sp.notice : undefined;
  const syncError = typeof sp.error === "string" ? sp.error : undefined;
  const executeReason = typeof sp.executeReason === "string" ? sp.executeReason : undefined;
  const executedRunId = typeof sp.runId === "string" ? sp.runId : undefined;

  const snap = await getSendGridFoundationSnapshot();
  const eccSnap = await getEmailCommandCenterSnapshot();
  const audiences = snap.dbReachable ? await listSendGridAudienceReadiness() : [];
  const events = snap.dbReachable ? await listRecentSendGridEvents(35) : [];
  const supSummary = snap.dbReachable ? await listSendGridSuppressionSummary() : [];
  const syncReadiness = snap.dbReachable ? await getSendGridContactSyncReadiness().catch(() => null) : null;
  const syncRuns = snap.dbReachable ? await listSendGridContactSyncRuns(12) : [];

  const exportPreview = previewId && snap.dbReachable ? await buildSendGridContactExportPreview(previewId).catch(() => null) : null;
  const payloadPreview =
    previewId && snap.dbReachable ? await mapAudienceDefinitionToSendGridPayloadPreview(previewId).catch(() => null) : null;
  const contactSyncPreview =
    previewId && snap.dbReachable ? await buildSendGridContactSyncPreview(previewId).catch(() => null) : null;

  const latestRunForPreviewAudience = previewId
    ? (syncRuns.find((r) => r.audienceDefinitionId === previewId) ?? null)
    : null;

  const hostedDbVerified = eccSnap.operatorGate.localContactImportDbVerified;
  const prodHostedExecuteBlocked = process.env.NODE_ENV === "production" && !hostedDbVerified;
  const canExecuteMarketingUpsert = Boolean(syncReadiness?.apiExecutionEnabled && !prodHostedExecuteBlocked);

  return (
    <div className="min-w-0 max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/workbench/email-command-center"
          className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate"
        >
          ← Email Command Center
        </Link>
        <Link href="/admin/workbench/email-command-center/audiences" className="text-xs text-kelly-text/60 hover:underline">
          Audience Studio
        </Link>
        <Link href="/admin/workbench/email-command-center/analytics" className="text-xs text-kelly-text/60 hover:underline">
          Analytics &amp; Deliverability
        </Link>
        <Link
          href="/admin/workbench/email-command-center/send-execution"
          className="text-xs text-kelly-text/60 hover:underline"
        >
          Send execution governance
        </Link>
      </div>

      <header>
        <h1 className="font-heading text-xl font-bold text-kelly-navy">SendGrid Foundation</h1>
        <p className="mt-1 max-w-3xl font-body text-sm text-kelly-text/85">
          EMAIL-SENDGRID-FOUNDATION-1.0 + contact sync (1.1 preview + <strong>1.2 governed Marketing Contacts upsert</strong>) —
          readiness, webhook intake, and operator-driven contact sync. <strong>No email sends</strong>, no campaigns, no single
          sends, no automation activation, no OpenAI from this surface.
        </p>
      </header>

      {notice === "sync-preview-saved" ? (
        <p className="rounded border border-emerald-300/60 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-950" role="status">
          Contact sync preview run saved (Postgres audit row) — still no SendGrid API calls.
        </p>
      ) : null}
      {notice === "sync-run-approved" ? (
        <p className="rounded border border-emerald-300/60 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-950" role="status">
          Sync run marked APPROVED — you may execute Marketing Contacts upsert when SENDGRID_API_KEY is set (contact sync only;
          does not send email).
        </p>
      ) : null}
      {notice === "execute-synced" ? (
        <p className="rounded border border-emerald-300/60 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-950" role="status">
          Contact sync completed (Marketing Contacts upsert — <strong>no email was sent</strong>
          {executedRunId ? ` · run …${executedRunId.slice(-8)}` : ""}).
        </p>
      ) : null}
      {notice === "execute-failed" && executeReason ? (
        <p className="rounded border border-rose-300/70 bg-rose-50 px-2 py-1 text-[11px] text-rose-950" role="alert">
          Execute failed: {executeReason}
        </p>
      ) : null}
      {notice === "execute-blocked" && executeReason ? (
        <p className="rounded border border-amber-300/70 bg-amber-50 px-2 py-1 text-[11px] text-amber-950" role="status">
          Execute blocked: {executeReason}
        </p>
      ) : null}
      {syncError ? (
        <p className="rounded border border-rose-300/60 bg-rose-50 px-2 py-1 text-[11px] text-rose-950" role="alert">
          {syncError}
        </p>
      ) : null}

      {!snap.dbReachable ? (
        <div className="rounded-lg border border-amber-300/60 bg-amber-50/90 px-3 py-2 font-body text-[11px] text-amber-950">
          SendGrid foundation tables unreachable — run{" "}
          <code className="text-[10px]">npx prisma migrate deploy</code> when <code className="text-[10px]">DATABASE_URL</code> is
          healthy. <code className="text-[10px]">npm run check</code> alone does not prove migrations.
        </div>
      ) : null}

      <section className="rounded-lg border border-rose-300/50 bg-rose-50/80 px-3 py-2">
        <h2 className="font-heading text-[10px] font-bold uppercase tracking-wide text-rose-950">Governance</h2>
        <ul className="mt-1 list-inside list-disc font-body text-[11px] text-rose-950/95">
          <li>No sends from this page — queue flag stays false.</li>
          <li>
            Contact sync: previews are local SQL; <strong>APPROVED</strong> runs may call SendGrid Marketing Contacts upsert only
            (EMAIL-SENDGRID-CONTACT-UPsert-EXECUTION-1.2) — still <strong>no email send</strong>.
          </li>
          <li>Suppressions from webhooks must be honored before any future send packet.</li>
          <li>Domain authentication + sender identity are launch gates in SendGrid (manual checklist).</li>
        </ul>
      </section>

      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
          <p className="font-heading text-[10px] font-bold uppercase text-kelly-text/50">API key</p>
          <p className="mt-1 font-heading text-lg font-bold text-kelly-navy">{snap.env.sendgridApiKeyPresent ? "Set" : "Missing"}</p>
          <p className="mt-0.5 font-body text-[10px] text-kelly-text/65">Env name only: SENDGRID_API_KEY</p>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
          <p className="font-heading text-[10px] font-bold uppercase text-kelly-text/50">From identity</p>
          <p className="mt-1 font-heading text-lg font-bold text-kelly-navy">
            {snap.readiness.fromIdentityReady ? "Ready" : "Incomplete"}
          </p>
          <p className="mt-0.5 font-body text-[10px] text-kelly-text/65">SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME</p>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
          <p className="font-heading text-[10px] font-bold uppercase text-kelly-text/50">Webhook verification</p>
          <p className="mt-1 font-heading text-lg font-bold text-kelly-navy">
            {snap.readiness.webhookVerificationReady ? "Configured" : "Missing"}
          </p>
          <p className="mt-0.5 font-body text-[10px] text-kelly-text/65">
            SENDGRID_WEBHOOK_VERIFICATION_KEY or SENDGRID_WEBHOOK_PUBLIC_KEY (PEM)
          </p>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-kelly-page/50 p-3">
          <p className="font-heading text-[10px] font-bold uppercase text-kelly-text/50">Event webhook route</p>
          <p className="mt-1 font-mono text-[10px] font-bold text-kelly-navy">{snap.webhook.eventWebhookPath}</p>
          <p className="mt-0.5 font-body text-[10px] text-kelly-text/65">POST only · configure URL in SendGrid Event Webhook settings.</p>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-kelly-page/50 p-3">
          <p className="font-heading text-[10px] font-bold uppercase text-kelly-text/50">Domain authentication</p>
          <p className="mt-1 font-heading text-sm font-bold text-kelly-navy">Manual checklist</p>
          <p className="mt-0.5 font-body text-[10px] text-kelly-text/65">
            Complete sender authentication in SendGrid; this app does not auto-verify DNS without a governed packet.
          </p>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-kelly-page/50 p-3">
          <p className="font-heading text-[10px] font-bold uppercase text-kelly-text/50">Comms legacy webhook</p>
          <p className="mt-1 font-mono text-[10px] text-kelly-navy">{snap.webhook.legacyCommsWebhookPath}</p>
          <p className="mt-0.5 font-body text-[10px] text-kelly-text/65">Workbench path unchanged — separate from Email OS foundation intake.</p>
        </div>
      </section>

      <section id="contact-sync" className="scroll-mt-20 rounded-lg border border-kelly-navy/20 bg-white/95 p-3">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">
          Contact sync (EMAIL-SENDGRID-CONTACT-SYNC-1.1 + UPSERT EXECUTION 1.2)
        </h2>
        <p className="mt-1 rounded border border-rose-400/40 bg-rose-50/90 px-2 py-1.5 font-body text-[10px] font-bold text-rose-950">
          This syncs contacts into SendGrid Marketing Contacts only. It does <strong>not</strong> send email, create campaigns,
          schedule sends, or activate automation.
        </p>
        <p className="mt-2 font-body text-[10px] text-kelly-text/80">
          Preview-first, suppression-aware, <strong>ACTIVE audience only</strong> for recording runs. Operators save preview
          JSON, may approve, then may execute upsert for <strong>APPROVED</strong> runs when <code className="text-[9px]">SENDGRID_API_KEY</code>{" "}
          is configured. Consent/source warnings from preview remain operator responsibility.
        </p>
        {syncReadiness ? (
          <ul className="mt-2 space-y-0.5 list-inside list-disc font-body text-[10px] text-kelly-navy/90">
            <li>Database reachable: {syncReadiness.dbReachable ? "yes" : "no"}</li>
            <li>SendGrid API key env present (name only): {syncReadiness.sendgridApiKeyConfigured ? "SENDGRID_API_KEY" : "missing"}</li>
            <li>Suppression table: {syncReadiness.suppressionTableAvailable ? "available" : "unavailable"}</li>
            <li>Sync run table: {syncReadiness.syncRunTableAvailable ? "available" : "missing migration"}</li>
            <li>Non-archived audiences: {syncReadiness.audienceDefinitionsNonArchived}</li>
            <li className={syncReadiness.apiExecutionEnabled ? "font-bold text-emerald-900" : "font-bold text-rose-900"}>
              Marketing Contacts upsert: {syncReadiness.apiExecutionEnabled ? "enabled" : "disabled"} —{" "}
              {syncReadiness.apiExecutionDisabledReason}
            </li>
            <li>Kelly-Grappe-App hosted DB verified (import gate): {hostedDbVerified ? "yes" : "no"}</li>
            {!hostedDbVerified && process.env.NODE_ENV !== "production" ? (
              <li className="text-amber-900">
                <strong>Local/dev:</strong> Marketing upsert is allowed without hosted verification — use synthetic or
                non-production lists only.
              </li>
            ) : null}
            {prodHostedExecuteBlocked ? (
              <li className="text-rose-900">
                <strong>Production:</strong> Marketing upsert disabled until hosted <code className="text-[9px]">DATABASE_URL</code>{" "}
                passes migrate + contact-import gate (operator-owned).
              </li>
            ) : null}
          </ul>
        ) : (
          <p className="mt-2 text-[10px] text-kelly-text/70">Readiness unavailable — check database connectivity.</p>
        )}
        {syncReadiness?.warnings?.length ? (
          <div className="mt-2 rounded border border-amber-200/80 bg-amber-50/80 px-2 py-2 text-[10px] text-amber-950">
            <p className="font-bold">Readiness warnings</p>
            <ul className="mt-1 list-inside list-disc">
              {syncReadiness.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-3 grid gap-2 lg:grid-cols-2">
          <div className="rounded border border-kelly-text/10 bg-kelly-page/50 p-2">
            <p className="font-heading text-[10px] font-bold text-kelly-text/55">Record preview run (operator action)</p>
            <p className="mt-1 text-[9px] text-kelly-text/70">
              Choose an <span className="font-bold">ACTIVE</span> audience from Audience Studio. This writes{" "}
              <code className="text-[9px]">SendGridContactSyncRun</code> only.
            </p>
            <form action={previewSendGridAudienceContactSyncAction} className="mt-2 flex flex-wrap items-end gap-2">
              <label className="flex min-w-[12rem] flex-1 flex-col text-[9px] text-kelly-text/75">
                audienceDefinitionId
                <input
                  name="audienceDefinitionId"
                  defaultValue={previewId ?? ""}
                  placeholder="cuid…"
                  className="mt-0.5 rounded border px-2 py-1 font-mono text-[10px]"
                />
              </label>
              <button
                type="submit"
                className="rounded border border-kelly-forest/40 bg-emerald-50/90 px-3 py-1 text-[10px] font-bold text-kelly-navy"
              >
                Save preview run
              </button>
            </form>
          </div>
          <div className="rounded border border-kelly-text/10 bg-kelly-page/50 p-2">
            <p className="font-heading text-[10px] font-bold text-kelly-text/55">Recent sync runs</p>
            <ul className="mt-1 max-h-56 space-y-2 overflow-auto font-mono text-[9px] text-kelly-text/85">
              {syncRuns.map((r) => (
                <li key={r.id} className="rounded border border-kelly-text/10 bg-white/80 px-1.5 py-1">
                  <div>
                    <span className="font-bold">{r.status}</span> · candidates {r.candidateCount} · excl. suppressed{" "}
                    {r.excludedSuppressedCount} · id …{r.id.slice(-8)}
                  </div>
                  {r.syncedAt ? (
                    <div className="text-[8px] text-kelly-text/65">syncedAt: {r.syncedAt.toISOString()}</div>
                  ) : null}
                  <div className="text-[8px] text-kelly-text/70">{summarizeRunResultJson(r.status, r.resultJson)}</div>
                  {r.status === "APPROVED" ? (
                    <form action={executeSendGridContactSyncRunAction} className="mt-1">
                      <input type="hidden" name="runId" value={r.id} />
                      <button
                        type="submit"
                        disabled={!canExecuteMarketingUpsert}
                        className="rounded border border-kelly-navy/35 bg-kelly-fog/80 px-2 py-0.5 text-[9px] font-bold text-kelly-navy disabled:opacity-40"
                        title={
                          !syncReadiness?.sendgridApiKeyConfigured
                            ? "SENDGRID_API_KEY missing"
                            : prodHostedExecuteBlocked
                              ? "Hosted DB gate required in production"
                              : "Upsert eligible contacts (no email send)"
                        }
                      >
                        Execute contact sync
                      </button>
                    </form>
                  ) : null}
                  {r.status === "SYNCED" ? (
                    <p className="mt-1 text-[9px] text-kelly-text/75">
                      <Link
                        href={`/admin/workbench/email-command-center/send-execution?sendGridContactSyncRunId=${encodeURIComponent(r.id)}${
                          r.audienceDefinitionId
                            ? `&audienceDefinitionId=${encodeURIComponent(r.audienceDefinitionId)}`
                            : ""
                        }#ops`}
                        className="font-bold text-violet-950 underline"
                      >
                        Prepare send execution
                      </Link>{" "}
                      — contact sync does not send email.
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
            {!syncRuns.length && snap.dbReachable ? (
              <p className="mt-1 text-[9px] text-kelly-text/65">No runs yet — save a preview for an ACTIVE audience.</p>
            ) : null}
          </div>
        </div>

        {contactSyncPreview && previewId ? (
          <div className="mt-3 rounded border border-kelly-forest/25 bg-emerald-50/35 p-2">
            <p className="font-heading text-[10px] font-bold text-kelly-navy">Mapping preview (selected audience)</p>
            <p className="mt-1 text-[10px] text-kelly-text/85">
              {contactSyncPreview.audienceName} · status <span className="font-bold">{contactSyncPreview.audienceStatus}</span> ·
              matches {contactSyncPreview.matchCount} · syncable after suppression{" "}
              <span className="font-bold tabular-nums">{contactSyncPreview.syncableCandidateCount}</span> · missing email{" "}
              {contactSyncPreview.excludedMissingEmailCount} · suppressed exclusions {contactSyncPreview.excludedSuppressedCount}
            </p>
            {contactSyncPreview.warnings.length ? (
              <ul className="mt-1 list-inside list-disc text-[9px] text-amber-950">
                {contactSyncPreview.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2">
              <form action={approveSendGridContactSyncRunAction} className="inline">
                <input type="hidden" name="runId" value={latestRunForPreviewAudience?.id ?? ""} />
                <button
                  type="submit"
                  disabled={!latestRunForPreviewAudience}
                  className="rounded border border-kelly-navy/30 bg-white px-2 py-1 text-[10px] font-bold text-kelly-navy disabled:opacity-40"
                  title="Approves the newest run row for this audience when status is PREVIEWED"
                >
                  Approve latest run (this audience)
                </button>
              </form>
              {latestRunForPreviewAudience?.status === "APPROVED" ? (
                <form action={executeSendGridContactSyncRunAction} className="inline">
                  <input type="hidden" name="runId" value={latestRunForPreviewAudience.id} />
                  <button
                    type="submit"
                    disabled={!canExecuteMarketingUpsert}
                    className="rounded border border-kelly-navy/35 bg-kelly-fog/90 px-2 py-1 text-[10px] font-bold text-kelly-navy disabled:opacity-40"
                    title="Marketing Contacts upsert only — no email send"
                  >
                    Execute contact sync (this run)
                  </button>
                </form>
              ) : (
                <p className="text-[9px] text-kelly-text/60">Execute appears when the latest run for this audience is APPROVED.</p>
              )}
            </div>
            <p className="mt-1 text-[9px] text-kelly-text/60">
              Approve targets the newest run row for this audience. Execute runs suppression re-check + Marketing Contacts PUT
              for eligible emails only.
            </p>
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">Audience sync readiness (planning)</h2>
        <p className="mt-1 font-body text-[10px] text-kelly-text/70">
          All audiences remain <strong>not synced</strong> to SendGrid in this packet — status reflects preview posture only.
        </p>
        <div className="mt-2 max-h-64 overflow-auto rounded border border-kelly-text/10">
          <table className="w-full text-left text-[10px]">
            <thead className="sticky top-0 bg-kelly-fog/80 text-kelly-text/70">
              <tr>
                <th className="px-2 py-1">Audience</th>
                <th className="px-2 py-1">Status</th>
                <th className="px-2 py-1">SendGrid readiness</th>
                <th className="px-2 py-1">Map sync</th>
                <th className="px-2 py-1">Preview</th>
              </tr>
            </thead>
            <tbody>
              {audiences.map((a) => (
                <tr key={a.audienceDefinitionId} className="border-t border-kelly-text/10">
                  <td className="px-2 py-1 font-semibold text-kelly-navy">{a.name}</td>
                  <td className="px-2 py-1">{a.status}</td>
                  <td className="px-2 py-1">{labelHuman(a.sendGridReadinessLabel)}</td>
                  <td className="px-2 py-1">{a.audienceMapSyncStatus ?? "—"}</td>
                  <td className="px-2 py-1">
                    <Link
                      href={`/admin/workbench/email-command-center/sendgrid?preview=${encodeURIComponent(a.audienceDefinitionId)}`}
                      className="font-bold text-kelly-forest underline"
                    >
                      Export preview
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!audiences.length ? (
            <div className="p-2 text-[10px] text-kelly-navy" role="status">
              <p className="font-semibold">No audience definitions</p>
              <p className="mt-1 text-kelly-text/80">
                Create drafts in{" "}
                <Link href="/admin/workbench/email-command-center/audiences" className="font-bold text-kelly-forest underline">
                  Audience Studio
                </Link>{" "}
                — sync column stays not-synced until a future contact-sync packet.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {exportPreview ? (
        <section className="rounded-lg border border-kelly-forest/25 bg-emerald-50/40 p-3">
          <h2 className="font-heading text-sm font-bold text-kelly-navy">Contact export preview (local SQL)</h2>
          <p className="mt-1 font-body text-[10px] text-kelly-text/80">
            Audience: <span className="font-bold">{exportPreview.audienceName}</span> · Match count{" "}
            <span className="tabular-nums font-bold">{exportPreview.matchCount}</span> · With primary email{" "}
            <span className="tabular-nums font-bold">{exportPreview.profilesWithPrimaryEmail}</span> · Missing email{" "}
            <span className="tabular-nums font-bold">{exportPreview.missingPrimaryEmail}</span> · Overlap with local
            suppressions <span className="tabular-nums font-bold">{exportPreview.suppressedInLocalTableApprox}</span>
          </p>
          <ul className="mt-2 list-inside list-disc font-body text-[10px] text-kelly-text/80">
            {exportPreview.governanceNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <p className="mt-2 font-heading text-[10px] font-bold text-kelly-text/60">Redacted sample rows</p>
          <ul className="mt-1 space-y-0.5 font-mono text-[9px] text-kelly-text/75">
            {exportPreview.sampleRows.map((r) => (
              <li key={r.profileId}>
                {r.profileId} · domain {r.emailDomainHint ?? "—"} · suppressed={String(r.suppressed)}
              </li>
            ))}
          </ul>
        </section>
      ) : previewId ? (
        <p className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-900">Preview failed or audience not found.</p>
      ) : null}

      {payloadPreview ? (
        <section className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
          <h2 className="font-heading text-sm font-bold text-kelly-navy">SendGrid payload shape (dry JSON)</h2>
          <p className="mt-1 font-body text-[10px] text-kelly-text/70">{payloadPreview.description}</p>
          <pre className="mt-2 max-h-56 overflow-auto rounded border border-kelly-text/10 bg-kelly-page/60 p-2 font-mono text-[9px] leading-snug text-kelly-navy">
            {JSON.stringify(payloadPreview.payload, null, 2)}
          </pre>
        </section>
      ) : null}

      <section className="grid gap-2 lg:grid-cols-2">
        <div className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
          <h2 className="font-heading text-sm font-bold text-kelly-navy">Webhook event health</h2>
          <p className="mt-1 font-body text-[10px] text-kelly-text/70">
            Recent rows in <code className="text-[9px]">SendGridEvent</code> (newest first).
          </p>
          <ul className="mt-2 max-h-52 space-y-1 overflow-auto font-mono text-[9px] text-kelly-text/85">
            {events.map((e) => (
              <li key={e.id}>
                {e.occurredAt.toISOString()} · {e.eventType} · id…{e.id.slice(0, 8)}
              </li>
            ))}
          </ul>
          {!events.length && snap.dbReachable ? (
            <div className="mt-2 rounded border border-kelly-text/10 bg-kelly-fog/40 px-2 py-2 text-[10px] text-kelly-navy" role="status">
              <p className="font-semibold">No events ingested yet</p>
              <p className="mt-1 text-kelly-text/80">
                Point SendGrid Event Webhook at <code className="text-[9px]">{snap.webhook.eventWebhookPath}</code> with
                verification key set — still <strong>no</strong> sends from this app path.
              </p>
              <p className="mt-1">
                <Link href="/admin/workbench/email-command-center/analytics" className="font-bold text-kelly-forest underline">
                  Analytics
                </Link>{" "}
                shows counts once rows arrive.
              </p>
            </div>
          ) : null}
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
          <h2 className="font-heading text-sm font-bold text-kelly-navy">Suppression summary</h2>
          <ul className="mt-2 space-y-1 font-body text-[11px] text-kelly-text/85">
            {supSummary.map((s) => (
              <li key={s.type}>
                <span className="font-semibold">{s.type}</span> — <span className="tabular-nums">{s.count}</span>
              </li>
            ))}
          </ul>
          {!supSummary.length && snap.dbReachable ? (
            <div className="mt-2 rounded border border-kelly-text/10 bg-kelly-fog/40 px-2 py-2 text-[10px] text-kelly-navy" role="status">
              <p className="font-semibold">No suppression rows yet</p>
              <p className="mt-1 text-kelly-text/80">
                Bounce/unsubscribe/spam categories populate when SendGrid posts events that map to suppressions — empty is OK
                in dev.
              </p>
              <p className="mt-1 text-kelly-forest/90">
                <strong>Safety:</strong> future sends must honor this table when execution packets ship.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-kelly-text/10 bg-kelly-page/40 p-3 font-body text-[10px] text-kelly-text/80">
        <p className="font-bold text-kelly-navy">Foundation counts (DB)</p>
        <p className="mt-1">
          SendGridEvent: <span className="tabular-nums font-semibold">{snap.counts.sendGridEventsTotal}</span> ·
          SendGridSuppression: <span className="tabular-nums font-semibold">{snap.counts.sendGridSuppressionsTotal}</span> ·
          SendGridAudienceMap: <span className="tabular-nums font-semibold">{snap.counts.sendGridAudienceMaps}</span> ·
          SendGridContactMap: <span className="tabular-nums font-semibold">{snap.counts.sendGridContactMaps}</span>
        </p>
      </section>
    </div>
  );
}
