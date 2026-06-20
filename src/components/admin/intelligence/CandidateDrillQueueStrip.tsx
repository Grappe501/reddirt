import Link from "next/link";
import type { DrillQueueSummary } from "@/lib/intelligence/v4/phase16P3DrillQueueShared";

export function CandidateDrillQueueStrip({ summary }: { summary: DrillQueueSummary }) {
  return (
    <section className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 text-xs text-teal-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Phase 16 · Drill queue</p>
          <p className="mt-1 leading-relaxed">{summary.tonightReminder}</p>
        </div>
        <p className="text-right font-mono text-[10px]">
          {summary.queueCount} queues · {summary.defaultCardCount} cards
          {summary.forumQueueAvailable ? ` · forum ${summary.forumCardCount}` : ""}
          {summary.dressQueueAvailable ? ` · dress ${summary.dressCardCount}` : ""}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`${summary.hubHref}?queue=${summary.defaultQueueId}&card=1`}
          className="inline-block rounded-full border border-teal-400 bg-white px-3 py-1 text-[10px] font-bold text-teal-950"
        >
          {summary.forumQueueAvailable ? "Start forum-acca queue →" : "Start standard queue →"}
        </Link>
        {summary.dressQueueAvailable ? (
          <Link
            href={`${summary.hubHref}?queue=world-class-dress&card=1`}
            className="inline-block rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-[10px] font-bold text-indigo-950"
          >
            World-class dress →
          </Link>
        ) : null}
        {summary.forumQueueAvailable && summary.defaultQueueId !== "standard-tonight" ? (
          <Link
            href={`${summary.hubHref}?queue=standard-tonight&card=1`}
            className="inline-block rounded-full border border-teal-300 px-3 py-1 text-[10px] font-bold text-teal-900"
          >
            Standard queue →
          </Link>
        ) : null}
      </div>
    </section>
  );
}
