import Link from "next/link";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { getGmailMonitorSnapshot } from "@/lib/gmail/monitor-read-model";
import { checkStaffGmailSyncStateMigration } from "@/lib/gmail/db-readiness";
import { getGmailReviewInboxForAdmin } from "@/lib/gmail/review";
import { createEmailWorkflowItemFromGmailMetadataAction } from "@/app/admin/gmail-review-actions";
import { isDatabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

const FLAG_LABELS: Record<string, string> = {
  no_subject: "No subject",
  likely_automated_or_list: "Likely automated / list mail",
  reply_or_threaded: "Reply / threaded",
  possible_unsubscribe_or_list_sender: "List-unsubscribe or bulk-sender hint",
};

type Props = {
  searchParams: Promise<{
    create_error?: string;
  }>;
};

export default async function GmailReviewPage({ searchParams }: Props) {
  const sp = await searchParams;
  const actor = await getAdminActorUserId();
  const snap = await getGmailMonitorSnapshot(actor);

  const inboxResult = actor ? await getGmailReviewInboxForAdmin({ actorUserId: actor, maxResults: 25 }) : null;

  const dbConfigured = isDatabaseConfigured();
  const migration = await checkStaffGmailSyncStateMigration();

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-kelly-text/10 pb-3">
        <div>
          <Link
            href="/admin/workbench/email-command-center/gmail"
            className="mb-2 inline-block rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate"
          >
            ← Gmail monitor
          </Link>
          <Link
            href="/admin/workbench/email-command-center"
            className="mb-2 ml-2 inline-block rounded border border-kelly-forest/30 bg-kelly-fog/60 px-2 py-0.5 text-xs font-bold text-kelly-navy"
          >
            Communication Command Center
          </Link>
          <h1 className="font-heading text-xl font-bold text-kelly-navy">Gmail metadata review → queue</h1>
          <p className="mt-1 max-w-3xl font-body text-sm text-kelly-text/85">
            Inspect <strong>metadata-only</strong> INBOX rows (safe headers). Creating an email queue row is always a manual
            button press—RedDirt does not auto-create from Gmail, does not read bodies, and does not send mail from this
            path.
          </p>
        </div>
      </div>

      <div className="rounded-lg border-2 border-amber-300/50 bg-amber-50/70 px-3 py-2">
        <p className="font-heading text-[10px] font-bold uppercase text-amber-950">Operator safety</p>
        <ul className="mt-1 list-inside list-disc font-body text-[11px] text-amber-950">
          <li>Metadata-only review — no bodies displayed or stored.</li>
          <li>This page does not send email, auto-reply, or call OpenAI.</li>
          <li>Queue creation is manual only — not L4 automation.</li>
          <li>Body review stays in Gmail (or a future governed body-ingest packet).</li>
        </ul>
      </div>

      <section className="rounded-lg border border-kelly-text/12 bg-white/90 p-3">
        <h2 className="font-heading text-[10px] font-bold uppercase text-kelly-subtle">Database / migration readiness</h2>
        <ul className="mt-2 list-inside list-disc font-body text-[11px] text-kelly-text">
          <li>
            <span className="font-bold">DATABASE_URL present:</span> {dbConfigured ? "yes" : "no"}
          </li>
          <li>
            <span className="font-bold">DB reachable + StaffGmailAccount.gmailSyncState column:</span>{" "}
            {migration.ok ? "ok" : `not verified — ${migration.messageSafe}`}
          </li>
          <li className="text-kelly-muted">
            <code className="text-[10px]">npm run check</code> does not apply migrations; use{" "}
            <code className="text-[10px]">npx prisma migrate deploy</code> where appropriate.
          </li>
        </ul>
      </section>

      <section className="rounded-lg border border-kelly-forest/25 bg-kelly-fog/35 p-3">
        <h2 className="font-heading text-[10px] font-bold uppercase text-kelly-navy">Governance (Email OS)</h2>
        <ul className="mt-2 list-inside list-disc font-body text-[11px] text-kelly-text">
          <li>Gmail Review creates <strong>queue work only</strong>; it does not send email.</li>
          <li>
            <code className="text-[10px]">EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM</code> remains false — approved external send
            paths are separate.
          </li>
          <li>Auto-create from Gmail push or history requires an explicit future policy packet.</li>
          <li>AI classification here is out of scope — needs OpenAI email intelligence packet.</li>
          <li>Profile / audience updates are out of scope — need profile graph + audience studio packets.</li>
          <li>
            <span className="font-bold">Duplicate guard:</span> existing items are matched by{" "}
            <code className="text-[10px]">metadataJson.gmailReviewSource.gmailMessageId</code> only; older rows without
            that key are not detected.
          </li>
        </ul>
      </section>

      {sp.create_error ? (
        <div className="rounded-lg border border-rose-300/60 bg-rose-50/80 px-3 py-2 font-body text-[11px] text-rose-950" role="alert">
          <span className="font-bold">Could not create queue item:</span> {sp.create_error}
        </div>
      ) : null}

      <section className="rounded-lg border border-kelly-text/12 bg-white/90 p-3">
        <h2 className="font-heading text-[10px] font-bold uppercase text-kelly-subtle">Gmail connection</h2>
        <p className="mt-1 font-body text-[11px] text-kelly-text">
          <span className="font-bold">Phase:</span>{" "}
          {!snap.oauth.isConfigured
            ? "OAuth env incomplete"
            : !snap.actorResolved
              ? "Set ADMIN_ACTOR_USER_EMAIL"
              : !snap.staffRow
                ? "Not connected — use Gmail monitor to connect"
                : "Connected"}
        </p>
        {snap.staffRow ? (
          <dl className="mt-2 grid gap-1 font-body text-[11px] text-kelly-text">
            <div>
              <dt className="font-bold">Last successful metadata sync</dt>
              <dd className="font-mono text-[10px]">{snap.staffRow.syncState.lastSuccessfulSyncAt ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-bold">Last metadata batch size</dt>
              <dd>{snap.staffRow.syncState.lastMetadataSyncCount ?? "—"}</dd>
            </div>
          </dl>
        ) : null}
        <p className="mt-2 font-body text-[10px] text-kelly-muted">
          Run <strong>safe metadata sync</strong> on the{" "}
          <Link href="/admin/workbench/email-command-center/gmail" className="font-bold underline">
            Gmail monitor
          </Link>{" "}
          before review if inbox data may be stale.
        </p>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-kelly-fog/40 p-3">
        <h2 className="font-heading text-[10px] font-bold uppercase text-kelly-subtle">Scope posture</h2>
        <p className="mt-1 font-body text-[11px] text-kelly-text/85">
          <span className="font-bold">Monitor (default):</span>{" "}
          <code className="text-[10px]">{snap.scopePosture.monitorScopes[0]}</code>
        </p>
        <p className="mt-1 font-body text-[11px] text-kelly-text/85">
          <span className="font-bold">Optional composer send:</span>{" "}
          <code className="text-[10px]">{snap.scopePosture.optionalComposerSendScope}</code> — requested only when{" "}
          <code className="text-[10px]">GMAIL_OAUTH_INCLUDE_SEND_FOR_WORKBENCH=true</code>
          {snap.scopePosture.composerSendRequestedViaEnv ? " (enabled)." : " (off)."}
        </p>
        <h3 className="mt-2 font-heading text-[10px] font-bold uppercase text-kelly-subtle">Requested scopes (new consent)</h3>
        <ul className="mt-1 list-inside list-decimal font-mono text-[10px] text-kelly-text/85">
          {snap.requestedScopes.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-kelly-page p-3">
        <h2 className="font-heading text-[10px] font-bold uppercase text-kelly-subtle">Recent INBOX metadata (max 25)</h2>

        {!actor ? (
          <p className="mt-2 font-body text-[11px] text-amber-900">Resolve admin actor email to load Gmail review.</p>
        ) : null}

        {actor && inboxResult && !inboxResult.ok ? (
          <p className="mt-2 font-body text-[11px] text-rose-900">
            Gmail not available ({inboxResult.code}) — connect tokens on the Gmail monitor, then reload.
          </p>
        ) : null}

        {actor && inboxResult?.ok ? (
          <div className="mt-3 space-y-3">
            {inboxResult.items.length === 0 ? (
              <div className="rounded-lg border border-kelly-text/15 bg-kelly-fog/50 px-3 py-2 font-body text-[11px] text-kelly-navy" role="status">
                <p className="font-semibold">Why this is empty</p>
                <p className="mt-1 text-[10px] text-kelly-text/85">
                  INBOX may have no recent metadata rows yet, sync may not have run, or Gmail returned an empty page for this
                  query window.
                </p>
                <p className="mt-2 font-semibold text-[10px] uppercase tracking-wide text-kelly-muted">What to do next</p>
                <ul className="mt-1 list-inside list-disc text-[10px] text-kelly-text/85">
                  <li>
                    Run <strong>safe metadata sync</strong> on the{" "}
                    <Link href="/admin/workbench/email-command-center/gmail" className="font-bold underline">
                      Gmail monitor
                    </Link>
                    .
                  </li>
                  <li>
                    Confirm OAuth + staff link above — then reload this page.
                  </li>
                  <li>
                    For triage without Gmail, use the{" "}
                    <Link href="/admin/workbench/email-queue" className="font-bold underline">
                      email queue
                    </Link>{" "}
                    or manual create.
                  </li>
                </ul>
                <p className="mt-2 text-[10px] text-kelly-forest/95">
                  <strong>Safety:</strong> still metadata-only — no bodies, no send, no auto-queue.
                </p>
              </div>
            ) : (
              inboxResult.items.map((item) => (
                <article
                  key={item.gmailMessageId}
                  className="rounded-lg border border-kelly-text/12 bg-white/95 p-3 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-heading text-xs font-bold text-kelly-navy">
                        {item.subject.trim() ? item.subject : <span className="text-kelly-muted">(No subject)</span>}
                      </p>
                      <p className="font-body text-[11px] text-kelly-text">
                        <span className="font-bold">From:</span> {item.fromLabel}
                      </p>
                      <p className="font-body text-[10px] text-kelly-text/75">
                        <span className="font-bold">Date:</span> {item.date}
                      </p>
                      <p className="font-body text-[10px] text-kelly-muted">
                        <span className="font-bold">Labels:</span> {item.labels.length ? item.labels.join(", ") : "—"}
                      </p>
                      {item.warningFlags.length ? (
                        <ul className="list-inside list-disc font-body text-[10px] text-amber-950">
                          {item.warningFlags.map((f) => (
                            <li key={f}>{FLAG_LABELS[f] ?? f}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="font-body text-[10px] text-kelly-muted">No warning flags from headers.</p>
                      )}
                      <p className="font-body text-[10px] text-kelly-muted">
                        <span className="font-bold">Proposed title:</span> {item.safeQueueTitle}
                      </p>
                      <p className="font-body text-[10px] text-kelly-muted">
                        <span className="font-bold">Proposed reason line:</span> {item.safeQueueReason}
                      </p>
                    </div>
                    <form action={createEmailWorkflowItemFromGmailMetadataAction} className="shrink-0">
                      <input type="hidden" name="gmailMessageId" value={item.gmailMessageId} />
                      <input type="hidden" name="gmailThreadId" value={item.gmailThreadId} />
                      <button
                        type="submit"
                        className="rounded border-2 border-kelly-forest/50 bg-kelly-forest/90 px-3 py-1.5 text-[11px] font-extrabold text-white"
                      >
                        Create queue item
                      </button>
                    </form>
                  </div>
                </article>
              ))
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}
