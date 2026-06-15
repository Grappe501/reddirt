import Link from "next/link";

import {
  PO5_CONVERSATIONS_PER_LEADER,
  PO5_VOTERS_PER_LEADER,
  countyVictoryTargetsHref,
  countyVictoryTargetsExecutiveHref,
  getAllCountyVictoryTargets,
  getCountyVictoryTargetsRollup,
  type CityVictoryTarget,
  type CountyVictoryTarget,
  type VictoryEffortLevel,
  effortLevelLabel,
  effortLevelShortLabel,
  formatPercentIncrease,
} from "@/lib/election-plan/load-county-victory-targets";
import { formatVotes } from "@/lib/election-plan/electionPlanData";
import { countyPlaybookHref } from "@/lib/election-plan/location-links";
import { cn } from "@/lib/utils";

type Variant = "hero" | "compact" | "city" | "inline";

type CountyProps = {
  target: CountyVictoryTarget;
  variant?: Variant;
};

type CityProps = {
  target: CityVictoryTarget;
  variant?: Variant;
};

function EffortBadge({ level, strategic }: { level: VictoryEffortLevel; strategic: boolean }) {
  const colors: Record<VictoryEffortLevel, string> = {
    green: "bg-emerald-100 text-emerald-900 border-emerald-300",
    yellow: "bg-amber-100 text-amber-900 border-amber-300",
    red: "bg-red-100 text-red-900 border-red-300",
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase", colors[level])}>
        {effortLevelShortLabel(level)}
      </span>
      {strategic ? (
        <span className="rounded-full border border-blue-400 bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-900">
          ★ Strategic
        </span>
      ) : null}
    </div>
  );
}

function MetricBlock({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn("rounded-lg border p-3", highlight ? "border-[var(--ep-gold)] bg-[var(--ep-cream)]" : "border-[var(--ep-border)]")}>
      <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">{label}</p>
      <p className="mt-1 font-heading text-xl font-bold text-[var(--ep-navy)]">{value}</p>
      {sub ? <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{sub}</p> : null}
    </div>
  );
}

function Po5Translation({ leaders }: { leaders: number }) {
  return (
    <p className="text-sm text-[var(--ep-navy-muted)]">
      <strong className="text-[var(--ep-navy)]">{leaders} leaders</strong> × {PO5_VOTERS_PER_LEADER} voters ×{" "}
      {PO5_CONVERSATIONS_PER_LEADER} conversations
    </p>
  );
}

