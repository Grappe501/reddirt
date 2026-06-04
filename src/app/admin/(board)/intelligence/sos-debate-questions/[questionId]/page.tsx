import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllSosDebateQuestionIds,
  getSosDebateQuestionDrillDown,
  getSosDebateQuestionWithBriefing,
} from "@/lib/intelligence/v4/sosDebateQuestionBank";
import { V4SosDebateQuestionPanel } from "@/components/admin/intelligence/sos-questions/V4SosDebateQuestionPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function generateStaticParams() {
  return getAllSosDebateQuestionIds().map((questionId) => ({ questionId }));
}

type PageProps = { params: Promise<{ questionId: string }> };

export default async function SosDebateQuestionDrillDownPage({ params }: PageProps) {
  const { questionId } = await params;
  const drill = getSosDebateQuestionWithBriefing(questionId);
  if (!drill) notFound();

  const ids = getAllSosDebateQuestionIds();
  const idx = ids.indexOf(questionId);
  const prev =
    idx > 0
      ? { questionId: ids[idx - 1], title: getSosDebateQuestionDrillDown(ids[idx - 1])!.title }
      : null;
  const next =
    idx >= 0 && idx < ids.length - 1
      ? { questionId: ids[idx + 1], title: getSosDebateQuestionDrillDown(ids[idx + 1])!.title }
      : null;

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow={`Expected question ${drill.questionNumber} of ${ids.length} · ${drill.categoryLabel}`}
        title={drill.title}
        description="Full drill-down: 1st/2nd/3rd speak order, direct answers, rebuttals, Hammer/Packo angles — verify acts before stage."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/sos-debate-questions"
          className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          ← All questions
        </Link>
      </V4PageHeader>

      <V4SosDebateQuestionPanel drill={drill} prev={prev} next={next} />
    </div>
  );
}
