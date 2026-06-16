import Link from "next/link";

import {
  getImmersionDoctrineHref,
  type ImmersionCountyMission,
} from "@/lib/election-plan/load-immersion-county-missions";

type Props = {
  mission: ImmersionCountyMission;
  variant?: "hero" | "compact";
};

export function ImmersionCountyMissionCard({ mission, variant = "hero" }: Props) {
  const detailHref = mission.href ?? getImmersionDoctrineHref();

  if (variant === "compact") {
    return (
      <div className="rounded-lg border border-[var(--ep-gold)]/40 bg-[var(--ep-cream)] px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">One mission</p>
        <p className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">{mission.headline}</p>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{mission.tagline}</p>
      </div>
    );
  }

  return (
    <div className="ep-card border-l-4 border-[var(--ep-gold)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">
            Campaign doctrine · One mission · {mission.community}
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-[var(--ep-navy)]">{mission.headline}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{mission.tagline}</p>
        </div>
        <span className="rounded-full bg-[var(--ep-navy)] px-3 py-1 text-[10px] font-bold uppercase text-white">
          Own this
        </span>
      </div>

      <p className="mt-4 text-sm">
        <span className="font-semibold text-[var(--ep-navy)]">Success metric:</span>{" "}
        <span className="text-[var(--ep-navy-muted)]">{mission.successMetric}</span>
      </p>

      {mission.primaryGoal != null ? (
        <div className="mt-4 rounded-lg bg-[var(--ep-cream)] px-4 py-3">
          <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Goal</p>
          <p className="font-heading text-3xl font-bold text-[var(--ep-navy)]">
            {mission.primaryGoal.toLocaleString()}{" "}
            <span className="text-base font-semibold">{mission.primaryGoalLabel ?? "units"}</span>
          </p>
        </div>
      ) : null}

      {mission.subTargets && mission.subTargets.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Targets</p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {mission.subTargets.map((t) => (
              <li key={t.label} className="flex justify-between rounded-lg border border-[var(--ep-border)] px-3 py-2 text-sm">
                <span>{t.label}</span>
                <strong>{t.goal.toLocaleString()}</strong>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {mission.activityTypes && mission.activityTypes.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Counts as a conversation</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {mission.activityTypes.map((a) => (
              <span key={a} className="rounded-full bg-white px-3 py-1 text-xs font-medium border border-[var(--ep-border)]">
                {a}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {mission.thenSteps && mission.thenSteps.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Then</p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-[var(--ep-navy-muted)]">
            {mission.thenSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
      ) : null}

      {mission.notThis && mission.notThis.length > 0 ? (
        <p className="mt-4 text-xs italic text-[var(--ep-navy-muted)]">
          Not this mission: {mission.notThis.join(" · ")}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3 border-t border-[var(--ep-border)] pt-4">
        <Link href={detailHref} className="text-xs font-semibold text-[var(--ep-navy)] hover:underline">
          Mission detail →
        </Link>
        <Link href={getImmersionDoctrineHref()} className="text-xs font-semibold text-[var(--ep-navy)] hover:underline">
          Campaign Doctrine · Ch. 0 →
        </Link>
        <Link href="/election-plan/immersion-missions" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline">
          All immersion missions →
        </Link>
      </div>
    </div>
  );
}
