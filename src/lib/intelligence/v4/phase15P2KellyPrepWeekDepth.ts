/**
 * Phase 15 P2 — Kelly prep week depth overlays.
 */
import {
  countKellyPrepWeekReads,
  KELLY_PREP_WEEK_DAYS,
  KELLY_PREP_WEEK_HUB_HREF,
  type KellyPrepWeekDayId,
} from "@/lib/intelligence/v4/kellyPrepWeekPath";

export { KELLY_PREP_WEEK_HUB_HREF };

export const PHASE15_P2_DAY_TOTAL = 7;
export const PHASE15_P2_MIN_READS_PER_DAY = 3;
export const PHASE15_P2_MIN_TOTAL_READS = 24;

export type KellyPrepWeekDayOverlay = {
  dayId: KellyPrepWeekDayId;
  passLabel: string;
  summary: string;
  closureSteps: string[];
  exitCriteria: string[];
};

function overlay(
  dayId: KellyPrepWeekDayId,
  passLabel: string,
  summary: string,
  steps: string[],
  exit: string[],
): KellyPrepWeekDayOverlay {
  return { dayId, passLabel, summary, closureSteps: steps, exitCriteria: exit };
}

const DAY_OVERLAYS: Record<KellyPrepWeekDayId, KellyPrepWeekDayOverlay> = {
  "day-1-philosophy": overlay(
    "day-1-philosophy",
    "Day 1 — Philosophy + framing",
    "Agree-but-contrast and author-vs-administrator briefings plus Kelly SOS framework chapter.",
    [
      "Open command home — confirm safe/blocked lines before philosophy reads.",
      "Complete two philosophy briefings with rehearsal out loud.",
      "Skim framework chapter — map three pillars to tonight's lanes.",
    ],
    ["3+ reads", "2 rehearsal lines", "success check met"],
  ),
  "day-2-trap-lanes": overlay(
    "day-2-trap-lanes",
    "Day 2 — Trap lanes 1–3",
    "Authorship, 2021 package, and ranking trap lanes with coaching presence.",
    [
      "Run trap lanes hub — identify lanes 1–3 bait lines.",
      "Rehearse two lanes with speak-order drills.",
      "Check debate command for BLOCKED lanes after rehearsal.",
    ],
    ["4 reads", "2 trap lanes aloud", "no new BLOCKED lanes"],
  ),
  "day-3-sos-questions": overlay(
    "day-3-sos-questions",
    "Day 3 — SOS question bank",
    "Top moderator questions with speak-order drills and stuck-bridge depth.",
    [
      "Pick five SOS questions from hub relevance sort.",
      "Run speak-order 1·2·3 on three questions.",
      "Use if-you-get-stuck depth card once cold.",
    ],
    ["4 reads", "5 SOS drills", "no agree-only closes"],
  ),
  "day-4-opposition": overlay(
    "day-4-opposition",
    "Day 4 — Opposition + contrast",
    "Opposition strategy v6.2 offense sequence with claims gate and film pivot.",
    [
      "Skim six offensive moves and cross-exam starters.",
      "Run debate command readiness — note philosophy feed gaps.",
      "Claims ledger pass on offense lines before rehearsal.",
    ],
    ["4 reads", "1 offensive move aloud", "zero UNSUPPORTED rehearsed"],
  ),
  "day-5-three-way": overlay(
    "day-5-three-way",
    "Day 5 — Three-way + panel context",
    "Psychology manual three-way geometry, pile-on briefing, clerk panel context.",
    [
      "Read three-way geometry section before any panel event.",
      "Rehearse pile-on pivot without fighting two fronts.",
      "Confirm Pakko contrast gate with staff.",
    ],
    ["4 reads", "three-way opening 90s", "psych section complete"],
  ),
  "day-6-simulation": overlay(
    "day-6-simulation",
    "Day 6 — Full simulation",
    "Debate prep sections 1–10 under time pressure with trap and SOS sprint.",
    [
      "60-min simulation — staff calls Hammer bait lines.",
      "Timed trap lane run — 60s per lane.",
      "Debrief top 3 fixes for Sunday.",
    ],
    ["3 reads", "simulation complete", "readiness ≥70% dimensions"],
  ),
  "day-7-red-lines": overlay(
    "day-7-red-lines",
    "Day 7 — Rest + red lines",
    "Claims-only consolidation — safe/blocked scan and opening/closing bookends.",
    [
      "Five-minute command home scan — safe lines only.",
      "Claims ledger red-line review — no new NEEDS_REVIEW on stage.",
      "One opening + one closing — verified lines only.",
    ],
    ["3 reads", "week complete", "three safe + three blocked from memory"],
  ),
};

export function getKellyPrepWeekDayOverlay(dayId: KellyPrepWeekDayId): KellyPrepWeekDayOverlay {
  return DAY_OVERLAYS[dayId];
}

export function kellyPrepWeekDayMeetsPhase15P2Bar(overlay: KellyPrepWeekDayOverlay): boolean {
  return overlay.closureSteps.length >= 3 && overlay.exitCriteria.length >= 2;
}

export function countKellyPrepWeekDaysAtBar(): { total: number; atBar: number } {
  const overlays = KELLY_PREP_WEEK_DAYS.map((d) => getKellyPrepWeekDayOverlay(d.dayId));
  const atBar = overlays.filter(kellyPrepWeekDayMeetsPhase15P2Bar).length;
  return { total: overlays.length, atBar };
}

export { countKellyPrepWeekReads } from "@/lib/intelligence/v4/kellyPrepWeekPath";
