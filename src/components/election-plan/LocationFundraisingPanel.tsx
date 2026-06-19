import Link from "next/link";

import { CommunityFundraisingGoalPanel } from "@/components/election-plan/CommunityFundraisingGoalPanel";
import { CommunityFundraisingOpportunitiesPanel } from "@/components/election-plan/CommunityFundraisingOpportunitiesPanel";
import { formatBudget } from "@/lib/election-plan/electionPlanData";
import type { LocationFundraisingView } from "@/lib/election-plan/load-location-fundraising";
import type { FundraisingLeadSlot } from "@/lib/election-plan/load-location-fundraising-leads";
import { cn } from "@/lib/utils";

type Props = {
  fundraising: LocationFundraisingView;
};

function leadStatusClass(status: FundraisingLeadSlot["status"]) {
  if (status === "assigned") return "bg-emerald-100 text-emerald-950";
  if (status === "interim") return "bg-amber-100 text-amber-950";
  if (status === "recruiting") return "bg-blue-100 text-blue-950";
  return "bg-slate-100 text-slate-700";
}

function LeadCard({ lead, geography }: { lead: FundraisingLeadSlot; geography: string }) {
  return (
    <article className="rounded-lg border border-[var(--ep-border)] bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">{geography}</p>
      <h3 className="mt-1 font-heading text-sm font-bold text-[var(--ep-navy)]">{lead.label}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="font-semibold text-[var(--ep-navy)]">{lead.displayName ?? "OPEN"}</span>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", leadStatusClass(lead.status))}>
          {lead.status}
        </span>
      </div>
      {lead.note ? <p className="mt-2 text-xs leading-relaxed text-[var(--ep-navy-muted)]">{lead.note}</p> : null}
      {lead.contact ? (
        <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
          Contact: <span className="font-mono">{lead.contact}</span>
        </p>
      ) : null}
    </article>
  );
}

function RollupCard({
  title,
  baseGoal,
  stretchGoal,
  raised,
  progressPct,
  subtitle,
}: {
  title: string;
  baseGoal: number;
  stretchGoal: number;
  raised: number;
  progressPct: number;
  subtitle: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--ep-border)] bg-[var(--ep-cream)]/40 p-4">
      <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{subtitle}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
        <div>
          <p className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Base</p>
          <p className="font-heading text-lg font-bold tabular-nums">{formatBudget(baseGoal)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Stretch</p>
          <p className="font-heading text-lg font-bold tabular-nums">{formatBudget(stretchGoal)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Raised</p>
          <p className="font-heading text-lg font-bold tabular-nums">{formatBudget(raised)}</p>
        </div>
      </div>
      <div className="ep-progress mt-3">
        <div className="ep-progress-bar bg-[var(--ep-navy)]" style={{ width: `${progressPct}%` }} />
      </div>
    </div>
  );
}

export function LocationFundraisingPanel({ fundraising }: Props) {
  const { cityAllocation, countyRollup, clusterRollup, leads, opportunityLanes } = fundraising;

  return (
    <section className="mb-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ep-gold)]">Fundraising Operating System</p>
          <h2 className="font-heading text-xl font-bold text-[var(--ep-navy)]">Fundraising goals &amp; leadership</h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--ep-navy-muted)]">
            Dollar targets follow victory math — vote share drives base goal. Find or place a fundraising lead at city,
            county, and cluster level before opportunity lanes go live.
          </p>
        </div>
        <Link href={fundraising.workbenchHref} className="ep-chapter-link text-sm">
          Community workbench →
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <LeadCard lead={leads.city} geography={`${fundraising.cityName} · city`} />
        <LeadCard lead={leads.county} geography={`${fundraising.countyName} County`} />
        {leads.cluster ? (
          <LeadCard lead={leads.cluster} geography={fundraising.clusterName ?? "Deployment cluster"} />
        ) : (
          <article className="rounded-lg border border-dashed border-[var(--ep-border)] bg-slate-50 p-4 text-sm text-[var(--ep-navy-muted)]">
            <p className="font-semibold text-[var(--ep-navy)]">Cluster lead</p>
            <p className="mt-2">No deployment cluster mapped for this county yet.</p>
          </article>
        )}
      </div>

      <CommunityFundraisingGoalPanel allocation={cityAllocation} />

      <div className="grid gap-4 lg:grid-cols-2">
        {countyRollup ? (
          <RollupCard
            title="County rollup"
            subtitle={`${countyRollup.communities.length} priority communities in ${fundraising.countyName}`}
            baseGoal={countyRollup.baseGoal}
            stretchGoal={countyRollup.stretchGoal}
            raised={countyRollup.raised}
            progressPct={countyRollup.progressPct}
          />
        ) : null}
        {clusterRollup ? (
          <RollupCard
            title="Cluster rollup"
            subtitle={`${clusterRollup.counties.length} counties · ${clusterRollup.name}`}
            baseGoal={clusterRollup.baseGoal}
            stretchGoal={clusterRollup.stretchGoal}
            raised={clusterRollup.raised}
            progressPct={clusterRollup.progressPct}
          />
        ) : null}
      </div>

      <div className="ep-card">
        <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Fundraising opportunity lanes</h3>
        <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
          Each lane needs an owner before counts go live — zeros until record-backed opportunities exist.
        </p>
        <ul className="mt-4 divide-y divide-[var(--ep-border)] rounded-lg border border-[var(--ep-border)]">
          {opportunityLanes.map((lane) => (
            <li key={lane.key} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[var(--ep-navy)]">{lane.label}</p>
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{lane.goalLabel}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Owner</p>
                <p className="font-semibold">{lane.ownerLabel}</p>
                <span
                  className={cn(
                    "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                    leadStatusClass(lane.ownerStatus),
                  )}
                >
                  {lane.ownerStatus}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {fundraising.citySlug === "sherwood" ? (
        <CommunityFundraisingOpportunitiesPanel allocation={cityAllocation} />
      ) : null}

      <div className="flex flex-wrap gap-3 text-xs font-semibold">
        <Link href="/election-plan/executive-book/fundraising-leadership" className="ep-chapter-link">
          Fundraising leadership playbook →
        </Link>
        <Link href="/election-plan/executive-book/fundraising-operating-system" className="ep-chapter-link">
          FOS doctrine →
        </Link>
      </div>
    </section>
  );
}
