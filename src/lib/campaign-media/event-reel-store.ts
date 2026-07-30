/**
 * Persist event reel proposals / assemblies.
 */
import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { writeJsonAtomic } from "@/lib/campaign-media/evidence-store";
import {
  EVENT_REELS_REL,
  type EventReelAssembly,
  type EventReelProject,
  type EventReelsStore,
} from "@/lib/campaign-media/event-reel-types";

function abs(rel: string): string {
  return path.join(process.cwd(), rel);
}

export function emptyEventReelsStore(): EventReelsStore {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    purpose:
      "Event reels — stills slideshow proposals from calendar packs. Confirm render only; never auto-encodes.",
    projects: [],
  };
}

export function loadEventReelsStore(): EventReelsStore {
  const p = abs(EVENT_REELS_REL);
  if (!existsSync(p)) return emptyEventReelsStore();
  try {
    const raw = JSON.parse(readFileSync(p, "utf8")) as Partial<EventReelsStore>;
    return {
      ...emptyEventReelsStore(),
      ...raw,
      version: 1,
      projects: Array.isArray(raw.projects) ? raw.projects : [],
    };
  } catch {
    return emptyEventReelsStore();
  }
}

export function saveEventReelsStore(store: EventReelsStore): void {
  writeJsonAtomic(EVENT_REELS_REL, {
    ...store,
    version: 1,
    updatedAt: new Date().toISOString(),
  });
}

export function upsertEventReelProject(project: EventReelProject): void {
  const store = loadEventReelsStore();
  store.projects = [project, ...store.projects.filter((p) => p.id !== project.id)].slice(0, 40);
  saveEventReelsStore(store);
}

export function getEventReelProject(projectId: string): EventReelProject | null {
  const id = String(projectId ?? "").trim();
  if (!id) return null;
  return loadEventReelsStore().projects.find((p) => p.id === id) ?? null;
}

export function pushEventReelAssemblies(
  projectId: string,
  assemblies: EventReelAssembly[],
): EventReelProject | null {
  const project = getEventReelProject(projectId);
  if (!project) return null;
  const next: EventReelProject = {
    ...project,
    status: "rendered",
    updatedAt: new Date().toISOString(),
    assemblies: [...assemblies, ...(project.assemblies ?? [])].slice(0, 12),
  };
  upsertEventReelProject(next);
  return next;
}
