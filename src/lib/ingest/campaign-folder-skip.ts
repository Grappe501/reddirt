/**
 * Paths to skip in folder / zip ingest: SCORM & Rise player bundles, macOS noise.
 * The engine ingests *campaign files* (docs, slides, A/V) — not third-party e-learning runtimes.
 */
export function isBundledElearningPath(relativePathPosix: string): boolean {
  const p = relativePathPosix.replace(/\\/g, "/").toLowerCase();
  if (p.includes("/__macosx/") || p.startsWith("__macosx/")) return true;
  if (p.includes("/content/lib/") || p.includes("/scorm/")) return true;
  return false;
}
