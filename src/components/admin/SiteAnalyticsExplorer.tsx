"use client";

import { useState } from "react";
import type { SiteTrafficSnapshot } from "@/lib/analytics/site-traffic-aggregate";

const TABS = [
  { id: "live", label: "Live" },
  { id: "people", label: "People" },
  { id: "acquisition", label: "Acquisition" },
  { id: "retention", label: "Retention" },
  { id: "funnel", label: "Funnel" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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

export function SiteAnalyticsExplorer({ snapshot }: { snapshot: SiteTrafficSnapshot }) {
  const [tab, setTab] = useState<TabId>(snapshot.realtime.active30 > 0 ? "live" : "people");
  const [open, setOpen] = useState<string | null>(
    snapshot.people[0] ? `${snapshot.people[0].label}-${snapshot.people[0].firstAt}` : null,
  );

  return (
    <section className="rounded-card border border-kelly-navy/20 bg-white p-6 shadow-sm">
      <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">
        Explorer · company-grade first party
      </p>
      <h2 className="mt-2 font-heading text-2xl font-bold text-kelly-ink">Everyone who showed up</h2>
      <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-kelly-slate">
        Same class of desk as Mixpanel or GA4 Explorations: live pulse, one card per anonymous visitor, source quality,
        who came back, and where the funnel drops. Timezone and browser language are the location signal. We do not
        store names, emails, IPs, or Google search words — those require a data-broker stack we are not running.
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

      {tab === "live" ? <LivePane snapshot={snapshot} /> : null}
      {tab === "people" ? <PeoplePane snapshot={snapshot} open={open} setOpen={setOpen} /> : null}
      {tab === "acquisition" ? <AcquisitionPane snapshot={snapshot} /> : null}
      {tab === "retention" ? <RetentionPane snapshot={snapshot} /> : null}
      {tab === "funnel" ? <FunnelPane snapshot={snapshot} /> : null}
    </section>
  );
}

function LivePane({ snapshot }: { snapshot: SiteTrafficSnapshot }) {
  const live = snapshot.realtime;
  return (
    <div className="mt-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Pulse label="Active now (5 min)" value={live.active5} />
        <Pulse label="Active 15 min" value={live.active15} />
        <Pulse label="Active 30 min" value={live.active30} />
      </div>
      {live.recent.length === 0 ? (
        <p className="mt-4 font-body text-sm text-kelly-slate">
          Nobody is mid-visit right now. Leave this tab open — a public page view should land here within about 10
          seconds of the recorder writing it.
        </p>
      ) : (
        <ol className="mt-4 space-y-2 font-body text-sm">
          {live.recent.map((row) => (
            <li key={`${row.at}-${row.path}`} className="flex flex-wrap justify-between gap-2 border-b border-kelly-ink/5 py-2">
              <span className="font-semibold text-kelly-navy">{row.path}</span>
              <span className="text-kelly-slate">
                {row.source} · {formatWhen(row.at)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function PeoplePane({
  snapshot,
  open,
  setOpen,
}: {
  snapshot: SiteTrafficSnapshot;
  open: string | null;
  setOpen: (value: string | null) => void;
}) {
  if (snapshot.people.length === 0) {
    return <p className="mt-4 font-body text-sm text-kelly-slate">No visitor cards in this window yet.</p>;
  }
  return (
    <ol className="mt-4 divide-y divide-kelly-ink/8">
      {snapshot.people.map((row) => {
        const key = `${row.label}-${row.firstAt}`;
        const expanded = open === key;
        return (
          <li key={key}>
            <button
              type="button"
              onClick={() => setOpen(expanded ? null : key)}
              className="flex w-full flex-col gap-1 py-3 text-left sm:flex-row sm:items-baseline sm:justify-between"
            >
              <span className="font-body text-sm text-kelly-ink">
                <span className="font-semibold text-kelly-navy">{row.neighborName ?? row.label}</span>
                {row.neighborName ? <span className="text-kelly-slate"> · {row.label}</span> : null}
                <span className="text-kelly-slate">
                  {" "}
                  · {row.sessions} session{row.sessions === 1 ? "" : "s"} · {row.uniquePages} unique pages
                </span>
                {row.converted ? <span className="text-kelly-navy"> · form finished</span> : null}
              </span>
              <span className="font-body text-sm text-kelly-slate">
                {row.sources.join(" · ") || "Direct / unknown"}
                {row.timezones[0] ? ` · ${row.timezones[0]}` : ""}
                {row.maxScroll != null ? ` · scrolled ${row.maxScroll}%` : ""}
              </span>
            </button>
            {expanded ? (
              <div className="mb-4 rounded-lg bg-kelly-fog/50 px-4 py-3 font-body text-sm text-kelly-ink">
                <p>
                  <span className="font-semibold">When:</span> {formatWhen(row.firstAt)} → {formatWhen(row.lastAt)} ·{" "}
                  {formatMinutes(row.totalMinutes)} on site
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Device / language:</span> {row.devices.join(", ") || "Unknown"}
                  {row.locales.length ? ` · ${row.locales.join(", ")}` : ""}
                  {row.formStarted && !row.converted ? " · started a form" : ""}
                  {row.outbounds ? ` · ${row.outbounds} outbound click${row.outbounds === 1 ? "" : "s"}` : ""}
                </p>
                <p className="mt-3 font-semibold">Tours</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {row.tours.map((tour) => (
                    <li key={tour}>{tour}</li>
                  ))}
                </ul>
                {row.timeline.length ? (
                  <>
                    <p className="mt-3 font-semibold">Timeline</p>
                    <ol className="mt-1 space-y-1">
                      {row.timeline.map((event) => (
                        <li key={`${event.at}-${event.name}-${event.path}`}>
                          <span className="text-kelly-slate">{formatWhen(event.at)}</span>
                          {" · "}
                          <span className="font-semibold">{event.name.replaceAll("_", " ")}</span>
                          {event.path ? ` ${event.path}` : ""}
                          {event.detail ? ` — ${event.detail}` : ""}
                        </li>
                      ))}
                    </ol>
                  </>
                ) : null}
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function AcquisitionPane({ snapshot }: { snapshot: SiteTrafficSnapshot }) {
  if (snapshot.acquisition.length === 0) {
    return <p className="mt-4 font-body text-sm text-kelly-slate">No source / medium / campaign rows yet.</p>;
  }
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[720px] text-left font-body text-sm">
        <thead>
          <tr className="border-b border-kelly-ink/10 text-[11px] uppercase tracking-wider text-kelly-slate/70">
            <th className="py-2 pr-3">Source</th>
            <th className="py-2 pr-3">Medium</th>
            <th className="py-2 pr-3">Campaign</th>
            <th className="py-2 pr-3">Sessions</th>
            <th className="py-2 pr-3">Bounce</th>
            <th className="py-2 pr-3">Pages / session</th>
            <th className="py-2 pr-3">Avg time</th>
            <th className="py-2">Forms</th>
          </tr>
        </thead>
        <tbody>
          {snapshot.acquisition.map((row) => (
            <tr key={`${row.source}-${row.medium}-${row.campaign}`} className="border-b border-kelly-ink/5">
              <td className="py-2 pr-3 font-semibold text-kelly-navy">{row.source}</td>
              <td className="py-2 pr-3">{row.medium}</td>
              <td className="py-2 pr-3">{row.campaign}</td>
              <td className="py-2 pr-3">{row.sessions}</td>
              <td className="py-2 pr-3">{formatPct(row.bounceRate)}</td>
              <td className="py-2 pr-3">{row.pagesPerSession.toFixed(1)}</td>
              <td className="py-2 pr-3">{formatMinutes(row.avgMinutes)}</td>
              <td className="py-2">{row.conversions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RetentionPane({ snapshot }: { snapshot: SiteTrafficSnapshot }) {
  const ret = snapshot.retention;
  return (
    <div className="mt-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Pulse label="Visitors in prior window" value={ret.priorVisitors} />
        <Pulse label="Came back this window" value={ret.returnedFromPrior} />
        <Pulse label="Return rate" value={ret.returnRate == null ? "—" : formatPct(ret.returnRate)} />
      </div>
      {ret.frequency.length === 0 ? (
        <p className="mt-4 font-body text-sm text-kelly-slate">Frequency fills after the first repeat visits.</p>
      ) : (
        <ul className="mt-4 space-y-2 font-body text-sm">
          {ret.frequency.map((row) => (
            <li key={row.label} className="flex justify-between gap-3 border-b border-kelly-ink/5 py-2">
              <span>{row.label}</span>
              <span className="font-semibold text-kelly-navy">{row.visitors} visitors</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FunnelPane({ snapshot }: { snapshot: SiteTrafficSnapshot }) {
  const steps = snapshot.dropFunnel.length ? snapshot.dropFunnel : snapshot.funnel.map((row) => ({ ...row, dropPct: null }));
  const max = Math.max(1, steps[0]?.count ?? 0);
  return (
    <ol className="mt-5 space-y-3">
      {steps.map((step, index) => (
        <li key={step.label}>
          <div className="flex justify-between gap-3 font-body text-sm">
            <span className="text-kelly-ink">
              {index + 1}. {step.label}
            </span>
            <span className="font-semibold text-kelly-navy">
              {step.count}
              {step.dropPct != null ? ` · dropped ${formatPct(step.dropPct)}` : ""}
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-kelly-fog">
            <div className="h-full rounded-full bg-kelly-gold" style={{ width: `${Math.max(step.count ? 8 : 0, (step.count / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function Pulse({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-kelly-ink/10 bg-kelly-fog/40 px-4 py-3">
      <p className="font-body text-[11px] font-bold uppercase tracking-wider text-kelly-slate/70">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold text-kelly-ink">{value}</p>
    </div>
  );
}
