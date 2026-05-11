import type { ReactNode } from "react";

import { FieldCommandTopNav } from "@/components/dashboard/field/FieldCommandTopNav";
import { DashboardCompactFooter } from "@/components/dashboard/vos/DashboardCompactFooter";

export function FieldCommandChrome({
  eyebrow = "Field structure",
  children,
}: {
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-kelly-page">
      <header className="border-b border-kelly-text/10 bg-kelly-fog/30 shadow-[var(--shadow-soft)]">
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-6 md:px-6">
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-wide text-kelly-navy/80">{eyebrow}</p>
            <h1 className="mt-1 font-heading text-xl font-bold text-kelly-text md:text-2xl">Field command center</h1>
            <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/75">
              Statewide director and functional leads drill into regions, counties, cities, precincts, and neighborhoods.
              Counties appear in the registry immediately; deeper nodes stay template links until volunteers stand them up.
            </p>
          </div>
          <FieldCommandTopNav />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8 md:px-6">{children}</main>
      <DashboardCompactFooter />
    </div>
  );
}
