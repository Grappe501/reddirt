/**
 * Client-safe drill queue types and labels — no server-only import chain.
 */

export type DrillQueueId =
  | "standard-tonight"
  | "sos-speak-order"
  | "trap-pivot"
  | "forum-acca-tonight"
  | "world-class-dress";

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
