/**
 * Evidence Video Pro Edit — confirmed render:
 * clip encode → concat/xfade → look + loudnorm → aspect export pack (+ optional captions).
 * Masters never overwritten.
 */

import { existsSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import path from "node:path";
import { probeVideoTooling, runFfmpeg, runFfprobeJson, workspaceLocalRoot } from "@/lib/campaign-media/ffmpeg-tooling";
import { findLocalVideoMaster, resolveAllowedVideoPath } from "@/lib/campaign-media/local-video-masters";
import { MEDIA_DERIVATIVES_PUBLIC_REL } from "@/lib/campaign-media/media-derivatives";
import { writeEditCaptionsSidecar } from "@/lib/campaign-media/video-caption-package";
import {
  getVideoEditProject,
  pushAssembly,
  upsertVideoEditProject,
} from "@/lib/campaign-media/video-edit-store";
import type { VideoAssemblyRecord, VideoEditProject } from "@/lib/campaign-media/video-edit-types";
import {
  aspectVf,
  joinVf,
  videoLookVf,
  type VideoExportAspect,
} from "@/lib/campaign-media/video-look-presets";

function absPublic(rel: string): string {
  return path.join(process.cwd(), rel);
}

function tempDir(): string {
  const d = path.join(workspaceLocalRoot(), "temp", "video-pro-edit");
  mkdirSync(d, { recursive: true });
  return d;
}

function escapeSubtitlesFilterPath(absPath: string): string {
  return absPath.replace(/\\/g, "/").replace(/:/g, "\\:").replace(/'/g, "\\'");
}

function probeMeta(absPath: string): {
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
} {
  const probed = runFfprobeJson(absPath);
  if (!probed.ok) return { durationSeconds: null, width: null, height: null };
  const data = probed.data as {
    format?: { duration?: string };
    streams?: Array<{ codec_type?: string; width?: number; height?: number }>;
  };
  const durationSeconds = data.format?.duration ? Number(data.format.duration) : null;
  const v = (data.streams ?? []).find((s) => s.codec_type === "video");
  return {
    durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : null,
    width: v?.width ?? null,
    height: v?.height ?? null,
  };
}

function resolveMaster(project: VideoEditProject, absPath?: string, localPublicSrc?: string) {
  if (absPath || localPublicSrc) {
    return resolveAllowedVideoPath({ absPath, localPublicSrc });
  }
  const hit = findLocalVideoMaster({
    speechId: project.speechId,
    youtubeVideoId: project.youtubeVideoId,
  });
  if (!hit) return { ok: false as const, error: "No local master matched this edit project." };
  return { ok: true as const, absPath: hit.absPath, publicSrc: hit.publicSrc };
}

function encodeSegment(input: {
  masterAbs: string;
  start: number;
  end: number;
  outAbs: string;
}): { ok: true } | { ok: false; error: string } {
  const dur = Math.max(0.4, input.end - input.start);
  const run = runFfmpeg([
    "-y",
    "-ss",
    String(input.start),
    "-i",
    input.masterAbs,
    "-t",
    String(dur),
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "23",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-ar",
    "48000",
    "-ac",
    "2",
    "-movflags",
    "+faststart",
    input.outAbs,
  ]);
  if (!run.ok) return { ok: false, error: run.error };
  if (!existsSync(input.outAbs)) return { ok: false, error: "Segment encode produced no file." };
  return { ok: true };
}

function concatSegments(segmentAbs: string[], outAbs: string): { ok: true } | { ok: false; error: string } {
  const listPath = path.join(tempDir(), `concat-${Date.now()}.txt`);
  const body = segmentAbs.map((p) => `file '${p.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`).join("\n");
  writeFileSync(listPath, `${body}\n`, "utf8");
  const run = runFfmpeg([
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listPath,
    "-c",
    "copy",
    outAbs,
  ]);
  if (!run.ok) {
    // Re-encode concat fallback
    const run2 = runFfmpeg([
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listPath,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "23",
      "-c:a",
      "aac",
      "-movflags",
      "+faststart",
      outAbs,
    ]);
    if (!run2.ok) return { ok: false, error: run2.error };
  }
  if (!existsSync(outAbs)) return { ok: false, error: "Concat produced no file." };
  return { ok: true };
}

function crossfadeTwo(aAbs: string, bAbs: string, outAbs: string, fade = 0.4): { ok: true } | { ok: false; error: string } {
  const aMeta = probeMeta(aAbs);
  const aDur = aMeta.durationSeconds ?? 2;
  const offset = Math.max(0.2, aDur - fade);
  const run = runFfmpeg([
    "-y",
    "-i",
    aAbs,
    "-i",
    bAbs,
    "-filter_complex",
    `[0:v][1:v]xfade=transition=fade:duration=${fade}:offset=${offset}[v];[0:a][1:a]acrossfade=d=${fade}[a]`,
    "-map",
    "[v]",
    "-map",
    "[a]",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-movflags",
    "+faststart",
    outAbs,
  ]);
  if (!run.ok) return { ok: false, error: run.error };
  if (!existsSync(outAbs)) return { ok: false, error: "Crossfade produced no file." };
  return { ok: true };
}

/** Pairwise crossfade chain for N clips; falls back to concat on failure. */
function crossfadeChain(
  segmentAbs: string[],
  outAbs: string,
  fade = 0.4,
): { ok: true; warnings: string[] } | { ok: false; error: string; warnings: string[] } {
  const warnings: string[] = [];
  if (segmentAbs.length < 2) {
    return { ok: false, error: "Need at least 2 segments for crossfade.", warnings };
  }
  if (segmentAbs.length === 2) {
    const xf = crossfadeTwo(segmentAbs[0], segmentAbs[1], outAbs, fade);
    if (!xf.ok) return { ok: false, error: xf.error, warnings };
    return { ok: true, warnings };
  }

  let current = segmentAbs[0];
  const work = path.dirname(outAbs);
  for (let i = 1; i < segmentAbs.length; i++) {
    const nextOut =
      i === segmentAbs.length - 1 ? outAbs : path.join(work, `xfade-chain-${i}.mp4`);
    const xf = crossfadeTwo(current, segmentAbs[i], nextOut, fade);
    if (!xf.ok) {
      warnings.push(`Crossfade step ${i} failed (${xf.error}) — falling back to hard-cut concat.`);
      const cat = concatSegments(segmentAbs, outAbs);
      if (!cat.ok) return { ok: false, error: cat.error, warnings };
      return { ok: true, warnings };
    }
    current = nextOut;
  }
  return { ok: true, warnings };
}

function finishEncode(input: {
  inAbs: string;
  outAbs: string;
  aspect: VideoExportAspect;
  lookVf: string | null;
  loudnorm: boolean;
  burnInSrtAbs?: string | null;
}): { ok: true } | { ok: false; error: string } {
  const vf = joinVf(aspectVf(input.aspect), input.lookVf);
  const args = ["-y", "-i", input.inAbs];
  if (input.burnInSrtAbs && existsSync(input.burnInSrtAbs)) {
    const sub = escapeSubtitlesFilterPath(input.burnInSrtAbs);
    const withSubs = joinVf(vf, `subtitles='${sub}'`);
    if (withSubs) args.push("-vf", withSubs);
  } else if (vf) {
    args.push("-vf", vf);
  }
  if (input.loudnorm) {
    args.push("-af", "loudnorm=I=-16:TP=-1.5:LRA=11");
  }
  args.push(
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "23",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    input.outAbs,
  );
  const run = runFfmpeg(args);
  if (!run.ok) return { ok: false, error: run.error };
  if (!existsSync(input.outAbs)) return { ok: false, error: "Finish encode produced no file." };
  return { ok: true };
}

export type ProRenderResult = {
  ok: boolean;
  message: string;
  assemblies: VideoAssemblyRecord[];
  captionPublicSrc?: string | null;
  warnings: string[];
};

/**
 * Confirm-render an edit project. Requires confirmRender at the action/AI layer.
 */
export function renderVideoEditProject(input: {
  projectId: string;
  absPath?: string;
  localPublicSrc?: string;
}): ProRenderResult {
  const tooling = probeVideoTooling();
  if (!tooling.ffmpegAvailable) {
    return { ok: false, message: tooling.note, assemblies: [], warnings: [tooling.note] };
  }

  const project = getVideoEditProject(input.projectId);
  if (!project) {
    return { ok: false, message: `Project not found: ${input.projectId}`, assemblies: [], warnings: [] };
  }
  if (!project.clips.length) {
    return { ok: false, message: "Edit project has no clips.", assemblies: [], warnings: [] };
  }

  const master = resolveMaster(project, input.absPath, input.localPublicSrc);
  if (!master.ok) {
    return { ok: false, message: master.error, assemblies: [], warnings: [master.error] };
  }

  const warnings: string[] = [];
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
  const outId = project.speechId || project.id;
  const work = path.join(tempDir(), `${project.id}-${stamp}`);
  mkdirSync(work, { recursive: true });

  const segmentAbs: string[] = [];
  for (let i = 0; i < project.clips.length; i++) {
    const c = project.clips[i];
    const seg = path.join(work, `seg-${i}.mp4`);
    const enc = encodeSegment({
      masterAbs: master.absPath,
      start: c.startSeconds,
      end: c.endSeconds,
      outAbs: seg,
    });
    if (!enc.ok) {
      return { ok: false, message: `Clip ${i + 1}: ${enc.error}`, assemblies: [], warnings };
    }
    segmentAbs.push(seg);
  }

  const assembledTemp = path.join(work, "assembled.mp4");
  if (project.transition === "crossfade" && segmentAbs.length >= 2) {
    const xf = crossfadeChain(segmentAbs, assembledTemp);
    if (!xf.ok) {
      warnings.push(`Crossfade chain failed (${xf.error}) — falling back to hard cut.`);
      const cat = concatSegments(segmentAbs, assembledTemp);
      if (!cat.ok) return { ok: false, message: cat.error, assemblies: [], warnings };
    } else {
      warnings.push(...xf.warnings);
    }
  } else {
    const cat = concatSegments(segmentAbs, assembledTemp);
    if (!cat.ok) return { ok: false, message: cat.error, assemblies: [], warnings };
  }

  let captionPublicSrc: string | null = null;
  let burnInAbs: string | null = null;
  if (project.captionMode !== "none" && project.youtubeVideoId) {
    const caps = writeEditCaptionsSidecar({
      projectId: project.id,
      outId,
      youtubeVideoId: project.youtubeVideoId,
      clips: project.clips,
    });
    if (caps.ok) {
      captionPublicSrc = caps.record.publicSrc;
      burnInAbs = caps.absPath;
    } else {
      warnings.push(`Captions skipped: ${caps.error}`);
    }
  }

  const outDirRel = path.join(MEDIA_DERIVATIVES_PUBLIC_REL, "_video", outId);
  const outDirAbs = absPublic(outDirRel);
  mkdirSync(outDirAbs, { recursive: true });

  const look = videoLookVf(project.look);
  const aspects = project.exportAspects.length ? project.exportAspects : (["source"] as VideoExportAspect[]);
  const assemblies: VideoAssemblyRecord[] = [];

  for (const aspect of aspects) {
    const filename = `assembly-${aspect}-${project.look}-${stamp}.mp4`;
    const outAbs = path.join(outDirAbs, filename);
    const fin = finishEncode({
      inAbs: assembledTemp,
      outAbs,
      aspect,
      lookVf: look,
      loudnorm: project.loudnorm !== false,
      burnInSrtAbs: project.captionMode === "burn_in" ? burnInAbs : null,
    });
    if (!fin.ok) {
      warnings.push(`${aspect}: ${fin.error}`);
      continue;
    }
    const meta = probeMeta(outAbs);
    let bytes: number | null = null;
    try {
      bytes = statSync(outAbs).size;
    } catch {
      /* optional */
    }
    const relativePath = path.join(outDirRel, filename).split(path.sep).join("/");
    const publicSrc = `/media/campaign-derivatives/_video/${outId}/${filename}`;
    const record: VideoAssemblyRecord = {
      id: `${outId}--asm-${aspect}--${stamp}`,
      projectId: project.id,
      outId,
      speechId: project.speechId,
      aspect,
      look: project.look,
      transition: project.transition,
      captionMode: project.captionMode,
      publicSrc,
      relativePath,
      sourcePath: master.absPath,
      bytes,
      durationSeconds: meta.durationSeconds,
      width: meta.width,
      height: meta.height,
      captionPublicSrc,
      createdAt: new Date().toISOString(),
      note: warnings.length ? warnings.slice(0, 3).join(" · ") : undefined,
    };
    pushAssembly(record);
    assemblies.push(record);
  }

  project.updatedAt = new Date().toISOString();
  upsertVideoEditProject(project);

  return {
    ok: assemblies.length > 0,
    message: assemblies.length
      ? `Rendered ${assemblies.length} assembly(ies) for ${project.id}`
      : `Render failed — ${warnings[0] ?? "no assemblies written."}`,
    assemblies,
    captionPublicSrc,
    warnings,
  };
}
