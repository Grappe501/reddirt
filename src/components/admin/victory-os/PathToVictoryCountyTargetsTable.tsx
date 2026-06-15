"use client";

import { useMemo, useState } from "react";
import type { PathToVictoryCountyTargetRow } from "@/lib/victory-os/path-to-victory-snapshot";
import { vos } from "./victory-os-ui/victory-os-tokens";

type SortKey = "county" | "targetVotes" | "targetVoteGain" | "baselineDemShare";

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export function PathToVictoryCountyTargetsTable({
  counties,
  generatedAt,
}: {
  counties: PathToVictoryCountyTargetRow[];
  generatedAt: string;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("targetVoteGain");
  const [sortAsc, setSortAsc] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = counties;
    if (q) list = list.filter((c) => c.county.toLowerCase().includes(q));
    list = [...list].sort((a, b) => {
      const av = sortKey === "county" ? a.county : a[sortKey];
      const bv = sortKey === "county" ? b.county : b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortAsc ? Number(av) - Number(bv) : Number(bv) - Number(av);
    });
    return list;
  }, [counties, query, sortAsc, sortKey]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(key === "county");
    }
  }

  const sortMark = (key: SortKey) => (sortKey === key ? (sortAsc ? " ↑" : " ↓") : "");

  return (
    <section className={vos.glass} aria-labelledby="path-to-victory-county-targets-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="path-to-victory-county-targets-heading" className="font-heading text-lg font-bold text-kelly-navy">
            County win targets (75)
          </h2>
          <p className="mt-1 font-body text-sm text-kelly-muted">
            Planning scenario from official SOS history — not operational until methodology lock (sheet 07).
          </p>
          <p className="mt-1 font-body text-[10px] text-kelly-subtle">
            Generated {new Date(generatedAt).toLocaleString("en-US")} · Rebuild:{" "}
            <code className="rounded bg-kelly-page px-1">npm run election:targets:build</code>
          </p>
        </div>
        <label className="font-body text-xs text-kelly-muted">
          Filter county
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Pulaski"
            className="ml-2 rounded border border-kelly-navy/15 px-2 py-1 text-sm text-kelly-navy"
          />
        </label>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-kelly-navy/10">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-kelly-navy/10 bg-kelly-page/80 text-kelly-muted">
              <th className="cursor-pointer px-3 py-2 font-semibold" onClick={() => toggleSort("county")}>
                County{sortMark("county")}
              </th>
              <th className="px-3 py-2 font-semibold">Projected turnout</th>
              <th className="px-3 py-2 font-semibold">Baseline D</th>
              <th className="cursor-pointer px-3 py-2 font-semibold" onClick={() => toggleSort("baselineDemShare")}>
                Baseline share{sortMark("baselineDemShare")}
              </th>
              <th className="cursor-pointer px-3 py-2 font-semibold" onClick={() => toggleSort("targetVotes")}>
                Target votes{sortMark("targetVotes")}
              </th>
              <th className="cursor-pointer px-3 py-2 font-semibold" onClick={() => toggleSort("targetVoteGain")}>
                Vote gain{sortMark("targetVoteGain")}
              </th>
              <th className="px-3 py-2 font-semibold">Target share</th>
              <th className="px-3 py-2 font-semibold">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.county} className="border-b border-kelly-navy/5 hover:bg-kelly-gold/5">
                <td className="px-3 py-2 font-semibold text-kelly-navy">{row.county}</td>
                <td className="px-3 py-2 tabular-nums">{row.projectedTotalVotes.toLocaleString()}</td>
                <td className="px-3 py-2 tabular-nums">{row.baselineDemVotes.toLocaleString()}</td>
                <td className="px-3 py-2 tabular-nums">{pct(row.baselineDemShare)}</td>
                <td className="px-3 py-2 tabular-nums font-semibold">{row.targetVotes.toLocaleString()}</td>
                <td className="px-3 py-2 tabular-nums text-kelly-navy">{row.targetVoteGain.toLocaleString()}</td>
                <td className="px-3 py-2 tabular-nums">{pct(row.targetShare)}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      row.confidence === "high"
                        ? "bg-emerald-100 text-emerald-800"
                        : row.confidence === "medium"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {row.confidence}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 font-body text-[10px] text-kelly-subtle">
        Showing {rows.length} of {counties.length} counties · Export:{" "}
        <code className="rounded bg-kelly-page px-1">data/election/kelly-county-targets-v1.csv</code>
      </p>
    </section>
  );
}
