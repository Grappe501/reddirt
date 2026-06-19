import { notFound } from "next/navigation";

import { ElectionPlanSosQuestionPanel } from "@/components/election-plan/ElectionPlanSosQuestionPanel";
import { ElectionPlanDrillDownShell } from "@/components/election-plan/ElectionPlanDrillDownShell";
import { EP_DEBATE_QUESTIONS_HREF } from "@/lib/election-plan/debate-prep-links";
import {
  getAllSosDebateQuestionIds,
  getSosDebateQuestionDrillDown,
} from "@/lib/intelligence/v4/sosDebateQuestionBank";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getAllSosDebateQuestionIds().map((questionId) => ({ questionId }));
}

export async function generateMetadata({ params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params;
  const drill = getSosDebateQuestionDrillDown(questionId);
  if (!drill) return { title: "Question not found" };
  return {
    title: `Q${drill.questionNumber} · ${drill.title}`,
    robots: { index: false, follow: false },
  };
}

export default async function ElectionPlanDebateQuestionPage({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  const { questionId } = await params;
  const drill = getSosDebateQuestionDrillDown(questionId);
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
    <ElectionPlanDrillDownShell
      backHref={EP_DEBATE_QUESTIONS_HREF}
      backLabel="40 expected questions"
      eyebrow={`Q${drill.questionNumber} of ${ids.length} · ${drill.categoryLabel} · ${drill.probability}`}
      title={drill.title}
      description={drill.whyModeratorsAsk}
    >
      <ElectionPlanSosQuestionPanel drill={drill} prev={prev} next={next} />
    </ElectionPlanDrillDownShell>
  );
}
