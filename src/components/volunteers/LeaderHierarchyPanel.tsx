"use client";

import Link from "next/link";

import type { LeaderHierarchyPayload } from "@/lib/volunteers/workbench-hierarchy";
import { volunteerCrmModules } from "@/lib/volunteers/workbench-hierarchy";

type Props = {
  hierarchy: LeaderHierarchyPayload;
  leaderSlug: string;
  isSelf?: boolean;
};

function tierPillClass(active: boolean, inherited: boolean): string {
  if (active) return "bg-[var(--ep-navy)] text-white ring-2 ring-[var(--ep-gold)]";
  if (inherited) return "bg-[var(--ep-cream)] text-[var(--ep-navy)] ring-1 ring-[var(--ep-gold)]/40";
  return "bg-white text-[var(--ep-navy-muted)] ring-1 ring-[var(--ep-navy)]/10";
}

export function LeaderHierarchyPanel({ hierarchy, leaderSlug, isSelf }: Props) {
  const crmModules = volunteerCrmModules({
    isSelf: Boolean(isSelf),
    leaderSlug,
    fieldOperatorHref: "/election-plan/operators/field",
  });
  const accessible = hierarchy.nestedWorkbenches.filter((w) => w.accessible);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Leadership hierarchy</p>
        <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">{hierarchy.doctrine}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2" role="list" aria-label="Hierarchy tiers">
          {hierarchy.tierChain.map((tier, i) => (
            <div key={tier.id} className="flex items-center gap-2" role="listitem">
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${tierPillClass(tier.active, tier.inherited)}`}
              >
                {tier.label}
                {tier.active ? " · you" : null}
              </span>
              {i < hierarchy.tierChain.length - 1 ? (
                <span className="text-[var(--ep-navy-muted)]" aria-hidden>
                  ↑
                </span>
              ) : null}
            </div>
          ))}
        </div>
        {hierarchy.upstreamTierLabels.length ? (
          <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
            Upstream managers ({hierarchy.upstreamTierLabels.join(", ")}) inherit every volunteer-template section and
            can open all nested workbenches below their tier.
          </p>
        ) : null}
      </div>

      <div>
        <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Nested workbenches</h3>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          Volunteer → city → county → cluster → ACM → CM. Your tier opens {accessible.length} surface
          {accessible.length === 1 ? "" : "s"}.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {hierarchy.nestedWorkbenches.map((bench) => (
            <li key={`${bench.tier}-${bench.href}`}>
              {bench.accessible ? (
                <Link
                  href={bench.href}
                  className="block h-full rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm transition hover:border-[var(--ep-gold)]"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ep-blue)]">{bench.tier.replace(/_/g, " ")}</p>
                  <p className="mt-1 font-semibold text-[var(--ep-navy)]">{bench.label}</p>
                  <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{bench.description}</p>
                </Link>
              ) : (
                <div className="block h-full rounded-xl border border-dashed border-[var(--ep-navy)]/15 bg-[var(--ep-cream)]/40 p-4 opacity-70">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">{bench.tier.replace(/_/g, " ")}</p>
                  <p className="mt-1 font-semibold text-[var(--ep-navy-muted)]">{bench.label}</p>
                  <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Unlocks at higher tier</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div id="work-branches">
        <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Work branch templates</h3>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          Comms, fundraising, events, volunteer management, and more — branches overlap by design; all inherit the
          volunteer workbench base.
        </p>
        <ul className="mt-4 space-y-4">
          {hierarchy.workBranches.map((branch) => (
            <li key={branch.id} className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-[var(--ep-navy)]">{branch.label}</p>
                  <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{branch.description}</p>
                </div>
                {branch.teamLaneId ? (
                  <Link
                    href={
                      isSelf
                        ? `/election-plan/operators/leaders/me/lane/${branch.teamLaneId}`
                        : `/election-plan/operators/leaders/${leaderSlug}/lane/${branch.teamLaneId}`
                    }
                    className="shrink-0 text-xs font-semibold text-[var(--ep-blue)] hover:underline"
                  >
                    Lane drill-down →
                  </Link>
                ) : null}
              </div>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {branch.sections.map((section) => (
                  <li key={section.id} className="rounded-lg bg-[var(--ep-cream)]/60 px-3 py-2 text-xs">
                    <p className="font-semibold text-[var(--ep-navy)]">{section.label}</p>
                    <p className="mt-0.5 text-[var(--ep-navy-muted)]">{section.description}</p>
                    {section.overlapsWith?.length ? (
                      <p className="mt-1 text-[10px] text-[var(--ep-navy-muted)]">
                        Overlaps: {section.overlapsWith.join(", ")}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Inherited sections (volunteer → your tier)</h3>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          Everything on the volunteer workbench appears on every upstream workbench — CRM modules marked below.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {hierarchy.inheritedSections.map((section) => (
            <li key={section.id}>
              <a
                href={section.anchor}
                className={`block rounded-full px-3 py-1 text-xs font-semibold ${
                  section.crmModule
                    ? "border border-[var(--ep-gold)]/50 bg-[var(--ep-cream)] text-[var(--ep-navy)]"
                    : "border border-[var(--ep-navy)]/15 bg-white text-[var(--ep-navy-muted)]"
                }`}
              >
                {section.label}
                {section.crmModule ? " · CRM" : ""}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Volunteer management & CRM path</h3>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          Live modules today; participation-layer CRM completes the full contact graph once PPEN ships.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {crmModules.map((mod) => (
            <li key={mod.id}>
              <Link
                href={mod.href}
                className={`block h-full rounded-xl border p-4 shadow-sm transition hover:border-[var(--ep-gold)] ${
                  mod.status === "live"
                    ? "border-[var(--ep-navy)]/10 bg-white"
                    : "border-dashed border-[var(--ep-navy)]/20 bg-[var(--ep-cream)]/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-[var(--ep-navy)]">{mod.label}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      mod.status === "live" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"
                    }`}
                  >
                    {mod.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{mod.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
