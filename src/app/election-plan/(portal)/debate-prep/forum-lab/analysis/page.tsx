import Link from "next/link";

import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownShell,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import { EP_FORUM_TRANSCRIPT_LAB_HREF, epForumLabAnalysisCategoryHref } from "@/lib/election-plan/debate-prep-links";
import {
  FORUM_ANALYSIS_CATEGORIES,
  FORUM_ANALYSIS_HUB_LINKS,
  listForumAnalysisLessonsInCategory,
} from "@/lib/election-plan/forumLabAnalysisDrillDown";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Forum analysis drill-down | Forum lab | Debate Prep",
  robots: { index: false, follow: false },
};

export default function ForumLabAnalysisHubPage() {
  return (
    <ElectionPlanDrillDownShell
      backHref={EP_FORUM_TRANSCRIPT_LAB_HREF}
      backLabel="Forum transcript lab"
      eyebrow="Forum lab · analysis"
      title="ACCA forum analysis — full lessons"
      description="Each v1 analysis box from the forum transcript lab drills down to a full lesson: forum evidence, debate lines, practice steps, and claims gate where needed."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {FORUM_ANALYSIS_CATEGORIES.map((category) => {
          const lessons = listForumAnalysisLessonsInCategory(category.id);
          return (
            <Link
              key={category.id}
              href={epForumLabAnalysisCategoryHref(category.id)}
              className="ep-card block p-5 text-sm transition hover:border-[var(--ep-gold)]"
            >
              <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">{category.title}</p>
              <p className="mt-2 text-[var(--ep-navy-muted)]">{category.description}</p>
              <p className="mt-3 text-xs font-bold text-[var(--ep-navy)]">
                {lessons.length} lessons · Open category →
              </p>
            </Link>
          );
        })}
      </div>

      <ElectionPlanDrillDownRelated links={FORUM_ANALYSIS_HUB_LINKS} />
    </ElectionPlanDrillDownShell>
  );
}
