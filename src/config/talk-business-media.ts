/**
 * Optional YouTube embed on `/about` for Kelly’s Talk Business & Politics interview.
 * Set `NEXT_PUBLIC_TALK_BUSINESS_KELLY_YOUTUBE_VIDEO_ID` to the 11-character id (from `v=` or `/embed/` URL).
 */
export function getTalkBusinessKellyInterviewVideoId(): string | null {
  const raw = process.env.NEXT_PUBLIC_TALK_BUSINESS_KELLY_YOUTUBE_VIDEO_ID?.trim();
  if (!raw) return null;
  return /^[a-zA-Z0-9_-]{11}$/.test(raw) ? raw : null;
}
