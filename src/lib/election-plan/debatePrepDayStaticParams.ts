/**
 * Static params for Election Plan day drill-down routes (Days 1–2 in Pass 1).
 */
import {
  DAY1_ID,
  DAY2_ID,
  listDayBlocksDrillDown,
  listDayCommandDrillsDrillDown,
  listDayConcepts,
  listDayMicroLessonsDrillDown,
  listDayRehearsalScripts,
  listDayExampleIds,
  type DrillDownDayId,
} from "@/lib/election-plan/debatePrepDayDrillDown";

export const DRILL_DOWN_DAY_IDS: DrillDownDayId[] = [DAY1_ID, DAY2_ID];

export function staticParamsForDayBlocks() {
  return DRILL_DOWN_DAY_IDS.flatMap((dayId) =>
    listDayBlocksDrillDown(dayId).map((b) => ({ dayId, blockId: b.blockId })),
  );
}

export function staticParamsForDayConcepts() {
  return DRILL_DOWN_DAY_IDS.flatMap((dayId) =>
    listDayConcepts(dayId).map((c) => ({ dayId, conceptId: c.id })),
  );
}

export function staticParamsForDayDrills() {
  return DRILL_DOWN_DAY_IDS.flatMap((dayId) =>
    listDayCommandDrillsDrillDown(dayId).map((d) => ({ dayId, drillId: d.id })),
  );
}

export function staticParamsForDayExamples() {
  return DRILL_DOWN_DAY_IDS.flatMap((dayId) =>
    listDayExampleIds(dayId).map((exampleId) => ({ dayId, exampleId })),
  );
}

export function staticParamsForDayMicroLessons() {
  return DRILL_DOWN_DAY_IDS.flatMap((dayId) =>
    listDayMicroLessonsDrillDown(dayId).map((l) => ({ dayId, lessonId: l.id })),
  );
}

export function staticParamsForDayRehearsals() {
  return DRILL_DOWN_DAY_IDS.flatMap((dayId) =>
    listDayRehearsalScripts(dayId).map((s) => ({ dayId, scriptId: s.id })),
  );
}
