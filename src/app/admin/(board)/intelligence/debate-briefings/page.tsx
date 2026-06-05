import Link from "next/link";
import { listDebatePhilosophyBriefings } from "@/lib/intelligence/v4/debatePhilosophyBriefings";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4OperatorGuide } from "@/components/admin/intelligence/v4/V4OperatorGuide";
import { V4DebatePrepFinder } from "@/components/admin/intelligence/v4/V4DebatePrepFinder";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { DebatePrepDepthNavPanel } from "@/components/admin/intelligence/DebatePrepDepthNavPanel";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const card =
  "flex flex-col rounded-xl border-2 border-violet-200/60 bg-white p-5 shadow-sm transition hover:border-violet-400 min-h-[120px]";

export default function DebateBriefingsIndexPage() {
  const briefings = listDebatePhilosophyBriefings();
  const guide = getSurfaceGuide("debate-briefings-index");
  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Debate prep · philosophy & handling"
        title="Debate briefing library"
        description="Full philosophy pages on how to handle issues, rebuttals, and presence — plus quick-read depth on every SOS question (why this answer, alternative lines, Hammer research hooks). Walk left-to-right: philosophy → questions → traps → claims."
        guide={guide}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/sos-debate-questions"
          className="rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-950"
        >
          SOS questions
        </Link>
        <Link
          href="/admin/intelligence/debate-prep/psychology-manual"
          className="rounded-full border border-fuchsia-300 bg-fuchsia-50 px-3 py-1 text-xs font-bold text-fuchsia-950"
        >
          Psychology manual
        </Link>
        <Link
          href="/admin/intelligence/debate-depth"
          className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Plain-language depth
        </Link>
        <Link
          href="/admin/intelligence/build-progress"
          className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Build progress
        </Link>
        <Link
          href="/admin/intelligence/opposition-strategy"
          className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-950"
        >
          Hammer research
        </Link>
      </V4PageHeader>

      {guide ? (
        <div className="mb-6">
          <V4OperatorGuide guide={guide} />
        </div>
      ) : null}

      <DebatePrepDepthNavPanel compact />

      <div className="mb-8">
        <V4DebatePrepFinder />
      </div>

      <article className="mb-8 rounded-xl border-2 border-kelly-gold/40 bg-amber-50/40 p-5 text-sm">
        <p className="font-bold uppercase text-amber-950">How to use this library</p>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-kelly-muted">
          <li>Read one philosophy briefing matching tonight&apos;s risk (pile-on, author vs administrator, etc.).</li>
          <li>Open each HIGH-probability SOS question — use the quick-read briefing at the top, not only the 30s line.</li>
          <li>Rotate alternative openers/closers so answers don&apos;t sound identical.</li>
          <li>Open Hammer research hooks before citing any bill on stage.</li>
          <li>Finish at claims gate before debate.</li>
        </ol>
      </article>

      <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-950">
        Philosophy & handling briefings ({briefings.length})
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {briefings.map((b) => (
          <Link key={b.briefingId} href={`/admin/intelligence/debate-briefings/${b.briefingId}`} className={card}>
            <p className="text-[10px] font-bold uppercase text-violet-800">{b.eyebrow}</p>
            <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">{b.title}</h3>
            <p className="mt-2 flex-1 text-xs text-kelly-muted line-clamp-4">{b.summary}</p>
            <p className="mt-3 text-[10px] font-bold text-kelly-gold">~{b.estimatedReadMinutes} min read →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
