import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownSections,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import {
  EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF,
  EP_FORUM_LAB_INTEGRATION_HREF,
  epDebatePrepDayHref,
  epForumLabIntegrationDayHref,
} from "@/lib/election-plan/debate-prep-links";
import { getForumIntegrationDay, listForumIntegrationDays } from "@/lib/election-plan/forumLabIntegrationDrillDown";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return listForumIntegrationDays().map((d) => ({ dayNumber: String(d.dayNumber) }));
}

export async function generateMetadata({ params }: { params: Promise<{ dayNumber: string }> }) {
  const { dayNumber } = await params;
  const day = getForumIntegrationDay(Number(dayNumber));
  if (!day) return { title: "Integration day not found" };
  return {
    title: `Day ${day.dayNumber} integration | Forum lab`,
    robots: { index: false, follow: false },
  };
}

export default async function ForumLabIntegrationDayPage({
  params,
}: {
  params: Promise<{ dayNumber: string }>;
}) {
  const { dayNumber: dayNumberRaw } = await params;
  const dayNumber = Number(dayNumberRaw);
  if (!Number.isFinite(dayNumber)) notFound();

  const day = getForumIntegrationDay(dayNumber);
  if (!day) notFound();

  const all = listForumIntegrationDays();
  const idx = all.findIndex((d) => d.dayNumber === dayNumber);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  const uniqueLinks = day.relatedLinks.filter(
    (link, i, arr) => arr.findIndex((l) => l.href === link.href) === i,
  );

  return (
    <ElectionPlanDrillDownShell
      backHref={EP_FORUM_LAB_INTEGRATION_HREF}
      backLabel="7-day integration map"
      eyebrow={`Forum lab · Day ${day.dayNumber}`}
      title={day.dayTitle}
      description={day.useThisIntel}
    >
      <article className="ep-card border-emerald-200 bg-emerald-50/40 p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-emerald-900">Tonight&apos;s drill</h2>
        <p className="mt-2 font-semibold text-[var(--ep-navy)]">{day.drillTonight}</p>
        {day.dayNumber === 1 ? (
          <Link href={EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF} className="mt-3 inline-block text-xs font-bold text-emerald-900 underline">
            Open current election law study →
          </Link>
        ) : null}
      </article>

      <article className="ep-card mt-4 p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Command course crosswalk</h2>
        <p className="mt-2 text-[var(--ep-navy-muted)]">{day.commandCourseTitle}</p>
        <Link href={epDebatePrepDayHref(day.commandCourseDayId)} className="mt-2 inline-block text-xs font-bold text-[var(--ep-navy)] underline">
          Open command course day →
        </Link>
      </article>

      <div className="mt-6">
        <ElectionPlanDrillDownSections sections={day.sections} />
      </div>

      <ElectionPlanDrillDownSteps title="Practice steps" steps={day.practiceSteps} />

      <ElectionPlanDrillDownRelated links={uniqueLinks} />

      <nav className="mt-10 flex flex-wrap justify-between gap-2 border-t border-[var(--ep-border)] pt-6 text-xs font-bold">
        {prev ? (
          <Link href={epForumLabIntegrationDayHref(prev.dayNumber)} className="text-[var(--ep-navy)] underline">
            ← Day {prev.dayNumber}: {prev.dayTitle}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={epForumLabIntegrationDayHref(next.dayNumber)} className="text-[var(--ep-navy)] underline">
            Day {next.dayNumber}: {next.dayTitle} →
          </Link>
        ) : null}
      </nav>
    </ElectionPlanDrillDownShell>
  );
}
