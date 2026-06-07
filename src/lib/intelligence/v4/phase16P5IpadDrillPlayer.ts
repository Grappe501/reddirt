/**
 * Phase 16 P5 — iPad drill player (full-screen stepper in candidate iPad shell).
 */
import { CANDIDATE_IPAD_PROFILE } from "@/lib/intelligence/candidateIpadMode";
import {
  DRILL_QUEUE_HUB_HREF,
  getDrillQueue,
  getDrillQueueCards,
  resolveDrillQueueCardIndex,
  resolveDrillQueueId,
  type DrillQueueCard,
  type DrillQueueId,
} from "@/lib/intelligence/v4/phase16P3DrillQueue";

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
): string {
  return `${IPAD_DRILL_PLAYER_HREF}?queue=${queueId}&card=${card}`;
}

export type IpadDrillPlayerSession = {
  queueId: DrillQueueId;
  queueTitle: string;
  cardIndex: number;
  card: DrillQueueCard;
  cards: DrillQueueCard[];
  totalCards: number;
};

export function resolveIpadDrillPlayerSession(
  queueRaw: string | undefined,
  cardRaw: string | undefined,
): IpadDrillPlayerSession | undefined {
  const queueId = resolveDrillQueueId(queueRaw);
  const cards = getDrillQueueCards(queueId);
  if (cards.length === 0) return undefined;
  const cardIndex = resolveDrillQueueCardIndex(cardRaw, cards.length);
  const queue = getDrillQueue(queueId);
  return {
    queueId,
    queueTitle: queue?.title ?? "Drill queue",
    cardIndex,
    card: cards[cardIndex]!,
    cards,
    totalCards: cards.length,
  };
}

export type IpadDrillPlayerSummary = {
  hubHref: string;
  controlCount: number;
  minTouchPx: number;
  maxColumnPx: number;
  defaultLaunchHref: string;
  drillQueueHref: string;
  tonightReminder: string;
};

export function buildIpadDrillPlayerSummary(): IpadDrillPlayerSummary {
  return {
    hubHref: IPAD_DRILL_PLAYER_HREF,
    controlCount: PHASE16_P5_PLAYER_CONTROL_TOTAL,
    minTouchPx: PHASE16_P5_MIN_TOUCH_TARGET_PX,
    maxColumnPx: PHASE16_P5_MAX_COLUMN_PX,
    defaultLaunchHref: buildIpadDrillPlayerHref("standard-tonight", 1),
    drillQueueHref: DRILL_QUEUE_HUB_HREF,
    tonightReminder:
      "iPad drill player — full-screen stepper with Exit · Prev · Next · Timer controls when rehearsing side-stage.",
  };
}
