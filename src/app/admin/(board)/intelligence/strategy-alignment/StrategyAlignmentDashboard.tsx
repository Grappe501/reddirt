"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  filterStrategicAlignments,
  loadCampaignStrategicDoctrineRegistry,
} from "@/lib/intelligence/campaignStrategicAlignment";
import type {
  CampaignNarrativeDoctrineAlignment,
  CampaignStrategicAlignmentIndex,
  CampaignStrategicAlignmentSignal,
} from "@/lib/intelligence/types/campaignStrategicAlignment";
import { CAMPAIGN_STRATEGIC_ALIGNMENT_SIGNALS } from "@/lib/intelligence/types/campaignStrategicAlignment";

type StrategyAlignmentDashboardProps = {
  index: CampaignStrategicAlignmentIndex;
};

const signalBadge: Record<CampaignStrategicAlignmentSignal, string> = {
  STRATEGICALLY_ALIGNED: "bg-emerald-100 text-emerald-900",
  STRATEGICALLY_TENSE: "bg-amber-100 text-amber-900",
  STRATEGICALLY_FRAGILE: "bg-orange-100 text-orange-900",
  STRATEGICALLY_CONTRADICTORY: "bg-rose-100 text-rose-900",
  STRATEGICALLY_UNDERDEFINED: "bg-violet-100 text-violet-900",
  STRATEGICALLY_PRIORITY: "bg-indigo-100 text-indigo-900",
};

