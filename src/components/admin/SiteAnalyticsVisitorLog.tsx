"use client";

import { useMemo, useState } from "react";
import type { TrafficChannelId } from "@/lib/analytics/traffic-source";
import type { TrafficWindowDays, VisitorJourney } from "@/lib/analytics/site-traffic-aggregate";

const FILTERS: Array<{ id: "all" | TrafficChannelId; label: string }> = [
  { id: "all", label: "All" },
  { id: "search", label: "Search" },
  { id: "social", label: "Social" },
  { id: "direct", label: "Direct" },
  { id: "referral", label: "Referral" },
  { id: "campaign", label: "Campaign" },
  { id: "email", label: "Email" },
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

function formatMinutes(n: number): string {
  if (n <= 0) return "one page";
  if (n < 1) return `${Math.max(1, Math.round(n * 60))}s`;
  const minutes = Math.floor(n);
  const seconds = Math.round((n - minutes) * 60);
  return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

export function SiteAnalyticsVisitorLog({
  days,
  journeys,
  truncated,
  limit,
}: {
  days: TrafficWindowDays;
  journeys: VisitorJourney[];
  truncated: boolean;
  limit: number;
}) {
  const [open, setOpen] = useState<string | null>(journeys[0] ? `${journeys[0].startedAt}-${journeys[0].landing}` : null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const rows = useMemo(
    () => (filter === "all" ? journeys : journeys.filter((row) => row.source === filter)),
    [filter, journeys],
  );

  return (
    <section className="rounded-card border border-kelly-navy/20 bg-white p-6 shadow-sm">
      <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">
        {days === 1 ? "Last 24 hours · every visit" : "Recent visits"}
      </p>
      <h2 className="mt-2 font-heading text-2xl font-bold text-kelly-ink">
        {days === 1 ? "Every visitor in the last day" : "Visitor journeys"}
      </h2>
      <p className="mt-2 max-w-3xl font-body text-sm text-kelly-slate">
        Each row is one visit (quiet for 30 minutes starts a new visit). Open a row to see every public page they
        opened, in order. No names, emails, or IPs.
      </p>
      {days !== 1 ? (
        <p className="mt-2 font-body text-sm text-kelly-navy">
          Switch to Last 24 hours to read the full visitor log. Longer windows show the {limit} most recent visits.
        </p>
      ) : null}
      {truncated ? (
        <p className="mt-2 font-body text-xs text-amber-800">Showing the newest {limit} visits in this window.</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => setFilter(row.id)}
            className={
              filter === row.id
                ? "rounded-full bg-kelly-navy px-3 py-1 font-body text-xs font-semibold text-white"
                : "rounded-full border border-kelly-ink/15 bg-kelly-fog/50 px-3 py-1 font-body text-xs font-semibold text-kelly-navy"
            }
          >
            {row.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 font-body text-sm text-kelly-slate">No visits in this filter.</p>
      ) : (
        <ol className="mt-4 divide-y divide-kelly-ink/8">
          {rows.map((row) => {
            const key = `${row.startedAt}-${row.landing}-${row.exit}`;
            const expanded = open === key;
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : key)}
                  className="flex w-full flex-col gap-1 py-3 text-left sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <span className="font-body text-sm text-kelly-ink">
                    <span className="font-semibold text-kelly-navy">{formatWhen(row.startedAt)}</span>
                    <span className="text-kelly-slate"> · {row.sourceLabel}</span>
                    {row.returning ? <span className="text-kelly-slate"> · came back</span> : null}
                  </span>
                  <span className="font-body text-sm text-kelly-ink">
                    {row.landing}
                    {row.steps.length > 1 ? ` → ${row.exit}` : ""}
                    <span className="text-kelly-slate">
                      {" "}
                      · {row.pageViews} page{row.pageViews === 1 ? "" : "s"} · {formatMinutes(row.minutes)}
                      {row.formCompleted ? " · form finished" : row.formStarted ? " · form started" : ""}
                      {row.bounced ? " · bounced" : ""}
                    </span>
                  </span>
                </button>
                {expanded ? (
                  <div className="mb-4 rounded-lg bg-kelly-fog/50 px-4 py-3 font-body text-sm text-kelly-ink">
                    <p>
                      <span className="font-semibold">Came from:</span> {row.referrer ?? "direct / no referrer"}
                      {row.campaign ? ` · ${row.campaign}` : ""}
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold">Device:</span> {row.device}
                      {row.ctaClicked ? " · clicked a key button" : ""}
                      {row.engaged ? " · stayed or opened another page" : ""}
                    </p>
                    <p className="mt-3 font-semibold">Every page in this visit</p>
                    <ol className="mt-1 list-decimal space-y-1 pl-5">
                      {row.steps.map((step, index) => (
                        <li key={`${key}-${index}-${step}`}>
                          {index === 0 ? "Landed on " : index === row.steps.length - 1 ? "Left from " : "Then "}
                          <a href={step} target="_blank" rel="noreferrer" className="font-semibold text-kelly-navy hover:underline">
                            {step}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
