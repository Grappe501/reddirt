"use client";

import { useNavVisitHighlight } from "@/lib/intelligence/useNavVisitHighlight";
import { CURRENT_NAV_RELEASE_ID } from "@/lib/intelligence/navLinkReleaseManifest";

/** Brief legend when unvisited new nav links remain from the current release batch. */
export function NavNewLinksBanner() {
  const { newUnvisitedCount } = useNavVisitHighlight();

  if (newUnvisitedCount <= 0) return null;

  return (
    <div
      role="status"
      className="mb-4 rounded-lg border border-teal-300/80 bg-teal-50/80 px-3 py-2 text-xs text-teal-950"
    >
      <span className="font-bold uppercase tracking-wide text-teal-900">New this release ({CURRENT_NAV_RELEASE_ID}): </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full bg-teal-500" aria-hidden />
        {newUnvisitedCount} page{newUnvisitedCount === 1 ? "" : "s"} highlighted in teal until you open them — sidebar,
        chips, and iPad More.
      </span>
    </div>
  );
}
