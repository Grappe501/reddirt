import type { TrustLevel } from "../relationship-intelligence/relationship-graph-types";
import type { WritingTone } from "./writing-orchestration-types";

export function adjustToneForRelationship(base: WritingTone, trust: TrustLevel): WritingTone {
  if (trust === "champion") return base === "urgent" ? "urgent" : "celebratory";
  if (trust === "new") return "warm";
  return base;
}

export function relationshipPreamble(trust: TrustLevel, displayName: string): string {
  if (trust === "champion") return `${displayName}, you've been a steady partner —`;
  if (trust === "trusted") return `${displayName},`;
  return `Hello ${displayName},`;
}
