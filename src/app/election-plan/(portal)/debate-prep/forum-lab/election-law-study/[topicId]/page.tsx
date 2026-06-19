import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownShell,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import {
  EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF,
  epForumLabElectionLawTopicHref,
} from "@/lib/election-plan/debate-prep-links";
import {
  getElectionLawStudyHub,
  getElectionLawStudyTopic,
  listElectionLawStudyTopics,
} from "@/lib/election-plan/forumLabElectionLawStudy";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return listElectionLawStudyTopics().map((t) => ({ topicId: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const topic = getElectionLawStudyTopic(topicId);
  if (!topic) return { title: "Study topic not found" };
  return { title: `${topic.title} | Election law study`, robots: { index: false, follow: false } };
}

export default async function ForumLabElectionLawTopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const topic = getElectionLawStudyTopic(topicId);
  if (!topic) notFound();

  const hub = getElectionLawStudyHub();
  const order = hub.studyOrder;
  const idx = order.indexOf(topicId);
  const prevId = idx > 0 ? order[idx - 1] : null;
  const nextId = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
  const prev = prevId ? getElectionLawStudyTopic(prevId) : null;
  const next = nextId ? getElectionLawStudyTopic(nextId) : null;

  const relatedLinks = topic.relatedTopicIds
    .map((id) => {
      const t = getElectionLawStudyTopic(id);
      return t ? { href: epForumLabElectionLawTopicHref(id), label: t.title } : null;
    })
    .filter((l): l is { href: string; label: string } => l !== null);

  return (
    <ElectionPlanDrillDownShell
      backHref={EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF}
      backLabel="Election law study"
      eyebrow="Forum lab · election law"
      title={topic.title}
      description={topic.summary}
    >
      <div className="space-y-4">
        {topic.sections.map((section) => (
          <article key={section.heading} className="ep-card p-5 text-sm">
            <h2 className="text-xs font-bold uppercase text-[var(--ep-navy)]">{section.heading}</h2>
            <p className="mt-3 leading-relaxed text-[var(--ep-navy-muted)]">{section.body}</p>
          </article>
        ))}
      </div>

      {topic.anchorBills.length > 0 ? (
        <article className="ep-card mt-6 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Anchor bills (verify on Arkleg)</h2>
          <ul className="mt-3 space-y-3">
            {topic.anchorBills.map((bill) => (
              <li key={bill.billNumber} className="rounded-lg border border-[var(--ep-border)] bg-[var(--ep-cream)]/30 p-3">
                <p className="font-bold text-[var(--ep-navy)]">
                  {bill.billNumber} · {bill.label}
                </p>
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{bill.note}</p>
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      {topic.debateLines.length > 0 ? (
        <article className="ep-card mt-6 border-emerald-200 bg-emerald-50/40 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-emerald-900">Practice lines</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-[var(--ep-navy-muted)]">
            {topic.debateLines.map((line) => (
              <li key={line.slice(0, 48)} className="italic">
                &ldquo;{line}&rdquo;
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      {topic.claimsGate.length > 0 ? (
        <article className="ep-card mt-6 border-rose-200 bg-rose-50/40 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-rose-900">Claims gate</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
            {topic.claimsGate.map((item) => (
              <li key={item.slice(0, 48)}>{item}</li>
            ))}
          </ul>
        </article>
      ) : null}

      {relatedLinks.length > 0 ? <ElectionPlanDrillDownRelated links={relatedLinks} /> : null}

      <nav className="mt-10 flex flex-wrap justify-between gap-2 border-t border-[var(--ep-border)] pt-6 text-xs font-bold">
        {prev ? (
          <Link href={epForumLabElectionLawTopicHref(prev.id)} className="text-[var(--ep-navy)] underline">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={epForumLabElectionLawTopicHref(next.id)} className="text-[var(--ep-navy)] underline">
            {next.title} →
          </Link>
        ) : null}
      </nav>
    </ElectionPlanDrillDownShell>
  );
}