export function CountyVictoryTargetsPanel({ target, variant = "hero" }: CountyProps) {
  if (variant === "compact") {
    return (
      <div className="space-y-2 text-sm">
        <EffortBadge level={target.effortLevel} strategic={target.isStrategic} />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-[var(--ep-navy-muted)]">Growth needed</p>
            <p className="font-bold">+{formatVotes(target.growthNeeded)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--ep-navy-muted)]">Increase</p>
            <p className="font-bold">{formatPercentIncrease(target.percentIncrease)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--ep-navy-muted)]">Weekly pace</p>
            <p className="font-bold">{formatVotes(target.weeklyVoteGoal)}/wk</p>
          </div>
          <div>
            <p className="text-xs text-[var(--ep-navy-muted)]">Po5 leaders</p>
            <p className="font-bold">{target.powerOf5LeadersNeeded}</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <p className="text-sm text-[var(--ep-navy-muted)]">
        Need <strong className="text-[var(--ep-navy)]">{formatPercentIncrease(target.percentIncrease)}</strong> (
        +{formatVotes(target.growthNeeded)} votes) · {formatVotes(target.weeklyVoteGoal)}/week ·{" "}
        {target.powerOf5LeadersNeeded} Po5 leaders
      </p>
    );
  }

  const title = variant === "city" ? undefined : `${target.county} County Victory Target`;

  return (
    <div className="ep-card border-l-4 border-[var(--ep-gold)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">
            Phase 18.7G · County Victory Targets
          </p>
          {title ? <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">{title}</h2> : null}
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            How many more votes do we need — in language local leaders understand
          </p>
        </div>
        <EffortBadge level={target.effortLevel} strategic={target.isStrategic} />
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Current Democratic baseline</p>
        <p className="mt-2 text-sm">
          2022 Democratic SOS vote: <strong>{formatVotes(target.demVote2022)}</strong>
        </p>
        <p className="text-sm">
          2024 Democratic Treasurer vote: <strong>{formatVotes(target.demVote2024)}</strong>
        </p>
        <p className="mt-2 text-sm font-semibold text-[var(--ep-navy)]">
          Planning baseline: {formatVotes(target.planningBaseline)}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricBlock label="Campaign target" value={formatVotes(target.targetVote)} highlight />
        <MetricBlock label="Net growth required" value={`+${formatVotes(target.growthNeeded)}`} />
        <MetricBlock label="Percent growth required" value={formatPercentIncrease(target.percentIncrease)} />
        <MetricBlock label="Weeks remaining" value={String(target.weeksRemaining)} />
        <MetricBlock label="Weekly vote goal" value={formatVotes(target.weeklyVoteGoal)} sub="votes per week" />
        <MetricBlock
          label="Power of 5 leaders needed"
          value={String(target.powerOf5LeadersNeeded)}
          sub={`${PO5_VOTERS_PER_LEADER} voters × ${PO5_CONVERSATIONS_PER_LEADER} conversations each`}
        />
      </div>

      <div className="mt-4">
        <Po5Translation leaders={target.powerOf5LeadersNeeded} />
        <p className="mt-2 text-xs italic text-[var(--ep-navy-muted)]">{effortLevelLabel(target.effortLevel)}</p>
      </div>
    </div>
  );
}

export function CityVictoryTargetsPanel({ target, variant = "hero" }: CityProps) {
  if (variant === "compact") {
    return (
      <div className="space-y-2 text-sm">
        <EffortBadge level={target.effortLevel} strategic={target.isStrategic} />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-[var(--ep-navy-muted)]">Growth needed</p>
            <p className="font-bold">+{formatVotes(target.growthNeeded)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--ep-navy-muted)]">Increase</p>
            <p className="font-bold">{formatPercentIncrease(target.percentIncrease)}</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <p className="text-sm text-[var(--ep-navy-muted)]">
        Need <strong className="text-[var(--ep-navy)]">{formatPercentIncrease(target.percentIncrease)}</strong> (
        +{formatVotes(target.growthNeeded)} votes) · {formatVotes(target.weeklyVoteGoal)}/week
      </p>
    );
  }

  return (
    <div className="ep-card border-l-4 border-emerald-600">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">City victory target</p>
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">{target.name}</h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{target.county} County · local organizing goal</p>
        </div>
        <EffortBadge level={target.effortLevel} strategic={target.isStrategic} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricBlock label="Baseline vote" value={formatVotes(target.planningBaseline)} />
        <MetricBlock label="Target vote" value={formatVotes(target.targetVote)} highlight />
        <MetricBlock label="Growth needed" value={`+${formatVotes(target.growthNeeded)}`} />
        <MetricBlock label="Required increase" value={formatPercentIncrease(target.percentIncrease)} />
        <MetricBlock label="Weekly vote goal" value={formatVotes(target.weeklyVoteGoal)} />
        <MetricBlock label="Po5 leaders needed" value={String(target.powerOf5LeadersNeeded)} />
      </div>

      <div className="mt-4">
        <Po5Translation leaders={target.powerOf5LeadersNeeded} />
      </div>
    </div>
  );
}

