import Link from "next/link";

import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import {
  EP_FORUM_LAB_CAPITALIZE_MOVES_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  epForumLabCapitalizeMoveHref,
} from "@/lib/election-plan/debate-prep-links";
import {
  CAPITALIZE_MOVES_HUB_INTRO,
  CAPITALIZE_MOVES_HUB_LINKS,
  listCapitalizeMoveLessons,
} from "@/lib/election-plan/forumLabCapitalizeMovesDrillDown";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Capitalize moves | Forum lab | Debate Prep",
  robots: { index: false, follow: false },
};

export default function ForumLabCapitalizeMovesHubPage() {
  const moves = listCapitalizeMoveLessons();

  return (
    <ElectionPlanDrillDownShell
      backHref={EP_FORUM_TRANSCRIPT_LAB_HREF}
      backLabel="Forum transcript lab"
      eyebrow="Forum lab · capitalize moves"
      title={CAPITALIZE_MOVES_HUB_INTRO.title}
      description={CAPITALIZE_MOVES_HUB_INTRO.description}
    >
      <div className="space-y-4">
        {CAPITALIZE_MOVES_HUB_INTRO.pillars.map((pillar) => (
          <article key={pillar.heading} className="ep-card border-violet-200 bg-violet-50/30 p-5 text-sm">
            <h2 className="text-xs font-bold uppercase text-violet-950">{pillar.heading}</h2>
            <p className="mt-3 leading-relaxed text-[var(--ep-navy-muted)]">{pillar.body}</p>
          </article>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">
          {moves.length} rehearsed triggers
        </h2>
        <div className="mt-4 space-y-3">
          {moves.map((lesson) => (
            <Link
              key={lesson.id}
              href={epForumLabCapitalizeMoveHref(lesson.id)}
              className="ep-card block border-emerald-200 bg-emerald-50/20 p-5 text-sm transition hover:border-[var(--ep-gold)]"
            >
              <p className="text-xs font-bold uppercase text-rose-900">Trigger</p>
              <p className="mt-1 font-semibold text-[var(--ep-navy)]">{lesson.trigger}</p>
              <p className="mt-3 text-xs font-bold uppercase text-emerald-900">Kelly line</p>
              <p className="mt-1 italic text-[var(--ep-navy)]">&ldquo;{lesson.kellyLine}&rdquo;</p>
              <p className="mt-3 text-[var(--ep-navy-muted)]">{lesson.whySummary}</p>
              <p className="mt-3 text-xs font-bold text-[var(--ep-navy)]">Full strategy & psychology drill-down →</p>
            </Link>
          ))}
        </div>
      </section>

      <ElectionPlanDrillDownRelated links={CAPITALIZE_MOVES_HUB_LINKS} />
    </ElectionPlanDrillDownShell>
  );
}
