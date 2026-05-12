import {
  GLOBAL_NEW_VOTER_REGISTRATION_GOAL,
} from "@/lib/campaign-dates";
import type { CountyRegistrationGoalCardData } from "@/lib/campaign-engine/county-registration-goal-load";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: CountyRegistrationGoalCardData["dataStatus"] }) {
  const styles: Record<CountyRegistrationGoalCardData["dataStatus"], string> = {
    live: "border-emerald-500/35 bg-emerald-500/[0.08] text-emerald-900",
    demo: "border-amber-500/40 bg-amber-500/[0.12] text-amber-950",
    not_connected: "border-kelly-text/20 bg-kelly-text/[0.05] text-kelly-text/80",
  };
  const labels: Record<CountyRegistrationGoalCardData["dataStatus"], string> = {
    live: "Live data",
    demo: "Planning view",
    not_connected: "Not connected yet",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide",
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  );
}

function TwentySquareStrip({ percent }: { percent: number | null }) {
  const safe = percent == null || Number.isNaN(percent) ? 0 : Math.max(0, Math.min(100, percent));
  const filled = Math.min(20, Math.round(safe / 5));
  return (
    <div className="mt-3">
      <p className="mb-1.5 font-body text-[10px] font-bold uppercase tracking-wide text-kelly-text/45">Progress · 5% per square</p>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square rounded-sm border border-kelly-text/10",
              i < filled ? "bg-kelly-blue/70" : "bg-kelly-fog/80",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function CountyRegistrationGoalCard({
  mode,
  data,
  teamRegistrationsTracked,
  className,
}: {
  mode: "county" | "community";
  data?: CountyRegistrationGoalCardData | null;
  /** Team P5 / VOS rollup — optional contextual line on county cards. */
  teamRegistrationsTracked?: number | null;
  className?: string;
}) {
  if (mode === "community") {
    return (
      <section
        className={cn(
          "rounded-2xl border border-kelly-navy/10 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5",
          className,
        )}
        aria-label="Statewide registration ambition"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-text/50">Statewide</p>
            <h3 className="mt-1 font-heading text-base font-bold text-kelly-navy">
              {GLOBAL_NEW_VOTER_REGISTRATION_GOAL.toLocaleString()} new registrations (goal)
            </h3>
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            <span
              className={cn(
                "inline-flex items-center rounded-full border border-kelly-navy/25 bg-kelly-navy/[0.06] px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide text-kelly-navy",
              )}
            >
              Campaign target
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full border border-kelly-text/20 bg-kelly-text/[0.05] px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide text-kelly-text/80",
              )}
            >
              Regional rollup pending
            </span>
          </div>
        </div>
        <p className="mt-2 font-body text-sm text-kelly-text/80">
          Community contribution totals are being connected to live county metrics. Until then, this card shows the statewide goal
          and keeps space for regional rollups that respect mosque, campus, and neighborhood privacy.
        </p>
      </section>
    );
  }

  if (!data) {
    return (
      <section
        className={cn(
          "rounded-2xl border border-dashed border-kelly-text/20 bg-kelly-fog/30 p-4 sm:p-5",
          className,
        )}
        aria-label="County registration goal"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-heading text-base font-bold text-kelly-navy">County registration goal</h3>
          <StatusBadge status="not_connected" />
        </div>
        <p className="mt-2 font-body text-sm text-kelly-text/80">County goal data is being connected.</p>
        <p className="mt-2 font-body text-xs text-kelly-text/60">
          Statewide ambition: {GLOBAL_NEW_VOTER_REGISTRATION_GOAL.toLocaleString()} new voter registrations.
        </p>
      </section>
    );
  }

  if (data.registrationGoal == null) {
    return (
      <section
        className={cn(
          "rounded-2xl border border-dashed border-kelly-text/20 bg-kelly-fog/30 p-4 sm:p-5",
          className,
        )}
        aria-label={`${data.countyDisplayName} registration goal`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-heading text-base font-bold text-kelly-navy">{data.countyDisplayName}</h3>
          <StatusBadge status={data.dataStatus} />
        </div>
        <p className="mt-2 font-body text-sm text-kelly-text/80">County goal data is being connected.</p>
        {data.registrationsSoFar != null ? (
          <p className="mt-2 font-body text-xs text-kelly-text/70">
            Registrations reported so far (partial):{" "}
            <span className="font-semibold text-kelly-deep">{data.registrationsSoFar.toLocaleString()}</span>
          </p>
        ) : null}
        <p className="mt-2 font-body text-xs text-kelly-text/60">
          Statewide ambition: {GLOBAL_NEW_VOTER_REGISTRATION_GOAL.toLocaleString()} new voter registrations.
        </p>
      </section>
    );
  }

  const goal = data.registrationGoal!;
  const soFar = data.registrationsSoFar ?? 0;
  const remaining = Math.max(0, goal - soFar);
  const pct = goal > 0 ? Math.min(100, (soFar / goal) * 100) : null;
  const statewideSharePct = goal > 0 ? Math.min(100, (goal / GLOBAL_NEW_VOTER_REGISTRATION_GOAL) * 100) : null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-kelly-text/10 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5",
        className,
      )}
      aria-label={`${data.countyDisplayName} registration goal`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-text/50">County target</p>
          <h3 className="mt-1 font-heading text-base font-bold text-kelly-navy">{data.countyDisplayName}</h3>
        </div>
        <StatusBadge status={data.dataStatus} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-kelly-text/8 bg-kelly-page/90 px-3 py-2">
          <dt className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Goal</dt>
          <dd className="mt-0.5 font-mono text-lg font-bold text-kelly-navy">{goal.toLocaleString()}</dd>
        </div>
        <div className="rounded-xl border border-kelly-text/8 bg-kelly-page/90 px-3 py-2">
          <dt className="font-body text-[10px] font-bold uppercase text-kelly-text/50">So far</dt>
          <dd className="mt-0.5 font-mono text-lg font-bold text-kelly-navy">{data.registrationsSoFar == null ? "—" : soFar.toLocaleString()}</dd>
        </div>
        <div className="rounded-xl border border-kelly-text/8 bg-kelly-page/90 px-3 py-2">
          <dt className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Remaining</dt>
          <dd className="mt-0.5 font-mono text-lg font-bold text-kelly-navy">{remaining.toLocaleString()}</dd>
        </div>
        <div className="rounded-xl border border-kelly-text/8 bg-kelly-page/90 px-3 py-2">
          <dt className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Complete</dt>
          <dd className="mt-0.5 font-mono text-lg font-bold text-kelly-navy">{pct == null ? "—" : `${Math.round(pct)}%`}</dd>
        </div>
      </dl>

      <TwentySquareStrip percent={pct} />

      <div className="mt-4 rounded-xl border border-kelly-blue/20 bg-kelly-blue/[0.05] px-3 py-2">
        <p className="font-body text-xs font-semibold text-kelly-navy">Statewide ambition</p>
        <p className="mt-1 font-body text-xs text-kelly-text/80">
          {GLOBAL_NEW_VOTER_REGISTRATION_GOAL.toLocaleString()} new registrations (campaign-wide goal). This county&apos;s numeric
          target is <span className="font-semibold text-kelly-deep">{goal.toLocaleString()}</span>
          {statewideSharePct != null ? (
            <>
              {" "}
              (~{Math.round(statewideSharePct)}% of the statewide goal by target share).
            </>
          ) : null}
        </p>
        {teamRegistrationsTracked != null ? (
          <p className="mt-2 font-body text-xs text-kelly-text/75">
            This team has <span className="font-semibold text-kelly-deep">{teamRegistrationsTracked.toLocaleString()}</span>{" "}
            voter registrations tracked in VOS (relational P5 / VR lane — not the full county file).
          </p>
        ) : null}
      </div>
    </section>
  );
}
