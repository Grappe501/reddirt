import Link from "next/link";
import { getAdminActorUserId } from "@/lib/admin/actor";
import {
  runGmailSafeMetadataSyncAction,
  startOrRenewGmailWatchAction,
  stopGmailWatchAction,
  processGmailPendingHistoryPreviewAction,
} from "@/app/admin/gmail-monitor-actions";
import { getGmailMonitorSnapshot } from "@/lib/gmail/monitor-read-model";
import { getGmailRedirectUri } from "@/lib/gmail/config";
import {
  getGmailWatchConfigStatus,
  getGmailWatchRenewalPolicy,
  isGmailWatchConfigured,
} from "@/lib/gmail/watch-config";
import { resolveDisplayWatchStatus } from "@/lib/gmail/gmail-sync-state";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    gmail_sync?: string;
    gmail_sync_error?: string;
    gmail_watch?: string;
    gmail_watch_error?: string;
    gmail_watch_stop?: string;
    gmail_history_preview?: string;
    gmail_history_error?: string;
    gmail_history_needs_sync?: string;
  }>;
};

function badge(ok: boolean, yes: string, no: string) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
        ok ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-950"
      }`}
    >
      {ok ? yes : no}
    </span>
  );
}

export default async function GmailMonitorPage({ searchParams }: Props) {
  const sp = await searchParams;
  const actor = await getAdminActorUserId();
  const snap = await getGmailMonitorSnapshot(actor);
  const watchCfg = getGmailWatchConfigStatus();
  const renewal = getGmailWatchRenewalPolicy();

  const phase =
    !snap.oauth.isConfigured
      ? "env_incomplete"
      : !snap.actorResolved
        ? "needs_actor"
        : !snap.staffRow
          ? "ready_to_connect"
          : "connected";

  const ss = snap.staffRow?.syncState;
  const watchUi = ss ? resolveDisplayWatchStatus(ss) : "NOT_CONFIGURED";
  const watchExpIso =
    ss?.watchExpiration && Number.isFinite(Number(ss.watchExpiration))
      ? new Date(Number(ss.watchExpiration)).toISOString()
      : null;

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-kelly-text/10 pb-3">
        <div>
          <Link
            href="/admin/workbench/email-command-center"
            className="mb-2 inline-block rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate"
          >
            ← Email Command Center
          </Link>
          <h1 className="font-heading text-xl font-bold text-kelly-navy">Gmail monitor</h1>
          <p className="mt-1 max-w-3xl font-body text-sm text-kelly-text/85">
            Connection + metadata-only inbox monitoring. No bodies stored, no bulk send, no queue automation.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Link
            href="/admin/workbench/email-command-center/gmail/review"
            className="rounded border border-kelly-forest/40 bg-kelly-forest/10 px-3 py-1 text-[11px] font-extrabold text-kelly-navy"
          >
            Gmail review → queue
          </Link>
          {phase === "ready_to_connect" || phase === "connected" ? (
            <Link
              href={`/admin/workbench/email-command-center/gmail/connect?return=${encodeURIComponent("/admin/workbench/email-command-center/gmail")}`}
              className="rounded border-2 border-kelly-forest/40 bg-kelly-fog/70 px-3 py-1 text-[11px] font-extrabold text-kelly-navy"
            >
              {phase === "connected" ? "Reconnect Gmail" : "Connect Gmail"}
            </Link>
          ) : null}
        </div>
      </div>

      {sp.gmail_sync ? (
        <div
          className="rounded-lg border border-emerald-300/50 bg-emerald-50/70 px-3 py-2 font-body text-[11px] text-emerald-950"
          role="status"
        >
          Metadata sync completed — summary updated below (no message bodies stored).
        </div>
      ) : null}
      {sp.gmail_sync_error ? (
        <div className="rounded-lg border border-rose-300/60 bg-rose-50/80 px-3 py-2 font-body text-[11px] text-rose-950" role="alert">
          <span className="font-bold">Sync:</span> {sp.gmail_sync_error}
        </div>
      ) : null}
      {sp.gmail_watch ? (
        <div
          className="rounded-lg border border-emerald-300/50 bg-emerald-50/70 px-3 py-2 font-body text-[11px] text-emerald-950"
          role="status"
        >
          Gmail watch start/renew completed — status stored below (no bodies; no queue automation).
        </div>
      ) : null}
      {sp.gmail_watch_stop ? (
        <div
          className="rounded-lg border border-amber-300/50 bg-amber-50/70 px-3 py-2 font-body text-[11px] text-amber-950"
          role="status"
        >
          Gmail watch stop requested — Google mailbox watch cleared if the API call succeeded.
        </div>
      ) : null}
      {sp.gmail_watch_error ? (
        <div className="rounded-lg border border-rose-300/60 bg-rose-50/80 px-3 py-2 font-body text-[11px] text-rose-950" role="alert">
          <span className="font-bold">Watch:</span> {sp.gmail_watch_error}
        </div>
      ) : null}
      {sp.gmail_history_preview ? (
        <div
          className="rounded-lg border border-emerald-300/50 bg-emerald-50/70 px-3 py-2 font-body text-[11px] text-emerald-950"
          role="status"
        >
          History preview completed — counts stored below (no message fetch beyond history.list).
        </div>
      ) : null}
      {sp.gmail_history_needs_sync ? (
        <div className="rounded-lg border border-amber-300/60 bg-amber-50/80 px-3 py-2 font-body text-[11px] text-amber-950" role="status">
          <span className="font-bold">History preview blocked:</span> cursor stale or full sync required — run{" "}
          <strong>safe metadata sync</strong> first (no bodies), then retry pending history preview.
        </div>
      ) : null}

      <div className="rounded-lg border-2 border-rose-300/50 bg-rose-50/60 px-3 py-2">
        <p className="font-heading text-[10px] font-bold uppercase text-rose-900">Safety rails</p>
        <ul className="mt-1 list-inside list-disc font-body text-[10px] text-rose-950">
          {snap.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </div>

      <section className="rounded-lg border border-kelly-text/12 bg-white/90 p-3">
        <h2 className="font-heading text-[10px] font-bold uppercase text-kelly-text/50">OAuth environment</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {badge(snap.oauth.present.clientId, "Client ID", "Missing client ID")}
          {badge(snap.oauth.present.clientSecret, "Client secret", "Missing client secret")}
          {badge(snap.oauth.present.redirectUri, "Redirect URI", "Missing redirect")}
          {badge(snap.oauth.present.tokenEncryptionKey, "Encrypt key", "Missing GMAIL_TOKEN_ENCRYPTION_KEY")}
          {badge(snap.oauth.present.oauthStateSecret, "State secret", "Missing state secret")}
          {badge(snap.oauth.present.pubsubTopic, "Pub/Sub topic", "No GOOGLE_PUBSUB_TOPIC")}
        </div>
        {!snap.oauth.isConfigured ? (
          <p className="mt-2 font-body text-[11px] text-amber-900">
            Set:{" "}
            <span className="font-mono text-[10px]">
              {snap.oauth.gaps[0]?.missingEnvVars.join(", ")}
            </span>
          </p>
        ) : (
          <p className="mt-2 font-body text-[11px] text-kelly-text/75">
            Redirect URI must match Google Cloud Console:{" "}
            <code className="rounded bg-kelly-page px-1 text-[10px]">{getGmailRedirectUri() || "(unset)"}</code>
          </p>
        )}
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-kelly-fog/40 p-3">
        <h2 className="font-heading text-[10px] font-bold uppercase text-kelly-text/50">Scope posture</h2>
        <p className="mt-1 font-body text-[11px] text-kelly-text/85">
          <span className="font-bold">Monitor (default):</span>{" "}
          <code className="text-[10px]">{snap.scopePosture.monitorScopes[0]}</code>
        </p>
        <p className="mt-1 font-body text-[11px] text-kelly-text/85">
          <span className="font-bold">Optional composer send:</span>{" "}
          <code className="text-[10px]">{snap.scopePosture.optionalComposerSendScope}</code> — requested only when{" "}
          <code className="text-[10px]">GMAIL_OAUTH_INCLUDE_SEND_FOR_WORKBENCH=true</code> before OAuth
          {snap.scopePosture.composerSendRequestedViaEnv ? " (currently enabled)." : " (currently off)."}
        </p>
        <p className="mt-1 font-body text-[10px] text-kelly-text/60">
          Monitoring and this sync action do not use send scope. EmailWorkflowItem never sends via Gmail.
        </p>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white/90 p-3">
        <h2 className="font-heading text-[10px] font-bold uppercase text-kelly-text/50">Connection phase</h2>
        <p className="mt-1 font-body text-sm font-semibold text-kelly-navy">
          {phase === "env_incomplete" && "Incomplete OAuth environment"}
          {phase === "needs_actor" && "Admin actor not resolved — set ADMIN_ACTOR_USER_EMAIL"}
          {phase === "ready_to_connect" && "Ready to connect (OAuth pipeline OK, no Staff Gmail row)"}
          {phase === "connected" && "Connected (Staff Gmail row present)"}
        </p>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white/90 p-3">
        <h2 className="font-heading text-[10px] font-bold uppercase text-kelly-text/50">
          Requested scopes (new consent)
        </h2>
        <ul className="mt-2 list-inside list-decimal font-mono text-[10px] text-kelly-text/85">
          {snap.requestedScopes.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      {snap.staffRow ? (
        <>
          <section className="rounded-lg border border-kelly-text/12 bg-white/90 p-3">
            <h2 className="font-heading text-[10px] font-bold uppercase text-kelly-text/50">Staff Gmail link</h2>
            <div className="mt-2 grid gap-1 font-body text-[11px] text-kelly-text">
              <div>
                <span className="font-bold">Active:</span> {snap.staffRow.isActive ? "yes" : "no"}
              </div>
              <div>
                <span className="font-bold">Send-as domain hint:</span>{" "}
                {snap.staffRow.sendAsDomainHint ? `@${snap.staffRow.sendAsDomainHint}` : "—"}
              </div>
              <div>
                <span className="font-bold">Storage:</span> {snap.staffRow.storageFormat}
              </div>
              <div>
                <span className="font-bold">Has refresh token:</span> {snap.staffRow.hasRefreshToken ? "yes" : "no"}
              </div>
              {snap.staffRow.accessTokenExpiresAtIso ? (
                <div>
                  <span className="font-bold">Access token expiry (metadata):</span>{" "}
                  {snap.staffRow.accessTokenExpiresAtIso}
                </div>
              ) : null}
              {snap.staffRow.scopes?.length ? (
                <div>
                  <span className="font-bold">Granted scopes (stored metadata):</span>
                  <ul className="mt-0.5 list-inside list-disc font-mono text-[9px]">
                    {snap.staffRow.scopes.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {snap.staffRow.lastError ? (
                <div className="text-rose-800">
                  <span className="font-bold">Last row error:</span> {snap.staffRow.lastError.slice(0, 500)}
                </div>
              ) : null}
              <div className="text-[10px] text-kelly-text/55">Row updated: {snap.staffRow.updatedAtIso}</div>
            </div>
          </section>

          <section className="rounded-lg border border-kelly-forest/30 bg-kelly-fog/50 p-3">
            <h2 className="font-heading text-[10px] font-bold uppercase text-kelly-navy">Metadata sync state</h2>
            <dl className="mt-2 grid gap-1 font-body text-[11px] text-kelly-text">
              <div>
                <dt className="font-bold">Last successful sync</dt>
                <dd className="font-mono text-[10px]">{ss?.lastSuccessfulSyncAt ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-bold">Messages metadata fetched (last run)</dt>
                <dd>{ss?.lastMetadataSyncCount ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-bold">Labels seen (last run)</dt>
                <dd>{ss?.lastLabelsCount ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-bold">Unique senders in sample (count only)</dt>
                <dd>{ss?.lastUniqueSenderCount ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-bold">Unread in INBOX sample (count)</dt>
                <dd>{ss?.lastUnreadInSampleCount ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-bold">Newest message (internal date)</dt>
                <dd className="font-mono text-[10px]">
                  {ss?.lastNewestInternalDateMs
                    ? new Date(Number(ss.lastNewestInternalDateMs)).toISOString()
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="font-bold">Profile / incremental cursor (lastHistoryId)</dt>
                <dd className="font-mono text-[10px] break-all">
                  {ss?.lastHistoryId ? `${ss.lastHistoryId.slice(0, 8)}…` : "—"}
                </dd>
              </div>
              <div>
                <dt className="font-bold">History cursor stale</dt>
                <dd>{ss?.historyCursorStale ? "yes — run metadata sync" : "no"}</dd>
              </div>
              <div>
                <dt className="font-bold">Requires full sync flag</dt>
                <dd>{ss?.requiresFullSync ? "yes — run metadata sync" : "no"}</dd>
              </div>
              <div>
                <dt className="font-bold">Pending Pub/Sub history id (signal only)</dt>
                <dd className="font-mono text-[10px]">
                  {ss?.pendingHistoryId ? `${ss.pendingHistoryId.slice(0, 8)}…` : "none"}
                </dd>
              </div>
              <div>
                <dt className="font-bold">Last history error (safe)</dt>
                <dd className="text-[10px]">{ss?.lastHistoryErrorMessageSafe ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-bold">History dry-run (last)</dt>
                <dd>
                  {ss?.lastHistoryDryRunStatus ?? "—"}
                  {ss?.lastHistoryDryRunChangedCount != null ? ` · Δ messages: ${ss.lastHistoryDryRunChangedCount}` : ""}
                </dd>
              </div>
              {ss?.lastHistoryDryRunMessageSafe ? (
                <div>
                  <dt className="font-bold">History note</dt>
                  <dd className="text-[10px]">{ss.lastHistoryDryRunMessageSafe}</dd>
                </div>
              ) : null}
              {ss?.lastErrorMessageSafe ? (
                <div className="text-rose-800">
                  <dt className="font-bold">Last sync error (safe)</dt>
                  <dd>{ss.lastErrorMessageSafe}</dd>
                </div>
              ) : null}
            </dl>

            {phase === "connected" && snap.oauth.isConfigured ? (
              <form action={runGmailSafeMetadataSyncAction} className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  className="rounded border-2 border-kelly-forest/50 bg-kelly-forest/90 px-3 py-1.5 text-[11px] font-extrabold text-white"
                >
                  Run safe metadata sync
                </button>
                <span className="font-body text-[10px] text-kelly-text/65">
                  INBOX · max 25 · METADATA headers only · no bodies · no queue rows
                </span>
              </form>
            ) : null}
          </section>
        </>
      ) : null}

      <section className="rounded-lg border border-kelly-text/12 bg-kelly-page p-3">
        <h2 className="font-heading text-[10px] font-bold uppercase text-kelly-text/50">
          Gmail push watch (users.watch)
        </h2>
        <p className="mt-1 font-body text-[10px] text-kelly-text/65">
          Registers Gmail push notifications to your Pub/Sub topic. Does not read bodies, send mail, or create queue
          items. Renew before expiry (Google limit ~7 days; daily renewal recommended).
        </p>
        <dl className="mt-2 grid gap-1 font-body text-[11px] text-kelly-text">
          <div>
            <dt className="font-bold">Watch config (topic env present)</dt>
            <dd>{isGmailWatchConfigured() ? "yes" : "no — set GOOGLE_PUBSUB_TOPIC"}</dd>
          </div>
          <div>
            <dt className="font-bold">Topic env name</dt>
            <dd className="font-mono text-[10px]">{watchCfg.topicEnvVarName}</dd>
          </div>
          <div>
            <dt className="font-bold">Pub/Sub push verification env</dt>
            <dd>
              {watchCfg.verificationTokenConfigured
                ? `set (${watchCfg.verificationTokenEnvVarName ?? "GMAIL_PUBSUB_VERIFICATION_TOKEN"})`
                : "not set — GMAIL_PUBSUB_VERIFICATION_TOKEN or GOOGLE_PUBSUB_VERIFICATION_TOKEN"}
            </dd>
          </div>
          <div>
            <dt className="font-bold">Optional label filter env</dt>
            <dd className="font-mono text-[10px]">
              {watchCfg.labelIdsEnvVarName} {watchCfg.labelIdsEnvPresent ? "(set)" : "(default INBOX)"}
            </dd>
          </div>
          <div>
            <dt className="font-bold">Renewal recommendation</dt>
            <dd>
              every {renewal.recommendedIntervalDays} day(s) (max mailbox watch lifetime ~{renewal.maxWatchLifetimeDays}{" "}
              days — env {watchCfg.renewalEnvVarName})
            </dd>
          </div>
          <div>
            <dt className="font-bold">Watch status (display)</dt>
            <dd className="font-semibold">{watchUi}</dd>
          </div>
          <div>
            <dt className="font-bold">Watch expiration (API)</dt>
            <dd className="font-mono text-[10px]">{watchExpIso ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-bold">Watch historyId stored</dt>
            <dd>{ss?.watchHistoryId ? `yes (${ss.watchHistoryId.slice(0, 8)}…)` : "no"}</dd>
          </div>
          <div>
            <dt className="font-bold">Last watch error (safe)</dt>
            <dd className="text-[10px]">{ss?.lastWatchErrorMessageSafe ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-bold">History cursor stale / needs full sync</dt>
            <dd>
              {ss?.historyCursorStale ? "stale" : "ok"} / {ss?.requiresFullSync ? "requires_full_sync" : "—"}
            </dd>
          </div>
          <div>
            <dt className="font-bold">Pub/Sub receiver route</dt>
            <dd className="font-mono text-[10px]">
              POST /api/gmail/pubsub — header x-gmail-pubsub-token — stores notification metadata only
            </dd>
          </div>
          <div>
            <dt className="font-bold">Last Pub/Sub notification</dt>
            <dd className="font-mono text-[10px]">
              {ss?.lastPubSubNotificationAt ?? "—"} · count {ss?.pubSubNotificationCount ?? 0} · historyId{" "}
              {ss?.lastPubSubHistoryId ? `${ss.lastPubSubHistoryId.slice(0, 8)}…` : "—"}
            </dd>
          </div>
          <div>
            <dt className="font-bold">Last history preview (manual)</dt>
            <dd className="text-[10px]">
              {ss?.lastHistoryPreviewAt ?? "—"} · added {ss?.lastHistoryPreviewMessagesAdded ?? "—"} · deleted{" "}
              {ss?.lastHistoryPreviewMessagesDeleted ?? "—"} · labels ± {ss?.lastHistoryPreviewLabelsAdded ?? "—"} /{" "}
              {ss?.lastHistoryPreviewLabelsRemoved ?? "—"} · pages {ss?.lastHistoryPreviewPages ?? "—"}
            </dd>
          </div>
        </dl>

        {phase === "connected" && snap.oauth.isConfigured ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <form action={startOrRenewGmailWatchAction}>
              <button
                type="submit"
                disabled={!isGmailWatchConfigured()}
                className="rounded border-2 border-kelly-forest/50 bg-kelly-forest/90 px-3 py-1.5 text-[11px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Start / renew Gmail watch
              </button>
            </form>
            <form action={stopGmailWatchAction}>
              <button
                type="submit"
                className="rounded border border-kelly-text/25 bg-white px-3 py-1.5 text-[11px] font-semibold text-kelly-slate"
              >
                Stop watch
              </button>
            </form>
            <form action={processGmailPendingHistoryPreviewAction}>
              <button
                type="submit"
                className="rounded border border-kelly-text/25 bg-kelly-fog/60 px-3 py-1.5 text-[11px] font-semibold text-kelly-navy"
              >
                Process pending history preview
              </button>
            </form>
            <span className="font-body text-[10px] text-kelly-text/60">
              History preview uses lastHistoryId · on 404 run metadata sync first · capped pages server-side
            </span>
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-kelly-forest/25 bg-kelly-fog/35 p-3">
        <h2 className="font-heading text-[10px] font-bold uppercase text-kelly-navy">Actions</h2>
        <ul className="mt-2 list-inside list-decimal space-y-1 font-body text-[11px] text-kelly-text">
          <li>Connect or reconnect Gmail when env is complete.</li>
          <li>Start/renew Gmail watch when topic env + connection exist (manual).</li>
          <li>Optional: stop watch or run history preview (counts only).</li>
          <li>
            <Link href="/admin/workbench/email-command-center/gmail/review" className="font-bold underline">
              Open Gmail metadata review → queue
            </Link>
            {" "}
            (manual create only; metadata-only reads)
          </li>
          <li>
            <Link href="/admin/workbench/email-command-center" className="font-bold underline">
              Return to Command Center
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
