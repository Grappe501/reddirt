/**
 * Campaign-themed team names for VOS Phase 1.
 * Format: [Geography label] + [Callsign] + [three-digit number]
 * Slug: kebab-case geography key + callsign + number (e.g. creek-county-liberty-104)
 */

export const TEAM_CALLSIGNS = [
  "Liberty",
  "Beacon",
  "Eagle",
  "Oak",
  "Torch",
  "Republic",
  "Frontier",
  "Resolve",
  "Sentinel",
  "Victory",
  "Integrity",
  "Pioneer",
] as const;

export type TeamCallsign = (typeof TEAM_CALLSIGNS)[number];

/** Abbreviation for teamCode (e.g. Liberty -> LIB) */
export function callsignAbbreviation(callsign: string): string {
  const trimmed = callsign.trim();
  if (!trimmed) return "TM";
  const u = trimmed.toUpperCase();
  if (u.length <= 3) return u;
  return (trimmed[0]! + trimmed[1]! + trimmed[Math.min(2, trimmed.length - 1)]!).toUpperCase();
}

export function formatTeamDisplayName(geographyLabel: string, callsign: string, threeDigit: number): string {
  const n = String(threeDigit).padStart(3, "0");
  return `${geographyLabel} ${callsign} ${n}`;
}

export function formatTeamCode(callsign: string, threeDigit: number): string {
  const n = String(threeDigit).padStart(3, "0");
  return `${callsignAbbreviation(callsign)}-${n}`;
}

/** geographyKey: slug-safe base without callsign/number, e.g. "creek-county" */
export function buildTeamSlug(geographyKey: string, callsign: string, threeDigit: number): string {
  const cs = callsign.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const n = String(threeDigit).padStart(3, "0");
  return `${geographyKey}-${cs}-${n}`.replace(/--+/g, "-");
}

/** Default slug for Phase 1 demo redirects (`/dashboard` → team workspace). */
export const VOLUNTEER_OS_DEMO_TEAM_SLUG = buildTeamSlug("creek-county", "Liberty", 104);
