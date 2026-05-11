/** Community regions that are intentionally scaffolded until partner-ready parity with Muslim dashboard. */

export const CONVERSATIONAL_SPANISH_DASHBOARD_BASE = "/dashboard/community/conversational-spanish" as const;
export const MARSHALLESE_DASHBOARD_BASE = "/dashboard/community/marshallese" as const;

export type CommunityScaffoldNavSegment = "" | "resources" | "rollup";

export const COMMUNITY_SCAFFOLD_NAV: { segment: CommunityScaffoldNavSegment; label: string }[] = [
  { segment: "", label: "Overview" },
  { segment: "resources", label: "Resources" },
  { segment: "rollup", label: "Rollup" },
];

export function communityScaffoldHref(base: string, segment: CommunityScaffoldNavSegment): string {
  return segment ? `${base}/${segment}` : base;
}

export function resolveCommunityScaffoldLabel(pathname: string, base: string): string {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const baseNorm = base.replace(/\/$/, "");
  if (normalized === baseNorm) return "Overview";
  if (normalized.startsWith(`${baseNorm}/resources`)) return "Resources";
  if (normalized.startsWith(`${baseNorm}/rollup`)) return "Rollup";
  return "Overview";
}
