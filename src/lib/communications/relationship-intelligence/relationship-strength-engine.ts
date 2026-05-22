import type { TrustLevel, InfluenceLevel, Responsiveness } from "./relationship-graph-types";

export function deriveTrustLevel(engagementScore: number, sendCount: number): TrustLevel {
  if (engagementScore >= 75 && sendCount >= 2) return "champion";
  if (engagementScore >= 55) return "trusted";
  if (engagementScore >= 35) return "warming";
  return "new";
}

export function deriveInfluenceLevel(kinds: string[], countySlug?: string): InfluenceLevel {
  if (kinds.includes("county_leader") || kinds.includes("host")) return "high";
  if (kinds.includes("donor_supporter") || kinds.includes("campaign_team")) return "medium";
  if (countySlug) return "medium";
  return "low";
}

export function deriveResponsiveness(engagementScore: number, daysSinceTouch?: number): Responsiveness {
  if (daysSinceTouch == null) return "unknown";
  if (engagementScore >= 60 && daysSinceTouch < 21) return "high";
  if (daysSinceTouch < 45) return "steady";
  return "slow";
}

export function computeRelationshipStrength(engagementScore: number, trust: TrustLevel): number {
  const trustBoost = { new: 0, warming: 8, trusted: 18, champion: 28 }[trust];
  return Math.min(100, Math.round(engagementScore * 0.7 + trustBoost));
}
