import type { TeamProgressDemo } from "@/lib/power-of-5/personal-dashboard-demo";
import { CountySectionHeader } from "@/components/county/dashboard/CountySectionHeader";
import { countyDashboardCardClass } from "@/components/county/dashboard/countyDashboardClassNames";
import { CountySourceBadge } from "@/components/county/dashboard/countyDashboardFormat";
import { cn } from "@/lib/utils";

function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-kelly-text/70">
        <span>{label}</span>
        <span className="font-semibold text-kelly-navy">
          {value} / {max}
        </span>
      </div>
      <div
        className="mt-1 h-2 overflow-hidden rounded-full bg-kelly-navy/10"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div className="h-full rounded-full bg-kelly-navy/70 transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

type Props = {
  team: TeamProgressDemo;
  className?: string;
};

/**
 * Team-level progress: roster momentum and weekly conversation cadence (demo).
 */
export function MyTeamPanel({ team, className }: Props) {
  return (
    <section className={className}>
      <CountySectionHeader
        overline="My team"
        title={team.teamName}
        description={
          <>
            {team.countyLabel}. <CountySourceBadge source="demo" note="Team stats are illustrative" />
          </>
        }
      />
      <div className={cn(countyDashboardCardClass, "mt-4 space-y-5")}>
        <ProgressBar value={team.membersActive} max={team.membersGoal} label="Active members (demo roster)" />
        <ProgressBar
          value={team.conversationsThisWeek}
          max={team.weeklyConversationGoal}
          label="Team conversations this week"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-kelly-text/10 bg-kelly-page/95 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-text/55">Open follow-ups</p>
            <p className="mt-1 font-heading text-2xl font-bold text-kelly-navy">{team.openFollowUps}</p>
            <p className="mt-0.5 text-xs text-kelly-text/65">Across the team queue (demo)</p>
          </div>
          <div className="rounded-xl border border-kelly-text/10 bg-kelly-page/95 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-text/55">Consistency streak</p>
            <p className="mt-1 font-heading text-2xl font-bold text-kelly-navy">{team.consistencyStreakWeeks} wk</p>
            <p className="mt-0.5 text-xs text-kelly-text/65">Weeks with logged team activity</p>
          </div>
        </div>
      </div>
    </section>
  );
}
