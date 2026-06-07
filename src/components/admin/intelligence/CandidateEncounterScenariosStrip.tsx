import Link from "next/link";
import type { EncounterScenariosSummary } from "@/lib/intelligence/v4/phase16P2EncounterScenarios";

export function CandidateEncounterScenariosStrip({ summary }: { summary: EncounterScenariosSummary }) {
  return (
    <section className="rounded-xl border border-violet-200 bg-violet-50/40 p-4 text-xs text-violet-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Phase 16 · Encounter scenarios</p>
          <p className="mt-1 leading-relaxed">{summary.tonightReminder}</p>
        </div>
        <p className="text-right font-mono text-[10px]">{summary.scenarioCount} scenarios</p>
      </div>
      <Link
        href={`${summary.hubHref}?scenario=${summary.defaultScenarioId}`}
        className="mt-3 inline-block rounded-full border border-violet-400 bg-white px-3 py-1 text-[10px] font-bold text-violet-950"
      >
        {summary.defaultTitle} →
      </Link>
    </section>
  );
}
