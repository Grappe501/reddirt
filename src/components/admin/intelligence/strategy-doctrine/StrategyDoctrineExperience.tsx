"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  STRATEGY_DOCTRINE_JSON_ENTRIES,
  STRATEGY_DOCTRINE_HUB_HREF,
  strategyDoctrineDocHref,
} from "@/lib/strategy-doctrine/strategy-doctrine-nav";
import type { ReactNode } from "react";

const CATEGORY_LABELS: Record<string, string> = {
  registry: "Registry",
  values: "Values",
  field: "Field",
  turnout: "Turnout",
  operations: "Operations",
  research: "Research",
};

function normalizeActiveKey(pathname: string): string {
  if (!pathname.startsWith(STRATEGY_DOCTRINE_HUB_HREF)) return "";
  const rest = pathname.slice(STRATEGY_DOCTRINE_HUB_HREF.length).replace(/^\/+/, "");
  return rest || "campaign-strategic-doctrine-registry";
}

export function StrategyDoctrineExperience({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const activeKey = normalizeActiveKey(pathname);

  const byCategory = STRATEGY_DOCTRINE_JSON_ENTRIES.reduce(
    (acc, entry) => {
      const cat = entry.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(entry);
      return acc;
    },
    {} as Record<string, typeof STRATEGY_DOCTRINE_JSON_ENTRIES>,
  );

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/40 to-white shadow-sm">
        <div className="border-b border-amber-200/60 bg-kelly-deep px-6 py-8 text-white md:px-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-amber-300/90">
            Intelligence · SDI-1 · Phase 11 P3
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight">Strategy doctrine JSON</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/80">
            Nine read-only SDI-1 artifacts from data/strategy-doctrine/ — registry, Steve doctrine, field playbooks,
            GOTV model, and research intake — with debate and alignment overlays on every file.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={STRATEGY_DOCTRINE_HUB_HREF}
              className="rounded-full border border-amber-400/40 bg-amber-900/40 px-3 py-1 text-xs font-bold text-white"
            >
              Artifact inventory
            </Link>
            <Link
              href="/admin/intelligence/phase-11-p3-upgrade"
              className="rounded-full border border-white/25 px-3 py-1 text-xs font-bold text-white/90 hover:bg-white/10"
            >
              Phase 11 P3 pass
            </Link>
            <Link
              href="/admin/intelligence/strategy-alignment"
              className="rounded-full border border-white/25 px-3 py-1 text-xs font-bold text-white/90 hover:bg-white/10"
            >
              Strategy alignment
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          <aside className="border-b border-kelly-text/10 bg-kelly-deep/97 px-4 py-5 text-white lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:w-[min(100%,280px)] lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:self-start">
            <nav aria-label="Strategy doctrine" className="space-y-4">
              {Object.entries(byCategory).map(([cat, entries]) => (
                <div key={cat}>
                  <p className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                    {CATEGORY_LABELS[cat] ?? cat}
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {entries.map((entry) => {
                      const href = strategyDoctrineDocHref(entry.pathKey);
                      const isActive = entry.pathKey === activeKey;
                      return (
                        <li key={entry.pathKey}>
                          <Link
                            href={href}
                            className={`block rounded-lg px-2 py-1.5 text-[11px] font-medium leading-snug transition ${
                              isActive
                                ? "bg-kelly-gold/25 text-white ring-1 ring-kelly-gold/40"
                                : "text-white/80 hover:bg-white/10"
                            }`}
                          >
                            {entry.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>
          <div className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
