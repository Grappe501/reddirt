/**
 * Phase 15 — Candidate Command Experience (CCE) depth constants.
 */
export const CANDIDATE_COMMAND_HOME_HREF = "/admin/intelligence";

export const PHASE15_P0_MAX_SECTIONS = 5;
export const PHASE15_P0_MAX_LINKS_PER_SECTION = 5;
export const PHASE15_P0_MAX_CANDIDATE_LINKS = 25;

export const BUILDER_INFRA_HREF_PREFIXES = [
  "/admin/intelligence/phase-3-upgrade",
  "/admin/intelligence/phase-4-upgrade",
  "/admin/intelligence/phase-5-upgrade",
  "/admin/intelligence/phase-6-upgrade",
  "/admin/intelligence/phase-7-upgrade",
  "/admin/intelligence/phase-8-upgrade",
  "/admin/intelligence/phase-9-upgrade",
  "/admin/intelligence/phase-10-upgrade",
  "/admin/intelligence/phase-11-upgrade",
  "/admin/intelligence/phase-11-p",
  "/admin/intelligence/phase-15-p",
  "/admin/intelligence/phase-11-stack-closure",
  "/admin/intelligence/field-book-chunk-promotion",
  "/admin/intelligence/strategy-alignment-chunk-preview",
  "/admin/intelligence/briefing-papers-chunk-attach",
  "/admin/intelligence/field-book-promotion-execution",
  "/admin/intelligence/build-progress",
  "/admin/intelligence/agent-tooling",
  "/admin/intelligence/command-center",
] as const;

export function isBuilderInfraHref(href: string): boolean {
  const path = href.split("?")[0]?.replace(/\/$/, "") ?? href;
  return BUILDER_INFRA_HREF_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(prefix),
  );
}
