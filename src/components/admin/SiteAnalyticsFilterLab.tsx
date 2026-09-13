"use client";

import { useMemo, useState } from "react";
import type { VisitorJourney } from "@/lib/analytics/site-traffic-aggregate";
import type { TrafficChannelId } from "@/lib/analytics/traffic-source";

const SOURCES: Array<{ id: "all" | TrafficChannelId; label: string }> = [
  { id: "all", label: "All sources" },
  { id: "search", label: "Search" },
  { id: "social", label: "Social" },
  { id: "direct", label: "Direct" },
  { id: "referral", label: "Referral" },
  { id: "campaign", label: "Campaign" },
  { id: "email", label: "Email" },
];

const SHAPES = [
  { id: "all", label: "Any depth" },
  { id: "bounce", label: "Bounced" },
  { id: "multi", label: "2+ pages" },
  { id: "deep", label: "4+ pages" },
  { id: "converted", label: "Form finished" },
  { id: "returning", label: "Came back" },
] as const;

export function SiteAnalyticsFilterLab({ journeys }: { journeys: VisitorJourney[] }) {
  const [source, setSource] = useState<(typeof SOURCES)[number]["id"]>("all");
  const [shape, setShape] = useState<(typeof SHAPES)[number]["id"]>("all");
  const [device, setDevice] = useState("all");

  const devices = useMemo(() => ["all", ...new Set(journeys.map((row) => row.device))], [journeys]);
  const rows = useMemo(() => {
    return journeys.filter((row) => {
      if (source !== "all" && row.source !== source) return false;
      if (device !== "all" && row.device !== device) return false;
      if (shape === "bounce" && !row.bounced) return false;
      if (shape === "multi" && row.pageViews < 2) return false;
      if (shape === "deep" && row.pageViews < 4) return false;
      if (shape === "converted" && !row.formCompleted) return false;
      if (shape === "returning" && !row.returning) return false;
      return true;
    });
  }, [device, journeys, shape, source]);

  const bounced = rows.filter((row) => row.bounced).length;
  const converted = rows.filter((row) => row.formCompleted).length;
  const landings = new Map<string, number>();
  const next = new Map<string, number>();
  for (const row of rows) {
    landings.set(row.landing, (landings.get(row.landing) ?? 0) + 1);
    if (row.steps[1]) next.set(row.steps[1], (next.get(row.steps[1]) ?? 0) + 1);
  }
  const topLanding = [...landings.entries()].sort((a, b) => b[1] - a[1])[0];
  const topNext = [...next.entries()].sort((a, b) => b[1] - a[1])[0];

  return (
    <section className="rounded-card border border-kelly-navy/20 bg-white p-6 shadow-sm">
      <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">Filter lab</p>
      <h2 className="mt-2 font-heading text-2xl font-bold text-kelly-ink">Slice the visits yourself</h2>
      <p className="mt-2 font-body text-sm text-kelly-slate">
        These controls recompute bounce, landings, and next clicks from the visit log. This is how you interrogate the
        window instead of reading a poster.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {SOURCES.map((row) => (
          <Chip key={row.id} active={source === row.id} onClick={() => setSource(row.id)} label={row.label} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {SHAPES.map((row) => (
          <Chip key={row.id} active={shape === row.id} onClick={() => setShape(row.id)} label={row.label} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {devices.map((row) => (
          <Chip key={row} active={device === row} onClick={() => setDevice(row)} label={row === "all" ? "Any device" : row} />
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <Stat label="Visits in slice" value={String(rows.length)} />
        <Stat label="Bounce in slice" value={rows.length ? `${Math.round((bounced / rows.length) * 100)}%` : "—"} />
        <Stat label="Forms finished" value={String(converted)} />
        <Stat label="Top landing" value={topLanding?.[0] ?? "—"} />
      </div>
      <p className="mt-3 font-body text-sm text-kelly-ink">
        {rows.length === 0
          ? "Nothing matches this slice."
          : `In this slice, people ${topNext ? `most often go next to ${topNext[0]}` : "almost never take a second page"}.`}
      </p>
      {rows.slice(0, 8).length ? (
        <ol className="mt-4 space-y-2 font-body text-sm">
          {rows.slice(0, 8).map((row) => (
            <li key={`${row.startedAt}-${row.landing}`} className="text-kelly-navy">
              <span className="font-semibold">{row.sourceLabel}</span>
              <span className="text-kelly-slate"> · {row.steps.join(" → ")}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-kelly-navy px-3 py-1 font-body text-xs font-semibold text-white"
          : "rounded-full border border-kelly-ink/15 bg-kelly-fog/50 px-3 py-1 font-body text-xs font-semibold text-kelly-navy"
      }
    >
      {label}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-kelly-ink/10 bg-kelly-fog/40 px-3 py-2">
      <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-slate/70">{label}</p>
      <p className="mt-1 font-heading text-lg font-bold text-kelly-ink">{value}</p>
    </div>
  );
}
