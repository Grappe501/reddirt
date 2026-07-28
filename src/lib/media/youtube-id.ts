/**
 * Canonical YouTube video ID extraction for campaign media registry imports.
 * All URL shapes resolve to one 11-char id so duplicates map to one record.
 */

const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/;

/**
 * Extract a canonical YouTube video id from a bare id or common URL forms:
 * youtu.be / watch?v= / embed / shorts / youtube-nocookie embed / with si= params.
 */
export function extractCanonicalYoutubeVideoId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  if (YT_ID_RE.test(raw)) return raw;

  let candidate = raw;
  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^\/\//, "")}`;
    const url = new URL(withProtocol);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();

    if (host === "youtu.be") {
      candidate = url.pathname.split("/").filter(Boolean)[0] ?? "";
    } else if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com" || host === "youtube-nocookie.com") {
      const v = url.searchParams.get("v");
      if (v) {
        candidate = v;
      } else {
        const parts = url.pathname.split("/").filter(Boolean);
        const kind = parts[0]?.toLowerCase();
        if (kind === "embed" || kind === "shorts" || kind === "live" || kind === "v") {
          candidate = parts[1] ?? "";
        } else if (parts[0] && YT_ID_RE.test(parts[0])) {
          candidate = parts[0];
        }
      }
    } else {
      // Fall through: maybe a path fragment containing the id
      const fromQuery = url.searchParams.get("v");
      if (fromQuery) candidate = fromQuery;
    }
  } catch {
    // not a URL — try query-style or path fragment
    const vMatch = raw.match(/[?&]v=([A-Za-z0-9_-]{11})/);
    if (vMatch?.[1]) candidate = vMatch[1];
    else {
      const pathMatch = raw.match(/(?:youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/i);
      if (pathMatch?.[1]) candidate = pathMatch[1];
    }
  }

  // Strip leftover query/hash if somehow attached
  candidate = candidate.split(/[?#&]/)[0]?.trim() ?? "";
  return YT_ID_RE.test(candidate) ? candidate : null;
}

/**
 * `InboundContentItem.externalId` for YouTube connector rows is `youtube:video:<id>`.
 */
export function youtubeVideoIdFromExternalId(externalId: string): string | null {
  const prefix = "youtube:video:";
  if (!externalId.startsWith(prefix)) return null;
  return extractCanonicalYoutubeVideoId(externalId.slice(prefix.length).trim());
}
