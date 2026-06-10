"use client";

import Link from "next/link";
import type { CountyMissionStack, WeeklyCampaignDecision } from "@/lib/victory-os/types";
import { vos } from "../victory-os-ui/victory-os-tokens";

const OPS_BADGE: Record<string, string> = {
  red: "bg-red-100 text-red-800",
  yellow: "bg-amber-100 text-amber-900",
  green: "bg-emerald-100 text-emerald-800",
};

const STATUS_STYLE: Record<string, string> = {
  pending: "border-kelly-text/20 bg-kelly-page text-kelly-muted",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  declined: "border-red-200 bg-red-50 text-red-800",
  modified: "border-amber-200 bg-amber-50 text-amber-900",
};

function ApproveBar({
  decision,
  onStatus,
  busy,
}: {
  decision: WeeklyCampaignDecision;
  onStatus: (id: string, status: WeeklyCampaignDecision["status"]) => void;
  busy: boolean;
}) {
  if (decision.status !== "pending") {
    return (
      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[decision.status]}`}>
        {decision.status}
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      <button type="button" disabled={busy} onClick={() => onStatus(decision.id, "approved")} className={vos.btnPrimary}>
        Approve
      </button>
      <button type="button" disabled={busy} onClick={() => onStatus(decision.id, "declined")} className="rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs font-bold text-red-800 disabled:opacity-50">
        Decline
      </button>
      <button type="button" disabled={busy} onClick={() => onStatus(decision.id, "modified")} className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900 disabled:opacity-50">
        Modify
      </button>
    </div>
  );
}

export function BriefTopDecisionsSection({
  decisions,
  stacksByCounty,
  onStatus,
  busy,
}: {
  decisions: WeeklyCampaignDecision[];
  stacksByCounty: Map<string, CountyMissionStack>;
  onStatus: (id: string, status: WeeklyCampaignDecision["status"]) => void;
  busy: boolean;
}) {
  const hero = decisions[0];
  const runners = decisions.slice(1, 3);
  const rest = decisions.slice(3);

  return (
    <section id="section-decisions" className="scroll-mt-24 space-y-6">
      <div>
        <h3 className="font-heading text-2xl font-bold text-kelly-navy">Top 10 decisions</h3>
        <p className="mt-1 font-body text-sm text-kelly-muted">
          Ranked by deployment priority — the primary output of Victory OS every Monday.
        </p>
      </div>

      {hero ? (
        <article className={`${vos.card} border-2 border-kelly-copper/30 bg-gradient-to-br from-amber-50/80 via-white to-kelly-navy/[0.03]`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-body text-xs font-bold uppercase tracking-[0.24em] text-amber-800">Decision #1 · Highest priority</p>
              <h4 className="mt-2 font-heading text-2xl font-bold text-kelly-navy">
                <Link href={`/admin/counties/${hero.countySlug}`} className="hover:underline">
                  {hero.displayName}
                </Link>
              </h4>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${OPS_BADGE[hero.opsStatus]}`}>{hero.opsStatus} ops</span>
          </div>
          <p className="mt-4 font-body text-lg font-semibold leading-snug text-kelly-navy">{hero.recommendation}</p>
          <p className="mt-2 font-body text-sm text-kelly-text/85">{hero.reason}</p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-4 font-body text-xs">
            <div><dt className="font-bold uppercase text-kelly-muted">Resource</dt><dd className="mt-0.5 capitalize">{hero.resourceType.replace(/_/g, " ")}</dd></div>
            <div><dt className="font-bold uppercase text-kelly-muted">Kelly tier</dt><dd className="mt-0.5">Tier {hero.kellyTier}</dd></div>
            <div><dt className="font-bold uppercase text-kelly-muted">Outcome</dt><dd className="mt-0.5">{hero.expectedOutcome}</dd></div>
            <div><dt className="font-bold uppercase text-kelly-muted">Priority</dt><dd className="mt-0.5 font-mono">{hero.deploymentPriority}</dd></div>
          </dl>
          <div className="mt-4"><ApproveBar decision={hero} onStatus={onStatus} busy={busy} /></div>
          <MissionPreview stack={stacksByCounty.get(hero.countySlug)} />
        </article>
      ) : null}

      {runners.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {runners.map((d) => (
            <article key={d.id} className="rounded-2xl border border-kelly-navy/15 bg-white p-5 shadow-sm">
              <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-muted">Decision #{d.rank}</p>
              <h4 className="mt-1 font-heading text-lg font-bold text-kelly-navy">
                <Link href={`/admin/counties/${d.countySlug}`}>{d.displayName}</Link>
              </h4>
              <p className="mt-2 font-body text-sm font-semibold text-kelly-navy">{d.recommendation}</p>
              <p className="mt-2 font-body text-xs text-kelly-muted">{d.expectedOutcome}</p>
              <div className="mt-3"><ApproveBar decision={d} onStatus={onStatus} busy={busy} /></div>
            </article>
          ))}
        </div>
      ) : null}

      {rest.length > 0 ? (
        <ol className="divide-y divide-kelly-text/10 rounded-2xl border border-kelly-text/10 bg-white/90">
          {rest.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <span className="font-mono text-xs text-kelly-muted">#{d.rank}</span>
                <Link href={`/admin/counties/${d.countySlug}`} className="ml-2 font-body text-sm font-semibold text-kelly-navy hover:underline">
                  {d.county}
                </Link>
                <p className="mt-0.5 truncate font-body text-xs text-kelly-text">{d.recommendation}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${OPS_BADGE[d.opsStatus]}`}>{d.opsStatus}</span>
                <ApproveBar decision={d} onStatus={onStatus} busy={busy} />
              </div>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}

function MissionPreview({ stack }: { stack?: CountyMissionStack }) {
  if (!stack?.weekly) return null;
  return (
    <div className="mt-4 rounded-xl border border-kelly-text/10 bg-white/70 p-3">
      <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-muted">Linked weekly mission</p>
      <p className="mt-1 font-body text-xs font-semibold text-kelly-navy">{stack.weekly.title}</p>
      {stack.dailyTasks.length > 0 ? (
        <ul className="mt-2 space-y-0.5 font-body text-[11px] text-kelly-muted">
          {stack.dailyTasks.slice(0, 3).map((t) => (
            <li key={t.id}>{t.periodKey} · {t.title}</li>
          ))}
          {stack.dailyTasks.length > 3 ? <li>+{stack.dailyTasks.length - 3} more tasks</li> : null}
        </ul>
      ) : null}
    </div>
  );
}

export function BriefDeploymentLanes({
  kelly,
  volunteer,
  fundraising,
}: {
  kelly: WeeklyCampaignDecision[];
  volunteer: WeeklyCampaignDecision[];
  fundraising: WeeklyCampaignDecision[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <DeploymentLane id="section-kelly" title="Kelly deployment" accent="border-kelly-navy/30 bg-kelly-navy/[0.04]" decisions={kelly} empty="No Tier 1–2 Kelly this week." />
      <DeploymentLane id="section-volunteer" title="Volunteer deployment" accent="border-emerald-200/80 bg-emerald-50/50" decisions={volunteer} empty="No volunteer actions flagged." />
      <DeploymentLane id="section-fundraising" title="Fundraising unlocks" accent="border-amber-200/80 bg-amber-50/50" decisions={fundraising} empty="No fundraising unlocks." showOutcome />
    </div>
  );
}

function DeploymentLane({
  id,
  title,
  accent,
  decisions,
  empty,
  showOutcome,
}: {
  id: string;
  title: string;
  accent: string;
  decisions: WeeklyCampaignDecision[];
  empty: string;
  showOutcome?: boolean;
}) {
  return (
    <section id={id} className={`scroll-mt-24 rounded-2xl border p-4 ${accent}`}>
      <h4 className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">{title}</h4>
      <ul className="mt-3 space-y-3">
        {decisions.length === 0 ? (
          <li className="font-body text-sm text-kelly-muted">{empty}</li>
        ) : (
          decisions.map((d) => (
            <li key={d.id} className="rounded-xl border border-white/60 bg-white/80 p-3 shadow-sm">
              <Link href={`/admin/counties/${d.countySlug}`} className="font-body text-sm font-bold text-kelly-navy hover:underline">
                {d.county}
              </Link>
              <p className="mt-1 font-body text-xs text-kelly-text">{showOutcome ? d.expectedOutcome : d.recommendation}</p>
              {!showOutcome ? (
                <p className="mt-1 font-body text-[10px] text-kelly-muted">Tier {d.kellyTier} · {d.resourceType.replace(/_/g, " ")}</p>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

export function BriefCountyIntelSection({
  atRisk,
  opportunities,
}: {
  atRisk: import("@/lib/victory-os/types").CountyVictoryContext[];
  opportunities: import("@/lib/victory-os/types").CountyVictoryContext[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <CountyIntelList id="section-risk" title="Counties at risk" counties={atRisk} />
      <CountyIntelList id="section-opportunities" title="Strategic opportunities" counties={opportunities} />
    </div>
  );
}

function CountyIntelList({
  id,
  title,
  counties,
}: {
  id: string;
  title: string;
  counties: import("@/lib/victory-os/types").CountyVictoryContext[];
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-kelly-text/10 bg-white/70 p-4">
      <h4 className="font-body text-xs font-bold uppercase tracking-wider text-kelly-muted">{title}</h4>
      {counties.length === 0 ? (
        <p className="mt-2 font-body text-sm text-kelly-muted">None flagged this week.</p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {counties.map((c) => (
            <li key={c.countySlug}>
              <Link
                href={`/admin/counties/${c.countySlug}`}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${OPS_BADGE[c.opsStatus]}`}
              >
                {c.county}
                <span className="font-mono opacity-70">{c.deploymentPriority.deploymentPriority}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
