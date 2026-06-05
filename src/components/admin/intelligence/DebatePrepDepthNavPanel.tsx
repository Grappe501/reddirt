import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import { DEBATE_DEPTH_TOPICS } from "@/lib/intelligence/v4/debateDepthTopics";
import { listDebatePhilosophyBriefings } from "@/lib/intelligence/v4/debatePhilosophyBriefings";
import { TIER_2_DEBATE_PREP_NAV_ITEMS } from "@/lib/intelligence/v4/debatePrepDepthNav";

const chip =
  "rounded border border-indigo-200 bg-white px-2 py-1 text-xs font-semibold text-kelly-navy transition hover:border-indigo-400";

const topicChip =
  "rounded-lg border border-indigo-100 bg-indigo-50/40 px-3 py-2 text-xs font-semibold text-indigo-950 transition hover:border-indigo-300";

/** Tier-2 debate prep depth — briefings, plain-language guides, build tracker, command hub. */
export function DebatePrepDepthNavPanel({ compact }: { compact?: boolean }) {
  const briefings = listDebatePhilosophyBriefings();

  return (
    <section className="mb-6 rounded-xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50/50 to-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-950">Debate prep depth library</p>
      {!compact ? (
        <p className="mt-1 max-w-3xl text-xs text-kelly-muted">
          Philosophy briefings, plain-language stage guides, build progress, and command hub — read in order: hub →
          philosophy → depth topics → trap lanes → claims gate.
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {TIER_2_DEBATE_PREP_NAV_ITEMS.map((item) => (
          <IntelligenceNavLink key={item.href} href={item.href} title={item.description} variant="chip" className={chip}>
            {item.label}
          </IntelligenceNavLink>
        ))}
        <IntelligenceNavLink
          href="/admin/intelligence/debate-prep/psychology-manual"
          title="22-section psychology and atmosphere manual"
          variant="chip"
          className={chip}
        >
          Psychology manual
        </IntelligenceNavLink>
      </div>
      {!compact ? (
        <>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-indigo-900">Depth topics</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {DEBATE_DEPTH_TOPICS.map((topic) => (
              <IntelligenceNavLink key={topic.topicId} href={topic.href} variant="chip" className={topicChip}>
                <span className="block font-bold">{topic.title}</span>
                <span className="mt-0.5 block font-normal text-indigo-900/80 line-clamp-2">{topic.summary}</span>
              </IntelligenceNavLink>
            ))}
          </div>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-violet-900">Philosophy briefings</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {briefings.map((b) => (
              <IntelligenceNavLink
                key={b.briefingId}
                href={`/admin/intelligence/debate-briefings/${b.briefingId}`}
                variant="chip"
                className="rounded-full border border-violet-200 bg-violet-50/60 px-3 py-1 text-[10px] font-bold text-violet-950"
              >
                {b.title}
              </IntelligenceNavLink>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
