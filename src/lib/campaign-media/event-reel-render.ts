/**
 * Confirm-render event reel stills slideshow → campaign-derivatives/_video/event-reels/.
 * Requires confirmRender at the action layer. Never touches campaign-photos originals.
 */
import "server-only";

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { probeVideoTooling, runFfmpeg, workspaceLocalRoot } from "@/lib/campaign-media/ffmpeg-tooling";
import { MEDIA_DERIVATIVES_PUBLIC_REL } from "@/lib/campaign-media/media-derivatives";
import {
  getEventReelProject,
  pushEventReelAssemblies,
} from "@/lib/campaign-media/event-reel-store";
import type { EventReelAssembly } from "@/lib/campaign-media/event-reel-types";
import { aspectVf, joinVf, type VideoExportAspect } from "@/lib/campaign-media/video-look-presets";

function absPublic(rel: string): string {
  return path.join(process.cwd(), rel);
}

function tempDir(): string {
  const d = path.join(workspaceLocalRoot(), "temp", "event-reels");
  mkdirSync(d, { recursive: true });
  return d;
}

function publicSrcToAbs(publicSrc: string): string | null {
  const src = String(publicSrc ?? "").trim();
  if (!src.startsWith("/media/")) return null;
  const rel = path.join("public", src.replace(/^\//, ""));
  const abs = absPublic(rel);
  return existsSync(abs) ? abs : null;
}

function encodeStillSegment(input: {
  imageAbs: string;
  durationSec: number;
  outAbs: string;
  aspect: VideoExportAspect;
}): { ok: true } | { ok: false; error: string } {
  const vf = joinVf(aspectVf(input.aspect), "fps=30,format=yuv420p");
  const args = [
    "-y",
    "-loop",
    "1",
    "-t",
    String(input.durationSec),
    "-i",
    input.imageAbs,
    "-f",
    "lavfi",
    "-t",
    String(input.durationSec),
    "-i",
    "anullsrc=channel_layout=stereo:sample_rate=48000",
    "-shortest",
  ];
  if (vf) args.push("-vf", vf);
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
    "96k",
    "-movflags",
    "+faststart",
    input.outAbs,
  );
  const run = runFfmpeg(args);
  if (!run.ok) return { ok: false, error: run.error };
  if (!existsSync(input.outAbs)) return { ok: false, error: "Still segment produced no file." };
  return { ok: true };
}

function concatSegments(
  segmentAbs: string[],
  outAbs: string,
): { ok: true } | { ok: false; error: string } {
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

export type EventReelRenderResult = {
  ok: boolean;
  message: string;
  assemblies: EventReelAssembly[];
  warnings: string[];
};

export function renderEventReelProject(input: { projectId: string }): EventReelRenderResult {
  const tooling = probeVideoTooling();
  if (!tooling.ffmpegAvailable) {
    return { ok: false, message: tooling.note, assemblies: [], warnings: [tooling.note] };
  }

  const project = getEventReelProject(input.projectId);
  if (!project) {
    return { ok: false, message: `Event reel not found: ${input.projectId}`, assemblies: [], warnings: [] };
  }
  if (!project.stills.length) {
    return { ok: false, message: "Event reel has no stills.", assemblies: [], warnings: [] };
  }

  const warnings: string[] = [...(project.speechIds.length
    ? [`Speech refs (${project.speechIds.join(", ")}) are not encoded in stills reel — use Speeches Pro Edit for cuts.`]
    : [])];
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
  const work = path.join(tempDir(), `${project.id}-${stamp}`);
  mkdirSync(work, { recursive: true });

  const aspects = project.exportAspects.length
    ? project.exportAspects
    : (["landscape_16x9", "vertical_9x16"] as const);
  const outDirRel = path.join(MEDIA_DERIVATIVES_PUBLIC_REL, "_video", "event-reels", project.id);
  const outDirAbs = absPublic(outDirRel);
  mkdirSync(outDirAbs, { recursive: true });

  const assemblies: EventReelAssembly[] = [];

  for (const aspect of aspects) {
    const segmentAbs: string[] = [];
    for (let i = 0; i < project.stills.length; i++) {
      const still = project.stills[i];
      const imageAbs = publicSrcToAbs(still.publicSrc);
      if (!imageAbs) {
        warnings.push(`Missing binary for ${still.photoId} (${still.publicSrc}).`);
        continue;
      }
      const seg = path.join(work, `seg-${aspect}-${i}.mp4`);
      const enc = encodeStillSegment({
        imageAbs,
        durationSec: still.durationSec || project.stillDurationSec || 3,
        outAbs: seg,
        aspect,
      });
      if (!enc.ok) {
        return {
          ok: false,
          message: `Still ${i + 1} (${still.photoId}): ${enc.error}`,
          assemblies,
          warnings,
        };
      }
      segmentAbs.push(seg);
    }
    if (!segmentAbs.length) {
      return {
        ok: false,
        message: "No still binaries on disk to encode.",
        assemblies,
        warnings,
      };
    }

    const filename = `reel-${aspect}-${stamp}.mp4`;
    const outAbs = path.join(outDirAbs, filename);
    const cat = concatSegments(segmentAbs, outAbs);
    if (!cat.ok) {
      return { ok: false, message: `Concat ${aspect}: ${cat.error}`, assemblies, warnings };
    }
    const relativePath = path.join(outDirRel, filename).replace(/\\/g, "/");
    const publicSrc = `/${relativePath.replace(/^public\//, "")}`;
    assemblies.push({
      id: `${project.id}-${aspect}-${stamp}`,
      projectId: project.id,
      aspect,
      publicSrc,
      relativePath,
      createdAt: new Date().toISOString(),
      stillCount: segmentAbs.length,
      note: "Event reel stills slideshow — gitignored under campaign-derivatives until ship path.",
    });
  }

  pushEventReelAssemblies(project.id, assemblies);
  return {
    ok: true,
    message: `Rendered ${assemblies.length} aspect(s) · ${project.stills.length} still(s) → campaign-derivatives/_video/event-reels/.`,
    assemblies,
    warnings,
  };
}
