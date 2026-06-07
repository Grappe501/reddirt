import Link from "next/link";
import type { RehearsalLauncherSummary } from "@/lib/intelligence/v4/phase16P0SessionLauncher";

export function CandidateRehearsalLauncherStrip({ summary }: { summary: RehearsalLauncherSummary }) {
  return (
    <section className="rounded-xl border-2 border-amber-400/80 bg-gradient-to-br from-amber-50/70 to-white p-4 text-xs text-amber-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Phase 16 · Start rehearsal</p>
          <p className="mt-1 leading-relaxed">{summary.tonightReminder}</p>
        </div>
        <p className="text-right font-mono text-[10px]">
          {summary.encounterCount} encounters · default {summary.defaultMinutes} min · {summary.defaultStepCount} steps
        </p>
      </div>
      <Link
        href={`${summary.hubHref}?encounter=${summary.defaultEncounterId}`}
        className="mt-3 inline-block rounded-full border border-amber-500 bg-white px-4 py-1.5 text-[10px] font-bold text-amber-950"
      >
        Start {summary.defaultMinutes}-min debate prep →
      </Link>
    </section>
  );
}
