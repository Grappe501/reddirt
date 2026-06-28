/** Kickoff opening reel — set `NEXT_PUBLIC_CPOS_KICKOFF_YOUTUBE_VIDEO_ID` in Netlify (Builds scope). */
export function resolveCposKickoffYoutubeVideoId(manifestVideoId?: string | null): string | null {
  const fromManifest = manifestVideoId?.trim();
  if (fromManifest && /^[a-zA-Z0-9_-]{10,}$/.test(fromManifest)) return fromManifest;

  const kickoff = process.env.NEXT_PUBLIC_CPOS_KICKOFF_YOUTUBE_VIDEO_ID?.trim();
  if (kickoff && /^[a-zA-Z0-9_-]{10,}$/.test(kickoff)) return kickoff;

  const heifer = process.env.NEXT_PUBLIC_FOREVERMOST_HEIFER_YOUTUBE_VIDEO_ID?.trim();
  if (heifer && /^[a-zA-Z0-9_-]{10,}$/.test(heifer)) return heifer;

  return null;
}
