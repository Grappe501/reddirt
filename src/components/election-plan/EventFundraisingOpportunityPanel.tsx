import Link from "next/link";

import { formatBudget } from "@/lib/election-plan/electionPlanData";
import { grassrootsGuitarStringsEventHref } from "@/lib/election-plan/community-workbench/event-links";
import type { PilotEventSeed } from "@/lib/election-plan/community-workbench/pilot-event-seeds";
import type { CommunityWorkbenchEventRow } from "@/lib/election-plan/community-workbench/types";

type Props = {
  seed: PilotEventSeed;
  event: CommunityWorkbenchEventRow;
};

/** Record-backed fundraising KPI slots for G&G — zeros until donation records exist. */
export function EventFundraisingOpportunityPanel({ seed, event }: Props) {
  const profitGoal = seed.profitGoal;
  const projectedProfit = 0;
  const gap = Math.max(0, profitGoal - projectedProfit);

  const openRoles = (event.assignments ?? []).filter((a) => !a.assignee?.trim() || a.assignee.trim().toUpperCase() === "OPEN");

  return (
    <section id="fundraising" className="mb-10 scroll-mt-28">
      <h2 className="mb-4 font-heading text-xl font-bold text-[var(--ep-navy)]">Fundraising · special KPI</h2>
      <p className="mb-4 text-sm text-[var(--ep-navy-muted)]">
        ${profitGoal.toLocaleString()} net profit is an opportunity contributing to Sherwood and county fundraising — not
        Sherwood&apos;s city base goal. Event committee ownership stays on this workbench.
      </p>

      <div className="ep-card border-l-4 border-[var(--ep-gold)]">
        <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Grassroots & Guitar Strings</p>
        <p className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">{event.title}</p>
        <p className="text-xs text-[var(--ep-navy-muted)]">
          {event.eventDate
            ? new Date(event.eventDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
            : "Sept 17"}{" "}
          · Status: {event.status.replace(/_/g, " ")}
        </p>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Profit goal</dt>
            <dd className="font-heading text-2xl font-bold tabular-nums">{formatBudget(profitGoal)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Sponsors</dt>
            <dd className="font-heading text-2xl font-bold tabular-nums">{formatBudget(0)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Tickets</dt>
            <dd className="font-heading text-2xl font-bold tabular-nums">{formatBudget(0)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Donations</dt>
            <dd className="font-heading text-2xl font-bold tabular-nums">{formatBudget(0)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Merchandise</dt>
            <dd className="font-heading text-2xl font-bold tabular-nums">{formatBudget(0)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Projected profit</dt>
            <dd className="font-heading text-2xl font-bold tabular-nums">{formatBudget(projectedProfit)}</dd>
          </div>
        </dl>

        <p className="mt-4 text-sm">
          Gap to profit goal: <strong className="text-[var(--ep-navy)]">{formatBudget(gap)}</strong>
        </p>

        <div className="mt-5 rounded-md bg-slate-50 p-3">
          <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Recruitable event roles (OPEN)</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {openRoles.length > 0 ? (
              openRoles.map((r) => (
                <li key={r.role} className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-950">
                  {r.role}
                </li>
              ))
            ) : (
              <li className="text-xs text-emerald-800">All framework roles assigned</li>
            )}
          </ul>
        </div>

        <Link
          href="/election-plan/workbenches/sherwood#fundraising"
          className="mt-4 inline-block text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
        >
          Sherwood city FOS + opportunity rollup →
        </Link>
      </div>
    </section>
  );
}

export function EventFundraisingKpiStripCard() {
  const profitGoal = 20_000;
  return (
    <div className="ep-card h-full border-l-4 border-[var(--ep-gold)]">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Special KPI · Event</p>
      <h3 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">Grassroots & Guitar Strings</h3>
      <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Sept 17 · Sherwood event workbench</p>
      <p className="mt-3 text-sm font-semibold text-[var(--ep-navy)]">{formatBudget(profitGoal)} net profit goal</p>
      <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
        Event leadership and committee live on the event workbench — not Sherwood city leadership board.
      </p>
      <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
        Projected profit {formatBudget(0)} · Gap {formatBudget(profitGoal)} · record-backed when donation layer live
      </p>
      <Link href={grassrootsGuitarStringsEventHref()} className="mt-4 inline-block text-sm font-semibold text-[var(--ep-navy)] underline">
        Event workbench →
      </Link>
    </div>
  );
}
