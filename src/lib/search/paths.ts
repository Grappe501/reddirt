/**
 * Map SearchChunk `path` values (from ingest) to public site hrefs.
 */
export function pathToHref(path: string): string {
  if (path.startsWith("brief:")) {
    return "/resources";
  }
  if (path.startsWith("external:")) {
    const rest = path.slice("external:".length);
    if (!rest.length) return "/";
    return /^https?:\/\//i.test(rest) ? rest : `https://${rest}`;
  }
  if (path.startsWith("route:")) {
    const rest = path.slice("route:".length);
    return rest.length ? rest : "/";
  }
  const normalized = path.replace(/\\/g, "/").toLowerCase();
  if (normalized.includes("explainer") || normalized.startsWith("content/explainers")) {
    return "/explainers";
  }
  if (normalized.startsWith("docs/")) {
    return "/resources";
  }
  return "/resources";
}

/** Short label for result type in UI */
export function pathKindLabel(path: string): string {
  if (path.startsWith("brief:")) return "Campaign briefing";
  if (path.startsWith("external:")) {
    const href = path.slice("external:".length);
    if (/forevermostfarms\.com/i.test(href)) return "Kelly & Steve’s farm site";
    if (/standuparkansas\.com/i.test(href)) return "Stand Up Arkansas";
    return "External site";
  }
  if (path.startsWith("route:")) return "Page";
  if (path.replace(/\\/g, "/").toLowerCase().startsWith("docs/")) return "Reference doc";
  return "Resource";
}
