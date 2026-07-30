/**
 * Persist Evidence Video Pro Edit projects / assemblies / captions.
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { writeJsonAtomic } from "@/lib/campaign-media/evidence-store";
import {
  VIDEO_PRO_EDITS_REL,
  type VideoAssemblyRecord,
  type VideoCaptionRecord,
  type VideoEditProject,
  type VideoProEditsStore,
} from "@/lib/campaign-media/video-edit-types";

function abs(rel: string): string {
  return path.join(process.cwd(), rel);
}

export function emptyVideoProEditsStore(): VideoProEditsStore {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    purpose:
      "Evidence Video Pro Edit — edit projects, caption sidecars, and rendered assemblies. Masters never overwritten.",
    projects: [],
    captions: [],
    assemblies: [],
  };
}

export function loadVideoProEditsStore(): VideoProEditsStore {
  const p = abs(VIDEO_PRO_EDITS_REL);
  if (!existsSync(p)) return emptyVideoProEditsStore();
  try {
    const raw = JSON.parse(readFileSync(p, "utf8")) as Partial<VideoProEditsStore>;
    return {
      ...emptyVideoProEditsStore(),
      ...raw,
      version: 1,
      projects: Array.isArray(raw.projects) ? raw.projects : [],
      captions: Array.isArray(raw.captions) ? raw.captions : [],
      assemblies: Array.isArray(raw.assemblies) ? raw.assemblies : [],
    };
  } catch {
    return emptyVideoProEditsStore();
  }
}

export function saveVideoProEditsStore(store: VideoProEditsStore): void {
  writeJsonAtomic(VIDEO_PRO_EDITS_REL, {
    ...store,
    version: 1,
    updatedAt: new Date().toISOString(),
  });
}

export function upsertVideoEditProject(project: VideoEditProject): void {
  const store = loadVideoProEditsStore();
  store.projects = [project, ...store.projects.filter((p) => p.id !== project.id)].slice(0, 80);
  saveVideoProEditsStore(store);
}

export function getVideoEditProject(projectId: string): VideoEditProject | null {
  const id = String(projectId ?? "").trim();
  if (!id) return null;
  return loadVideoProEditsStore().projects.find((p) => p.id === id) ?? null;
}

export function listVideoEditProjects(speechId?: string): VideoEditProject[] {
  const sid = String(speechId ?? "").trim();
  const all = loadVideoProEditsStore().projects;
  if (!sid) return all;
  return all.filter((p) => p.speechId === sid);
}

export function listVideoAssemblies(outId?: string): VideoAssemblyRecord[] {
  const id = String(outId ?? "").trim();
  const all = loadVideoProEditsStore().assemblies;
  if (!id) return all;
  return all.filter((a) => a.outId === id || a.speechId === id || a.projectId === id);
}

export function listVideoCaptions(outId?: string): VideoCaptionRecord[] {
  const id = String(outId ?? "").trim();
  const all = loadVideoProEditsStore().captions;
  if (!id) return all;
  return all.filter((c) => c.outId === id || c.projectId === id);
}

export function pushAssembly(record: VideoAssemblyRecord): void {
  const store = loadVideoProEditsStore();
  store.assemblies = [record, ...store.assemblies].slice(0, 200);
  saveVideoProEditsStore(store);
}

export function pushCaption(record: VideoCaptionRecord): void {
  const store = loadVideoProEditsStore();
  store.captions = [record, ...store.captions].slice(0, 200);
  saveVideoProEditsStore(store);
}

/**
 * Soft-archive assemblies for a project/outId — moves records to the end of the list
 * with an archived note. Files are never deleted (doctrine).
 */
export function softArchiveVideoAssemblies(input: {
  projectId?: string;
  outId?: string;
  confirmArchive: boolean;
}): { ok: true; archived: number; message: string } | { ok: false; error: string } {
  if (input.confirmArchive !== true) {
    return { ok: false, error: "confirmArchive:true required." };
  }
  const projectId = String(input.projectId ?? "").trim();
  const outId = String(input.outId ?? "").trim();
  if (!projectId && !outId) return { ok: false, error: "projectId or outId required." };

  const store = loadVideoProEditsStore();
  const stamp = new Date().toISOString();
  let archived = 0;
  store.assemblies = store.assemblies.map((a) => {
    const hit =
      (projectId && a.projectId === projectId) ||
      (outId && (a.outId === outId || a.speechId === outId));
    if (!hit) return a;
    if (a.note?.includes("[archived")) return a;
    archived += 1;
    return {
      ...a,
      note: [`[archived ${stamp}]`, a.note].filter(Boolean).join(" · "),
    };
  });
  // Stable: archived assemblies sink toward the end for fresher previews first.
  store.assemblies = [
    ...store.assemblies.filter((a) => !a.note?.includes("[archived")),
    ...store.assemblies.filter((a) => a.note?.includes("[archived")),
  ].slice(0, 200);
  saveVideoProEditsStore(store);
  return {
    ok: true,
    archived,
    message: archived
      ? `Soft-archived ${archived} assembly record(s) — files kept on disk.`
      : "No matching assemblies to archive.",
  };
}
