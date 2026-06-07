import Link from "next/link";
import type { IpadPolishSummary } from "@/lib/intelligence/v4/phase15P7IpadPolish";

export function CandidateIpadPolishStrip({ summary }: { summary: IpadPolishSummary }) {
  return (
    <section
      className={`rounded-xl border p-4 text-xs ${summary.ipadModeActive ? "border-sky-400 bg-sky-50/60 text-sky-950" : "border-sky-200 bg-sky-50/40 text-sky-950"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
            Phase 15 · iPad polish{summary.ipadModeActive ? " · LIVE" : ""}
          </p>
          <p className="mt-1 leading-relaxed">{summary.tonightReminder}</p>
        </div>
        <p className="text-right font-mono text-[10px]">
          {summary.bottomNavTabs} bottom tabs · 820px column
        </p>
      </div>
      <Link
        href={summary.hubHref}
        className="mt-3 inline-block rounded-full border border-sky-400 bg-white px-3 py-1 text-[10px] font-bold text-sky-950"
      >
        iPad polish hub →
      </Link>
    </section>
  );
}
