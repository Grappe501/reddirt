import Link from "next/link";
import { notFound } from "next/navigation";

import { ElectionPlanPhilosophyBriefingPanel } from "@/components/election-plan/ElectionPlanPhilosophyBriefingPanel";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { EP_DEBATE_PREP_BRIEFINGS_HREF } from "@/lib/election-plan/debate-prep-links";
import {
  DEBATE_PHILOSOPHY_BRIEFINGS,
  getDebatePhilosophyBriefing,
} from "@/lib/intelligence/v4/debatePhilosophyBriefings";
import { epDebatePrepBriefingHref } from "@/lib/election-plan/debate-prep-links";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return DEBATE_PHILOSOPHY_BRIEFINGS.map((b) => ({ briefingId: b.briefingId }));
}

export async function generateMetadata({ params }: { params: Promise<{ briefingId: string }> }) {
  const { briefingId } = await params;
  const briefing = getDebatePhilosophyBriefing(briefingId);
  if (!briefing) return { title: "Briefing not found" };
  return { title: `${briefing.title} | Debate Prep`, robots: { index: false, follow: false } };
}

export default async function ElectionPlanDebateBriefingDetailPage({
  params,
}: {
  params: Promise<{ briefingId: string }>;
}) {
  const { briefingId } = await params;
  const briefing = getDebatePhilosophyBriefing(briefingId);
  if (!briefing) notFound();

  const idx = DEBATE_PHILOSOPHY_BRIEFINGS.findIndex((b) => b.briefingId === briefingId);
  const prev = idx > 0 ? DEBATE_PHILOSOPHY_BRIEFINGS[idx - 1] : null;
  const next = idx >= 0 && idx < DEBATE_PHILOSOPHY_BRIEFINGS.length - 1 ? DEBATE_PHILOSOPHY_BRIEFINGS[idx + 1] : null;

  return (
    <>
      <div className="ep-classification">Internal · Philosophy briefing · {briefing.eyebrow}</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ElectionPlanDebatePrepSubnav />
          <header className="mb-8">
            <Link href={EP_DEBATE_PREP_BRIEFINGS_HREF} className="text-xs font-bold text-[var(--ep-navy-muted)] underline">
              ← All briefings
            </Link>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-violet-800">{briefing.eyebrow}</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">{briefing.title}</h1>
            <p className="mt-3 text-sm text-[var(--ep-navy-muted)]">{briefing.summary}</p>
          </header>
          <ElectionPlanPhilosophyBriefingPanel briefing={briefing} />
          <nav className="mt-10 flex flex-wrap justify-between gap-2 border-t border-[var(--ep-border)] pt-6 text-xs font-bold">
            {prev ? (
              <Link href={epDebatePrepBriefingHref(prev.briefingId)} className="text-[var(--ep-navy)] underline">
                ← {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={epDebatePrepBriefingHref(next.briefingId)} className="text-[var(--ep-navy)] underline">
                {next.title} →
              </Link>
            ) : null}
          </nav>
        </div>
      </div>
    </>
  );
}
