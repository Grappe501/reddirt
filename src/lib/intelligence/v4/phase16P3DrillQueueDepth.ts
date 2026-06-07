/**
 * Phase 16 P3 — Drill queue depth overlays.
 */
import {
  DRILL_QUEUE_HUB_HREF,
  DRILL_QUEUE_IDS,
  getDrillQueue,
  getDrillQueueCards,
  type DrillQueueCard,
  type DrillQueueId,
} from "@/lib/intelligence/v4/phase16P3DrillQueue";

export { DRILL_QUEUE_HUB_HREF };

export type DrillQueueOverlay = {
  queueId: DrillQueueId;
  operatorSteps: string[];
  cardsWired: boolean;
  stageSafeEnforced: boolean;
  wiredOnRoute: boolean;
};

export type DrillQueueCardOverlay = {
  cardId: string;
  operatorSteps: string[];
  stageSafeBlocked: boolean;
  wiredOnRoute: boolean;
};

export function getDrillQueueOverlay(queueId: DrillQueueId): DrillQueueOverlay | undefined {
  const queue = getDrillQueue(queueId);
  if (!queue) return undefined;
  const cards = getDrillQueueCards(queueId);
  const blockedCount = cards.filter((c) => c.stageSafeBlocked).length;
  return {
    queueId,
    operatorSteps: [
      queue.description,
      queue.kellyRule,
      `${cards.length} cards · ~${queue.estimatedMinutes} min · ${blockedCount} stage-safe blocked`,
    ],
    cardsWired: cards.every((c) => c.href.startsWith("/admin/intelligence")),
    stageSafeEnforced: cards.every((c) => c.claimsGate.length > 0),
    wiredOnRoute: queue.launchHref.startsWith("/admin/intelligence"),
  };
}

export function drillQueueMeetsPhase16P3Bar(overlay: DrillQueueOverlay): boolean {
  return overlay.operatorSteps.length >= 3 && overlay.cardsWired && overlay.stageSafeEnforced && overlay.wiredOnRoute;
}

export function countDrillQueuesAtBar(): { atBar: number; total: number } {
  const atBar = DRILL_QUEUE_IDS.filter((id) => {
    const o = getDrillQueueOverlay(id);
    return o && drillQueueMeetsPhase16P3Bar(o);
  }).length;
  return { atBar, total: DRILL_QUEUE_IDS.length };
}

export function getDrillQueueCardOverlay(
  queueId: DrillQueueId,
  cardId: string,
): DrillQueueCardOverlay | undefined {
  const card = getDrillQueueCards(queueId).find((c) => c.cardId === cardId);
  if (!card) return undefined;
  return buildCardOverlay(card);
}

function buildCardOverlay(card: DrillQueueCard): DrillQueueCardOverlay {
  return {
    cardId: card.cardId,
    operatorSteps: [
      card.kellyBeat,
      card.stageSafeBlocked ? "Stage-safe blocked — research-question framing only" : `Say: ${card.speakLine?.slice(0, 80) ?? ""}`,
      `Route: ${card.href}`,
    ],
    stageSafeBlocked: card.stageSafeBlocked,
    wiredOnRoute: card.href.startsWith("/admin/intelligence"),
  };
}

export function drillQueueCardMeetsPhase16P3Bar(overlay: DrillQueueCardOverlay): boolean {
  return overlay.operatorSteps.length >= 3 && overlay.wiredOnRoute;
}

export function countStandardQueueCardsAtBar(): { atBar: number; total: number } {
  const cards = getDrillQueueCards("standard-tonight");
  const atBar = cards.filter((c) => {
    const o = getDrillQueueCardOverlay("standard-tonight", c.cardId);
    return o && drillQueueCardMeetsPhase16P3Bar(o);
  }).length;
  return { atBar, total: cards.length };
}
