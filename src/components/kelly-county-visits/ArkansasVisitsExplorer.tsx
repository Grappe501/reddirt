"use client";

import { useMemo, useState } from "react";
import {
  displayTitle,
  formatStopDate,
  type KellyCampaignStop,
} from "@/data/kelly-county-visits";
import { cn } from "@/lib/utils";

type Mode = "completed" | "upcoming" | "all";

type Props = {
  completed: KellyCampaignStop[];
  upcoming: KellyCampaignStop[];
  counties: string[];
};

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "America/Chicago",
  }).format(new Date(Date.UTC(y, m - 1, 1, 12)));
}

function GroupedStops({
  stops,
  empty,
  newestFirst,
}: {
  stops: KellyCampaignStop[];
  empty: string;
  newestFirst: boolean;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, KellyCampaignStop[]>();
    for (const s of stops) {
      const k = monthKey(s.date);
      const arr = map.get(k) || [];
      arr.push(s);
      map.set(k, arr);
    }
    return [...map.entries()].sort((a, b) =>
      newestFirst ? b[0].localeCompare(a[0]) : a[0].localeCompare(b[0]),
    );
  }, [stops, newestFirst]);

  if (!stops.length) {
    return (
      <p className="mt-8 rounded-lg border border-kelly-text/10 bg-kelly-text/[0.03] p-6 font-body text-sm text-kelly-text/80">
        {empty}
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-10">
      {groups.map(([ym, rows]) => (
        <section key={ym} aria-labelledby={`visits-month-${ym}`}>
          <h3
            id={`visits-month-${ym}`}
            className="font-heading text-lg font-bold text-kelly-navy md:text-xl"
          >
            {monthLabel(ym)}
            <span className="ml-2 font-body text-sm font-semibold text-kelly-muted">({rows.length})</span>
          </h3>
          <ol className="mt-4 space-y-3">
            {rows.map((stop) => {
              const pending = stop.counties.length === 0;
              return (
                <li
                  key={stop.id}
                  className={cn(
                    "rounded-lg border px-4 py-4 md:px-5",
                    pending
                      ? "border-amber-700/25 bg-amber-50/40"
                      : "border-kelly-text/10 bg-kelly-text/[0.02]",
                  )}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="font-body text-sm font-semibold text-kelly-navy">
                        {formatStopDate(stop.date)}
                      </p>
                      <h4 className="mt-1 font-heading text-lg font-bold text-kelly-text">
                        {displayTitle(stop)}
                      </h4>
                      {stop.city ? (
                        <p className="mt-1 font-body text-sm text-kelly-text/70">{stop.city}</p>
                      ) : null}
                    </div>
                    <div className="md:max-w-[50%] md:text-right">
                      {pending ? (
                        <span className="inline-flex items-center rounded-full border border-amber-700/30 bg-amber-50 px-2.5 py-1 font-body text-xs font-semibold text-amber-900">
                          County assignment pending
                        </span>
                      ) : (
                        <ul className="flex flex-wrap gap-2 md:justify-end" aria-label="Counties">
                          {stop.counties.map((c) => (
                            <li key={c}>
                              <span className="inline-flex items-center rounded-full border border-kelly-navy/20 bg-kelly-navy/8 px-2.5 py-1 font-body text-xs font-semibold text-kelly-navy">
                                {c}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

export function ArkansasVisitsExplorer({ completed, upcoming, counties }: Props) {
  const [mode, setMode] = useState<Mode>("completed");
  const [county, setCounty] = useState<string>("");

  const filtered = useMemo(() => {
    const base =
      mode === "completed" ? completed : mode === "upcoming" ? upcoming : [...completed, ...upcoming];
    const sorted =
      mode === "upcoming"
        ? [...base].sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))
        : [...base].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
    if (!county) return sorted;
    return sorted.filter((s) => s.counties.includes(county));
  }, [completed, upcoming, mode, county]);

  const modes: { id: Mode; label: string; count: number }[] = [
    { id: "completed", label: "Completed", count: completed.length },
    { id: "upcoming", label: "Upcoming", count: upcoming.length },
    { id: "all", label: "All public", count: completed.length + upcoming.length },
  ];

  return (
    <section aria-labelledby="arkansas-visits-explorer">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2
            id="arkansas-visits-explorer"
            className="font-heading text-2xl font-bold text-kelly-text md:text-3xl"
          >
            Campaign stops
          </h2>
          <p className="mt-2 max-w-2xl font-body text-base leading-relaxed text-kelly-text/80">
            Filter by completed or upcoming, and optionally by county. Summary totals above still reflect the full
            ledger.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div
            className="inline-flex rounded-lg border border-kelly-navy/20 bg-kelly-page p-1"
            role="tablist"
            aria-label="Stop list mode"
          >
            {modes.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={mode === m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  "min-h-[44px] rounded-md px-3 py-2 font-body text-sm font-semibold transition",
                  mode === m.id ? "bg-kelly-navy text-kelly-fog" : "text-kelly-navy hover:bg-kelly-navy/8",
                )}
              >
                {m.label} ({m.count})
              </button>
            ))}
          </div>
          <label className="font-body text-sm text-kelly-text/80">
            <span className="sr-only">Filter by county</span>
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="min-h-[44px] w-full min-w-[12rem] rounded-lg border border-kelly-navy/20 bg-white px-3 py-2 font-body text-sm text-kelly-navy"
            >
              <option value="">All counties</option>
              {counties.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <GroupedStops
        stops={filtered}
        newestFirst={mode !== "upcoming"}
        empty={
          mode === "upcoming"
            ? "No upcoming public stops match this filter."
            : "No public stops match this filter."
        }
      />
    </section>
  );
}
