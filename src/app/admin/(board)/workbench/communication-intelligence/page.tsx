import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCommunicationIntelligenceSnapshot } from "@/lib/communications/intelligence-snapshot";
import { COMMUNICATION_INGEST_CONFIRM_PHRASE } from "@/lib/communications/communication-ingest-constants";
import {
  previewGmailIngestAction,
  runGmailIngestAction,
  previewGoogleContactsIngestAction,
  runGoogleContactsIngestAction,
  previewGoogleCalendarIngestAction,
  runGoogleCalendarIngestAction,
  approveCommunicationMatchCandidateAction,
  rejectCommunicationMatchCandidateAction,
} from "@/app/admin/communication-ingest-actions";

export const dynamic = "force-dynamic";

const card = "rounded-lg border border-kelly-text/12 bg-white/90 px-3 py-2 text-[11px] shadow-sm";
const h2 = "font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-muted";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function CommunicationIntelligencePage({ searchParams }: Props) {
  const sp = await searchParams;
  const snap = await getCommunicationIntelligenceSnapshot();
  const calendarSources = await prisma.calendarSource
    .findMany({
      where: { isActive: true },
      orderBy: { label: "asc" },
      take: 40,
      select: { id: true, label: true, displayName: true, externalCalendarId: true },
    })
    .catch(() => []);
  const matchRows = await prisma.communicationProfileMatchCandidate
    .findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 25,
      include: {
        communicationIdentity: { select: { id: true, displayName: true, normalizedEmail: true, reviewStatus: true } },
      },
    })
    .catch(() => []);

  const defaultStart = new Date(Date.now() - 730 * 86400000).toISOString().slice(0, 10);
  const defaultEnd = new Date().toISOString().slice(0, 10);
  const calEnd = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);

  return (
    <div className="min-w-0 max-w-5xl space-y-4 px-2 py-3">
      <div className="flex flex-wrap gap-2 text-[10px]">
        <Link className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 font-semibold" href="/admin/workbench">
          ← Workbench
        </Link>
        <Link className="rounded border border-kelly-navy/20 px-2 py-0.5" href="/admin/workbench/cockpit">
          Cockpit
        </Link>
        <Link className="rounded border border-kelly-forest/30 bg-emerald-50 px-2 py-0.5 font-bold" href="/admin/workbench/email-command-center">
          Email command center
        </Link>
        <Link className="rounded border border-kelly-navy/20 px-2 py-0.5" href="/admin/workbench/communication-intelligence/search">
          Search
        </Link>
      </div>

      <header>
        <h1 className="font-heading text-xl font-bold text-kelly-navy">Communication Intelligence Center</h1>
        <p className="mt-1 max-w-3xl font-body text-[12px] text-kelly-text/85">
          Ingest Gmail metadata (optional full bodies), Google Contacts, and Google Calendar events into RedDirt-owned rows for operator context.{" "}
          <strong>No sends</strong>, no SendGrid execution, no Google Calendar writes, no automatic voter scoring, no ACTIVE audiences from this lane.
        </p>
      </header>

      {sp.gmail_preview ? (
        <p className="rounded border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] text-sky-950">Gmail preview: listed {sp.gmail_preview} message id(s) in first page.</p>
      ) : null}
      {sp.contacts_preview ? (
        <p className="rounded border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] text-sky-950">Contacts preview: {sp.contacts_preview} row(s) in first page.</p>
      ) : null}
      {sp.cal_preview ? (
        <p className="rounded border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] text-sky-950">Calendar preview: {sp.cal_preview} event(s) in window (capped).</p>
      ) : null}
      {sp.notice ? (
        <p className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-950">Done: {sp.notice}</p>
      ) : null}
      {sp.error ? (
        <p className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-950">Error: {sp.error}</p>
      ) : null}

      <section className={card}>
        <p className={h2}>Readiness</p>
        <ul className="mt-1 list-inside list-disc text-[11px] text-kelly-text/85">
          <li>Gmail OAuth env: {snap.gmailOAuthConfigured ? "configured" : "incomplete"}</li>
          <li>Google Calendar OAuth env (Calendar HQ sources): {snap.googleCalendarEnvPresent ? "present" : "incomplete"}</li>
          <li>Ingest tables: Gmail rows {snap.gmailMessageCount}, contacts {snap.googleContactCount}, calendar events {snap.googleCalendarEventIngestCount}</li>
        </ul>
      </section>

      <section className={card}>
        <p className={h2}>Snapshot</p>
        <ul className="mt-1 grid gap-1 text-[11px] text-kelly-text/85 sm:grid-cols-2">
          <li>Communication identities: {snap.identityCount}</li>
          <li>Needs review: {snap.identityNeedsReview}</li>
          <li>Suppressed (SendGrid signal): {snap.identitySuppressed}</li>
          <li>Pending match candidates: {snap.pendingMatchCandidates}</li>
        </ul>
      </section>

      <section className={card}>
        <p className={h2}>Gmail ingest</p>
        <p className="mt-1 text-[10px] text-kelly-muted">
          Defaults: last ~2y window, max {500} messages, metadata/snippet. Over {500} messages requires phrase{" "}
          <code className="text-[9px]">{COMMUNICATION_INGEST_CONFIRM_PHRASE.gmailHistory}</code>. Full bodies require{" "}
          <code className="text-[9px]">{COMMUNICATION_INGEST_CONFIRM_PHRASE.gmailFullBody}</code> in the second phrase field.
        </p>
        <form action={previewGmailIngestAction} className="mt-2 space-y-1 border-t border-kelly-text/10 pt-2">
          <div className="flex flex-wrap gap-2 text-[10px]">
            <label>
              Start <input type="date" name="dateStart" defaultValue={defaultStart} className="ml-1 rounded border px-1" />
            </label>
            <label>
              End <input type="date" name="dateEnd" defaultValue={defaultEnd} className="ml-1 rounded border px-1" />
            </label>
            <label>
              Max <input type="number" name="maxMessages" defaultValue={200} className="ml-1 w-16 rounded border px-1" />
            </label>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px]">
            <label>
              <input type="checkbox" name="includeInbox" defaultChecked /> inbox
            </label>
            <label>
              <input type="checkbox" name="includeSent" defaultChecked /> sent
            </label>
            <label>
              <input type="checkbox" name="includeArchived" /> anywhere (broader)
            </label>
            <label>
              <input type="checkbox" name="includeSpam" /> spam
            </label>
            <label>
              <input type="checkbox" name="includeTrash" /> trash
            </label>
          </div>
          <button type="submit" className="rounded border border-sky-400/50 bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-950">
            Preview Gmail
          </button>
        </form>
        <form action={runGmailIngestAction} className="mt-3 space-y-1">
          <p className="text-[10px] font-bold text-kelly-navy">Import Gmail (writes DB)</p>
          <div className="flex flex-wrap gap-2 text-[10px]">
            <label>
              Start <input type="date" name="dateStart" defaultValue={defaultStart} className="ml-1 rounded border px-1" />
            </label>
            <label>
              End <input type="date" name="dateEnd" defaultValue={defaultEnd} className="ml-1 rounded border px-1" />
            </label>
            <label>
              Max <input type="number" name="maxMessages" defaultValue={200} className="ml-1 w-16 rounded border px-1" />
            </label>
            <label>
              Body mode{" "}
              <select name="bodyStorageMode" className="ml-1 rounded border px-1" defaultValue="METADATA_ONLY">
                <option value="METADATA_ONLY">Metadata + snippet</option>
                <option value="SNIPPET_AND_HEADERS">Snippet + headers (same fetch)</option>
                <option value="FULL_TEXT">Full text (requires phrase)</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px]">
            <label>
              <input type="checkbox" name="includeInbox" defaultChecked /> inbox
            </label>
            <label>
              <input type="checkbox" name="includeSent" defaultChecked /> sent
            </label>
            <label>
              <input type="checkbox" name="includeArchived" /> anywhere
            </label>
            <label>
              <input type="checkbox" name="includeSpam" /> spam
            </label>
            <label>
              <input type="checkbox" name="includeTrash" /> trash
            </label>
          </div>
          <label className="block text-[10px]">
            Phrase if &gt;500 messages:{" "}
            <input name="confirmPhraseHistory" className="mt-0.5 w-full max-w-md rounded border px-1 font-mono text-[10px]" placeholder={COMMUNICATION_INGEST_CONFIRM_PHRASE.gmailHistory} />
          </label>
          <label className="block text-[10px]">
            Phrase if full body:{" "}
            <input name="confirmPhraseBody" className="mt-0.5 w-full max-w-md rounded border px-1 font-mono text-[10px]" placeholder={COMMUNICATION_INGEST_CONFIRM_PHRASE.gmailFullBody} />
          </label>
          <button type="submit" className="mt-1 rounded border border-emerald-500/50 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-950">
            Run Gmail import
          </button>
        </form>
      </section>

      <section className={card}>
        <p className={h2}>Google Contacts (People API)</p>
        <p className="mt-1 text-[10px] text-kelly-muted">
          Uses the same staff OAuth client as Gmail; requires People scopes on the linked account. Over 1000 contacts requires{" "}
          <code className="text-[9px]">{COMMUNICATION_INGEST_CONFIRM_PHRASE.googleContacts}</code>.
        </p>
        <form action={previewGoogleContactsIngestAction} className="mt-2 flex flex-wrap items-end gap-2 border-t border-kelly-text/10 pt-2 text-[10px]">
          <label>
            Page size <input type="number" name="maxContacts" defaultValue={50} className="ml-1 w-16 rounded border px-1" />
          </label>
          <button type="submit" className="rounded border border-sky-400/50 bg-sky-50 px-2 py-0.5 font-bold text-sky-950">
            Preview contacts
          </button>
        </form>
        <form action={runGoogleContactsIngestAction} className="mt-2 flex flex-wrap items-end gap-2 text-[10px]">
          <label>
            Max contacts <input type="number" name="maxContacts" defaultValue={300} className="ml-1 w-20 rounded border px-1" />
          </label>
          <label>
            Phrase if &gt;1000:{" "}
            <input name="confirmPhrase" className="w-48 rounded border px-1 font-mono" placeholder={COMMUNICATION_INGEST_CONFIRM_PHRASE.googleContacts} />
          </label>
          <button type="submit" className="rounded border border-emerald-500/50 bg-emerald-50 px-2 py-0.5 font-bold text-emerald-950">
            Run contacts import
          </button>
        </form>
      </section>

      <section className={card}>
        <p className={h2}>Google Calendar ingest (read-only list)</p>
        <p className="mt-1 text-[10px] text-kelly-muted">
          Select an existing Calendar HQ source. Does not call events.insert/update. Over 500 events requires{" "}
          <code className="text-[9px]">{COMMUNICATION_INGEST_CONFIRM_PHRASE.calendarHistory}</code>. Private events default to redacted summary/description unless you check private details.
        </p>
        <form action={previewGoogleCalendarIngestAction} className="mt-2 space-y-1 border-t border-kelly-text/10 pt-2 text-[10px]">
          <select name="calendarSourceId" className="max-w-full rounded border px-1 py-0.5" defaultValue={calendarSources[0]?.id ?? ""}>
            {calendarSources.map((c) => (
              <option key={c.id} value={c.id}>
                {(c.displayName ?? c.label).slice(0, 80)} — {c.externalCalendarId}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            <label>
              Start <input type="date" name="calDateStart" defaultValue={defaultStart} className="ml-1 rounded border px-1" />
            </label>
            <label>
              End <input type="date" name="calDateEnd" defaultValue={calEnd} className="ml-1 rounded border px-1" />
            </label>
            <label>
              Max <input type="number" name="maxEvents" defaultValue={200} className="ml-1 w-16 rounded border px-1" />
            </label>
            <label>
              <input type="checkbox" name="includeCanceled" /> include cancelled
            </label>
          </div>
          <button type="submit" className="rounded border border-sky-400/50 bg-sky-50 px-2 py-0.5 font-bold text-sky-950">
            Preview calendar window
          </button>
        </form>
        <form action={runGoogleCalendarIngestAction} className="mt-2 space-y-1 text-[10px]">
          <select name="calendarSourceId" className="max-w-full rounded border px-1 py-0.5" defaultValue={calendarSources[0]?.id ?? ""}>
            {calendarSources.map((c) => (
              <option key={c.id} value={c.id}>
                {(c.displayName ?? c.label).slice(0, 80)}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            <label>
              Start <input type="date" name="calDateStart" defaultValue={defaultStart} className="ml-1 rounded border px-1" />
            </label>
            <label>
              End <input type="date" name="calDateEnd" defaultValue={calEnd} className="ml-1 rounded border px-1" />
            </label>
            <label>
              Max <input type="number" name="maxEvents" defaultValue={200} className="ml-1 w-16 rounded border px-1" />
            </label>
            <label>
              <input type="checkbox" name="includeCanceled" /> include cancelled
            </label>
            <label>
              <input type="checkbox" name="includePrivateDetails" /> allow private titles/descriptions/attendees
            </label>
          </div>
          <label>
            Phrase if &gt;500 events:{" "}
            <input name="confirmPhrase" className="ml-1 w-48 rounded border px-1 font-mono" placeholder={COMMUNICATION_INGEST_CONFIRM_PHRASE.calendarHistory} />
          </label>
          <button type="submit" className="rounded border border-emerald-500/50 bg-emerald-50 px-2 py-0.5 font-bold text-emerald-950">
            Run calendar import
          </button>
        </form>
      </section>

      <section className={card}>
        <p className={h2}>Match review queue</p>
        {matchRows.length === 0 ? (
          <p className="mt-1 text-[10px] text-kelly-muted">No pending candidates.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {matchRows.map((m) => (
              <li key={m.id} className="rounded border border-kelly-text/10 p-2 text-[10px]">
                <p className="font-bold text-kelly-navy">
                  {m.communicationIdentity.displayName ?? m.communicationIdentity.normalizedEmail ?? m.communicationIdentity.id}
                </p>
                <p className="text-kelly-muted">
                  → {m.targetType} <span className="font-mono">{m.targetId}</span> · confidence {m.confidence}
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <form action={approveCommunicationMatchCandidateAction}>
                    <input type="hidden" name="candidateId" value={m.id} />
                    <button type="submit" className="rounded border border-emerald-400/50 bg-emerald-50 px-2 py-0.5 font-bold">
                      Approve
                    </button>
                  </form>
                  <form action={rejectCommunicationMatchCandidateAction}>
                    <input type="hidden" name="candidateId" value={m.id} />
                    <button type="submit" className="rounded border border-rose-200 bg-rose-50 px-2 py-0.5 font-bold text-rose-900">
                      Reject
                    </button>
                  </form>
                  <Link href={`/admin/workbench/communication-intelligence/identities/${m.communicationIdentity.id}`} className="text-kelly-forest underline">
                    Identity
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={card}>
        <p className={h2}>Recent ingest runs</p>
        <ul className="mt-1 space-y-1 font-mono text-[9px] text-kelly-text/80">
          {snap.recentIngestRuns.map((r) => (
            <li key={r.id}>
              {r.createdAt.toISOString()} · {r.source} · {r.mode} · {r.status}
              {r.errorSummary ? ` · ${r.errorSummary.slice(0, 120)}` : ""}
            </li>
          ))}
        </ul>
      </section>

      <section className={card}>
        <p className={h2}>Recent Gmail subjects (ingested)</p>
        <ul className="mt-1 list-inside list-disc text-[10px] text-kelly-text/80">
          {snap.recentGmailSubjects.map((g) => (
            <li key={g.id}>{g.subject ?? "(no subject)"}</li>
          ))}
        </ul>
      </section>

      <section className={`${card} border-amber-200/70 bg-amber-50/40`}>
        <p className={h2}>Safety</p>
        <ul className="mt-1 list-inside list-disc text-[10px] text-amber-950/95">
          <li>Imported rows are not sendable audiences.</li>
          <li>Match candidates are not voter scores.</li>
          <li>Suppression flags mark identities; they do not remove SendGrid rows.</li>
          <li>Broadcast outreach still flows through governed Send Execution + preflight.</li>
        </ul>
      </section>
    </div>
  );
}
