import Link from "next/link";

import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownShell,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import {
  EP_FORUM_LAB_INTEGRATION_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  epForumLabElectionLawTopicHref,
  epForumLabIntegrationDayHref,
} from "@/lib/election-plan/debate-prep-links";
import { ELECTION_LAW_STUDY_LINKS, getElectionLawStudyHub } from "@/lib/election-plan/forumLabElectionLawStudy";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Current election law study | Forum lab | Debate Prep",
  robots: { index: false, follow: false },
};

export default function ForumLabElectionLawStudyHubPage() {
  const hub = getElectionLawStudyHub();
  const topicById = new Map(hub.topics.map((t) => [t.id, t]));

  return (
    <ElectionPlanDrillDownShell
      backHref={EP_FORUM_TRANSCRIPT_LAB_HREF}
      backLabel="Forum transcript lab"
      eyebrow="Forum lab · study"
      title={hub.title}
      description={hub.intro}
    >
      <article className="ep-card border-amber-200 bg-amber-50/40 p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-amber-900">Suggested study order</h2>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-[var(--ep-navy-muted)]">
          {hub.studyOrder.map((id) => {
            const topic = topicById.get(id);
            if (!topic) return null;
            return (
              <li key={id}>
                <Link href={epForumLabElectionLawTopicHref(id)} className="font-bold text-[var(--ep-navy)] underline">
                  {topic.title}
                </Link>
                <span className="ml-1">— {topic.summary}</span>
              </li>
            );
          })}
        </ol>
      </article>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {hub.topics.map((topic) => (
          <Link
            key={topic.id}
            href={epForumLabElectionLawTopicHref(topic.id)}
            className="ep-card block p-5 text-sm transition hover:border-[var(--ep-gold)]"
          >
            <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">{topic.title}</h2>
            <p className="mt-2 text-[var(--ep-navy-muted)]">{topic.summary}</p>
            <p className="mt-3 text-xs font-bold text-[var(--ep-navy)]">Study topic →</p>
          </Link>
        ))}
      </div>

      <ElectionPlanDrillDownRelated
        links={[
          { href: ELECTION_LAW_STUDY_LINKS.day1Integration, label: "Day 1 integration drill-down" },
          { href: ELECTION_LAW_STUDY_LINKS.oppositionResearch, label: "Opposition research hub" },
          { href: EP_FORUM_LAB_INTEGRATION_HREF, label: "7-day integration map" },
        ]}
      />
    </ElectionPlanDrillDownShell>
  );
}
