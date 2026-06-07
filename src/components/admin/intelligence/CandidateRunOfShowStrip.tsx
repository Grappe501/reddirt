import Link from "next/link";
import type { RunOfShowSummary } from "@/lib/intelligence/v4/phase16P1RunOfShow";

export function CandidateRunOfShowStrip({ summary }: { summary: RunOfShowSummary }) {
  return (
    <section className="rounded-xl border border-orange-200 bg-orange-50/40 p-4 text-xs text-orange-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Phase 16 · Run-of-show</p>
          <p className="mt-1 leading-relaxed">{summary.tonightReminder}</p>
        </div>
        <p className="text-right font-mono text-[10px]">
          {summary.presetCount} presets · 15–60 min
        </p>
      </div>
      <Link
        href={`${summary.hubHref}?preset=${summary.defaultPresetId}`}
        className="mt-3 inline-block rounded-full border border-orange-400 bg-white px-3 py-1 text-[10px] font-bold text-orange-950"
      >
        {summary.defaultMinutes}-min standard run →
      </Link>
    </section>
  );
}
