import type { PersonalGamificationSnapshot } from "@/lib/power-of-5/gamification";
import { CountySectionHeader } from "@/components/county/dashboard/CountySectionHeader";
import { countyDashboardCardClass } from "@/components/county/dashboard/countyDashboardClassNames";
import { CountySourceBadge, formatCountyDashboardNumber } from "@/components/county/dashboard/countyDashboardFormat";
import { cn } from "@/lib/utils";

type Props = {
  snapshot: PersonalGamificationSnapshot;
  className?: string;
};

export function GamificationPanel({ snapshot, className }: Props) {
  const { xp, badges, streaks, missions } = snapshot;
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <section className={className}>
      <CountySectionHeader
        overline="Momentum"
        title="XP, badges & missions"
        description={
          <>
            Cooperative recognition — private to you and your team leads. No public leaderboards in this product slice.{" "}
            <CountySourceBadge source="demo" note="Totals derived from demo dashboard fields" />
          </>
        }
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className={cn(countyDashboardCardClass, "border-l-4 border-l-kelly-gold/70 lg:col-span-1")}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-text/55">Experience</p>
          <p className="mt-2 font-heading text-xl font-bold text-kelly-navy">
            Level {xp.level} — {xp.levelTitle}
          </p>
          <p className="mt-1 text-sm text-kelly-text/75">
            <strong>{formatCountyDashboardNumber(xp.totalXp)}</strong> XP (demo ledger)
          </p>
          {xp.xpToReachNextLevel != null ? (
            <>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-kelly-text/10" role="progressbar" aria-valuenow={Math.round(xp.progressInLevel * 100)} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-kelly-gold/90 transition-[width]" style={{ width: `${Math.round(xp.progressInLevel * 100)}%` }} />
              </div>
              <p className="mt-2 text-xs text-kelly-text/65">
                {formatCountyDashboardNumber(xp.xpToReachNextLevel)} XP to next level
              </p>
            </>
          ) : (
            <p className="mt-3 text-xs text-kelly-text/65">Top demo band — live caps TBD.</p>
          )}
        </div>

        <div className={cn(countyDashboardCardClass, "lg:col-span-2")}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-text/55">Streaks</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {streaks.map((s) => (
              <div key={s.id} className="rounded-lg border border-kelly-text/10 bg-kelly-page/60 px-3 py-2">
                <p className="text-xs font-bold text-kelly-navy">{s.label}</p>
                <p className="mt-1 font-heading text-2xl font-bold text-kelly-navy">
                  {formatCountyDashboardNumber(s.current)}
                  <span className="ml-1 text-sm font-normal text-kelly-text/60">{s.unit}</span>
                </p>
                <p className="mt-1 text-[11px] leading-snug text-kelly-text/65">{s.caption}</p>
                <p className="mt-1 text-[10px] text-kelly-text/50">Best (demo): {formatCountyDashboardNumber(s.best)} {s.unit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className={countyDashboardCardClass}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-text/55">Badges ({earnedCount}/{badges.length})</p>
          <ul className="mt-3 space-y-2">
            {badges.map((b) => (
              <li
                key={b.id}
                className={cn(
                  "flex gap-2 rounded-lg border px-3 py-2 text-sm",
                  b.earned ? "border-kelly-success/40 bg-kelly-success/5 text-kelly-text" : "border-kelly-text/10 bg-kelly-page/50 text-kelly-text/55",
                )}
              >
                <span aria-hidden className="select-none">{b.earned ? "◆" : "◇"}</span>
                <span>
                  <span className="font-semibold text-kelly-navy">{b.name}</span>
                  <span className="block text-xs text-kelly-text/70">{b.description}</span>
                  {b.earned && b.earnedLabel ? <span className="mt-0.5 block text-[10px] text-kelly-text/50">{b.earnedLabel}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={countyDashboardCardClass}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-text/55">Missions</p>
          <ul className="mt-3 space-y-3">
            {missions.map((m) => (
              <li key={m.id} className="rounded-lg border border-kelly-text/10 bg-kelly-page/60 px-3 py-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-kelly-navy">{m.title}</p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      m.status === "complete" && "bg-kelly-success/15 text-kelly-success",
                      m.status === "active" && "bg-kelly-slate/10 text-kelly-navy",
                      m.status === "locked" && "bg-kelly-text/10 text-kelly-text/55",
                    )}
                  >
                    {m.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-kelly-text/70">{m.description}</p>
                <p className="mt-2 text-xs text-kelly-text/80">
                  Progress:{" "}
                  <strong>
                    {formatCountyDashboardNumber(Math.min(m.current, m.target))}/{formatCountyDashboardNumber(m.target)}
                  </strong>
                  {" · "}
                  <span className="text-kelly-text/60">+{m.xpReward} XP on complete</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
