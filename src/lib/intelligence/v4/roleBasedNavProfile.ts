/**
 * Role-based intelligence nav profiles — Netlify deploy variants beyond iPad mode.
 * Set NEXT_PUBLIC_INTELLIGENCE_NAV_PROFILE=CANDIDATE|STAFF|CLERK_WEEK (default: auto).
 */

export type IntelligenceNavProfile = "CANDIDATE" | "STAFF" | "CLERK_WEEK" | "AUTO";

export function getIntelligenceNavProfile(): IntelligenceNavProfile {
  const raw = process.env.NEXT_PUBLIC_INTELLIGENCE_NAV_PROFILE?.trim().toUpperCase();
  if (raw === "CANDIDATE" || raw === "STAFF" || raw === "CLERK_WEEK") return raw;
  return "AUTO";
}

/** Client-safe profile for nav components. */
export function resolveIntelligenceNavProfileClient(
  clerkWeekAudience: boolean,
): Exclude<IntelligenceNavProfile, "AUTO"> {
  const configured = getIntelligenceNavProfile();
  if (configured !== "AUTO") return configured;
  if (clerkWeekAudience) return "CLERK_WEEK";
  return "CANDIDATE";
}

/** Server components — defaults AUTO to CANDIDATE (stage-safe deploy). */
export function resolveIntelligenceNavProfileServer(): Exclude<IntelligenceNavProfile, "AUTO"> {
  const configured = getIntelligenceNavProfile();
  if (configured !== "AUTO") return configured;
  return "CANDIDATE";
}

export function profileUsesStageSafeFilter(
  profile: Exclude<IntelligenceNavProfile, "AUTO">,
): boolean {
  return profile === "CANDIDATE" || profile === "CLERK_WEEK";
}

export const NAV_PROFILE_LABELS: Record<Exclude<IntelligenceNavProfile, "AUTO">, string> = {
  CANDIDATE: "Candidate — Kelly-safe surfaces only",
  STAFF: "Staff — full three-lane access",
  CLERK_WEEK: "Clerk week — county path first",
};
