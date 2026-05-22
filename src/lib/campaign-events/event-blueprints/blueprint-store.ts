import "server-only";

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { EventBlueprint, EventBlueprintIndex, EventBlueprintType } from "./blueprint-types";

const INDEX_REL = "data/campaign-events/event-blueprints/blueprints.json";

export async function loadBlueprintIndex(): Promise<EventBlueprintIndex> {
  const p = path.join(process.cwd(), INDEX_REL);
  try {
    const raw = await readFile(p, "utf8");
    const parsed = JSON.parse(raw) as EventBlueprintIndex;
    if (parsed?.version === 1 && Array.isArray(parsed.blueprints)) return parsed;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
  return { version: 1, blueprints: [] };
}

export async function saveBlueprintIndex(index: EventBlueprintIndex): Promise<void> {
  const p = path.join(process.cwd(), INDEX_REL);
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, `${JSON.stringify(index, null, 2)}\n`, "utf8");
}

export async function upsertBlueprint(blueprint: EventBlueprint): Promise<void> {
  const index = await loadBlueprintIndex();
  const i = index.blueprints.findIndex((b) => b.id === blueprint.id);
  blueprint.updatedAt = new Date().toISOString();
  if (i >= 0) index.blueprints[i] = blueprint;
  else index.blueprints.push(blueprint);
  await saveBlueprintIndex(index);
}
