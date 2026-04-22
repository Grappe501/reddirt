/**
 * Derive stable, filterable issue tags from a relative path for the campaign "brain" index.
 */
export function inferBrainIssueTags(relativePathPosix: string, sourceBundleName: string): string[] {
  const out = new Set<string>(["campaign-brain", "brain-ingest"]);
  const bundle = sourceBundleName
    .toLowerCase()
    .replace(/\.zip$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (bundle.length > 2) out.add(`brain-bundle-${bundle.slice(0, 48)}`);

  const parts = relativePathPosix.split("/").filter(Boolean);
  for (const part of parts) {
    const base = part.replace(/\.[^.]+$/, "");
    const lower = base.toLowerCase();
    if (lower.length < 2) continue;
    if (/^__macosx$|^\.git$|^node_modules$/.test(lower)) continue;
    if (/^trainings-\d{8}t/i.test(lower)) continue;
    if (/^\d+$/.test(lower)) continue;
    const slug = lower.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (slug.length > 2 && slug !== "html" && slug !== "htm") {
      out.add(`brain-${slug.slice(0, 64)}`);
    }
  }
  return [...out].slice(0, 32);
}

/**
 * Skip e-learning / build artifacts that are not useful for RAG (minified JS, SCORM shells).
 */
export function shouldSkipBrainPath(relativePathPosix: string): boolean {
  const p = relativePathPosix.replace(/\\/g, "/").toLowerCase();
  if (p.includes("/content/lib/")) return true;
  if (p.includes("/learn_dist/")) return true;
  if (p.includes("/__macosx/")) return true;
  if (p.includes("/node_modules/")) return true;
  if (p.endsWith(".map")) return true;
  if (p.includes("/rise/") && p.endsWith(".js")) return true;
  if (p.includes("/mondrian/") && p.endsWith(".js")) return true;
  if (p.includes("/sandbox/") && p.endsWith(".js")) return true;
  if (/\/\d+[a-f]{6,8}\.js$/i.test(p)) return true;
  return false;
}
