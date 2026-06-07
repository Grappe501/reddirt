import Link from "next/link";
import type { SessionMemorySummary } from "@/lib/intelligence/v4/phase16P6SessionMemory";

export function CandidateSessionMemoryStrip({ summary }: { summary: SessionMemorySummary }) {
  return (
    <section className="rounded-xl border border-sky-200 bg-sky-50/40 p-4 text-xs text-sky-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Phase 16 · Session memory</p>
          <p className="mt-1 leading-relaxed">{summary.tonightReminder}</p>
        </div>
        <p className="text-right font-mono text-[10px]">{summary.historyCount} in history</p>
      </div>
      {summary.hasActiveSession && summary.continueHref ? (
        <Link
          href={summary.continueHref}
          className="mt-3 inline-block rounded-full border border-sky-500 bg-white px-3 py-1 text-[10px] font-bold text-sky-950"
        >
          {summary.continueLabel} — {summary.stepLabel} →
        </Link>
      ) : (
        <Link
          href={summary.hubHref}
          className="mt-3 inline-block rounded-full border border-sky-400 bg-white px-3 py-1 text-[10px] font-bold text-sky-950"
        >
          Rehearsal history →
        </Link>
      )}
    </section>
  );
}
