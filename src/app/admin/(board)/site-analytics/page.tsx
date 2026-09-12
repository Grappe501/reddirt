import type { Metadata } from "next";
import Link from "next/link";
import { SiteAnalyticsAiPanel } from "@/components/admin/SiteAnalyticsAiPanel";
import { loadSiteTrafficSnapshot, type TrafficWindowDays } from "@/lib/analytics/site-traffic";
import { describeOpenAIKeySource, getOpenAIKeySource, isOpenAIConfigured } from "@/lib/openai/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visitor analytics",
  robots: { index: false, follow: false },
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default async function SiteAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const sp = await searchParams;
  const days: TrafficWindowDays = sp.days === "30" ? 30 : 7;
  const snapshot = await loadSiteTrafficSnapshot(days);
  const openaiReady = isOpenAIConfigured();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">
          Operator desk · not public
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-kelly-ink">Visitor analytics</h1>
        <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-kelly-slate">
          First-party hits from the public site. Admin pages are excluded. This is our own log — not Google Analytics.
        </p>
        <p className="mt-2 font-body text-xs text-kelly-muted">
          OpenAI: {openaiReady ? `ready (${describeOpenAIKeySource(getOpenAIKeySource())})` : "not configured"}
        </p>
        <nav className="mt-4 flex gap-3 font-body text-sm font-semibold">
          <Link
            href="/admin/site-analytics?days=7"
            className={days === 7 ? "text-kelly-navy underline" : "text-kelly-blue hover:underline"}
          >
            Last 7 days
          </Link>
          <Link
            href="/admin/site-analytics?days=30"
            className={days === 30 ? "text-kelly-navy underline" : "text-kelly-blue hover:underline"}
          >
            Last 30 days
          </Link>
        </nav>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-card border border-kelly-ink/10 bg-white p-5 shadow-sm">
          <p className="font-body text-[11px] font-bold uppercase tracking-wider text-kelly-slate/70">Page views</p>
          <p className="mt-2 font-heading text-3xl font-bold text-kelly-ink">{snapshot.pageViews}</p>
        </div>
        <div className="rounded-card border border-kelly-ink/10 bg-white p-5 shadow-sm">
          <p className="font-body text-[11px] font-bold uppercase tracking-wider text-kelly-slate/70">Sessions</p>
          <p className="mt-2 font-heading text-3xl font-bold text-kelly-ink">{snapshot.sessions}</p>
        </div>
        <div className="rounded-card border border-kelly-ink/10 bg-white p-5 shadow-sm">
          <p className="font-body text-[11px] font-bold uppercase tracking-wider text-kelly-slate/70">One-page visits</p>
          <p className="mt-2 font-heading text-3xl font-bold text-kelly-ink">{snapshot.singlePageSessions}</p>
          <p className="mt-1 font-body text-xs text-kelly-slate">
            {snapshot.sessions
              ? `${Math.round((snapshot.singlePageSessions / snapshot.sessions) * 100)}% left after one page`
              : "No sessions yet"}
          </p>
        </div>
      </section>

      <SiteAnalyticsAiPanel days={days} openaiReady={openaiReady} />

      <section className="rounded-card border border-kelly-ink/10 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-xl font-bold text-kelly-ink">Pages with the most attention</h2>
        {snapshot.pages.length === 0 ? (
          <p className="mt-3 font-body text-sm text-kelly-slate">No public hits in this window yet.</p>
        ) : (
          <table className="mt-4 w-full text-left font-body text-sm">
            <thead>
              <tr className="border-b border-kelly-ink/10 text-[11px] uppercase tracking-wider text-kelly-slate/70">
                <th className="py-2 pr-3">Page</th>
                <th className="py-2 pr-3">Hits</th>
                <th className="py-2">Sessions</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.pages.map((row) => (
                <tr key={row.path} className="border-b border-kelly-ink/5">
                  <td className="py-2 pr-3 font-semibold text-kelly-navy">
                    <Link href={row.path} className="hover:underline" target="_blank" rel="noreferrer">
                      {row.path}
                    </Link>
                  </td>
                  <td className="py-2 pr-3">{row.hits}</td>
                  <td className="py-2">{row.sessions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-card border border-kelly-ink/10 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-xl font-bold text-kelly-ink">How people arrived</h2>
        {snapshot.referrers.length === 0 ? (
          <p className="mt-3 font-body text-sm text-kelly-slate">
            No off-site referrers yet. Direct visits and in-site clicks do not show here.
          </p>
        ) : (
          <ul className="mt-4 space-y-2 font-body text-sm">
            {snapshot.referrers.map((row) => (
              <li key={row.referrer} className="flex justify-between gap-4">
                <span className="text-kelly-ink">{row.referrer}</span>
                <span className="font-semibold text-kelly-navy">{row.hits}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-card border border-kelly-ink/10 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-xl font-bold text-kelly-ink">Campaign tags</h2>
        {snapshot.campaigns.length === 0 ? (
          <p className="mt-3 font-body text-sm text-kelly-slate">
            No utm_source / utm_medium / utm_campaign tags in this window. Add them to shared links to see which posts bring people in.
          </p>
        ) : (
          <ul className="mt-4 space-y-2 font-body text-sm">
            {snapshot.campaigns.map((row) => (
              <li key={row.campaign} className="flex justify-between gap-4">
                <span className="text-kelly-ink">{row.campaign}</span>
                <span className="font-semibold text-kelly-navy">{row.hits}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-card border border-kelly-ink/10 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-xl font-bold text-kelly-ink">Visitor paths</h2>
        <p className="mt-2 font-body text-sm text-kelly-slate">Recent sessions that opened more than one public page.</p>
        {snapshot.paths.length === 0 ? (
          <p className="mt-3 font-body text-sm text-kelly-slate">No multi-page paths in this window yet.</p>
        ) : (
          <ol className="mt-4 space-y-3 font-body text-sm">
            {snapshot.paths.map((row) => (
              <li key={`${row.hitAt}-${row.steps.join(">")}`} className="rounded-lg border border-kelly-ink/8 bg-kelly-fog/40 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-kelly-slate/60">{formatWhen(row.hitAt)}</p>
                <p className="mt-1 font-semibold text-kelly-navy">{row.steps.join(" → ")}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
