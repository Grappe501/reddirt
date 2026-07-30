/**
 * Build verbatim SRT/VTT captions from local transcript workspace windows.
 * Never invents spoken lines.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadWorkspaceRecord } from "@/lib/media/youtube-transcripts/workspace-store";
import { MEDIA_DERIVATIVES_PUBLIC_REL } from "@/lib/campaign-media/media-derivatives";
import { pushCaption } from "@/lib/campaign-media/video-edit-store";
import type { VideoCaptionRecord, VideoEditClip } from "@/lib/campaign-media/video-edit-types";
import { workspaceLocalRoot } from "@/lib/campaign-media/ffmpeg-tooling";

function pad2(n: number): string {
  return String(Math.floor(n)).padStart(2, "0");
}

function formatSrtTime(seconds: number): string {
  const s = Math.max(0, seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.round((s % 1) * 1000);
  return `${pad2(h)}:${pad2(m)}:${pad2(sec)},${String(ms).padStart(3, "0")}`;
}

function formatVttTime(seconds: number): string {
  return formatSrtTime(seconds).replace(",", ".");
}

function escapeSrt(text: string): string {
  return text.replace(/\r?\n/g, " ").trim();
}

export type CaptionCue = { start: number; end: number; text: string };

export function buildCaptionCuesForEditClips(input: {
  youtubeVideoId: string;
  clips: VideoEditClip[];
}): { ok: true; cues: CaptionCue[] } | { ok: false; error: string } {
  const youtubeVideoId = String(input.youtubeVideoId ?? "").trim();
  if (!youtubeVideoId) return { ok: false, error: "youtubeVideoId required for captions." };
  const ws = loadWorkspaceRecord(youtubeVideoId);
  if (!ws || !Array.isArray(ws.segments) || !ws.segments.length) {
    return {
      ok: false,
      error: "No local transcript workspace segments — pull/review transcript before captions.",
    };
  }

  const cues: CaptionCue[] = [];
  let cursor = 0;

  for (const clip of input.clips) {
    const clipStart = Math.max(0, Number(clip.startSeconds) || 0);
    const clipEnd = Math.max(clipStart + 0.4, Number(clip.endSeconds) || clipStart);
    const clipDur = clipEnd - clipStart;

    for (const seg of ws.segments) {
      const text = String(seg.text ?? "").trim();
      if (!text) continue;
      const segStart = typeof seg.startSeconds === "number" ? seg.startSeconds : 0;
      const segEnd =
        typeof seg.endSeconds === "number" && seg.endSeconds > segStart
          ? seg.endSeconds
          : segStart + 2;
      if (segEnd <= clipStart || segStart >= clipEnd) continue;
      const overlapStart = Math.max(segStart, clipStart);
      const overlapEnd = Math.min(segEnd, clipEnd);
      const localStart = cursor + (overlapStart - clipStart);
      const localEnd = cursor + (overlapEnd - clipStart);
      if (localEnd - localStart < 0.2) continue;
      cues.push({ start: localStart, end: localEnd, text: escapeSrt(text) });
    }
    cursor += clipDur;
  }

  if (!cues.length) {
    return { ok: false, error: "No transcript segments overlap the edit clip windows." };
  }
  return { ok: true, cues };
}

export function cuesToSrt(cues: CaptionCue[]): string {
  const lines: string[] = [];
  cues.forEach((c, i) => {
    lines.push(String(i + 1));
    lines.push(`${formatSrtTime(c.start)} --> ${formatSrtTime(c.end)}`);
    lines.push(c.text);
    lines.push("");
  });
  return lines.join("\n");
}

export function cuesToVtt(cues: CaptionCue[]): string {
  const lines = ["WEBVTT", ""];
  cues.forEach((c) => {
    lines.push(`${formatVttTime(c.start)} --> ${formatVttTime(c.end)}`);
    lines.push(c.text);
    lines.push("");
  });
  return lines.join("\n");
}

export function buildSrtForEditClips(input: {
  youtubeVideoId: string;
  clips: VideoEditClip[];
}): { ok: true; srt: string; segmentCount: number } | { ok: false; error: string } {
  const built = buildCaptionCuesForEditClips(input);
  if (!built.ok) return built;
  return { ok: true, srt: cuesToSrt(built.cues), segmentCount: built.cues.length };
}

export function previewEditCaptions(input: {
  youtubeVideoId: string;
  clips: VideoEditClip[];
  limit?: number;
}):
  | { ok: true; segmentCount: number; cues: CaptionCue[]; previewNote: string }
  | { ok: false; error: string } {
  const built = buildCaptionCuesForEditClips(input);
  if (!built.ok) return built;
  const limit = Math.min(Math.max(Number(input.limit) || 24, 1), 60);
  return {
    ok: true,
    segmentCount: built.cues.length,
    cues: built.cues.slice(0, limit),
    previewNote: "Verbatim transcript windows only — never invent spoken lines.",
  };
}

export function writeEditCaptionsSidecar(input: {
  projectId: string;
  outId: string;
  youtubeVideoId: string;
  clips: VideoEditClip[];
  formats?: Array<"srt" | "vtt">;
}):
  | { ok: true; record: VideoCaptionRecord; absPath: string; records: VideoCaptionRecord[] }
  | { ok: false; error: string } {
  const built = buildCaptionCuesForEditClips({
    youtubeVideoId: input.youtubeVideoId,
    clips: input.clips,
  });
  if (!built.ok) return built;

  const outId = String(input.outId ?? "").trim();
  if (!outId) return { ok: false, error: "outId required." };
  const formats = input.formats?.length ? input.formats : (["srt", "vtt"] as const);
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
  const outDirRel = path.join(MEDIA_DERIVATIVES_PUBLIC_REL, "_video", outId);
  const outDirAbs = path.join(process.cwd(), outDirRel);
  mkdirSync(outDirAbs, { recursive: true });
  const tempDir = path.join(workspaceLocalRoot(), "temp", "video-pro-edit");
  mkdirSync(tempDir, { recursive: true });

  const records: VideoCaptionRecord[] = [];
  let primaryAbs = "";
  let primary: VideoCaptionRecord | null = null;

  for (const format of formats) {
    const body = format === "vtt" ? cuesToVtt(built.cues) : cuesToSrt(built.cues);
    const filename = `captions-${stamp}.${format}`;
    const outAbs = path.join(outDirAbs, filename);
    writeFileSync(outAbs, body, "utf8");
    const tempAbs = path.join(tempDir, `${outId}-${filename}`);
    writeFileSync(tempAbs, body, "utf8");
    const relativePath = path.join(outDirRel, filename).split(path.sep).join("/");
    const publicSrc = `/media/campaign-derivatives/_video/${outId}/${filename}`;
    const record: VideoCaptionRecord = {
      id: `${outId}--captions-${format}--${stamp}`,
      projectId: input.projectId,
      outId,
      format,
      publicSrc,
      relativePath,
      createdAt: new Date().toISOString(),
      segmentCount: built.cues.length,
      note: `Verbatim ${format.toUpperCase()} from transcript windows (${built.cues.length} cues). Temp: ${tempAbs}`,
    };
    pushCaption(record);
    records.push(record);
    if (format === "srt") {
      primary = record;
      primaryAbs = tempAbs;
    }
  }

  if (!records.length || !primary) {
    return { ok: false, error: "No caption files written." };
  }

  return { ok: true, record: primary, absPath: primaryAbs, records };
}
