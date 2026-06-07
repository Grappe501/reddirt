import Link from "next/link";
import type { EvidenceHonestySummary } from "@/lib/intelligence/v4/phase15P5EvidenceHonesty";

export function CandidateEvidenceHonestyStrip({ summary }: { summary: EvidenceHonestySummary }) {
  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-xs text-amber-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Phase 15 · Evidence honesty</p>
          <p className="mt-1 leading-relaxed">{summary.tonightReminder}</p>
        </div>
        <p className="text-right font-mono text-[10px]">
          {summary.filmDrillCount} film drills tagged · {summary.nonStageSafeCount} non-stage-safe
        </p>
      </div>
      <Link
        href={summary.hubHref}
        className="mt-3 inline-block rounded-full border border-amber-400 bg-white px-3 py-1 text-[10px] font-bold text-amber-950"
      >
        Evidence honesty hub →
      </Link>
    </section>
  );
}
