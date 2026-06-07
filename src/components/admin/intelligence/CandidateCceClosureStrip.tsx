import Link from "next/link";
import type { CceClosureSummary } from "@/lib/intelligence/v4/phase15P9Closure";

export function CandidateCceClosureStrip({ summary }: { summary: CceClosureSummary }) {
  return (
    <section className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 text-xs text-indigo-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Phase 15 · CCE closure</p>
          <p className="mt-1 leading-relaxed">{summary.tonightReminder}</p>
        </div>
        <p className="text-right font-mono text-[10px]">
          {summary.passesAtBar}/{summary.checkpointCount} · {summary.stackCompletionPct}%
        </p>
      </div>
      <Link
        href={summary.hubHref}
        className="mt-3 inline-block rounded-full border border-indigo-400 bg-white px-3 py-1 text-[10px] font-bold text-indigo-950"
      >
        CCE checkpoint queue →
      </Link>
    </section>
  );
}
