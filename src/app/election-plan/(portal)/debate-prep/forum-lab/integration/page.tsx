import Link from "next/link";

import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownShell,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import {
  EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  epForumLabIntegrationDayHref,
} from "@/lib/election-plan/debate-prep-links";
import { listForumIntegrationDays } from "@/lib/election-plan/forumLabIntegrationDrillDown";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "7-day integration map | Forum lab | Debate Prep",
  robots: { index: false, follow: false },
};

export default function ForumLabIntegrationHubPage() {
  const days = listForumIntegrationDays();

  return (
    <ElectionPlanDrillDownShell
      backHref={EP_FORUM_TRANSCRIPT_LAB_HREF}
      backLabel="Forum transcript lab"
      eyebrow="Forum lab · integration"
      title="7-day integration map"
      description="Forum deep analysis crosswalked to the command course — each day drills down to practice steps, study modules, and related debate prep routes."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {days.map((day) => (
          <Link
            key={day.dayNumber}
            href={epForumLabIntegrationDayHref(day.dayNumber)}
            className="ep-card block p-5 text-sm transition hover:border-[var(--ep-gold)]"
          >
            <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Day {day.dayNumber}</p>
            <h2 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">{day.dayTitle}</h2>
            <p className="mt-2 text-[var(--ep-navy-muted)]">{day.useThisIntel}</p>
            <p className="mt-3 text-xs font-bold text-emerald-900">Tonight: {day.drillTonight}</p>
            <p className="mt-2 text-xs font-bold text-[var(--ep-navy)]">Open drill-down →</p>
          </Link>
        ))}
      </div>

      <ElectionPlanDrillDownRelated
        links={[
          { href: EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF, label: "Current election law study" },
          { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum transcript lab" },
        ]}
      />
    </ElectionPlanDrillDownShell>
  );
}