function AlignmentCard({ row }: { row: CampaignNarrativeDoctrineAlignment }) {
  return (
    <article className="rounded-lg border border-kelly-text/10 bg-white p-3 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-kelly-navy">{row.narrativeTitle}</h3>
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${signalBadge[row.alignmentSignal]}`}>
          {row.alignmentSignal.replaceAll("_", " ")}
        </span>
        <span className="text-[10px] text-kelly-subtle">
          {(row.alignmentScore * 100).toFixed(0)}% · ops {row.operationalReadinessBand}
        </span>
      </div>

      <p className="mt-2 rounded border border-kelly-text/10 bg-kelly-page/50 p-2 font-medium text-kelly-navy">
        {row.signal}
      </p>

      <div className="mt-2 grid gap-2 sm:grid-cols-3 text-[10px] text-kelly-muted">
        <div className="rounded border border-kelly-text/10 p-2">
          <p className="font-semibold text-kelly-navy">Doctrine links</p>
          <p>{row.matchedDoctrineIds.length} matched</p>
        </div>
        <div className="rounded border border-kelly-text/10 p-2">
          <p className="font-semibold text-kelly-navy">Geographic</p>
          <p>{row.geographicDominantSignal?.replaceAll("_", " ") ?? "—"}</p>
        </div>
        <div className="rounded border border-kelly-text/10 p-2">
          <p className="font-semibold text-kelly-navy">Usage</p>
          <p>{row.usageSignal?.replaceAll("_", " ") ?? "—"}</p>
        </div>
      </div>

      {row.tensionDoctrineIds.length > 0 ? (
        <p className="mt-2 text-[10px] text-amber-900">
          Tension doctrines: {row.tensionDoctrineIds.join(", ")}
        </p>
      ) : null}

      <p className="mt-2">
        <Link href="/admin/intelligence/kim-hammer/narrative-state" className="font-semibold text-kelly-navy underline">
          NSI-1
        </Link>
        {" · "}
        <Link
          href="/admin/intelligence/kim-hammer/geographic-narrative-intelligence"
          className="font-semibold text-kelly-navy underline"
        >
          NSI-2
        </Link>
        {" · "}
        <Link
          href="/admin/intelligence/kim-hammer/narrative-usage-analytics"
          className="font-semibold text-kelly-navy underline"
        >
          NSI-3
        </Link>
      </p>
    </article>
  );
}

export function StrategyAlignmentDashboard({ index }: StrategyAlignmentDashboardProps) {
  const registry = loadCampaignStrategicDoctrineRegistry();
  const [signalFilter, setSignalFilter] = useState<CampaignStrategicAlignmentSignal | "ALL">("ALL");
  const [narrativeQuery, setNarrativeQuery] = useState("");

  const filtered = useMemo(
    () => filterStrategicAlignments(index, { signal: signalFilter, narrativeQuery }),
    [index, signalFilter, narrativeQuery],
  );

  return (
    <div>
      <section className="mb-4 rounded-xl border border-purple-200/50 bg-purple-50/40 p-4 text-xs text-purple-950">
        <p className="font-bold uppercase tracking-wider">SDI-1 · Strategic doctrine intelligence (read-only)</p>
        <p className="mt-1">
          Evaluates whether governed narratives are operationally ready, geographically appropriate, and strategically
          aligned with campaign doctrine. No autonomous strategy generation or messaging on this surface.
        </p>
      </section>

      <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Doctrine assets</p>
          <p className="mt-1 text-xl font-bold">{index.doctrineCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Narratives analyzed</p>
          <p className="mt-1 text-xl font-bold">{index.narrativeCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Priority / aligned</p>
          <p className="mt-1 text-xl font-bold">
            {index.signalCounts.STRATEGICALLY_PRIORITY + index.signalCounts.STRATEGICALLY_ALIGNED}
          </p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Tense / fragile</p>
          <p className="mt-1 text-xl font-bold">
            {index.signalCounts.STRATEGICALLY_TENSE +
              index.signalCounts.STRATEGICALLY_FRAGILE +
              index.signalCounts.STRATEGICALLY_CONTRADICTORY}
          </p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">AI doctrine warnings</p>
          <p className="mt-1 text-xl font-bold">{index.aiSuggestionAlignmentWarnings.length}</p>
        </div>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Doctrine registry</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[10px]">
            <thead className="text-kelly-subtle">
              <tr>
                <th className="px-2 py-1">Doctrine</th>
                <th className="px-2 py-1">Category</th>
                <th className="px-2 py-1">Domain</th>
                <th className="px-2 py-1">Sync</th>
                <th className="px-2 py-1">Review</th>
              </tr>
            </thead>
            <tbody>
              {registry.doctrines.map((row) => (
                <tr key={row.doctrineId} className="border-t border-kelly-text/10">
                  <td className="px-2 py-2 font-medium text-kelly-navy">{row.title}</td>
                  <td className="px-2 py-2 text-kelly-muted">{row.category}</td>
                  <td className="px-2 py-2 text-kelly-muted">{row.strategicDomain}</td>
                  <td className="px-2 py-2 text-kelly-muted">{row.synchronizationPriority}</td>
                  <td className="px-2 py-2 text-kelly-muted">{row.reviewStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {index.topStrategicTensions.length > 0 ? (
        <section className="mb-4 rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-950">Top strategic tensions</h2>
          <ul className="mt-2 space-y-2">
            {index.topStrategicTensions.map((row) => (
              <li key={row.narrativeId} className="rounded border border-amber-900/10 bg-white p-2">
                <strong>{row.narrativeTitle}:</strong> {row.signal}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {index.consistencySignals.length > 0 ? (
        <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Philosophy consistency indicators</h2>
          <ul className="mt-2 space-y-1 text-kelly-muted">
            {index.consistencySignals.map((row) => (
              <li key={`${row.doctrineId}-${row.severity}`} className="rounded border border-kelly-text/10 px-2 py-1">
                <span className="font-semibold text-kelly-navy">{row.severity}</span> · {row.signal}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {index.aiSuggestionAlignmentWarnings.length > 0 ? (
        <section className="mb-4 rounded-xl border border-violet-200/60 bg-violet-50/50 p-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-violet-950">AI suggestion alignment impact</h2>
          <ul className="mt-2 space-y-2">
            {index.aiSuggestionAlignmentWarnings.map((row) => (
              <li key={row.suggestionId} className="rounded border border-violet-900/10 bg-white p-2">
                <strong>{row.title}</strong> ({row.suggestionId}): {row.warning}
              </li>
            ))}
          </ul>
          <Link
            href="/admin/intelligence/kim-hammer/ai-suggestion-sandbox"
            className="mt-3 inline-block font-semibold text-violet-950 underline"
          >
            Open AI suggestion sandbox →
          </Link>
        </section>
      ) : null}

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Strategic alignment matrix</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Alignment signal</span>
            <select
              value={signalFilter}
              onChange={(event) =>
                setSignalFilter(event.target.value as CampaignStrategicAlignmentSignal | "ALL")
              }
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            >
              <option value="ALL">All</option>
              {CAMPAIGN_STRATEGIC_ALIGNMENT_SIGNALS.map((signal) => (
                <option key={signal} value={signal}>
                  {signal.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Narrative</span>
            <input
              type="search"
              value={narrativeQuery}
              onChange={(event) => setNarrativeQuery(event.target.value)}
              placeholder="county burden, debate…"
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        {filtered.map((row) => (
          <AlignmentCard key={row.narrativeId} row={row} />
        ))}
      </section>
    </div>
  );
}
