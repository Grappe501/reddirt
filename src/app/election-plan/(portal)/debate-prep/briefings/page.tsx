import { ElectionPlanPhilosophyBriefingCard } from "@/components/election-plan/ElectionPlanPhilosophyBriefingPanel";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { EP_DEBATE_PREP_BRIEFINGS_HREF, EP_DEBATE_PREP_HREF, EP_DEBATE_PREP_PSYCHOLOGY_HREF } from "@/lib/election-plan/debate-prep-links";
import { listDebatePhilosophyBriefings } from "@/lib/intelligence/v4/debatePhilosophyBriefings";
import Link from "next/link";

export const metadata = {
  title: "Philosophy Briefings | Debate Prep | Election Plan",
  robots: { index: false, follow: false },
};

export default function ElectionPlanDebateBriefingsPage() {
  const briefings = listDebatePhilosophyBriefings();
  const day1 = briefings.filter((b) =>
    ["agree-but-never-only-agree", "author-vs-administrator", "county-clerk-partnership"].includes(b.briefingId),
  );

  return (
    <>
      <div className="ep-classification">Internal · Philosophy briefings · Debate prep</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ElectionPlanDebatePrepSubnav />
          <header className="mb-8">
            <Link href={EP_DEBATE_PREP_HREF} className="text-xs font-bold text-[var(--ep-navy-muted)] underline">
              ← Debate prep hub
            </Link>
            <h1 className="mt-3 font-heading text-3xl font-bold text-[var(--ep-navy)]">Philosophy &amp; handling briefings</h1>
            <p className="mt-3 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
              Full depth on how to handle issues, rebuttals, and presence — every briefing is a drill-down page, not a
              one-line bubble.
            </p>
          </header>

          <section className="ep-card mb-8 border-2 border-[var(--ep-gold)]/30 p-5 text-sm">
            <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Day 1 start here</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {day1.map((b) => (
                <ElectionPlanPhilosophyBriefingCard key={b.briefingId} briefing={b} />
              ))}
            </div>
          </section>

          <h2 className="mb-4 font-heading text-lg font-bold text-[var(--ep-navy)]">All briefings ({briefings.length})</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {briefings.map((b) => (
              <ElectionPlanPhilosophyBriefingCard key={b.briefingId} briefing={b} />
            ))}
          </div>

          <p className="mt-8 text-sm text-[var(--ep-navy-muted)]">
            Pair with{" "}
            <Link href={EP_DEBATE_PREP_PSYCHOLOGY_HREF} className="font-bold underline">
              psychology manual
            </Link>{" "}
            for Day 1 atmosphere work.
          </p>
        </div>
      </div>
    </>
  );
}
