"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { filterGeographicCountyStates } from "@/lib/opposition/kimHammerGeographicNarrativeState";
import type {
  KimHammerGeographicCountyState,
  KimHammerGeographicNarrativeIndex,
  KimHammerGeographicReadinessSignal,
  KimHammerNarrativeCountyState,
} from "@/lib/opposition/types/kimHammerGeographicNarrative";
import { KIM_HAMMER_GEOGRAPHIC_READINESS_SIGNALS } from "@/lib/opposition/types/kimHammerGeographicNarrative";

type KimHammerGeographicNarrativeDashboardProps = {
  index: KimHammerGeographicNarrativeIndex;
};

const signalBadge: Record<KimHammerGeographicReadinessSignal, string> = {
  COUNTY_STRONG: "bg-emerald-100 text-emerald-900",
  COUNTY_MODERATE: "bg-sky-100 text-sky-900",
  COUNTY_WEAK: "bg-amber-100 text-amber-900",
  COUNTY_BLOCKED: "bg-rose-100 text-rose-900",
  COUNTY_OVEREXPOSED: "bg-orange-100 text-orange-900",
  COUNTY_UNDERDEVELOPED: "bg-violet-100 text-violet-900",
};

function NarrativeCellRow({ cell }: { cell: KimHammerNarrativeCountyState }) {
  return (
    <tr className="border-t border-kelly-text/10">
      <td className="px-2 py-2 font-medium text-kelly-navy">{cell.narrativeTitle}</td>
      <td className="px-2 py-2">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${signalBadge[cell.geographicSignal]}`}>
          {cell.geographicSignal.replaceAll("_", " ")}
        </span>
      </td>
      <td className="px-2 py-2 text-kelly-muted">{(cell.geographicScore * 100).toFixed(0)}%</td>
      <td className="px-2 py-2 text-kelly-muted">{cell.baseReadinessBand}</td>
      <td className="px-2 py-2 text-kelly-muted">{cell.exportUsageCount}</td>
      <td className="px-2 py-2 text-[10px] text-kelly-muted">{cell.localMediaRisk} / {cell.localDebateRelevance}</td>
    </tr>
  );
}

function CountyPanel({ county }: { county: KimHammerGeographicCountyState }) {
  return (
    <article className="rounded-lg border border-kelly-text/10 bg-white p-3 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-kelly-navy">{county.countyName}</h3>
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${signalBadge[county.dominantSignal]}`}>
          {county.dominantSignal.replaceAll("_", " ")}
        </span>
        <span className="text-[10px] text-kelly-subtle">avg {(county.averageScore * 100).toFixed(0)}%</span>
      </div>

      <p className="mt-2 text-kelly-muted">{county.localOperationalImpact}</p>
      <p className="mt-2 rounded border border-kelly-text/10 bg-kelly-page/40 p-2 text-kelly-navy">{county.topRiskSignal}</p>

      <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-kelly-subtle">
        <span>Sensitivity: {county.localSensitivity}</span>
        <span>Exports: {county.exportUsageCount}</span>
        <span>Blocked: {county.blockedNarrativeCount}</span>
        <span>Overexposed: {county.overexposedNarrativeCount}</span>
        <span>Underdeveloped: {county.underdevelopedNarrativeCount}</span>
      </div>

      {county.countyBurdenSignals.length > 0 ? (
        <ul className="mt-2 list-inside list-disc text-[10px] text-kelly-muted">
          {county.countyBurdenSignals.map((row) => (
            <li key={row}>{row}</li>
          ))}
        </ul>
      ) : null}

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[10px]">
          <thead className="text-kelly-subtle">
            <tr>
              <th className="px-2 py-1">Narrative</th>
              <th className="px-2 py-1">Geo signal</th>
              <th className="px-2 py-1">Score</th>
              <th className="px-2 py-1">Base band</th>
              <th className="px-2 py-1">Exports</th>
              <th className="px-2 py-1">Media / debate</th>
            </tr>
          </thead>
          <tbody>
            {county.narrativeStates.map((cell) => (
              <NarrativeCellRow key={`${cell.countyId}-${cell.narrativeId}`} cell={cell} />
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-[10px] text-kelly-muted">{county.strategicNotes}</p>
      <p className="mt-2">
        <Link href="/admin/intelligence/kim-hammer/narrative-state" className="font-semibold text-kelly-navy underline">
          NSI-1 narrative state
        </Link>
        {" · "}
        <Link href="/admin/intelligence/kim-hammer/county-administration-burden" className="font-semibold text-kelly-navy underline">
          KH-0B county burden
        </Link>
      </p>
    </article>
  );
}

export function KimHammerGeographicNarrativeDashboard({
  index,
}: KimHammerGeographicNarrativeDashboardProps) {
  const [countyQuery, setCountyQuery] = useState("");
  const [signalFilter, setSignalFilter] = useState<KimHammerGeographicReadinessSignal | "ALL">("ALL");
  const [narrativeQuery, setNarrativeQuery] = useState("");

  const filtered = useMemo(
    () =>
      filterGeographicCountyStates(index, {
        countyQuery,
        signal: signalFilter,
        narrativeQuery,
      }),
    [index, countyQuery, signalFilter, narrativeQuery],
  );

  return (
    <div>
      <section className="mb-4 rounded-xl border border-teal-200/50 bg-teal-50/40 p-4 text-xs text-teal-950">
        <p className="font-bold uppercase tracking-wider">NSI-2 · Geographic composition (read-only)</p>
        <p className="mt-1">
          County readiness composes NSI-1 narrative state, KH-0B county burden signals, export lineage, citation
          health, retrieval tasks, and AI suggestion pressure. No mutations on this surface.
        </p>
      </section>

      <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Counties / regions</p>
          <p className="mt-1 text-xl font-bold">{index.countyCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Narrative × county cells</p>
          <p className="mt-1 text-xl font-bold">{index.narrativeCellCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Blocked / weak cells</p>
          <p className="mt-1 text-xl font-bold">
            {index.signalCounts.COUNTY_BLOCKED + index.signalCounts.COUNTY_WEAK}
          </p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Underdeveloped</p>
          <p className="mt-1 text-xl font-bold">{index.signalCounts.COUNTY_UNDERDEVELOPED}</p>
        </div>
      </section>

      {index.topGeographicRisks.length > 0 ? (
        <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Top geographic risk signals</h2>
          <ul className="mt-2 space-y-2">
            {index.topGeographicRisks.map((row) => (
              <li key={row.countyId} className="rounded border border-amber-200/60 bg-amber-50/50 p-2">
                <strong>{row.countyName}:</strong> {row.signal}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Filters</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">County</span>
            <input
              type="search"
              value={countyQuery}
              onChange={(event) => setCountyQuery(event.target.value)}
              placeholder="Pulaski, statewide…"
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Dominant signal</span>
            <select
              value={signalFilter}
              onChange={(event) =>
                setSignalFilter(event.target.value as KimHammerGeographicReadinessSignal | "ALL")
              }
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            >
              <option value="ALL">All</option>
              {KIM_HAMMER_GEOGRAPHIC_READINESS_SIGNALS.map((signal) => (
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
              placeholder="county burden, SB487…"
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        {filtered.map((county) => (
          <CountyPanel key={county.countyId} county={county} />
        ))}
      </section>
    </div>
  );
}
