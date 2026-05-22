import { buildCountyActionPackage } from "@/lib/agents/county-intelligence/county-action-package-builder";

export function adaptCountyMessaging(countySlug: string): {
  angle: string;
  powerOfFiveAsk: string;
  volunteerAsk: string;
  followUp: string;
} | null {
  const pkg = buildCountyActionPackage(countySlug, "county_growth");
  if (!pkg) return null;
  return {
    angle: pkg.communicationsRecommendation,
    powerOfFiveAsk: pkg.powerOfFiveTarget,
    volunteerAsk: pkg.volunteerNeed,
    followUp: pkg.followUpPlan.join(" · "),
  };
}

export function buildCountyIssueSummary(countySlug: string): string {
  const pkg = buildCountyActionPackage(countySlug, "county_recovery");
  if (!pkg) return `County ${countySlug}: no bridge data`;
  return `${pkg.countyName}: ${pkg.topGaps.join(" · ")}`;
}
