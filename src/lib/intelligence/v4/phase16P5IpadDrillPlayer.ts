/**
 * Phase 16 P5 — iPad drill player (full-screen stepper in candidate iPad shell).
 */
import "server-only";

import {
  DRILL_QUEUE_HUB_HREF,
  getDrillQueue,
  getDrillQueueCards,
  resolveDrillQueueCardIndex,
  resolveDrillQueueId,
} from "@/lib/intelligence/v4/phase16P3DrillQueue";
import {
  buildIpadDrillPlayerHref,
  IPAD_DRILL_PLAYER_HREF,
  PHASE16_P5_MAX_COLUMN_PX,
  PHASE16_P5_MIN_TOUCH_TARGET_PX,
  PHASE16_P5_PLAYER_CONTROL_TOTAL,
  type IpadDrillPlayerSession,
  type IpadDrillPlayerSummary,
} from "@/lib/intelligence/v4/phase16P5IpadDrillPlayerShared";

export {
  buildIpadDrillPlayerHref,
  IPAD_DRILL_PLAYER_HREF,
  IPAD_DRILL_PLAYER_CONTROL_IDS,
  IPAD_DRILL_PLAYER_CONTROLS,
  isIpadDrillPlayerRoute,
  PHASE16_P5_MAX_COLUMN_PX,
  PHASE16_P5_MIN_TOUCH_TARGET_PX,
  PHASE16_P5_PLAYER_CONTROL_TOTAL,
  type IpadDrillPlayerControl,
  type IpadDrillPlayerControlId,
  type IpadDrillPlayerSession,
  type IpadDrillPlayerSummary,
} from "@/lib/intelligence/v4/phase16P5IpadDrillPlayerShared";

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
