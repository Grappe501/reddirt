/**
 * Map SearchChunk `path` values (from ingest) to public site hrefs.
 */
export function pathToHref(path: string): string {
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
  if (path.startsWith("route:")) return "Page";
  if (path.replace(/\\/g, "/").toLowerCase().startsWith("docs/")) return "Reference doc";
  return "Resource";
}
