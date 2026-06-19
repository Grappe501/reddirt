import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownShell,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import {
  EP_FORUM_LAB_ANALYSIS_HREF,
  epForumLabAnalysisItemHref,
} from "@/lib/election-plan/debate-prep-links";
import {
  FORUM_ANALYSIS_CATEGORIES,
  FORUM_ANALYSIS_HUB_LINKS,
  getForumAnalysisCategory,
  listForumAnalysisLessonsInCategory,
} from "@/lib/election-plan/forumLabAnalysisDrillDown";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return FORUM_ANALYSIS_CATEGORIES.map((c) => ({ categoryId: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  const category = getForumAnalysisCategory(categoryId);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.title} | Forum analysis`,
    robots: { index: false, follow: false },
  };
}

export default async function ForumLabAnalysisCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const category = getForumAnalysisCategory(categoryId);
  if (!category) notFound();

  const lessons = listForumAnalysisLessonsInCategory(category.id);

  return (
    <ElectionPlanDrillDownShell
      backHref={EP_FORUM_LAB_ANALYSIS_HREF}
      backLabel="Forum analysis hub"
      eyebrow={`Forum lab · ${category.title}`}
      title={category.title}
      description={category.description}
    >
      <div className="space-y-3">
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={epForumLabAnalysisItemHref(category.id, lesson.id)}
            className="ep-card block p-5 text-sm transition hover:border-[var(--ep-gold)]"
          >
            <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">{lesson.title}</h2>
            <p className="mt-2 text-[var(--ep-navy-muted)]">{lesson.summary}</p>
            <p className="mt-3 text-xs font-bold text-[var(--ep-navy)]">Full lesson →</p>
          </Link>
        ))}
      </div>

      <ElectionPlanDrillDownRelated links={FORUM_ANALYSIS_HUB_LINKS} />
    </ElectionPlanDrillDownShell>
  );
}
