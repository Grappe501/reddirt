import Link from "next/link";
import type { IpadDrillPlayerSummary } from "@/lib/intelligence/v4/phase16P5IpadDrillPlayerShared";

export function CandidateIpadDrillPlayerStrip({ summary }: { summary: IpadDrillPlayerSummary }) {
  return (
    <section className="rounded-xl border border-cyan-200 bg-cyan-50/40 p-4 text-xs text-cyan-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Phase 16 · iPad drill player</p>
          <p className="mt-1 leading-relaxed">{summary.tonightReminder}</p>
        </div>
        <p className="text-right font-mono text-[10px]">
          {summary.controlCount} controls · {summary.minTouchPx}px touch
        </p>
      </div>
      <Link
        href={summary.defaultLaunchHref}
        className="mt-3 inline-block rounded-full border border-cyan-400 bg-white px-3 py-1 text-[10px] font-bold text-cyan-950"
      >
        Open iPad drill player →
      </Link>
    </section>
  );
}
