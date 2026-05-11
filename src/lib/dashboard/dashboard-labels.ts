/**
 * Volunteer team dashboard — human-readable context for the super header.
 */

export function resolveTeamDashboardLabel(pathname: string | null | undefined, teamSlug: string): string {
  if (!pathname) return "Overview Dashboard";
  const base = `/dashboard/team/${teamSlug}`;
  const norm = pathname.replace(/\/$/, "");
  if (norm === base) return "Overview Dashboard";
  if (norm.startsWith(`${base}/social-media`)) return "Social Media Dashboard";
  if (norm.startsWith(`${base}/events`)) return "Events Dashboard";
  if (norm.startsWith(`${base}/power-of-5`)) return "Power of 5 / VR Dashboard";
  if (norm.startsWith(`${base}/youth-outreach`)) return "Youth Outreach Dashboard";
  if (norm.startsWith(`${base}/training`)) return "Training Dashboard";
  if (norm.startsWith(`${base}/metrics`)) return "Metrics Dashboard";
  if (norm.startsWith(`${base}/resources`)) return "Resources Dashboard";
  if (norm.startsWith(`${base}/messages`)) return "Messages Dashboard";
  return "Overview Dashboard";
}
