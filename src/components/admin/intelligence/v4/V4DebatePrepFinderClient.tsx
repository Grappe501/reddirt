"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DebatePrepFinderEntry } from "@/lib/intelligence/v4/debateBriefingDepthTypes";
import { searchDebatePrepFinderEntries } from "@/lib/intelligence/v4/debatePrepFinderSearch";

const kindLabel: Record<DebatePrepFinderEntry["kind"], string> = {
  question: "SOS Q",
  "trap-lane": "Trap",
  philosophy: "Philosophy",
  "prep-section": "Prep §",
  opposition: "Opposition",
};

const kindStyle: Record<DebatePrepFinderEntry["kind"], string> = {
  question: "bg-sky-100 text-sky-950",
  "trap-lane": "bg-rose-100 text-rose-950",
  philosophy: "bg-violet-100 text-violet-950",
  "prep-section": "bg-amber-100 text-amber-950",
  opposition: "bg-emerald-100 text-emerald-950",
};

export function V4DebatePrepFinderClient({
  entries,
  compact = false,
  placeholder = "Search questions, traps, philosophy, prep sections, Hammer research…",
}: {
  entries: DebatePrepFinderEntry[];
  compact?: boolean;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(
    () => searchDebatePrepFinderEntries(entries, query, compact ? 8 : 20),
    [entries, query, compact],
  );

  return (
    <section className={`rounded-xl border-2 border-kelly-navy/20 bg-white ${compact ? "p-4" : "p-5"}`}>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-kelly-navy">
        Prep finder — jump to any drill-down
      </label>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-kelly-text/20 px-3 py-2 text-sm text-kelly-text outline-none focus:border-kelly-gold"
      />
      {query.trim() ? (
        <ul className={`mt-3 space-y-2 ${compact ? "max-h-64 overflow-y-auto" : ""}`}>
          {results.length === 0 ? (
            <li className="text-xs text-kelly-muted">No matches — try “county”, “petition”, “integrity”, or a bill number.</li>
          ) : (
            results.map((r) => (
              <li key={r.id + r.kind}>
                <Link
                  href={r.href}
                  className="flex flex-col gap-1 rounded-lg border border-kelly-text/10 p-3 text-xs transition hover:border-kelly-gold/50 hover:bg-kelly-page/30"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${kindStyle[r.kind]}`}>
                      {kindLabel[r.kind]}
                    </span>
                    {r.probability ? (
                      <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-900">
                        {r.probability}
                      </span>
                    ) : null}
                    <span className="font-bold text-kelly-navy">{r.title}</span>
                  </span>
                  <span className="line-clamp-2 text-kelly-muted">{r.summary}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-kelly-muted">
          Type to search {compact ? "…" : "35 SOS questions, 6 trap lanes, 8 philosophy briefings, 28 prep sections, and opposition surfaces."}
        </p>
      )}
    </section>
  );
}
