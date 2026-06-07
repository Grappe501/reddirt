"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MOVEMENT_PHILOSOPHY_ENTRIES,
  MOVEMENT_PHILOSOPHY_HUB_HREF,
  movementPhilosophyDocHref,
} from "@/lib/philosophy/movement-philosophy-nav";
import type { ReactNode } from "react";

function normalizeActiveKey(pathname: string): string {
  if (!pathname.startsWith(MOVEMENT_PHILOSOPHY_HUB_HREF)) return "";
  const rest = pathname.slice(MOVEMENT_PHILOSOPHY_HUB_HREF.length).replace(/^\/+/, "");
  return rest || "README";
}

export function MovementPhilosophyExperience({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const activeKey = normalizeActiveKey(pathname);

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-b from-indigo-50/40 to-white shadow-sm">
        <div className="border-b border-indigo-200/60 bg-kelly-deep px-6 py-8 text-white md:px-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-indigo-300/90">
            Intelligence · Movement lane · Phase 11 P2
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight">Movement philosophy</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/80">
            Public philosophy corpus — vision, principles, coalition framing, and VOL-CORE-1 volunteer foundation — with
            debate application and volunteer system overlays on every document.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={MOVEMENT_PHILOSOPHY_HUB_HREF}
              className="rounded-full border border-indigo-400/40 bg-indigo-900/40 px-3 py-1 text-xs font-bold text-white"
            >
              Document inventory
            </Link>
            <Link
              href="/admin/intelligence/phase-11-p2-upgrade"
              className="rounded-full border border-white/25 px-3 py-1 text-xs font-bold text-white/90 hover:bg-white/10"
            >
              Phase 11 P2 pass
            </Link>
            <Link
              href="/admin/intelligence/staff-strategy-command"
              className="rounded-full border border-white/25 px-3 py-1 text-xs font-bold text-white/90 hover:bg-white/10"
            >
              Staff strategy command
            </Link>
            <Link
              href="/admin/intelligence/strategy-philosophy-hub"
              className="rounded-full border border-white/25 px-3 py-1 text-xs font-bold text-white/90 hover:bg-white/10"
            >
              Strategy & philosophy
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          <aside className="border-b border-kelly-text/10 bg-kelly-deep/97 px-4 py-5 text-white lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:w-[min(100%,280px)] lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:self-start">
            <nav aria-label="Movement philosophy" className="space-y-1">
              {MOVEMENT_PHILOSOPHY_ENTRIES.map((entry) => {
                const href = movementPhilosophyDocHref(entry.pathKey);
                const isActive = entry.pathKey === activeKey;
                return (
                  <Link
                    key={entry.pathKey}
                    href={href}
                    className={`block rounded-lg px-2 py-1.5 text-[11px] font-medium leading-snug transition ${
                      isActive
                        ? "bg-kelly-gold/25 text-white ring-1 ring-kelly-gold/40"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {entry.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
          <div className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
