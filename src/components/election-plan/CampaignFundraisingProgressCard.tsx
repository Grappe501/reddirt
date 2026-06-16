import { formatBudget } from "@/lib/election-plan/electionPlanData";
import {
  fundraisingProgressView,
  type WarRoomFundraisingFields,
} from "@/lib/election-plan/load-fundraising-tracker";
import { cn } from "@/lib/utils";

type Props = {
  data: WarRoomFundraisingFields;
  variant?: "war" | "dashboard";
};

/** Compact KPI for Executive War Room header stat row */
export function WarRoomFundraisingHeaderStat({ data }: { data: WarRoomFundraisingFields }) {
  const f = fundraisingProgressView(data);

  return (
    <div className="ep-card ep-war-stat">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="ep-war-stat-label mb-0">Fundraising</div>
        {f.raisedProvisional ? (
          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-900">
            Pending filing
          </span>
        ) : null}
      </div>
      <div className="ep-war-stat-value tabular-nums">
        {formatBudget(f.raised)} / {formatBudget(f.networkGoal)}
      </div>
      <div className="ep-war-stat-label">$60K milestone</div>
      <div className="ep-progress mx-auto mt-2 max-w-[12rem]">
        <div className="ep-progress-bar bg-[var(--ep-gold)]" style={{ width: `${f.networkPct}%` }} />
      </div>
      <p className="mt-2 text-[10px] text-[var(--ep-navy-muted)]">
        {Math.round(f.networkPct)}% milestone · {formatBudget(f.combinedGoal)} overall
      </p>
    </div>
  );
}

export function CampaignFundraisingProgressCard({ data, variant = "war" }: Props) {
  const f = fundraisingProgressView(data);
  const isWar = variant === "war";

  return (
    <div className={cn(isWar ? "ep-card" : "rounded-lg border border-[var(--ep-border)] p-4")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
          Fundraising
        </div>
        {f.raisedProvisional ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
            Pending filing
          </span>
        ) : null}
      </div>

      <div className={cn("font-heading font-bold text-[var(--ep-navy)]", isWar ? "mt-1 text-xl" : "mt-2 text-2xl")}>
        {formatBudget(f.raised)}
        {f.raisedProvisional ? (
          <span className="text-base font-normal text-[var(--ep-navy-muted)]"> raised (provisional)</span>
        ) : (
          <span className="text-base font-normal text-[var(--ep-navy-muted)]"> raised</span>
        )}
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
          <span className="font-semibold text-[var(--ep-navy)]">$60K milestone</span>
          <span className="tabular-nums text-[var(--ep-navy-muted)]">
            {formatBudget(f.raised)} / {formatBudget(f.networkGoal)}
          </span>
        </div>
        <div className="ep-progress mt-2">
          <div className="ep-progress-bar bg-[var(--ep-gold)]" style={{ width: `${f.networkPct}%` }} />
        </div>
        <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
          {Math.round(f.networkPct)}% of $60K milestone
          {f.raisedProvisional ? " · update after filing next week" : ""}
        </p>
      </div>

      <div className="mt-4 border-t border-[var(--ep-border)] pt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
          <span className="font-semibold text-[var(--ep-navy)]">Overall target</span>
          <span className="font-heading text-lg font-bold tabular-nums text-[var(--ep-navy)]">
            {formatBudget(f.combinedGoal)}
          </span>
        </div>
        <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
          {formatBudget(f.networkGoal)} milestone + {formatBudget(f.workingCampaignGoal)} working campaign
        </p>
        <div className="ep-progress mt-2">
          <div className="ep-progress-bar" style={{ width: `${f.combinedPct}%` }} />
        </div>
        <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
          {Math.round(f.combinedPct)}% of combined target · {formatBudget(Math.max(0, f.combinedGoal - f.raised))}{" "}
          remaining
        </p>
      </div>

      {f.raisedNote ? (
        <p className="mt-3 text-xs leading-relaxed text-amber-900/90">{f.raisedNote}</p>
      ) : null}
      {f.note ? <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{f.note}</p> : null}
      <p className="mt-3 text-xs leading-relaxed text-[var(--ep-navy-muted)]">
        Geographic goals follow the{" "}
        <strong className="text-[var(--ep-navy)]">Fundraising Operating System</strong> — vote-target allocation to
        Top 40 communities ($300K state goal). See community and county workbenches for base / stretch goals.
      </p>
    </div>
  );
}
