import Link from "next/link";
import { DEBATE_DEPTH_TOPICS } from "@/lib/intelligence/v4/debateDepthTopics";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4OperatorGuide } from "@/components/admin/intelligence/v4/V4OperatorGuide";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { DebatePrepDepthNavPanel } from "@/components/admin/intelligence/DebatePrepDepthNavPanel";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const card =
  "flex flex-col rounded-xl border-2 border-indigo-200 bg-white p-5 shadow-sm transition active:border-indigo-500 min-h-[120px]";

export default function DebateDepthIndexPage() {
  const guide = getSurfaceGuide("debate-depth-index");

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Debate prep · plain-language depth"
        title="Debate depth library"
        description="Top-to-bottom intelligence explained in plain terms: what Hammer will do, how to handle attacks, adversity, getting stuck, and culture-war bait. Use with trap lanes, SOS questions, and the 28-section prep packet."
        guide={guide}
      >
        <V4BackLinks />
        <Link href="/admin/intelligence/debate-briefings" className="rounded-full border px-3 py-1 text-xs font-bold text-violet-950">
          Philosophy briefings
        </Link>
        <Link href="/admin/intelligence/trap-lanes" className="rounded-full border px-3 py-1 text-xs font-bold text-kelly-navy">
          Trap lanes
        </Link>
        <Link href="/admin/intelligence/sos-debate-questions" className="rounded-full border px-3 py-1 text-xs font-bold text-kelly-navy">
          SOS questions
        </Link>
        <Link href="/admin/intelligence/build-progress" className="rounded-full border px-3 py-1 text-xs font-bold text-kelly-navy">
          Build progress
        </Link>
      </V4PageHeader>

      <DebatePrepDepthNavPanel compact />

      {guide ? (
        <div className="mb-6">
          <V4OperatorGuide guide={guide} />
        </div>
      ) : null}

      <section className="mb-6 grid gap-4 sm:grid-cols-2">
        {DEBATE_DEPTH_TOPICS.map((topic) => (
          <Link key={topic.topicId} href={topic.href} className={card}>
            <span className="text-[10px] font-bold uppercase text-indigo-800">~{topic.estimatedMinutes} min</span>
            <h2 className="mt-2 font-heading text-lg font-bold text-kelly-navy">{topic.title}</h2>
            <p className="mt-2 flex-1 text-xs text-kelly-muted">{topic.summary}</p>
            <p className="mt-4 text-xs font-bold text-indigo-900">Open full guide →</p>
          </Link>
        ))}
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs text-kelly-muted">
        <p className="font-bold text-kelly-navy">Where depth also appears automatically</p>
        <ul className="mt-2 list-inside list-disc">
          <li>Command hub and every operator guide (blue depth blocks)</li>
          <li>Each SOS question and trap lane drill-down</li>
          <li>Each of the 28 debate prep section drill-downs</li>
          <li>Film room, debate command, claims, and agent tooling guides</li>
        </ul>
      </section>
    </div>
  );
}
