import Link from "next/link";
import { getGoogleCalendarEnv, isGoogleCalendarConfigured } from "@/lib/calendar/env";
import { getKellyGoogleLaneStatus, listSafeCalendarSourceStatuses } from "@/lib/calendar/google-calendar-source-status";

export const dynamic = "force-dynamic";

function badge(ok: boolean, yes = "configured", no = "missing") {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${ok ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}>
      {ok ? yes : no}
    </span>
  );
}

export default async function GoogleCalendarSetupPage() {
  const [sources, lanes] = await Promise.all([
    listSafeCalendarSourceStatuses(),
    getKellyGoogleLaneStatus(),
  ]);
  const anchor = sources.find((source) => source.hasRefreshToken);
  const configured = isGoogleCalendarConfigured();
  const googleEnv = getGoogleCalendarEnv();

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-6">
      <div className="font-body text-xs text-kelly-muted">
        <Link href="/admin/calendar-command-center" className="text-kelly-text underline-offset-2 hover:underline">← Command center</Link>
        {" · "}
        <span>Google Calendar setup</span>
      </div>

      <header className="rounded-lg border border-kelly-text/15 bg-[#f7f2e8] px-5 py-5 shadow-sm">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Staff-only calendar lanes</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-text">Kelly Google Calendar Setup</h1>
        <p className="mt-2 max-w-3xl font-body text-sm text-kelly-text/75">
          Connect the intended Google account, create/find Kelly Campaign — Tentative and Kelly Campaign — Confirmed, then run the CLI smoke test.
          Tokens stay server-side and are never shown here.
        </p>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border bg-white px-4 py-3">
          <p className="text-[10px] uppercase text-kelly-subtle">OAuth env</p>
          <p className="mt-1">{badge(configured)}</p>
        </div>
        <div className="rounded-lg border bg-white px-4 py-3">
          <p className="text-[10px] uppercase text-kelly-subtle">Anchor source</p>
          <p className="mt-1">{badge(Boolean(anchor), "refresh token present", "no refresh token")}</p>
          {anchor ? <code className="mt-2 block break-all text-xs">{anchor.id}</code> : null}
        </div>
        <div className="rounded-lg border bg-white px-4 py-3">
          <p className="text-[10px] uppercase text-kelly-subtle">Next command</p>
          <code className="mt-1 block text-xs">npm run calendar:google:ensure</code>
        </div>
      </section>

      <section className="rounded-lg border border-amber-700/25 bg-amber-50 px-5 py-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-amber-900/70">Active OAuth redirect URI</p>
        <code className="mt-2 block break-all rounded bg-white/80 px-3 py-2 font-body text-xs text-amber-950">
          {googleEnv.redirectUri || "Missing GOOGLE_CALENDAR_REDIRECT_URI"}
        </code>
        <p className="mt-2 font-body text-xs text-amber-950/75">
          This exact URI must be present in Google Cloud OAuth Authorized redirect URIs before clicking Connect.
        </p>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-kelly-text">Connect Google Calendar</h2>
            <p className="mt-1 font-body text-sm text-kelly-muted">Requires offline access and a refresh token. Use the intended calendar owner account.</p>
          </div>
          <a
            href="/api/admin/google-calendar/connect"
            className={`rounded-lg px-4 py-2 font-body text-sm font-bold text-white ${configured ? "bg-kelly-text hover:bg-kelly-text/90" : "pointer-events-none bg-zinc-400"}`}
          >
            Connect Google Calendar
          </a>
        </div>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white px-5 py-4">
        <h2 className="font-heading text-lg font-bold text-kelly-text">Kelly lanes</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded border border-kelly-text/10 bg-kelly-page/60 px-3 py-3">
            <p className="font-semibold">Kelly Campaign — Tentative</p>
            <p className="mt-1 text-xs text-kelly-muted">{lanes.tentative ? lanes.tentative.id : "Not created yet"}</p>
            <p className="mt-1">{badge(Boolean(lanes.tentative?.hasRefreshToken), "refresh token present", "missing")}</p>
          </div>
          <div className="rounded border border-kelly-text/10 bg-kelly-page/60 px-3 py-3">
            <p className="font-semibold">Kelly Campaign — Confirmed</p>
            <p className="mt-1 text-xs text-kelly-muted">{lanes.confirmed ? lanes.confirmed.id : "Not created yet"}</p>
            <p className="mt-1">{badge(Boolean(lanes.confirmed?.hasRefreshToken), "refresh token present", "missing")}</p>
          </div>
        </div>
      </section>

      <section className="overflow-x-auto rounded-lg border border-kelly-text/12 bg-white">
        <table className="min-w-[900px] w-full border-collapse font-body text-xs">
          <thead className="bg-kelly-wash/50 text-left uppercase text-kelly-muted">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Google calendar</th>
              <th className="px-3 py-2">Sync</th>
              <th className="px-3 py-2">OAuth</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.id} className="border-t border-kelly-text/10">
                <td className="px-3 py-2">{source.name}</td>
                <td className="px-3 py-2"><code>{source.id}</code></td>
                <td className="px-3 py-2">{source.sourceType}</td>
                <td className="px-3 py-2">{source.externalCalendarId}</td>
                <td className="px-3 py-2">{source.syncEnabled ? "enabled" : "off"}</td>
                <td className="px-3 py-2">{source.hasRefreshToken ? "refresh token yes" : source.hasOauthJson ? "oauth, no refresh" : "none"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
