import path from "node:path";

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

export const ACCA_2026_SOS_FORUM_EVENT = {
  title: "ACCA 2026 SOS three-candidate forum — Mountain View",
  date: "2026-06-11",
  venue: "Ozark Mountain Folk Center, Mountain View, AR",
  candidates: ["Kelly Grappe (D)", "Sen. Kim Hammer (R)", "Dr. Michael Pakko (L)"],
  forumTranscriptLabHref: "/admin/intelligence/forum-transcript-lab",
  /** Official YouTube recording — watch in browser while transcript lab ingests local MP4. */
  youtubeVideoId: "Hl_n-A9aL1s",
  youtubeWatchUrl: "https://www.youtube.com/watch?v=Hl_n-A9aL1s",
} as const;
