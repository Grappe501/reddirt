"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import type { ElectionPlanWorkbenchSnapshot } from "@/lib/election-plan/types";
import { laneDescriptiveLabel } from "@/lib/election-plan/four-lanes-labels";
import { formatVotes } from "@/lib/election-plan/electionPlanData";
import { cn } from "@/lib/utils";

type Props = {
  forwardMotion: ElectionPlanWorkbenchSnapshot["forwardMotion"];
  standalone?: boolean;
};

type WindowFilter = "7d" | "21d" | "90d" | "election";

function statusLabel(s: string) {
  return s.replace(/_/g, " ");
}

function primaryLaneLabel(raw: string): string {
  const low = raw.toLowerCase();
  if (/lane 2|reactivation|recovery|drop-off/i.test(low)) return laneDescriptiveLabel("lane2");
  if (/lane 3|registration/i.test(low)) return laneDescriptiveLabel("lane3");
  if (/lane 4|conversion|persuasion|gop|republican/i.test(low)) return laneDescriptiveLabel("lane4");
  if (/lane 1|retention/i.test(low)) return laneDescriptiveLabel("lane1");
  if (/coverage|volunteer/i.test(low)) {
    return `${raw} · builds county presence across lanes`;
  }
  return raw;
}

export function IntelligenceOpportunitiesPanel({ forwardMotion: fm, standalone }: Props) {
  const [window, setWindow] = useState<WindowFilter>("7d");

  const stops = useMemo(() => {
    if (window === "7d") return fm.stopsNext7Days;
    if (window === "21d") return fm.stopsNext21Days;
    if (window === "election") return fm.stopsThroughElection ?? fm.stops;
    return fm.stops;
  }, [fm, window]);

  const byCluster = useMemo(() => {
    const map = new Map<string, typeof stops>();
    for (const s of stops) {
      const key = s.cluster || "Unclustered";
      const list = map.get(key) ?? [];
      list.push(s);
      map.set(key, list);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [stops]);

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">Intelligence opportunities</h1>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            Forward Motion activation queue — scored stops the campaign should pursue, promote, and activate
          </p>
        </div>
        {standalone ? (
          <Link
            href="/election-plan?tab=warRoom"
            className="rounded-md border border-[var(--ep-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
          >
            ← Executive War Room
          </Link>
        ) : null}
      </div>

      <div className="ep-warning mb-8">
        <p className="text-sm font-medium">{fm.explanation}</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          These are <strong>not</strong> Kelly&apos;s confirmed Google Calendar until OAuth sync is live. Confirmed
          public schedule: Google Calendar → CampaignEvent →{" "}
          <Link href="/campaign-calendar" className="font-semibold underline">
            /campaign-calendar
          </Link>
          .
        </p>
      </div>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{fm.nextWeekCount}</div>
          <div className="ep-stat-label">Next 7 days</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{fm.priorityWindowCount}</div>
          <div className="ep-stat-label">Priority window (21d)</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{fm.throughElectionCount ?? fm.stops.length}</div>
          <div className="ep-stat-label">Through Election Day</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{fm.avgActivationReadiness}%</div>
          <div className="ep-stat-label">Avg activation readiness</div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["7d", `Next 7 days (${fm.stopsNext7Days.length})`],
            ["21d", `Priority 21 days (${fm.stopsNext21Days.length})`],
            ["90d", `90-day queue (${fm.stops.length})`],
            ["election", `Through Nov (${fm.throughElectionCount ?? fm.stops.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setWindow(key)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-semibold",
              window === key
                ? "border-[var(--ep-navy)] bg-[var(--ep-navy)] text-white"
                : "border-[var(--ep-border)] bg-white text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <h2 className="mb-3 font-heading text-lg font-bold">Opportunity list</h2>
      {stops.length === 0 ? (
        <p className="text-sm text-[var(--ep-navy-muted)]">No opportunities in this window.</p>
      ) : (
        <div className="mb-10 overflow-x-auto ep-card">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--ep-border)] text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Event</th>
                <th className="py-2 pr-3">County</th>
                <th className="py-2 pr-3">Cluster</th>
                <th className="py-2 pr-3">Score</th>
                <th className="py-2 pr-3">Verify</th>
                <th className="py-2 pr-3">Kelly?</th>
                <th className="py-2 pr-3">Primary lane</th>
                <th className="py-2 pr-3">Next action</th>
              </tr>
            </thead>
            <tbody>
              {stops.map((s) => (
                <tr key={s.eventId} className="border-b border-[var(--ep-border)] last:border-0">
                  <td className="py-2.5 pr-3 font-mono text-xs">{s.date}</td>
                  <td className="py-2.5 pr-3 font-medium">{s.eventName}</td>
                  <td className="py-2.5 pr-3 text-[var(--ep-navy-muted)]">
                    {s.county}
                    {s.countyTier ? ` · Tier ${s.countyTier}` : ""}
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-[var(--ep-navy-muted)]">{s.cluster || "—"}</td>
                  <td className="py-2.5 pr-3 tabular-nums font-semibold">{s.effectiveScore}</td>
                  <td className="py-2.5 pr-3 text-xs">{statusLabel(s.verificationStatus)}</td>
                  <td className="py-2.5 pr-3 text-xs">{s.assignment}</td>
                  <td className="py-2.5 pr-3 text-xs leading-snug">{primaryLaneLabel(s.primaryLane)}</td>
                  <td className="py-2.5 text-xs text-[var(--ep-navy-muted)]">{s.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mb-3 font-heading text-lg font-bold">By cluster</h2>
      <div className="mb-10 grid gap-4 lg:grid-cols-2">
        {byCluster.map(([cluster, items]) => (
          <div key={cluster} className="ep-card">
            <h3 className="font-heading font-bold">{cluster}</h3>
            <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{items.length} opportunities in window</p>
            <ul className="mt-3 max-h-48 space-y-1.5 overflow-y-auto text-sm">
              {items.map((s) => (
                <li key={s.eventId} className="border-b border-[var(--ep-border)] pb-1.5 last:border-0">
                  <span className="font-medium">{s.eventName}</span>
                  <span className="text-[var(--ep-navy-muted)]">
                    {" "}
                    · {s.date} · score {s.effectiveScore}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-heading text-lg font-bold">Activation status (Mobilize · social · press)</h2>
      <div className="mb-10 overflow-x-auto ep-card">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--ep-border)] text-xs uppercase text-[var(--ep-navy-muted)]">
              <th className="py-2 pr-3">Event</th>
              <th className="py-2 pr-3">Readiness</th>
              <th className="py-2 pr-3">Mobilize</th>
              <th className="py-2 pr-3">Facebook</th>
              <th className="py-2 pr-3">Release</th>
              <th className="py-2 pr-3">Graphics</th>
              <th className="py-2 pr-3">Story</th>
            </tr>
          </thead>
          <tbody>
            {stops.slice(0, 30).map((s) => (
              <tr key={`act-${s.eventId}`} className="border-b border-[var(--ep-border)] last:border-0">
                <td className="py-2 pr-3 font-medium">{s.eventName}</td>
                <td className="py-2 pr-3 tabular-nums">{s.activationReadinessPct}%</td>
                <td className="py-2 pr-3 text-xs">{statusLabel(s.mobilizeStatus)}</td>
                <td className="py-2 pr-3 text-xs">{statusLabel(s.facebookStatus)}</td>
                <td className="py-2 pr-3 text-xs">{statusLabel(s.newsReleaseStatus)}</td>
                <td className="py-2 pr-3 text-xs">{statusLabel(s.graphicsStatus)}</td>
                <td className="py-2 pr-3 text-xs">{statusLabel(s.storyWorkflowStatus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {fm.missingPieces.length > 0 ? (
        <>
          <h2 className="mb-3 font-heading text-lg font-bold">Missing promotion pieces</h2>
          <ul className="mb-8 list-inside list-disc space-y-1 text-sm text-[var(--ep-navy-muted)]">
            {fm.missingPieces.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </>
      ) : null}

      <p className="text-xs text-[var(--ep-navy-muted)]">
        Source: Campaign Brain Forward Motion · campaign-impact scores × verification confidence ·{" "}
        <Link href="/election-plan?tab=forwardMotion" className="font-semibold underline">
          Full Forward Motion tab →
        </Link>
      </p>
    </section>
  );
}
