import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownSections,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import {
  epForumLabAnalysisCategoryHref,
  epForumLabAnalysisItemHref,
} from "@/lib/election-plan/debate-prep-links";
import {
  getForumAnalysisCategory,
  getForumAnalysisLesson,
  listForumAnalysisLessonsInCategory,
  listForumAnalysisStaticParams,
} from "@/lib/election-plan/forumLabAnalysisDrillDown";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return listForumAnalysisStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ categoryId: string; itemId: string }> }) {
  const { categoryId, itemId } = await params;
  const lesson = getForumAnalysisLesson(categoryId, itemId);
  if (!lesson) return { title: "Lesson not found" };
  return {
    title: `${lesson.title} | Forum analysis`,
    robots: { index: false, follow: false },
  };
}

export default async function ForumLabAnalysisLessonPage({
  params,
}: {
  params: Promise<{ categoryId: string; itemId: string }>;
}) {
  const { categoryId, itemId } = await params;
  const category = getForumAnalysisCategory(categoryId);
  const lesson = getForumAnalysisLesson(categoryId, itemId);
  if (!category || !lesson) notFound();

  const lessons = listForumAnalysisLessonsInCategory(category.id);
  const idx = lessons.findIndex((l) => l.id === itemId);
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null;

  const sections = lesson.sections.map((s) => ({ title: s.heading, body: s.body }));

  return (
    <ElectionPlanDrillDownShell
      backHref={epForumLabAnalysisCategoryHref(category.id)}
      backLabel={category.title}
      eyebrow={`Forum lab · ${category.title}`}
      title={lesson.title}
      description={lesson.summary}
    >
      <ElectionPlanDrillDownSections sections={sections} />

      {lesson.forumEvidence.length > 0 ? (
        <article className="ep-card mt-6 border-amber-200 bg-amber-50/40 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-amber-900">ACCA forum evidence</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-[var(--ep-navy-muted)]">
            {lesson.forumEvidence.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </article>
      ) : null}

      {lesson.debateLines.length > 0 ? (
        <article className="ep-card mt-6 border-emerald-200 bg-emerald-50/40 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-emerald-900">Practice lines</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-[var(--ep-navy-muted)]">
            {lesson.debateLines.map((line) => (
              <li key={line.slice(0, 48)} className="italic">
                &ldquo;{line}&rdquo;
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      <ElectionPlanDrillDownSteps title="Tonight's practice" steps={lesson.practiceSteps} />

      {lesson.claimsGate.length > 0 ? (
        <article className="ep-card mt-6 border-rose-200 bg-rose-50/40 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-rose-900">Claims gate</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
            {lesson.claimsGate.map((item) => (
              <li key={item.slice(0, 48)}>{item}</li>
            ))}
          </ul>
        </article>
      ) : null}

      {lesson.relatedLinks.length > 0 ? (
        <ElectionPlanDrillDownRelated links={lesson.relatedLinks} />
      ) : null}

      <nav className="mt-10 flex flex-wrap justify-between gap-2 border-t border-[var(--ep-border)] pt-6 text-xs font-bold">
        {prev ? (
          <Link href={epForumLabAnalysisItemHref(category.id, prev.id)} className="text-[var(--ep-navy)] underline">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={epForumLabAnalysisItemHref(category.id, next.id)} className="text-[var(--ep-navy)] underline">
            {next.title} →
          </Link>
        ) : null}
      </nav>
    </ElectionPlanDrillDownShell>
  );
}
