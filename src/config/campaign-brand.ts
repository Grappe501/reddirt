/** Section nav label "The Plan" in config/navigation — these routes get stronger visuals + page hero tone. */
export const THE_PLAN_PATH_PREFIXES = ["/priorities", "/explainers", "/editorial"] as const;

export function isThePlanPath(pathname: string): boolean {
  const p = pathname.split("?")[0] ?? "/";
  return THE_PLAN_PATH_PREFIXES.some(
    (prefix) => p === prefix || p.startsWith(`${prefix}/`)
  );
}

export function isCampaignHomePath(pathname: string): boolean {
  const p = pathname.split("?")[0] ?? "/";
  return p === "/";
}
