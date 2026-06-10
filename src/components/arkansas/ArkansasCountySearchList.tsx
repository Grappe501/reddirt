"use client";

import { useMemo, useState } from "react";
import type { PublicCountyPresenceRow } from "@/lib/county/public-county-presence";
import { arkansasPresenceCopy } from "@/content/county/arkansas-presence";
import { ContentPendingBadge } from "@/components/content/ContentPendingBadge";

type Props = {
  counties: PublicCountyPresenceRow[];
};

export function ArkansasCountySearchList({ counties }: Props) {
  const [query, setQuery] = useState("");
  const copy = arkansasPresenceCopy.countiesPage;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return counties;
    return counties.filter((c) => c.displayName.toLowerCase().includes(q));
  }, [counties, query]);

  return (
    <div>
      <label htmlFor="county-search" className="sr-only">
        {copy.searchPlaceholder}
      </label>
      <input
        id="county-search"
        type="search"
        placeholder={copy.searchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-md rounded-card border border-kelly-text/15 bg-white px-4 py-3 font-body text-base text-kelly-text shadow-sm focus:border-kelly-navy/40 focus:outline-none focus:ring-2 focus:ring-kelly-gold/30"
      />

      <div className="mt-8 overflow-x-auto rounded-card border border-kelly-text/10">
        <table className="min-w-full font-body text-sm">
          <thead className="border-b border-kelly-text/10 bg-kelly-text/[0.03] text-left">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-kelly-text">
                {copy.colCounty}
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-kelly-text">
                {copy.colVisited}
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-kelly-text">
                {copy.colUpcoming}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.slug} className="border-b border-kelly-text/8 last:border-0">
                <td className="px-4 py-3 font-medium text-kelly-text">{c.displayName}</td>
                <td className="px-4 py-3 text-kelly-text/85">
                  {c.visitVerified ? (
                    <span>{c.lastVerifiedVisitLabel ?? "Verified"}</span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-kelly-muted">
                      Not yet verified
                      <ContentPendingBadge variant="source" />
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-kelly-text/85">{c.upcomingEventCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 font-body text-sm text-kelly-muted">No counties match your search.</p>
      ) : null}
    </div>
  );
}
