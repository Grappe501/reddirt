/**
 * Phase 15 P2 — Kelly prep week inventory + state builder.
 */
import {
  getKellyPrepWeekDayOverlay,
  kellyPrepWeekDayMeetsPhase15P2Bar,
} from "@/lib/intelligence/v4/phase15P2KellyPrepWeekDepth";
import {
  KELLY_PREP_WEEK_DAYS,
  type KellyPrepWeekDayId,
} from "@/lib/intelligence/v4/kellyPrepWeekPath";
import type { KellyPrepWeekStateFile } from "@/lib/intelligence/v4/kellyPrepWeekState";

export type KellyPrepWeekDaySurface = {
  dayId: KellyPrepWeekDayId;
  day: number;
  weekdayLabel: string;
  title: string;
  readCount: number;
  href: string;
  phase15P2Enriched: boolean;
};

export function buildKellyPrepWeekState(): KellyPrepWeekStateFile {
  const days: KellyPrepWeekDaySurface[] = KELLY_PREP_WEEK_DAYS.map((plan) => {
    const overlay = getKellyPrepWeekDayOverlay(plan.dayId);
    return {
      dayId: plan.dayId,
      day: plan.day,
      weekdayLabel: plan.weekdayLabel,
      title: plan.title,
      readCount: plan.kellyReads.length,
      href: `/admin/intelligence/kelly-prep-week/${plan.dayId}`,
      phase15P2Enriched: kellyPrepWeekDayMeetsPhase15P2Bar(overlay),
    };
  });

  const daysComplete = days.filter((d) => d.phase15P2Enriched).length;

  return {
    generatedAt: new Date().toISOString(),
    daysComplete,
    dayTotal: days.length,
    days: days.map((d) => ({
      dayId: d.dayId,
      day: d.day,
      status: d.phase15P2Enriched ? ("complete" as const) : ("open" as const),
      completedAt: d.phase15P2Enriched ? new Date().toISOString() : undefined,
    })),
  };
}

export function listKellyPrepWeekDaySurfacesFromPath(): KellyPrepWeekDaySurface[] {
  return KELLY_PREP_WEEK_DAYS.map((plan) => {
    const overlay = getKellyPrepWeekDayOverlay(plan.dayId);
    return {
      dayId: plan.dayId,
      day: plan.day,
      weekdayLabel: plan.weekdayLabel,
      title: plan.title,
      readCount: plan.kellyReads.length,
      href: `/admin/intelligence/kelly-prep-week/${plan.dayId}`,
      phase15P2Enriched: kellyPrepWeekDayMeetsPhase15P2Bar(overlay),
    };
  });
}
