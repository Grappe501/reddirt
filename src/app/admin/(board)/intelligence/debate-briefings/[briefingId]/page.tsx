import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DEBATE_PHILOSOPHY_BRIEFINGS,
  getDebatePhilosophyBriefing,
} from "@/lib/intelligence/v4/debatePhilosophyBriefings";
import { V4PhilosophyBriefingPanel } from "@/components/admin/intelligence/v4/V4PhilosophyBriefingPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function generateStaticParams() {
  return DEBATE_PHILOSOPHY_BRIEFINGS.map((b) => ({ briefingId: b.briefingId }));
}

type PageProps = { params: Promise<{ briefingId: string }> };

export default async function DebatePhilosophyBriefingPage({ params }: PageProps) {
  const { briefingId } = await params;
  const briefing = getDebatePhilosophyBriefing(briefingId);
  if (!briefing) notFound();

  const idx = DEBATE_PHILOSOPHY_BRIEFINGS.findIndex((b) => b.briefingId === briefingId);
  const prev = idx > 0 ? DEBATE_PHILOSOPHY_BRIEFINGS[idx - 1] : null;
  const next = idx >= 0 && idx < DEBATE_PHILOSOPHY_BRIEFINGS.length - 1 ? DEBATE_PHILOSOPHY_BRIEFINGS[idx + 1] : null;

  return (
    <div className="mx-auto max-w-4xl text-kelly-text">
      <V4PageHeader
        eyebrow={`Philosophy · ${briefing.eyebrow}`}
        title={briefing.title}
        description={briefing.summary}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/debate-briefings"
          className="rounded-full border px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          All briefings
        </Link>
      </V4PageHeader>

      <V4PhilosophyBriefingPanel briefing={briefing} />

      <nav className="mt-8 flex flex-wrap justify-between gap-2 border-t border-kelly-text/10 pt-6 text-xs font-bold">
        {prev ? (
          <Link href={`/admin/intelligence/debate-briefings/${prev.briefingId}`} className="text-kelly-navy underline">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/admin/intelligence/debate-briefings/${next.briefingId}`} className="text-kelly-navy underline">
            {next.title} →
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
