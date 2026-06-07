import Link from "next/link";
import type { LiveEventDayOfPlan, LiveEventSummary } from "@/lib/intelligence/v4/phase16P8LiveEventMode";

export function CandidateLiveEventPanel({
  summary,
  plan,
}: {
  summary: LiveEventSummary;
  plan: LiveEventDayOfPlan;
}) {
  const { countdown } = summary;

  return (
    <div className="space-y-8">
      <section
        className={`rounded-xl border p-5 text-sm ${
          countdown.isDayOf ? "border-rose-300 bg-rose-50/50" : "border-orange-200 bg-orange-50/40"
        }`}
      >
        <h2 className="font-heading text-lg font-bold text-kelly-navy">{summary.countdown.eventLabel}</h2>
        {countdown.isPast ? (
          <p className="mt-2 text-xs text-kelly-muted">Event window passed — debrief and staff follow-ups.</p>
        ) : countdown.isDayOf ? (
          <p className="mt-2 text-xs font-bold text-rose-900">Day-of panel — run the safe path below before 1pm.</p>
        ) : (
          <p className="mt-2 text-xs text-kelly-muted">
            {countdown.daysRemaining} day{countdown.daysRemaining === 1 ? "" : "s"} · {countdown.hoursRemaining} hours
            until panel — mode {summary.modeActive ? "active" : "inactive (set env or clerk audience)"}.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={summary.accaPrepHref}
            className="rounded-full border border-orange-400 bg-white px-3 py-1 text-[10px] font-bold text-orange-950"
          >
            ACCA summer conference prep
          </Link>
          <Link
            href={summary.encounterHref}
            className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-950"
          >
            ACCA encounter scenario
          </Link>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-lg font-bold text-kelly-navy">{plan.title}</h2>
        <p className="mt-1 text-xs text-kelly-muted">
          {plan.totalMinutes} minutes · {plan.stepCount} steps · stage-safe only
        </p>
        <ol className="mt-4 space-y-3">
          {plan.steps.map((step, index) => (
            <li key={step.stepId} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-bold text-kelly-navy">
                  {index + 1}. {step.title}
                </p>
                <p className="font-mono text-[10px] text-kelly-subtle">{step.durationLabel}</p>
              </div>
              <p className="mt-2 text-kelly-muted">{step.kellyBeat}</p>
              <Link href={step.href} className="mt-2 inline-block font-bold text-orange-800 underline">
                Open step →
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
