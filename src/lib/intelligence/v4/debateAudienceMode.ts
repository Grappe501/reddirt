/**
 * Primary audience for this debate week cycle.
 * Set NEXT_PUBLIC_DEBATE_PRIMARY_AUDIENCE=county_clerks on Netlify for clerk-first nav.
 */

export type DebatePrimaryAudience = "county_clerks" | "general_debate" | "media";

export function getDebatePrimaryAudience(): DebatePrimaryAudience {
  const raw = process.env.NEXT_PUBLIC_DEBATE_PRIMARY_AUDIENCE?.trim().toLowerCase();
  if (raw === "county_clerks" || raw === "clerks") return "county_clerks";
  if (raw === "media") return "media";
  return "general_debate";
}

export function isCountyClerkPrimaryAudience(): boolean {
  return getDebatePrimaryAudience() === "county_clerks";
}
