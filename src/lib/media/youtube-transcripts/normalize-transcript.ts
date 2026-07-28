/**
 * Caption format → normalized transcript segments (formatting only — no meaning rewrite).
 */

import type { TranscriptSegment } from "@/content/media/campaign-media-types";

function parseTimestampToSeconds(raw: string): number | undefined {
  const t = raw.trim().replace(",", ".");
  const parts = t.split(":");
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return Number(h) * 3600 + Number(m) * 60 + Number(s);
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return Number(m) * 60 + Number(s);
  }
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

function cleanCaptionText(text: string): string {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Parse WebVTT or SRT-ish caption bodies into segments. */
export function parseCaptionFileToSegments(raw: string): TranscriptSegment[] {
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const blocks = normalized.split(/\n{2,}/);
  const segments: TranscriptSegment[] = [];
  let idx = 0;

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    if (lines[0]?.toUpperCase() === "WEBVTT") continue;
    if (lines[0]?.startsWith("NOTE")) continue;

    const timeLineIdx = lines.findIndex((l) => l.includes("-->"));
    if (timeLineIdx < 0) continue;
    const timeLine = lines[timeLineIdx]!;
    const [startRaw, endRaw] = timeLine.split("-->").map((s) => s.trim().split(" ")[0] ?? "");
    const startSeconds = parseTimestampToSeconds(startRaw ?? "");
    const endSeconds = parseTimestampToSeconds(endRaw ?? "");
    const text = cleanCaptionText(lines.slice(timeLineIdx + 1).join(" "));
    if (!text) continue;
    idx += 1;
    segments.push({
      id: `seg-${idx}`,
      startSeconds,
      endSeconds,
      text,
    });
  }

  return mergeAdjacentSegments(segments);
}

/** Merge consecutive tiny caption cues into readable paragraphs (formatting only). */
export function mergeAdjacentSegments(segments: TranscriptSegment[], maxGapSeconds = 1.25): TranscriptSegment[] {
  if (!segments.length) return [];
  const out: TranscriptSegment[] = [];
  let cur: TranscriptSegment = { ...segments[0]! };

  for (let i = 1; i < segments.length; i++) {
    const next = segments[i]!;
    const gap =
      cur.endSeconds != null && next.startSeconds != null ? next.startSeconds - cur.endSeconds : Number.POSITIVE_INFINITY;
    const endsWithPunct = /[.!?]"?$/.test(cur.text.trim());
    if (!endsWithPunct && gap <= maxGapSeconds && cur.text.length + next.text.length < 420) {
      cur = {
        ...cur,
        endSeconds: next.endSeconds ?? cur.endSeconds,
        text: `${cur.text} ${next.text}`.replace(/\s+/g, " ").trim(),
      };
    } else {
      out.push(cur);
      cur = { ...next };
    }
  }
  out.push(cur);
  return out.map((s, i) => ({ ...s, id: `seg-${i + 1}` }));
}

export function segmentsToPlainText(segments: TranscriptSegment[]): string {
  return segments
    .map((s) => s.text.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function normalizeWhitespaceAndPunctuation(text: string): string {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ ]{2,}/g, " ")
    .trim();
}

export function normalizeCaptionToTranscript(rawCaption: string): {
  segments: TranscriptSegment[];
  plainText: string;
} {
  const segments = parseCaptionFileToSegments(rawCaption);
  const plainText = normalizeWhitespaceAndPunctuation(segmentsToPlainText(segments));
  return { segments, plainText };
}

/** Build a simple SRT from segments for optional YouTube upload. */
export function segmentsToSrt(segments: TranscriptSegment[]): string {
  const fmt = (sec?: number) => {
    const s = Math.max(0, Math.floor(sec ?? 0));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    const ms = "000";
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(r)},${ms}`;
  };
  return segments
    .map((seg, i) => {
      const start = fmt(seg.startSeconds);
      const end = fmt(seg.endSeconds ?? (seg.startSeconds ?? 0) + 3);
      return `${i + 1}\n${start} --> ${end}\n${seg.text.trim()}\n`;
    })
    .join("\n");
}
