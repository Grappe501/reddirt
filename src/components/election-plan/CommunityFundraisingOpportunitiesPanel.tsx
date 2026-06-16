import Link from "next/link";

import { formatBudget } from "@/lib/election-plan/electionPlanData";
import type { FosCommunityAllocation } from "@/lib/election-plan/fundraising-operating-system-shared";
import { grassrootsGuitarStringsEventHref } from "@/lib/election-plan/community-workbench/event-links";
import { GRASSROOTS_GUITAR_STRINGS_EVENT } from "@/lib/election-plan/community-workbench/pilot-event-seeds";

type Props = {
  allocation: FosCommunityAllocation;
};

/** Sherwood city FOS goals + fundraising opportunities (G&G profit is an opportunity, not base goal). */
export function CommunityFundraisingOpportunitiesPanel({ allocation }: Props) {
  const profitGoal = GRASSROOTS_GUITAR_STRINGS_EVENT.profitGoal;
  const raised = allocation.raised;
  const potentialTotal = allocation.baseGoal + profitGoal;

  return (
    <div className="mt-6 space-y-4">
      <div>
        <h3 className="font-heading text-base font-bold text-[var(--ep-navy)]">Fundraising opportunities</h3>
        <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
          Opportunities add upside to city base goals — they do not replace them. Roll profit into county totals only when
          backed by actual fundraising records.
        </p>
      </div>

      <div className="rounded-lg border border-[var(--ep-border)] bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Grassroots & Guitar Strings</p>
            <p className="font-heading font-bold text-[var(--ep-navy)]">Sept 17 · Event profit opportunity</p>
          </div>
          <Link
            href={grassrootsGuitarStringsEventHref()}
            className="text-xs font-semibold text-[var(--ep-gold)] hover:underline"
          >
            Event workbench →
          </Link>
        </div>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div>
            <dt className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Profit goal</dt>
            <dd className="font-heading text-xl font-bold tabular-nums">{formatBudget(profitGoal)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Projected profit</dt>
            <dd className="font-heading text-xl font-bold tabular-nums">{formatBudget(0)}</dd>
            <p className="text-[10px] text-[var(--ep-navy-muted)]">Record-backed when donation layer live</p>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Gap</dt>
            <dd className="font-heading text-xl font-bold tabular-nums">{formatBudget(profitGoal)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Event chair</dt>
            <dd className="font-semibold text-amber-800">OPEN</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
          Sponsors · tickets · donations · merchandise KPIs live on the event workbench — zeros until records exist.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-[var(--ep-border)] bg-slate-50 p-4 text-sm">
        <p className="font-semibold text-[var(--ep-navy)]">Potential total if G&amp;G hits goal</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">
          City base {formatBudget(allocation.baseGoal)} + G&amp;G profit {formatBudget(profitGoal)} ={" "}
          <strong className="text-[var(--ep-navy)]">{formatBudget(potentialTotal)}</strong> potential (
          {allocation.baseGoal > 0 ? Math.round((potentialTotal / allocation.baseGoal) * 100) : 0}% of base goal — cushion
          and gravy).
        </p>
        <p className="mt-2 text-xs">
          Raised today (city): {formatBudget(raised)} · {allocation.raisedNote}
        </p>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2 text-xs text-[var(--ep-navy-muted)]">
        <li className="rounded border border-[var(--ep-border)] bg-white px-3 py-2">House Parties · Goal TBD · OPEN</li>
        <li className="rounded border border-[var(--ep-border)] bg-white px-3 py-2">Direct Donations · Goal TBD · OPEN</li>
        <li className="rounded border border-[var(--ep-border)] bg-white px-3 py-2">Sponsors · Goal TBD · OPEN</li>
      </ul>
    </div>
  );
}
