import {
  formatMissionMetricValue,
  getMissionProgressPrimaryMetric,
  missionProgressPct,
  missionProgressRemaining,
  type MissionProgressRecord,
} from "@/lib/election-plan/load-immersion-mission-progress";

type Props = {
  progress: MissionProgressRecord;
  missionHeadline: string;
  compact?: boolean;
};

export function MissionProgressPanel({ progress, missionHeadline, compact = false }: Props) {
  const primary = getMissionProgressPrimaryMetric(progress);

  if (compact && primary) {
    return (
      <div className="mt-3 rounded-lg border-2 border-[var(--ep-navy)] bg-white px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--ep-navy)]">Mission progress</p>
        <p className="mt-1 font-heading text-xl font-bold text-[var(--ep-navy)]">
          {formatMissionMetricValue(primary)}
          <span className="ml-2 text-sm font-normal text-[var(--ep-navy-muted)]">
            · {missionProgressRemaining(primary)} remaining
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border-2 border-[var(--ep-navy)] bg-gradient-to-br from-slate-50 to-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-navy)]">Mission progress · Results</p>
          <h3 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">{missionHeadline}</h3>
        </div>
        <div className="text-right text-xs text-[var(--ep-navy-muted)]">
          <p>
            Owner: <strong className="text-[var(--ep-navy)]">{progress.owner}</strong>
          </p>
          <p>Updated {new Date(progress.updatedAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</p>
        </div>
      </div>

      {primary ? (
        <div className="mt-4 rounded-lg bg-[var(--ep-navy)] px-4 py-4 text-white">
          <p className="text-xs font-bold uppercase tracking-wide text-white/70">Primary metric</p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
            <p className="font-heading text-3xl font-bold tabular-nums">{formatMissionMetricValue(primary)}</p>
            <p className="text-sm text-white/80">{missionProgressRemaining(primary).toLocaleString()} remaining</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-[var(--ep-gold)]"
              style={{ width: `${missionProgressPct(primary)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-white/70">{missionProgressPct(primary).toFixed(0)}% of goal</p>
        </div>
      ) : null}

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {progress.metrics
          .filter((m) => !m.primary)
          .map((m) => (
            <li key={m.id} className="rounded-lg border border-[var(--ep-border)] bg-white px-3 py-2">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium text-[var(--ep-navy)]">{m.label}</span>
                <span className="tabular-nums font-bold">{formatMissionMetricValue(m)}</span>
              </div>
              <div className="ep-progress mt-2">
                <div className="ep-progress-bar bg-[var(--ep-gold)]" style={{ width: `${missionProgressPct(m)}%` }} />
              </div>
            </li>
          ))}
      </ul>

      <div className="mt-4 rounded-lg border border-[var(--ep-gold)] bg-[var(--ep-cream)] px-3 py-2 text-sm">
        <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">What happens next</p>
        <p className="mt-1 text-[var(--ep-navy)]">{progress.nextAction}</p>
      </div>
    </div>
  );
}
