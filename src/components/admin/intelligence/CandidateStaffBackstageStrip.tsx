import Link from "next/link";
import type { StaffBackstageSummary } from "@/lib/intelligence/v4/phase15P8StaffBackstage";

export function CandidateStaffBackstageStrip({ summary }: { summary: StaffBackstageSummary }) {
  return (
    <section className="rounded-xl border border-violet-200 bg-violet-50/40 p-4 text-xs text-violet-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Phase 15 · Staff backstage</p>
          <p className="mt-1 leading-relaxed">{summary.tonightReminder}</p>
        </div>
        <p className="text-right font-mono text-[10px]">
          {summary.guardCategoryCount} categories · {summary.prefixCount} prefixes
        </p>
      </div>
      <Link
        href={summary.hubHref}
        className="mt-3 inline-block rounded-full border border-violet-400 bg-white px-3 py-1 text-[10px] font-bold text-violet-950"
      >
        Guard inventory →
      </Link>
    </section>
  );
}
