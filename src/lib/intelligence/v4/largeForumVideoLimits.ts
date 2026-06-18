/** Local forum / event videos — above normal 4 GiB upload cap (CLI + disk move only). */
export const LOCAL_FORUM_VIDEO_MAX_BYTES = 8 * 1024 * 1024 * 1024;

/** OpenAI Whisper API per-request file limit. */
export const WHISPER_API_MAX_BYTES = 25 * 1024 * 1024;

export function formatBytes(n: number): string {
  if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(2)} GB`;
  if (n >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.round(n / 1024)} KB`;
}
