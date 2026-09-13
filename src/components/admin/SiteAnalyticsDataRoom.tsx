"use client";

import { useState } from "react";
import Link from "next/link";
import type { SiteTrafficSnapshot } from "@/lib/analytics/site-traffic-aggregate";
import { getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";

const TABS = [
  { id: "pages", label: "Every page" },
  { id: "sources", label: "Source × landing" },
  { id: "depth", label: "Depth" },
  { id: "utm", label: "UTM tags" },
  { id: "convert", label: "Conversion paths" },
  { id: "counties", label: "Counties" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function formatPct(n: number | null): string {
  if (n == null) return "—";
  return `${Math.round(n * 100)}%`;
}

export function SiteAnalyticsDataRoom({ snapshot }: { snapshot: SiteTrafficSnapshot }) {
  const [tab, setTab] = useState<TabId>("pages");

  return (
    <section className="rounded-card border border-kelly-ink/10 bg-white p-6 shadow-sm">
      <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">Data room</p>
      <h2 className="mt-2 font-heading text-2xl font-bold text-kelly-ink">Every tidbit we can prove</h2>
      <p className="mt-2 max-w-3xl font-body text-sm text-kelly-slate">
        Page-level bounce, next click, source mix, depth, tagged campaigns, and converting paths. This is the evidence
        the intelligence studio reads.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => setTab(row.id)}
            className={
              tab === row.id
                ? "rounded-full bg-kelly-navy px-3 py-1 font-body text-xs font-semibold text-white"
                : "rounded-full border border-kelly-ink/15 bg-kelly-fog/50 px-3 py-1 font-body text-xs font-semibold text-kelly-navy"
            }
          >
            {row.label}
          </button>
        ))}
      </div>

      {tab === "pages" ? (
        snapshot.pageIntel.length === 0 ? (
          <p className="mt-4 font-body text-sm text-kelly-slate">No page intelligence yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left font-body text-sm">
              <thead>
                <tr className="border-b border-kelly-ink/10 text-[11px] uppercase tracking-wider text-kelly-slate/70">
                  <th className="py-2 pr-3">Page</th>
                  <th className="py-2 pr-3">Hits</th>
                  <th className="py-2 pr-3">Landings</th>
                  <th className="py-2 pr-3">Landing bounce</th>
                  <th className="py-2 pr-3">Exits</th>
                  <th className="py-2 pr-3">Next click</th>
                  <th className="py-2">Top source</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.pageIntel.map((row) => (
                  <tr key={row.path} className="border-b border-kelly-ink/5">
                    <td className="py-2 pr-3 font-semibold text-kelly-navy">
                      <Link href={row.path} target="_blank" rel="noreferrer" className="hover:underline">
                        {row.path}
                      </Link>
                    </td>
                    <td className="py-2 pr-3">{row.hits}</td>
                    <td className="py-2 pr-3">{row.landings}</td>
                    <td className="py-2 pr-3">{formatPct(row.landingBounceRate)}</td>
                    <td className="py-2 pr-3">{row.exits}</td>
                    <td className="py-2 pr-3">{row.next ? `${row.next} (${row.nextHits})` : "—"}</td>
                    <td className="py-2">{row.topSource ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}

      {tab === "sources" ? (
        snapshot.sourceLandings.length === 0 ? (
          <p className="mt-4 font-body text-sm text-kelly-slate">No source × landing pairs yet.</p>
        ) : (
          <table className="mt-4 w-full text-left font-body text-sm">
            <thead>
              <tr className="border-b border-kelly-ink/10 text-[11px] uppercase tracking-wider text-kelly-slate/70">
                <th className="py-2 pr-3">Came from</th>
                <th className="py-2 pr-3">Landed on</th>
                <th className="py-2 pr-3">Visits</th>
                <th className="py-2">Bounced</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.sourceLandings.map((row) => (
                <tr key={`${row.source}-${row.landing}`} className="border-b border-kelly-ink/5">
                  <td className="py-2 pr-3 font-semibold text-kelly-ink">{row.source}</td>
                  <td className="py-2 pr-3 text-kelly-navy">{row.landing}</td>
                  <td className="py-2 pr-3">{row.sessions}</td>
                  <td className="py-2">{formatPct(row.bounceRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      ) : null}

      {tab === "depth" ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-4">
          {snapshot.depth.map((row) => (
            <li key={row.label} className="rounded-xl border border-kelly-ink/10 bg-kelly-fog/40 px-4 py-3">
              <p className="font-body text-xs uppercase tracking-wider text-kelly-slate/70">{row.label}</p>
              <p className="mt-1 font-heading text-2xl font-bold text-kelly-ink">{row.sessions}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {tab === "utm" ? (
        snapshot.utmRows.length === 0 ? (
          <p className="mt-4 font-body text-sm text-kelly-slate">
            No utm tags yet. Add utm_source, utm_medium, and utm_campaign on shared links.
          </p>
        ) : (
          <table className="mt-4 w-full text-left font-body text-sm">
            <thead>
              <tr className="border-b border-kelly-ink/10 text-[11px] uppercase tracking-wider text-kelly-slate/70">
                <th className="py-2 pr-3">Source</th>
                <th className="py-2 pr-3">Medium</th>
                <th className="py-2 pr-3">Campaign</th>
                <th className="py-2">Hits</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.utmRows.map((row) => (
                <tr key={`${row.source}-${row.medium}-${row.campaign}`} className="border-b border-kelly-ink/5">
                  <td className="py-2 pr-3">{row.source}</td>
                  <td className="py-2 pr-3">{row.medium}</td>
                  <td className="py-2 pr-3">{row.campaign}</td>
                  <td className="py-2 font-semibold">{row.hits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      ) : null}

      {tab === "convert" ? (
        snapshot.conversionPaths.length === 0 ? (
          <p className="mt-4 font-body text-sm text-kelly-slate">No form finishes in this window, so there is no converting path yet.</p>
        ) : (
          <ol className="mt-4 space-y-3 font-body text-sm">
            {snapshot.conversionPaths.map((row) => (
              <li key={row.steps.join(">")}>
                <span className="font-semibold text-kelly-navy">{row.steps.join(" → ")}</span>
                <span className="text-kelly-slate"> · {row.count}</span>
              </li>
            ))}
          </ol>
        )
      ) : null}

      {tab === "counties" ? (
        snapshot.counties.length === 0 ? (
          <p className="mt-4 font-body text-sm text-kelly-slate">No county-page hits in this window.</p>
        ) : (
          <ul className="mt-4 space-y-2 font-body text-sm">
            {snapshot.counties.map((row) => (
              <li key={row.label} className="flex justify-between gap-3">
                <Link href={`/counties/${row.label}`} className="font-semibold text-kelly-navy hover:underline" target="_blank" rel="noreferrer">
                  {getRegistryCountyBySlug(row.label)?.displayName ?? row.label}
                </Link>
                <span>{row.hits}</span>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </section>
  );
}
