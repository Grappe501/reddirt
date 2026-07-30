/**
 * Build verbatim SRT captions from local transcript workspace windows.
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

function escapeSrt(text: string): string {
  return text.replace(/\r?\n/g, " ").trim();
}

export function buildSrtForEditClips(input: {
  youtubeVideoId: string;
  clips: VideoEditClip[];
}): { ok: true; srt: string; segmentCount: number } | { ok: false; error: string } {
  const youtubeVideoId = String(input.youtubeVideoId ?? "").trim();
  if (!youtubeVideoId) return { ok: false, error: "youtubeVideoId required for captions." };
  const ws = loadWorkspaceRecord(youtubeVideoId);
  if (!ws || !Array.isArray(ws.segments) || !ws.segments.length) {
    return {
      ok: false,
      error: "No local transcript workspace segments — pull/review transcript before captions.",
    };
  }

  type Cue = { start: number; end: number; text: string };
  const cues: Cue[] = [];
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

  const lines: string[] = [];
  cues.forEach((c, i) => {
    lines.push(String(i + 1));
    lines.push(`${formatSrtTime(c.start)} --> ${formatSrtTime(c.end)}`);
    lines.push(c.text);
    lines.push("");
  });

  return { ok: true, srt: lines.join("\n"), segmentCount: cues.length };
}

export function writeEditCaptionsSidecar(input: {
  projectId: string;
  outId: string;
  youtubeVideoId: string;
  clips: VideoEditClip[];
}):
  | { ok: true; record: VideoCaptionRecord; absPath: string }
  | { ok: false; error: string } {
  const built = buildSrtForEditClips({
    youtubeVideoId: input.youtubeVideoId,
    clips: input.clips,
  });
  if (!built.ok) return built;

  const outId = String(input.outId ?? "").trim();
  if (!outId) return { ok: false, error: "outId required." };
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
  const filename = `captions-${stamp}.srt`;
  const outDirRel = path.join(MEDIA_DERIVATIVES_PUBLIC_REL, "_video", outId);
  const outDirAbs = path.join(process.cwd(), outDirRel);
  mkdirSync(outDirAbs, { recursive: true });
  const outAbs = path.join(outDirAbs, filename);
  writeFileSync(outAbs, built.srt, "utf8");

  // Also stash under .local/temp for burn-in path reliability on Windows paths with spaces.
  const tempDir = path.join(workspaceLocalRoot(), "temp", "video-pro-edit");
  mkdirSync(tempDir, { recursive: true });
  const tempAbs = path.join(tempDir, `${outId}-${filename}`);
  writeFileSync(tempAbs, built.srt, "utf8");

  const relativePath = path.join(outDirRel, filename).split(path.sep).join("/");
  const publicSrc = `/media/campaign-derivatives/_video/${outId}/${filename}`;
  const record: VideoCaptionRecord = {
    id: `${outId}--captions--${stamp}`,
    projectId: input.projectId,
    outId,
    format: "srt",
    publicSrc,
    relativePath,
    createdAt: new Date().toISOString(),
    segmentCount: built.segmentCount,
    note: `Verbatim SRT from transcript windows (${built.segmentCount} cues). Temp: ${tempAbs}`,
  };
  pushCaption(record);
  return { ok: true, record, absPath: tempAbs };
}
