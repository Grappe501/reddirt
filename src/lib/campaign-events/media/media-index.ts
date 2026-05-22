import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { HotWashMediaIndex, HotWashMediaRecord } from "./hot-wash-media-types";
import { MEDIA_ROOT_REL } from "./media-path-builder";

export const MEDIA_INDEX_REL = path.join(MEDIA_ROOT_REL, "media-index.json");

export async function loadMediaIndex(): Promise<HotWashMediaIndex> {
  const filePath = path.join(process.cwd(), MEDIA_INDEX_REL);
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as HotWashMediaIndex;
    if (parsed?.version === 1 && Array.isArray(parsed.items)) return parsed;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
  return { version: 1, items: [] };
}

export async function saveMediaIndex(index: HotWashMediaIndex): Promise<void> {
  const filePath = path.join(process.cwd(), MEDIA_INDEX_REL);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
}

export async function upsertMediaRecord(record: HotWashMediaRecord): Promise<void> {
  const index = await loadMediaIndex();
  const i = index.items.findIndex((x) => x.id === record.id);
  if (i >= 0) index.items[i] = record;
  else index.items.push(record);
  await saveMediaIndex(index);
}

export async function getMediaById(id: string): Promise<HotWashMediaRecord | undefined> {
  const index = await loadMediaIndex();
  return index.items.find((x) => x.id === id);
}

export async function listMediaForEvent(eventRecordId: string): Promise<HotWashMediaRecord[]> {
  const index = await loadMediaIndex();
  return index.items
    .filter((x) => x.eventRecordId === eventRecordId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listPendingMedia(): Promise<HotWashMediaRecord[]> {
  const index = await loadMediaIndex();
  return index.items
    .filter((x) => x.approvalStatus === "pending" || x.approvalStatus === "needs_review")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listAllMedia(): Promise<HotWashMediaRecord[]> {
  const index = await loadMediaIndex();
  return [...index.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
