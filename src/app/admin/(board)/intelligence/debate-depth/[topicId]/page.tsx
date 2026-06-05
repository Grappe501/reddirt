import { notFound } from "next/navigation";
import Link from "next/link";
import { DEBATE_DEPTH_TOPICS, getDebateDepthTopic } from "@/lib/intelligence/v4/debateDepthTopics";
import { V4DebateDepthTopicPanel } from "@/components/admin/intelligence/v4/V4DebateDepthTopicPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function generateStaticParams() {
  return DEBATE_DEPTH_TOPICS.map((t) => ({ topicId: t.topicId }));
}

type PageProps = { params: Promise<{ topicId: string }> };

export default async function DebateDepthTopicPage({ params }: PageProps) {
  const { topicId } = await params;
  const topic = getDebateDepthTopic(topicId);
  if (!topic) notFound();

  const idx = DEBATE_DEPTH_TOPICS.findIndex((t) => t.topicId === topicId);
  const prev = idx > 0 ? DEBATE_DEPTH_TOPICS[idx - 1] : null;
  const next = idx >= 0 && idx < DEBATE_DEPTH_TOPICS.length - 1 ? DEBATE_DEPTH_TOPICS[idx + 1] : null;

  return (
    <div className="mx-auto max-w-4xl text-kelly-text">
      <V4PageHeader eyebrow="Debate depth" title={topic.title} description={topic.summary}>
        <V4BackLinks />
        <Link href="/admin/intelligence/debate-briefings" className="rounded-full border px-3 py-1 text-xs font-bold text-violet-950">
          Philosophy briefings
        </Link>
        <Link href="/admin/intelligence/debate-depth" className="rounded-full border px-3 py-1 text-xs font-bold text-kelly-navy">
          All topics
        </Link>
      </V4PageHeader>

      <V4DebateDepthTopicPanel topic={topic} />

      <nav className="mt-8 flex flex-wrap justify-between gap-2 text-xs font-bold">
        {prev ? (
          <Link href={prev.href} className="text-kelly-navy underline">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={next.href} className="text-kelly-navy underline">
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
