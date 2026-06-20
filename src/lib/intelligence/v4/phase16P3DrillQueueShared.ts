/**
 * Client-safe drill queue types and labels — no server-only import chain.
 */

export const DRILL_QUEUE_HUB_HREF = "/admin/intelligence/drill-queue";
export const EP_DRILL_QUEUE_HUB_HREF = "/election-plan/debate-prep/rehearsal";

export type DrillQueueId =
  | "standard-tonight"
  | "sos-speak-order"
  | "trap-pivot"
  | "forum-acca-tonight"
  | "world-class-dress";

export const DRILL_QUEUE_IDS: DrillQueueId[] = [
  "standard-tonight",
  "sos-speak-order",
  "trap-pivot",
  "forum-acca-tonight",
  "world-class-dress",
];

export type DrillQueueCardType = "sos-speak-order" | "trap-pivot" | "forum-capitalize" | "forum-moderator-q";

export type DrillQueueCard = {
  cardId: string;
  order: number;
  cardType: DrillQueueCardType;
  title: string;
  prompt: string;
  speakLine: string | null;
  claimsGate: string;
  stageSafeBlocked: boolean;
  href: string;
  kellyBeat: string;
  durationMinutes: number;
  durationLabel: string;
};

export function drillQueueCardTypeLabel(cardType: DrillQueueCardType): string {
  switch (cardType) {
    case "sos-speak-order":
      return "SOS speak-order";
    case "trap-pivot":
      return "Trap pivot";
    case "forum-capitalize":
      return "Forum capitalize";
    case "forum-moderator-q":
      return "Forum moderator Q";
    default:
      return cardType;
  }
}

/** Client-safe queue id parse — does not probe forum/dress availability. */
export function resolveDrillQueueIdClient(raw: string | undefined): DrillQueueId {
  if (raw && DRILL_QUEUE_IDS.includes(raw as DrillQueueId)) {
    return raw as DrillQueueId;
  }
  return "standard-tonight";
}

export function resolveDrillQueueCardIndex(raw: string | undefined, cardTotal: number): number {
  const parsed = raw ? Number.parseInt(raw, 10) : 1;
  if (!Number.isFinite(parsed) || parsed < 1) return 0;
  return Math.min(cardTotal - 1, parsed - 1);
}

export function buildDrillQueueLaunchHref(
  queueId: DrillQueueId,
  hubBaseHref: string = DRILL_QUEUE_HUB_HREF,
): string {
  return `${hubBaseHref}?queue=${queueId}&card=1`;
}

export type DrillQueueSummary = {
  hubHref: string;
  queueCount: number;
  defaultQueueId: DrillQueueId;
  defaultCardCount: number;
  tonightReminder: string;
  forumQueueAvailable: boolean;
  forumCardCount: number;
  dressQueueAvailable: boolean;
  dressCardCount: number;
};
