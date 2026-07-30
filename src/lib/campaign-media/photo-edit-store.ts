/**
 * Persist Evidence Photo Pro Edit projects / assemblies.
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { writeJsonAtomic } from "@/lib/campaign-media/evidence-store";
import {
  PHOTO_PRO_EDITS_REL,
  type PhotoAssemblyRecord,
  type PhotoEditProject,
  type PhotoProEditsStore,
} from "@/lib/campaign-media/photo-edit-types";

function abs(rel: string): string {
  return path.join(process.cwd(), rel);
}

export function emptyPhotoProEditsStore(): PhotoProEditsStore {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    purpose:
      "Evidence Photo Pro Edit — edit projects and rendered assembly packs. Originals never overwritten.",
    projects: [],
    assemblies: [],
  };
}

export function loadPhotoProEditsStore(): PhotoProEditsStore {
  const p = abs(PHOTO_PRO_EDITS_REL);
  if (!existsSync(p)) return emptyPhotoProEditsStore();
  try {
    const raw = JSON.parse(readFileSync(p, "utf8")) as Partial<PhotoProEditsStore>;
    return {
      ...emptyPhotoProEditsStore(),
      ...raw,
      version: 1,
      projects: Array.isArray(raw.projects) ? raw.projects : [],
      assemblies: Array.isArray(raw.assemblies) ? raw.assemblies : [],
    };
  } catch {
    return emptyPhotoProEditsStore();
  }
}

export function savePhotoProEditsStore(store: PhotoProEditsStore): void {
  writeJsonAtomic(PHOTO_PRO_EDITS_REL, {
    ...store,
    version: 1,
    updatedAt: new Date().toISOString(),
  });
}

export function upsertPhotoEditProject(project: PhotoEditProject): void {
  const store = loadPhotoProEditsStore();
  store.projects = [project, ...store.projects.filter((p) => p.id !== project.id)].slice(0, 120);
  savePhotoProEditsStore(store);
}

export function getPhotoEditProject(projectId: string): PhotoEditProject | null {
  const id = String(projectId ?? "").trim();
  if (!id) return null;
  return loadPhotoProEditsStore().projects.find((p) => p.id === id) ?? null;
}

export function listPhotoEditProjects(photoId?: string): PhotoEditProject[] {
  const pid = String(photoId ?? "").trim();
  const all = loadPhotoProEditsStore().projects;
  if (!pid) return all;
  return all.filter((p) => p.photoId === pid);
}

export function listPhotoAssemblies(photoId?: string): PhotoAssemblyRecord[] {
  const id = String(photoId ?? "").trim();
  const all = loadPhotoProEditsStore().assemblies;
  if (!id) return all;
  return all.filter((a) => a.photoId === id || a.projectId === id);
}

export function pushPhotoAssembly(record: PhotoAssemblyRecord): void {
  const store = loadPhotoProEditsStore();
  store.assemblies = [record, ...store.assemblies].slice(0, 400);
  savePhotoProEditsStore(store);
}
