import Link from "next/link";
import type { LiveEventSummary } from "@/lib/intelligence/v4/phase16P8LiveEventMode";

export function CandidateLiveEventStrip({ summary }: { summary: LiveEventSummary }) {
  const { countdown, dayOfPlan } = summary;
  const active = summary.modeActive;

  return (
    <section
      className={`rounded-xl border p-4 text-xs ${
        active
          ? countdown.isDayOf
            ? "border-rose-400 bg-rose-50/60 text-rose-950"
            : "border-orange-400 bg-orange-50/60 text-orange-950"
          : "border-slate-200 bg-slate-50/40 text-slate-800"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Phase 16 · Live event</p>
          <p className="mt-1 leading-relaxed">{summary.tonightReminder}</p>
        </div>
        {active && !countdown.isPast ? (
          <p className="text-right font-mono text-[10px]">
            {countdown.isDayOf ? "DAY OF" : `${countdown.daysRemaining}d`} · {countdown.hoursRemaining}h
          </p>
        ) : null}
      </div>
      {active ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={summary.hubHref}
            className="inline-block rounded-full border border-orange-500 bg-white px-3 py-1 text-[10px] font-bold"
          >
            Live event hub →
          </Link>
          <Link
            href={dayOfPlan.launchHref}
            className="inline-block rounded-full border border-orange-400 bg-white px-3 py-1 text-[10px] font-bold"
          >
            {dayOfPlan.totalMinutes}-min safe path ({dayOfPlan.stepCount} steps) →
          </Link>
          <Link
            href={summary.accaPrepHref}
            className="inline-block rounded-full border border-orange-300 bg-white px-3 py-1 text-[10px] font-bold"
          >
            ACCA prep →
          </Link>
        </div>
      ) : (
        <Link
          href={summary.hubHref}
          className="mt-3 inline-block rounded-full border border-slate-300 bg-white px-3 py-1 text-[10px] font-bold"
        >
          Live event mode →
        </Link>
      )}
    </section>
  );
}
