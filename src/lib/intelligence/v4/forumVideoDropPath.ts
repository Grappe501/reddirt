import path from "node:path";

import { ACCA_2026_SOS_FORUM_EVENT } from "@/lib/election-plan/acca-forum-event";

export { ACCA_2026_SOS_FORUM_EVENT };

/** Relative to RedDirt repo root — local drop for ACCA 2026 three-candidate SOS panel (Mountain View). */
export const ACCA_2026_SOS_FORUM_DROP_REL = path.join(
  "data",
  "local-ingest",
  "events",
  "2026-06-11-acca-sos-three-candidate-forum-mountain-view",
);

export function getAcca2026SosForumDropAbsolute(): string {
  return path.join(process.cwd(), ACCA_2026_SOS_FORUM_DROP_REL);
}