export function CountyVictoryTargetsTable({
  counties,
  showLinks = true,
}: {
  counties: CountyVictoryTarget[];
  showLinks?: boolean;
}) {
  const sorted = [...counties].sort((a, b) => b.growthNeeded - a.growthNeeded);

  return (
    <div className="overflow-x-auto ep-card">
      <table className="w-full min-w-[48rem] text-sm">
        <thead>
          <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
            <th className="py-2 pr-3">County</th>
            <th className="py-2 pr-3 text-right">Baseline</th>
            <th className="py-2 pr-3 text-right">Target</th>
            <th className="py-2 pr-3 text-right">Growth</th>
            <th className="py-2 pr-3 text-right">% Increase</th>
            <th className="py-2 pr-3 text-right">Weekly</th>
            <th className="py-2 pr-3 text-right">Po5</th>
            <th className="py-2">Effort</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.county} className="border-b border-[var(--ep-border)] last:border-0 hover:bg-slate-50/50">
              <td className="py-2 pr-3 font-medium">
                {showLinks ? (
                  <Link href={countyPlaybookHref(row.county, row.slug)} className="hover:underline">
                    {row.county}
                    {row.isStrategic ? " ★" : ""}
                  </Link>
                ) : (
                  <>
                    {row.county}
                    {row.isStrategic ? " ★" : ""}
                  </>
                )}
              </td>
              <td className="py-2 pr-3 text-right tabular-nums">{formatVotes(row.planningBaseline)}</td>
              <td className="py-2 pr-3 text-right tabular-nums font-semibold">{formatVotes(row.targetVote)}</td>
              <td className="py-2 pr-3 text-right tabular-nums text-emerald-800">+{formatVotes(row.growthNeeded)}</td>
              <td className="py-2 pr-3 text-right tabular-nums font-semibold">
                {formatPercentIncrease(row.percentIncrease)}
              </td>
              <td className="py-2 pr-3 text-right tabular-nums">{formatVotes(row.weeklyVoteGoal)}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{row.powerOf5LeadersNeeded}</td>
              <td className="py-2">
                <EffortBadge level={row.effortLevel} strategic={false} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CountyVictoryTargetsExecutivePanel() {
  const counties = getAllCountyVictoryTargets();
  const rollup = getCountyVictoryTargetsRollup();

  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Phase 18.7G</p>
      <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">County Victory Targets</h1>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
        Translate statewide strategy into votes, percent increase, weekly pace, and Power of 5 leaders — for all 75 counties
      </p>

      <div className="my-6 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(rollup.totalBaseline)}</div>
          <div className="ep-stat-label">Statewide baseline</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(rollup.totalTarget)}</div>
          <div className="ep-stat-label">Statewide target</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">+{formatVotes(rollup.totalGrowthNeeded)}</div>
          <div className="ep-stat-label">Total growth needed</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.totalPo5Leaders.toLocaleString()}</div>
          <div className="ep-stat-label">Po5 leaders (statewide)</div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3 text-xs">
        <span className="rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 font-semibold text-emerald-900">
          Green {rollup.greenCount} · 0–10%
        </span>
        <span className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 font-semibold text-amber-900">
          Yellow {rollup.yellowCount} · 10–20%
        </span>
        <span className="rounded-full border border-red-300 bg-red-100 px-3 py-1 font-semibold text-red-900">
          Red {rollup.redCount} · 20%+
        </span>
        <span className="rounded-full border border-blue-400 bg-blue-100 px-3 py-1 font-semibold text-blue-900">
          ★ Strategic {rollup.strategicCount}
        </span>
      </div>

      <CountyVictoryTargetsTable counties={counties} />

      <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">
        Every county playbook inherits these numbers. Source: Kelly win-target scenario + SOS election history.
      </p>
      <Link href={countyVictoryTargetsHref()} className="mt-2 inline-block text-xs font-semibold underline">
        County victory targets hub →
      </Link>
    </section>
  );
}

export function CountyVictoryTargetsSummaryStrip() {
  const rollup = getCountyVictoryTargetsRollup();
  return (
    <Link
      href={countyVictoryTargetsExecutiveHref()}
      className="block ep-card transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
    >
      <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Phase 18.7G · Victory targets</p>
      <p className="mt-1 font-heading font-bold text-[var(--ep-navy)]">County vote math</p>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
        +{formatVotes(rollup.totalGrowthNeeded)} statewide · {rollup.redCount} red counties · read in local language
      </p>
    </Link>
  );
}
