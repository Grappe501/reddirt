/**
 * Client-safe iPad drill player helpers — no drill queue / fs import chain.
 */
import { CANDIDATE_IPAD_PROFILE } from "@/lib/intelligence/candidateIpadMode";
import type { DrillQueueCard, DrillQueueId } from "@/lib/intelligence/v4/phase16P3DrillQueueShared";
import { DRILL_QUEUE_HUB_HREF } from "@/lib/intelligence/v4/phase16P3DrillQueueShared";

export const IPAD_DRILL_PLAYER_HREF = "/admin/intelligence/ipad-drill-player";

export const PHASE16_P5_PLAYER_CONTROL_TOTAL = 4;
export const PHASE16_P5_MIN_TOUCH_TARGET_PX = CANDIDATE_IPAD_PROFILE.minTouchTargetPx;
export const PHASE16_P5_MAX_COLUMN_PX = CANDIDATE_IPAD_PROFILE.maxContentWidthPx;

export type IpadDrillPlayerControlId = "exit" | "prev" | "next" | "timer";

export const IPAD_DRILL_PLAYER_CONTROL_IDS: IpadDrillPlayerControlId[] = [
  "exit",
  "prev",
  "next",
  "timer",
];

export type IpadDrillPlayerControl = {
  controlId: IpadDrillPlayerControlId;
  label: string;
  description: string;
  minTouchPx: number;
};

export const IPAD_DRILL_PLAYER_CONTROLS: IpadDrillPlayerControl[] = [
  {
    controlId: "exit",
    label: "Exit",
    description: "Leave drill player — returns to command home.",
    minTouchPx: PHASE16_P5_MIN_TOUCH_TARGET_PX,
  },
  {
    controlId: "prev",
    label: "Prev",
    description: "Previous drill card in the active queue.",
    minTouchPx: PHASE16_P5_MIN_TOUCH_TARGET_PX,
  },
  {
    controlId: "next",
    label: "Next",
    description: "Next drill card — stage-safe gate on every line.",
    minTouchPx: PHASE16_P5_MIN_TOUCH_TARGET_PX,
  },
  {
    controlId: "timer",
    label: "Timer",
    description: "Per-card countdown — tap to start or pause.",
    minTouchPx: PHASE16_P5_MIN_TOUCH_TARGET_PX,
  },
];

export function isIpadDrillPlayerRoute(pathname: string): boolean {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") ?? "";
  return path === IPAD_DRILL_PLAYER_HREF || path.startsWith(`${IPAD_DRILL_PLAYER_HREF}/`);
}

export function buildIpadDrillPlayerHref(
  queueId: DrillQueueId = "standard-tonight",
  card = 1,
  options?: { total?: number; minutes?: number },
): string {
  const params = new URLSearchParams({
    queue: queueId,
    card: String(card),
  });
  if (options?.total != null) params.set("total", String(options.total));
  if (options?.minutes != null) params.set("dur", String(options.minutes));
  return `${IPAD_DRILL_PLAYER_HREF}?${params.toString()}`;
}

export type IpadDrillPlayerSession = {
  queueId: DrillQueueId;
  queueTitle: string;
  cardIndex: number;
  card: DrillQueueCard;
  cards: DrillQueueCard[];
  totalCards: number;
};

export type IpadDrillPlayerSummary = {
  hubHref: string;
  controlCount: number;
  minTouchPx: number;
  maxColumnPx: number;
  defaultLaunchHref: string;
  drillQueueHref: string;
  tonightReminder: string;
};

export { DRILL_QUEUE_HUB_HREF };
