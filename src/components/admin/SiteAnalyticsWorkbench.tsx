import Link from "next/link";
import type { ReactNode } from "react";
import { SiteAnalyticsCommandBoard } from "@/components/admin/SiteAnalyticsCommandBoard";
import { SiteAnalyticsDataRoom } from "@/components/admin/SiteAnalyticsDataRoom";
import { SiteAnalyticsExplorer } from "@/components/admin/SiteAnalyticsExplorer";
import { SiteAnalyticsFilterLab } from "@/components/admin/SiteAnalyticsFilterLab";
import { SiteAnalyticsJourneyDesk } from "@/components/admin/SiteAnalyticsJourneyDesk";
import { SiteAnalyticsSeoDesk } from "@/components/admin/SiteAnalyticsSeoDesk";
import { SiteAnalyticsVisitorLog } from "@/components/admin/SiteAnalyticsVisitorLog";
import { SiteAnalyticsWarRoom } from "@/components/admin/SiteAnalyticsWarRoom";
import { pctChange, type SiteTrafficSnapshot, type TrafficWindowDays } from "@/lib/analytics/site-traffic-aggregate";
import type { SiteTrafficIntelligence } from "@/lib/analytics/site-traffic-intelligence";
import { getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";

const WINDOWS: Array<{ days: TrafficWindowDays; label: string }> = [
  { days: 1, label: "Last 24 hours" },
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" },
];

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDay(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return ymd;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  });
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

