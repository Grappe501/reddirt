"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { communityWorkbenchHref } from "@/lib/election-plan/community-workbench/links";
import type { CommunityWorkbenchView } from "@/lib/election-plan/community-workbench/types";

type ListItem = Pick<CommunityWorkbenchView, "slug" | "name" | "kind" | "countySlug" | "tagline">;

type Props = {
  workbenches: ListItem[];
  totalCount: number;
  initialQuery?: string;
};

function kindBadge(kind: string): string {
  if (kind === "program") return "bg-violet-100 text-violet-900";
  if (kind === "campus") return "bg-indigo-100 text-indigo-900";
  return "bg-teal-100 text-teal-900";
}

export function CommunityWorkbenchHubPanel({ workbenches, totalCount, initialQuery = "" }: Props) {
  const [q, setQ] = useState(initialQuery);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return workbenches.slice(0, 80);
    return workbenches
      .filter((w) => {
        const blob = [w.name, w.tagline ?? "", w.kind, w.countySlug ?? ""].join(" ").toLowerCase();
        return blob.includes(term) || w.slug.includes(term.replace(/\s+/g, "-"));
      })
      .slice(0, 80);
  }, [q, workbenches]);

  const featured = ["sherwood", "jacksonville", "quitman", "bentonville", "jonesboro", "uca-campus", "election-integrity", "direct-democracy"];

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Community Workbench Framework v1</p>
      <h1 className="mt-1 font-heading text-2xl font-bold text-[var(--ep-navy)] lg:text-3xl">Local Action Hubs</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--ep-navy-muted)]">
        One operating template. Unlimited communities. Jacksonville, Sherwood, Quitman, campuses, and movement programs
        all run leadership, missions, KPIs, committees, events, relationships, and field logging here — not on county
        intelligence pages.
      </p>

      <div className="mt-6">
        <label htmlFor="wb-search" className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">
          Search Community Workbenches
        </label>
        <input
          id="wb-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Jacksonville, Sherwood, Election Integrity, Campus…"
          className="mt-1 w-full rounded-lg border border-[var(--ep-border)] px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--ep-gold)]"
          autoFocus={Boolean(initialQuery)}
        />
        <p className="mt-1 text-[10px] text-[var(--ep-navy-muted)]">
          {totalCount} workbenches · also searchable from Election Plan search
        </p>
      </div>

      {!q.trim() ? (
        <div className="mt-6">
          <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Featured</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {featured.map((slug) => {
              const wb = workbenches.find((w) => w.slug === slug);
              if (!wb) return null;
              return (
                <Link
                  key={slug}
                  href={communityWorkbenchHref(slug)}
                  className="rounded-full border border-[var(--ep-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]"
                >
                  {wb.name}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <ul className="mt-8 divide-y divide-[var(--ep-border)] rounded-lg border border-[var(--ep-border)]">
        {filtered.map((wb) => (
          <li key={wb.slug}>
            <Link
              href={communityWorkbenchHref(wb.slug)}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-[var(--ep-cream)]"
            >
              <div>
                <p className="font-heading font-bold text-[var(--ep-navy)]">{wb.name}</p>
                {wb.tagline ? <p className="text-xs text-[var(--ep-navy-muted)]">{wb.tagline}</p> : null}
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${kindBadge(wb.kind)}`}>
                {wb.kind}
              </span>
            </Link>
          </li>
        ))}
        {filtered.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm italic text-[var(--ep-navy-muted)]">No workbenches match.</li>
        ) : null}
      </ul>
    </div>
  );
}
