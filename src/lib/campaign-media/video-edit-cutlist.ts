/**
 * Video Pro Edit cut-list ops — reorder / trim / drop only.
 * Never invents quote text or spoken lines.
 */
import "server-only";

import { getVideoEditProject, upsertVideoEditProject } from "@/lib/campaign-media/video-edit-store";
import type { VideoEditClip, VideoEditProject } from "@/lib/campaign-media/video-edit-types";

export type CutListUpdate =
  | { op: "reorder"; clipIds: string[] }
  | { op: "remove"; clipId: string }
  | { op: "trim"; clipId: string; startSeconds?: number; endSeconds?: number }
  | { op: "set_meta"; look?: VideoEditProject["look"]; transition?: VideoEditProject["transition"]; captionMode?: VideoEditProject["captionMode"]; exportAspects?: VideoEditProject["exportAspects"]; loudnorm?: boolean };

function clampClip(clip: VideoEditClip): VideoEditClip {
  const start = Math.max(0, Number(clip.startSeconds) || 0);
  let end = Math.max(start + 0.4, Number(clip.endSeconds) || start + 0.4);
  if (end - start > 120) end = start + 120;
  return { ...clip, startSeconds: Math.round(start * 100) / 100, endSeconds: Math.round(end * 100) / 100 };
}

export function updateVideoEditCutList(input: {
  projectId: string;
  updates: CutListUpdate[];
}):
  | { ok: true; project: VideoEditProject; message: string; warnings: string[] }
  | { ok: false; error: string } {
  const project = getVideoEditProject(input.projectId);
  if (!project) return { ok: false, error: `Project not found: ${input.projectId}` };
  if (!Array.isArray(input.updates) || !input.updates.length) {
    return { ok: false, error: "updates[] required." };
  }

  let clips = [...project.clips];
  const warnings: string[] = [];
  let look = project.look;
  let transition = project.transition;
  let captionMode = project.captionMode;
  let exportAspects = [...project.exportAspects];
  let loudnorm = project.loudnorm;

  for (const u of input.updates.slice(0, 40)) {
    if (u.op === "reorder") {
      const ids = u.clipIds.map(String).filter(Boolean);
      const byId = new Map(clips.map((c) => [c.id, c]));
      const next: VideoEditClip[] = [];
      for (const id of ids) {
        const c = byId.get(id);
        if (c) {
          next.push(c);
          byId.delete(id);
        }
      }
      for (const c of byId.values()) next.push(c);
      clips = next;
    } else if (u.op === "remove") {
      const before = clips.length;
      clips = clips.filter((c) => c.id !== u.clipId);
      if (clips.length === before) warnings.push(`Clip not found for remove: ${u.clipId}`);
      if (!clips.length) warnings.push("Cut list empty after remove — propose again before render.");
    } else if (u.op === "trim") {
      const idx = clips.findIndex((c) => c.id === u.clipId);
      if (idx < 0) {
        warnings.push(`Clip not found for trim: ${u.clipId}`);
        continue;
      }
      const cur = clips[idx];
      clips[idx] = clampClip({
        ...cur,
        startSeconds: typeof u.startSeconds === "number" ? u.startSeconds : cur.startSeconds,
        endSeconds: typeof u.endSeconds === "number" ? u.endSeconds : cur.endSeconds,
      });
      // Quote text is never rewritten here.
    } else if (u.op === "set_meta") {
      if (u.look) look = u.look;
      if (u.transition) transition = u.transition;
      if (u.captionMode) captionMode = u.captionMode;
      if (u.exportAspects?.length) exportAspects = u.exportAspects;
      if (typeof u.loudnorm === "boolean") loudnorm = u.loudnorm;
    }
  }

  const next: VideoEditProject = {
    ...project,
    clips: clips.map(clampClip).slice(0, 12),
    look,
    transition,
    captionMode,
    exportAspects,
    loudnorm,
    updatedAt: new Date().toISOString(),
    notes: [project.notes, "Cut list updated by operator (times/order only — no invented lines)."]
      .filter(Boolean)
      .join(" · "),
  };
  upsertVideoEditProject(next);
  return {
    ok: true,
    project: next,
    message: `Cut list updated · ${next.clips.length} clip(s).`,
    warnings,
  };
}
