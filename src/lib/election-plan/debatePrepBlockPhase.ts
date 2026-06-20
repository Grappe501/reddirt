import { getDay1BlockStudy, type BlockStudyPhase } from "@/lib/election-plan/debatePrepDay1BlockStudy";
import { getDay2BlockStudy } from "@/lib/election-plan/debatePrepDay2BlockStudy";
import { DAY1_ID, DAY2_ID, type DrillDownDayId } from "@/lib/election-plan/debatePrepDayDrillDown";
import type { Day1BlockStudyDeep } from "@/lib/election-plan/debatePrepDay1BlockStudy";

export type BlockPhaseContext = {
  dayId: DrillDownDayId;
  blockId: string;
  phaseIndex: number;
  phase: BlockStudyPhase;
  study: Day1BlockStudyDeep;
  totalPhases: number;
};

export function getDayBlockStudyForDay(dayId: DrillDownDayId, blockId: string): Day1BlockStudyDeep | undefined {
  if (dayId === DAY1_ID) return getDay1BlockStudy(blockId);
  if (dayId === DAY2_ID) return getDay2BlockStudy(blockId);
  return undefined;
}

export function getDayBlockPhaseContext(
  dayId: DrillDownDayId,
  blockId: string,
  phaseIndex: number,
): BlockPhaseContext | null {
  const study = getDayBlockStudyForDay(dayId, blockId);
  if (!study || phaseIndex < 1 || phaseIndex > study.phases.length) return null;
  const phase = study.phases[phaseIndex - 1];
  if (!phase) return null;
  return {
    dayId,
    blockId,
    phaseIndex,
    phase,
    study,
    totalPhases: study.phases.length,
  };
}

export function listDayBlockPhaseParams(dayId: DrillDownDayId, blockId: string): number[] {
  const study = getDayBlockStudyForDay(dayId, blockId);
  if (!study) return [];
  return study.phases.map((_, i) => i + 1);
}