function formatMinutes(n: number): string {
  if (n <= 0) return "—";
  if (n < 1) return `${Math.max(1, Math.round(n * 60))}s`;
  const minutes = Math.floor(n);
  const seconds = Math.round((n - minutes) * 60);
  return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

function formatPct(n: number | null): string {
  if (n == null) return "—";
  return `${Math.round(n * 100)}%`;
}

function deltaLabel(current: number, prior: number | null | undefined): string | null {
  if (prior == null) return null;
  const change = pctChange(current, prior);
  if (change == null) return null;
  const rounded = Math.round(change);
  if (rounded === 0) return "flat vs prior window";
  return `${rounded > 0 ? "+" : ""}${rounded}% vs prior window`;
}

function BarList({
  rows,
  empty,
}: {
  rows: Array<{ label: string; hits: number; href?: string }>;
  empty: string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.hits));
  if (rows.length === 0) {
    return <p className="mt-3 font-body text-sm text-kelly-slate">{empty}</p>;
  }
  return (
    <ul className="mt-4 space-y-2.5">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="flex items-baseline justify-between gap-3 font-body text-sm">
            {row.href ? (
              <Link href={row.href} target="_blank" rel="noreferrer" className="font-semibold text-kelly-navy hover:underline">
                {row.label}
              </Link>
            ) : (
              <span className="text-kelly-ink">{row.label}</span>
            )}
            <span className="shrink-0 font-semibold text-kelly-navy">{formatNumber(row.hits)}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-kelly-fog">
            <div className="h-full rounded-full bg-kelly-navy" style={{ width: `${Math.max(6, (row.hits / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-card border border-kelly-ink/10 bg-white p-6 shadow-sm">
      <h2 className="font-heading text-xl font-bold text-kelly-ink">{title}</h2>
      {children}
    </section>
  );
}

export function SiteAnalyticsWorkbench({
  snapshot,
  intel,
  openaiReady,
  readError,
  newestEventAt,
}: {
  snapshot: SiteTrafficSnapshot;
  intel: SiteTrafficIntelligence;
  openaiReady: boolean;
  readError?: string | null;
  newestEventAt?: string | null;
}) {
  const days = snapshot.days;
  const prior = snapshot.prior;
  const maxDay = Math.max(1, ...snapshot.daysSeries.map((row) => row.pageViews));
  const maxHour = Math.max(1, ...snapshot.hours.map((row) => row.hits));
  const peakHour = snapshot.hours.reduce((best, row) => (row.hits > best.hits ? row : best), snapshot.hours[0] ?? { hour: 0, hits: 0 });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">
          Operator desk · not public
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-kelly-ink">Visitor analytics</h1>
        <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-kelly-slate">
          First-party explorer from kellygrappe.com — Mixpanel-grade journeys, not a page-view counter. Admin and FEC
          research pages are excluded. Each anonymous visitor gets a card: source, timezone, every page, time on page,
          scroll, outbound clicks, and whether they came back. We do not store names, emails, or IPs.
        </p>
        <p className="mt-2 font-body text-xs text-kelly-muted">
          A session is a visit that goes quiet for 30 minutes. Times are Arkansas time. Comparison is the same number of days
          right before this window.
        </p>
        {readError ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-900">
            {readError} Empty counts here do not mean the public site was quiet.
          </p>
        ) : null}
        {!readError && snapshot.pageViews === 0 ? (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 font-body text-sm text-amber-950">
            {newestEventAt
              ? `This database has hits, but none in this window. Newest stored public hit: ${formatWhen(newestEventAt)} Arkansas time.`
              : "This database has no stored public page views. The live site was not recording visits to /api/analytics — that recorder is being restored on Netlify. Hours already spent on the site were not saved."}
          </p>
        ) : null}
        {snapshot.truncated ? (
          <p className="mt-2 font-body text-xs text-amber-800">
            This window hit the 12,000-event cap. The newest rows are still here; older ones in the comparison window may be
            thin.
          </p>
        ) : null}
        <nav className="mt-4 flex flex-wrap gap-3 font-body text-sm font-semibold">
          {WINDOWS.map((window) => (
            <Link
              key={window.days}
              href={`/admin/site-analytics?days=${window.days}`}
              className={days === window.days ? "text-kelly-navy underline" : "text-kelly-blue hover:underline"}
            >
              {window.label}
            </Link>
          ))}
        </nav>
      </header>

      <SiteAnalyticsCommandBoard days={days} openaiReady={openaiReady} intel={intel} />

      <SiteAnalyticsWarRoom
        hypotheses={snapshot.hypotheses}
        grades={snapshot.landingGrades}
        clusters={snapshot.pathClusters}
        heat={snapshot.heat}
        deviceSource={snapshot.deviceSource}
        pulse={snapshot.pulse}
        medianMinutes={snapshot.medianSessionMinutes}
      />
      <SiteAnalyticsExplorer snapshot={snapshot} />
      <SiteAnalyticsFilterLab journeys={snapshot.journeys} />

      <section className="rounded-card border border-kelly-navy/15 bg-kelly-fog/40 p-6">
        <h2 className="font-heading text-xl font-bold text-kelly-ink">What this window means</h2>
        <ul className="mt-3 space-y-2 font-body text-sm leading-relaxed text-kelly-ink">
          {snapshot.analysis.map((row) => (
            <li key={row}>{row}</li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Page views"
          value={formatNumber(snapshot.pageViews)}
          hint={deltaLabel(snapshot.pageViews, prior?.pageViews)}
        />
        <Kpi
          label="Visitors"
          value={formatNumber(snapshot.visitors)}
          hint={deltaLabel(snapshot.visitors, prior?.visitors)}
        />
        <Kpi
          label="Sessions"
          value={formatNumber(snapshot.sessions)}
          hint={deltaLabel(snapshot.sessions, prior?.sessions)}
        />
        <Kpi
          label="Bounce rate"
          value={formatPct(snapshot.bounceRate)}
          hint={
            snapshot.bounceRate == null
              ? "No sessions yet"
              : deltaLabel(snapshot.bounceRate, prior?.bounceRate ?? null) ??
                `${formatNumber(snapshot.singlePageSessions)} left after one page`
          }
        />
        <Kpi label="Pages / session" value={snapshot.sessions ? snapshot.pagesPerSession.toFixed(1) : "—"} />
        <Kpi label="Avg. time on site" value={formatMinutes(snapshot.avgSessionMinutes)} />
        <Kpi
          label="Engaged visits"
          value={formatPct(snapshot.engageRate)}
          hint={`${formatNumber(snapshot.engagedSessions)} stayed 15 seconds or opened another page`}
        />
        <Kpi
          label="Forms finished"
          value={formatNumber(snapshot.formCompletes)}
          hint={
            snapshot.formStarts
              ? `${formatNumber(snapshot.formStarts)} started · ${formatNumber(snapshot.ctaClicks)} key button clicks`
              : `${formatNumber(snapshot.ctaClicks)} key button clicks`
          }
        />
        <Kpi
          label="New visitors"
          value={formatNumber(snapshot.newVisitors)}
          hint={`${formatNumber(snapshot.returningVisitors)} came back in this window`}
        />
        <Kpi
          label="Deep visits"
          value={formatNumber(snapshot.deepSessions)}
          hint="Four or more public pages in one visit"
        />
        <Kpi
          label="Search share"
          value={snapshot.seo.share == null ? "—" : `${Math.round(snapshot.seo.share * 100)}%`}
          hint={`${formatNumber(snapshot.seo.sessions)} search sessions`}
        />
        <Kpi
          label="Returning sessions"
          value={formatNumber(snapshot.returningSessions)}
          hint="Same browser came back after 30 quiet minutes"
        />
      </section>

      <SiteAnalyticsSeoDesk seo={snapshot.seo} sessions={snapshot.sessions} />
      <SiteAnalyticsJourneyDesk
        channels={snapshot.channels}
        transitions={snapshot.transitions}
        landingNext={snapshot.landingNext}
      />
      <SiteAnalyticsVisitorLog
        days={days}
        journeys={snapshot.journeys}
        truncated={snapshot.journeysTruncated}
        limit={snapshot.journeyLimit}
      />
      <SiteAnalyticsDataRoom snapshot={snapshot} />

      <section className="grid gap-4 lg:grid-cols-3">
        <Card title="Machine reads">
          <ul className="mt-3 space-y-2 font-body text-sm leading-relaxed text-kelly-ink">
            {intel.reasons.map((row) => (
              <li key={row}>{row}</li>
            ))}
          </ul>
        </Card>
        <Card title="Leaking pages">
          {intel.leaks.length === 0 ? (
            <p className="mt-3 font-body text-sm text-kelly-slate">Not enough exits to flag a leak yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 font-body text-sm text-kelly-ink">
              {intel.leaks.map((row) => (
                <li key={row.page}>
                  <Link href={row.page} target="_blank" rel="noreferrer" className="font-semibold text-kelly-navy hover:underline">
                    {row.page}
                  </Link>
                  <span className="text-kelly-slate"> — {row.note}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Arkansas coverage">
          <p className="mt-3 font-heading text-3xl font-bold text-kelly-ink">{intel.countyCoverage} / 75</p>
          <p className="mt-1 font-body text-sm text-kelly-slate">County pages with at least one public hit.</p>
          {intel.countyNames.length ? (
            <p className="mt-3 font-body text-sm text-kelly-ink">{intel.countyNames.join(" · ")}</p>
          ) : null}
        </Card>
      </section>

      <Card title="Daily attention">
        {snapshot.pageViews === 0 ? (
          <p className="mt-3 font-body text-sm text-kelly-slate">No public hits in this window yet.</p>
        ) : (
          <>
            <div className="mt-5 flex h-40 items-end gap-1">
              {snapshot.daysSeries.map((row) => (
                <div key={row.date} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                  <div
                    className="w-full rounded-t bg-kelly-navy/85"
                    style={{ height: `${Math.max(row.pageViews ? 8 : 2, (row.pageViews / maxDay) * 100)}%` }}
                    title={`${formatDay(row.date)}: ${row.pageViews} views, ${row.sessions} sessions`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between font-body text-[11px] text-kelly-slate/70">
              <span>{formatDay(snapshot.daysSeries[0]?.date ?? "")}</span>
              <span>{formatDay(snapshot.daysSeries[snapshot.daysSeries.length - 1]?.date ?? "")}</span>
            </div>
          </>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="When neighbors show up">
          <p className="mt-2 font-body text-sm text-kelly-slate">
            {snapshot.pageViews
              ? `Busiest hour: ${((peakHour.hour + 11) % 12) + 1}${peakHour.hour >= 12 ? " p.m." : " a.m."} Arkansas time.`
              : "Hours fill after the first public hits."}
          </p>
          <div className="mt-4 flex h-24 items-end gap-0.5">
            {snapshot.hours.map((row) => (
              <div
                key={row.hour}
                className="flex-1 rounded-t bg-kelly-gold/80"
                style={{ height: `${Math.max(row.hits ? 6 : 2, (row.hits / maxHour) * 100)}%` }}
                title={`${row.hour}:00 — ${row.hits} views`}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between font-body text-[11px] text-kelly-slate/70">
            <span>12 a.m.</span>
            <span>Noon</span>
            <span>11 p.m.</span>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 font-body text-sm text-kelly-ink sm:grid-cols-4">
            {snapshot.weekdays.map((row) => (
              <li key={row.label} className="flex justify-between gap-2">
                <span className="text-kelly-slate">{row.label.slice(0, 3)}</span>
                <span className="font-semibold">{formatNumber(row.hits)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Path to action">
          <ol className="mt-4 space-y-3">
            {snapshot.funnel.map((step, index) => {
              const max = Math.max(1, snapshot.funnel[0]?.count ?? 0);
              return (
                <li key={step.label}>
                  <div className="flex justify-between gap-3 font-body text-sm">
                    <span className="text-kelly-ink">
                      {index + 1}. {step.label}
                    </span>
                    <span className="font-semibold text-kelly-navy">{formatNumber(step.count)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-kelly-fog">
                    <div className="h-full rounded-full bg-kelly-gold" style={{ width: `${Math.max(step.count ? 8 : 0, (step.count / max) * 100)}%` }} />
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Where visits start">
          <BarList
            rows={snapshot.landingPages.map((row) => ({ label: row.path, hits: row.hits, href: row.path }))}
            empty="No landing pages yet."
          />
        </Card>
        <Card title="Where visits end">
          <BarList
            rows={snapshot.exitPages.map((row) => ({ label: row.path, hits: row.hits, href: row.path }))}
            empty="No exit pages yet."
          />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="What they came to read">
          <BarList rows={snapshot.sections} empty="Sections appear after the first public page views." />
        </Card>
        <Card title="County pages">
          <BarList
            rows={snapshot.counties.map((row) => ({
              label: getRegistryCountyBySlug(row.label)?.displayName ?? row.label,
              hits: row.hits,
              href: `/counties/${row.label}`,
            }))}
            empty="No /counties hits in this window. County pages light up when neighbors open a specific county."
          />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Devices">
          <BarList rows={snapshot.devices} empty="Device class starts on the next live page view." />
        </Card>
        <Card title="Raw referrer hosts">
          <BarList
            rows={snapshot.referrers.map((row) => ({ label: row.referrer, hits: row.hits }))}
            empty="No off-site referrers yet. Direct visits and in-site clicks do not show here."
          />
        </Card>
        <Card title="Campaign tags">
          <BarList
            rows={snapshot.campaigns.map((row) => ({ label: row.campaign, hits: row.hits }))}
            empty="No utm tags yet. Add utm_source / utm_medium / utm_campaign on shared links."
          />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Forms">
          {snapshot.forms.length === 0 ? (
            <p className="mt-3 font-body text-sm text-kelly-slate">No form starts or finishes in this window.</p>
          ) : (
            <table className="mt-4 w-full text-left font-body text-sm">
              <thead>
                <tr className="border-b border-kelly-ink/10 text-[11px] uppercase tracking-wider text-kelly-slate/70">
                  <th className="py-2 pr-3">Form</th>
                  <th className="py-2 pr-3">Started</th>
                  <th className="py-2">Finished</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.forms.map((row) => (
                  <tr key={row.formType} className="border-b border-kelly-ink/5">
                    <td className="py-2 pr-3 font-semibold text-kelly-ink">{row.formType.replaceAll("_", " ")}</td>
                    <td className="py-2 pr-3">{formatNumber(row.starts)}</td>
                    <td className="py-2">{formatNumber(row.completes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card title="Key buttons">
          <BarList
            rows={snapshot.ctas}
            empty="Donate, volunteer, host, and voter-registration clicks will show here after neighbors use those buttons."
          />
          {snapshot.locales.length ? (
            <p className="mt-4 font-body text-xs text-kelly-slate">
              Browser language: {snapshot.locales.map((row) => `${row.label} (${row.hits})`).join(" · ")}
            </p>
          ) : null}
        </Card>
      </div>

      <Card title="Pages with the most attention">
        {snapshot.pages.length === 0 ? (
          <p className="mt-3 font-body text-sm text-kelly-slate">No public hits in this window yet.</p>
        ) : (
          <table className="mt-4 w-full text-left font-body text-sm">
            <thead>
              <tr className="border-b border-kelly-ink/10 text-[11px] uppercase tracking-wider text-kelly-slate/70">
                <th className="py-2 pr-3">Page</th>
                <th className="py-2 pr-3">Hits</th>
                <th className="py-2 pr-3">Visitors</th>
                <th className="py-2">Share</th>
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
                  <td className="py-2 pr-3">{formatNumber(row.hits)}</td>
                  <td className="py-2 pr-3">{formatNumber(row.sessions)}</td>
                  <td className="py-2">
                    {snapshot.pageViews ? `${Math.round((row.hits / snapshot.pageViews) * 100)}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card title="Multi-page paths (compressed)">
        <p className="mt-2 font-body text-sm text-kelly-slate">
          Same journeys as the visitor log, limited to people who opened more than one page.
        </p>
        {snapshot.paths.length === 0 ? (
          <p className="mt-3 font-body text-sm text-kelly-slate">No multi-page paths in this window yet.</p>
        ) : (
          <ol className="mt-4 space-y-3 font-body text-sm">
            {snapshot.paths.map((row) => (
              <li key={`${row.hitAt}-${row.steps.join(">")}`} className="rounded-lg border border-kelly-ink/8 bg-kelly-fog/40 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-kelly-slate/60">
                  {formatWhen(row.hitAt)}
                  {row.minutes >= 0.2 ? ` · ${formatMinutes(row.minutes)} on site` : ""}
                </p>
                <p className="mt-1 font-semibold text-kelly-navy">{row.steps.join(" → ")}</p>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string | null }) {
  return (
    <div className="rounded-card border border-kelly-ink/10 bg-white p-5 shadow-sm">
      <p className="font-body text-[11px] font-bold uppercase tracking-wider text-kelly-slate/70">{label}</p>
      <p className="mt-2 font-heading text-3xl font-bold text-kelly-ink">{value}</p>
      {hint ? <p className="mt-1 font-body text-xs text-kelly-slate">{hint}</p> : null}
    </div>
  );
}
