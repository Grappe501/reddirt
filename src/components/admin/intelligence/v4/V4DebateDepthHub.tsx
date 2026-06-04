import Link from "next/link";
import { DEBATE_DEPTH_TOPICS } from "@/lib/intelligence/v4/debateDepthTopics";

const card =
  "flex flex-col rounded-xl border-2 border-indigo-200/60 bg-white p-4 shadow-sm transition hover:border-indigo-400 min-h-[100px]";

export function V4DebateDepthHub({ compact }: { compact?: boolean }) {
  return (
    <section className={compact ? "mb-6" : "mb-8"}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-900">
            Plain-language depth
          </p>
          <h2 className="font-heading text-lg font-bold text-kelly-navy">
            What to expect · handle attacks · adversity · culture war
          </h2>
          {!compact ? (
            <p className="mt-1 max-w-3xl text-xs text-kelly-muted">
              Every debate surface now includes expect / attack / handle / stuck recovery blocks. Start with these five
              topic guides, then open trap lanes and SOS questions for question-specific scripts.
            </p>
          ) : null}
        </div>
        <Link
          href="/admin/intelligence/debate-depth"
          className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          All depth topics →
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DEBATE_DEPTH_TOPICS.map((topic) => (
          <Link key={topic.topicId} href={topic.href} className={card}>
            <span className="text-[10px] font-bold uppercase text-indigo-800">{topic.estimatedMinutes} min</span>
            <h3 className="mt-2 font-heading text-base font-bold text-kelly-navy">{topic.title}</h3>
            <p className="mt-2 flex-1 text-xs text-kelly-muted line-clamp-3">{topic.summary}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
