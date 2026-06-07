/**
 * Phase 15 P8 — Staff backstage route guard policy.
 */
import {
  CANDIDATE_COMMAND_HOME_HREF,
  isBuilderInfraHref,
} from "@/lib/intelligence/v4/phase15CandidateCommandDepth";
import type { IntelligenceNavProfile } from "@/lib/intelligence/v4/roleBasedNavProfile";

export const STAFF_BACKSTAGE_BLOCKED_QUERY = "staff-backstage-blocked";

export const STAFF_OPERATIONS_HREF_PREFIXES = [
  "/admin/intelligence/rehearsal-coach",
  "/admin/intelligence/supreme-workbench",
  "/admin/intelligence/morning-brief",
  "/admin/intelligence/strategy-philosophy-hub",
  "/admin/intelligence/command-center",
  "/admin/intelligence/kim-hammer/debate-ai-workbench",
  "/admin/intelligence/llm-review-queue",
  "/admin/intelligence/action-queue",
] as const;

const PUBLIC_META_HREFS = new Set([
  "/admin/intelligence/staff-backstage",
  "/admin/intelligence/phase-15-p8-upgrade",
]);

export function normalizeIntelligencePath(pathname: string): string {
  return pathname.split("?")[0]?.replace(/\/$/, "") || CANDIDATE_COMMAND_HOME_HREF;
}

export function isStaffBackstageHref(href: string): boolean {
  const path = normalizeIntelligencePath(href);
  if (PUBLIC_META_HREFS.has(path)) return false;
  if (isBuilderInfraHref(path)) return true;
  return STAFF_OPERATIONS_HREF_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export function profileMayAccessStaffBackstage(
  profile: Exclude<IntelligenceNavProfile, "AUTO">,
): boolean {
  return profile === "STAFF";
}

export function resolveStaffBackstageRedirect(
  pathname: string,
  profile: Exclude<IntelligenceNavProfile, "AUTO">,
): string | null {
  if (profileMayAccessStaffBackstage(profile)) return null;
  if (!isStaffBackstageHref(pathname)) return null;
  const blocked = encodeURIComponent(normalizeIntelligencePath(pathname));
  return `${CANDIDATE_COMMAND_HOME_HREF}?${STAFF_BACKSTAGE_BLOCKED_QUERY}=${blocked}`;
}
