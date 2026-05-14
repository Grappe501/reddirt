import Link from "next/link";

import { buildEmailAudience } from "@/lib/email/build-email-audience";
import { getEmailReadinessReport } from "@/lib/email/email-readiness";
import { loadEmailDrafts, loadEmailSendLog, loadEmailSuppressions } from "@/lib/email/email-staged-store";
import {
  approveEmailDraftForLive,
  approveEmailDraftForTest,
  cancelEmailDraft,
  sendEmailDraftLiveBatch,
  sendEmailDraftTest,
} from "@/app/admin/(board)/calendar-command-center/email/actions";

export const dynamic = "force-dynamic";

function statusClasses(status: "green" | "yellow" | "red") {
  if (status === "green") return "border-emerald-500/30 bg-emerald-50 text-emerald-950";
  if (status === "yellow") return "border-amber-400/40 bg-amber-50 text-amber-950";
  return "border-rose-400/40 bg-rose-50 text-rose-950";
}

export default async function EmailCommandCenterPage() {
  const [readiness, audience, drafts, sendLog, suppressions] = await Promise.all([
    getEmailReadinessReport(),
    buildEmailAudience(),
    loadEmailDrafts(),
    loadEmailSendLog(),
    loadEmailSuppressions(),
  ]);
  const approved = drafts.filter((d) => d.status === "approved_for_live");

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6">
      <div className="font-body text-xs text-kelly-text/60">
        <Link href="/admin/calendar-command-center" className="text-kelly-text underline-offset-2 hover:underline">
          ← Command center
        </Link>
        {" · "}
        <span className="text-kelly-text/80">Email readiness</span>
      </div>

      <header className={`rounded-lg border px-5 py-5 shadow-sm ${statusClasses(readiness.status)}`}>
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] opacity-65">V3 · Email readiness</p>
        <h1 className="mt-2 font-heading text-2xl font-bold">Controlled SendGrid outreach</h1>
        <p className="mt-2 max-w-3xl font-body text-sm opacity-80">
          DB audience → compliance filters → draft → human approval → test send → small live batch → logs. No SMS,
          no voter targeting, no unsupervised AI sending.
        </p>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
          <div><b>Status:</b> {readiness.status}</div>
          <div><b>Test send:</b> {readiness.canSendTest ? "allowed" : "blocked"}</div>
          <div><b>Live send:</b> {readiness.canSendLive ? "allowed" : "blocked"}</div>
          <div><b>Suppressed:</b> {suppressions.length + audience.suppressedCount}</div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-kelly-text/12 bg-white p-4">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-text/55">Readiness</h2>
          <ul className="mt-3 space-y-1 font-body text-xs text-kelly-text/75">
            <li>SendGrid key: {readiness.configured.sendgridApiKey ? "present" : "missing"}</li>
            <li>From email: {readiness.configured.fromEmail ? "present" : "missing"}</li>
            <li>Physical address: {readiness.configured.physicalAddress ? "present" : "missing"}</li>
            <li>Unsubscribe URL: {readiness.configured.unsubscribeUrl ? "present" : "missing"}</li>
            <li>Domain authenticated: {readiness.configured.domainAuthenticated ? "operator confirmed" : "needs check"}</li>
          </ul>
        </div>

        <div className="rounded-lg border border-kelly-text/12 bg-white p-4">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-text/55">Audience builder</h2>
          <dl className="mt-3 grid grid-cols-2 gap-2 font-body text-xs text-kelly-text/75">
            <dt>Eligible</dt><dd className="font-bold">{audience.eligible.length}</dd>
            <dt>Needs review</dt><dd className="font-bold">{audience.needsReview.length}</dd>
            <dt>Duplicates</dt><dd className="font-bold">{audience.duplicateCount}</dd>
            <dt>Invalid</dt><dd className="font-bold">{audience.invalidCount}</dd>
          </dl>
          <p className="mt-3 text-[11px] text-kelly-text/60">Unknown consent is excluded from default live sends.</p>
        </div>

        <div className="rounded-lg border border-kelly-text/12 bg-white p-4">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-text/55">Test list</h2>
          <p className="mt-3 font-body text-xs text-kelly-text/70">
            Use <code>npm run email:test-send -- &lt;draft-id&gt; &lt;email&gt;</code>. The draft must be approved for test.
          </p>
          <p className="mt-2 font-body text-xs text-kelly-text/70">
            Live sends require <code>approved_for_live</code> and <code>CONFIRM_LIVE_EMAIL_SEND=true</code>.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white p-4">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-text/55">Draft Queue</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {drafts.map((d) => (
            <article key={d.id} className="rounded border border-kelly-text/12 bg-kelly-wash/50 p-3 font-body text-xs text-kelly-text/75">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-sm font-bold text-kelly-text">{d.subject}</h3>
                  <p className="mt-1">{d.purpose.replace(/_/g, " ")} · {d.status.replace(/_/g, " ")}</p>
                </div>
                <span className="rounded bg-white px-2 py-1 text-[10px] font-bold uppercase">{d.aiRecommended ? "AI rec" : "manual"}</span>
              </div>
              <p className="mt-2">Audience count: {audience.eligible.filter((m) => (d.audienceFilter.tags ?? []).some((t) => m.tags.includes(t))).length}</p>
              <p className="mt-2 text-[11px] text-kelly-text/60">Compliance: consent required, footer appended, suppressions checked.</p>
              <div className="mt-3 grid gap-2 text-[11px] font-bold md:grid-cols-2">
                <form action={approveEmailDraftForTest}>
                  <input type="hidden" name="draftId" value={d.id} />
                  <button className="w-full rounded border bg-white px-2 py-1 text-left">Approve test</button>
                </form>
                <form action={sendEmailDraftTest} className="flex gap-1">
                  <input type="hidden" name="draftId" value={d.id} />
                  <input name="testRecipients" placeholder="test@example.com" className="min-w-0 flex-1 rounded border px-2 py-1" />
                  <button className="rounded border bg-white px-2 py-1">Send test</button>
                </form>
                <form action={approveEmailDraftForLive}>
                  <input type="hidden" name="draftId" value={d.id} />
                  <button className="w-full rounded border bg-white px-2 py-1 text-left">Approve live</button>
                </form>
                <form action={sendEmailDraftLiveBatch} className="flex gap-1">
                  <input type="hidden" name="draftId" value={d.id} />
                  <input type="hidden" name="limit" value="25" />
                  <button className="rounded border bg-white px-2 py-1">Send live batch of 25</button>
                </form>
                <form action={cancelEmailDraft}>
                  <input type="hidden" name="draftId" value={d.id} />
                  <button className="rounded border bg-white px-2 py-1">Cancel</button>
                </form>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-kelly-text/12 bg-white p-4">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-text/55">Approved Queue</h2>
          <p className="mt-3 font-body text-xs text-kelly-text/75">{approved.length} draft(s) approved for live.</p>
        </div>
        <div className="rounded-lg border border-kelly-text/12 bg-white p-4">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-text/55">Sent Log</h2>
          <ul className="mt-3 space-y-2 font-body text-xs text-kelly-text/75">
            {sendLog.slice(0, 5).map((row) => <li key={row.id}>{row.createdAt}: {row.kind} · {row.status} · {row.recipientCount}</li>)}
            {sendLog.length === 0 ? <li>No sends logged.</li> : null}
          </ul>
        </div>
        <div className="rounded-lg border border-kelly-text/12 bg-white p-4">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-text/55">AI Outreach Recommendations</h2>
          <p className="mt-3 font-body text-xs text-kelly-text/75">
            Kelly may suggest email drafts on event approval, but every send requires human approval.
          </p>
        </div>
      </section>
    </div>
  );
}
