import Link from "next/link";
import type { DemoModeSummary } from "@/lib/intelligence/v4/phase15P6DemoMode";

export function CandidateDemoModeStrip({ summary }: { summary: DemoModeSummary }) {
  return (
    <section
      className={`rounded-xl border p-4 text-xs ${summary.demoEnvActive ? "border-teal-400 bg-teal-50/60 text-teal-950" : "border-teal-200 bg-teal-50/40 text-teal-950"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
            Phase 15 · Demo mode{summary.demoEnvActive ? " · LIVE" : ""}
          </p>
          <p className="mt-1 font-semibold">{summary.scenario.eventLabel}</p>
          <p className="mt-1 leading-relaxed">{summary.tonightReminder}</p>
        </div>
        <p className="text-right font-mono text-[10px]">
          {summary.stepCount} steps · ~{summary.totalMinutes} min
        </p>
      </div>
      <Link
        href={summary.hubHref}
        className="mt-3 inline-block rounded-full border border-teal-400 bg-white px-3 py-1 text-[10px] font-bold text-teal-950"
      >
        Run demo script →
      </Link>
    </section>
  );
}
