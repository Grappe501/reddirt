import { notFound } from "next/navigation";
import Link from "next/link";

import { ElectionPlanBlockStudyPanel } from "@/components/election-plan/ElectionPlanBlockStudyPanel";
import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownSections,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import { getDay1BlockStudy } from "@/lib/election-plan/debatePrepDay1BlockStudy";
import { getDayBlockDrillDown, listDayBlocksDrillDown, DAY1_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { epDebatePrepDayBlockHref, epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DEBATE_WEEK_INTENSIVE_DAY_IDS, type IntensiveDayId } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return listDayBlocksDrillDown(DAY1_ID).map((b) => ({ dayId: DAY1_ID, blockId: b.blockId }));
}

export default async function ElectionPlanDayBlockPage({
  params,
}: {
  params: Promise<{ dayId: string; blockId: string }>;
}) {
  const { dayId, blockId } = await params;
  if (!DEBATE_WEEK_INTENSIVE_DAY_IDS.includes(dayId as IntensiveDayId)) notFound();
  const block = getDayBlockDrillDown(dayId as IntensiveDayId, blockId);
  if (!block) notFound();

  const study = dayId === DAY1_ID ? getDay1BlockStudy(blockId) : undefined;
  const title = study?.studyGuideTitle ?? block.title;
  const eyebrow = study ? `Study guide · ~${block.minutes} min` : `Study block · ~${block.minutes} min`;

  const dayBlocks = dayId === DAY1_ID ? listDayBlocksDrillDown(DAY1_ID) : [];
  const blockIndex = dayBlocks.findIndex((b) => b.blockId === blockId);
  const prevBlock = blockIndex > 0 ? dayBlocks[blockIndex - 1] : undefined;
  const nextBlock = blockIndex >= 0 && blockIndex < dayBlocks.length - 1 ? dayBlocks[blockIndex + 1] : undefined;

  return (
    <ElectionPlanDrillDownShell
      backHref={epDebatePrepDayHref(dayId)}
      backLabel="Day 1 command foundation"
      eyebrow={eyebrow}
      title={title}
      description={study?.overview ?? block.why}
      pageSummary={study?.professorLead ?? study?.overview}
    >
      {study ? (
        <ElectionPlanBlockStudyPanel study={study} />
      ) : (
        <>
          <ElectionPlanDrillDownSections sections={block.sections} />
          <ElectionPlanDrillDownSteps title="Practice steps — in order" steps={block.practiceSteps} />
          <ElectionPlanDrillDownRelated links={block.relatedLinks} />
        </>
      )}

      {dayId === DAY1_ID && (prevBlock || nextBlock) ? (
        <nav className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--ep-navy)]/10 pt-6">
          {prevBlock ? (
            <Link
              href={epDebatePrepDayBlockHref(DAY1_ID, prevBlock.blockId)}
              className="ep-card ep-chapter-nav-link max-w-md p-4 text-sm"
            >
              <span className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Previous block</span>
              <span className="mt-1 block font-heading font-bold text-[var(--ep-navy)]">{prevBlock.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {nextBlock ? (
            <Link
              href={epDebatePrepDayBlockHref(DAY1_ID, nextBlock.blockId)}
              className="ep-card ep-chapter-nav-link max-w-md p-4 text-right text-sm"
            >
              <span className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Next block</span>
              <span className="mt-1 block font-heading font-bold text-[var(--ep-navy)]">{nextBlock.title}</span>
            </Link>
          ) : null}
        </nav>
      ) : null}
    </ElectionPlanDrillDownShell>
  );
}
