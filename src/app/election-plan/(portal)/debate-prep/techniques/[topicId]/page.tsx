import Link from "next/link";
import { notFound } from "next/navigation";

import { DebatePrepDepthTopicPanel } from "@/components/election-plan/DebatePrepDepthTopicPanel";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { EP_DEBATE_TECHNIQUES_HREF } from "@/lib/election-plan/debate-prep-links";
import { DEBATE_DEPTH_TOPICS, getDebateDepthTopic } from "@/lib/intelligence/v4/debateDepthTopics";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return DEBATE_DEPTH_TOPICS.map((t) => ({ topicId: t.topicId }));
}

export async function generateMetadata({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const topic = getDebateDepthTopic(topicId);
  if (!topic) return { title: "Technique not found" };
  return {
    title: `${topic.title} | Debate Techniques`,
    robots: { index: false, follow: false },
  };
}

export default async function ElectionPlanDebateTechniqueDetailPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const topic = getDebateDepthTopic(topicId);
  if (!topic) notFound();

  return (
    <>
      <div className="ep-classification">Internal · Debate technique · {topic.title}</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ElectionPlanDebatePrepSubnav />

          <header className="mb-6">
            <Link href={EP_DEBATE_TECHNIQUES_HREF} className="text-xs font-bold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
              ← Techniques library
            </Link>
            <h1 className="mt-3 font-heading text-3xl font-bold text-[var(--ep-navy)]">{topic.title}</h1>
            <p className="mt-3 text-sm text-[var(--ep-navy-muted)]">{topic.summary}</p>
          </header>

          <DebatePrepDepthTopicPanel topic={topic} />
        </div>
      </div>
    </>
  );
}
