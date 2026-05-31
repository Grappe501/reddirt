import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type {
  OppositionArchiveItem,
  OppositionArchiveItemsFile,
  OppositionClipRecord,
  OppositionQuoteRecord,
  OppositionRetrievalTask,
  OppositionRetrievalTasksFile,
  OppositionSourceRecord,
  OppositionWritingRecord,
} from "./oppositionArchiveTypes";
import { OPPOSITION_ARCHIVE_BASE } from "./oppositionArchiveTypes";

export const OPPOSITION_ARCHIVE_ITEMS_REL = `${OPPOSITION_ARCHIVE_BASE}/opposition-archive-items.json`;
export const OPPOSITION_SOURCE_RECORDS_REL = `${OPPOSITION_ARCHIVE_BASE}/opposition-source-records.json`;
export const OPPOSITION_QUOTE_RECORDS_REL = `${OPPOSITION_ARCHIVE_BASE}/opposition-quote-records.json`;
export const OPPOSITION_CLIP_RECORDS_REL = `${OPPOSITION_ARCHIVE_BASE}/opposition-clip-records.json`;
export const OPPOSITION_WRITING_RECORDS_REL = `${OPPOSITION_ARCHIVE_BASE}/opposition-writing-records.json`;
export const OPPOSITION_RETRIEVAL_TASKS_REL = `${OPPOSITION_ARCHIVE_BASE}/opposition-retrieval-tasks.json`;
export const OPPOSITION_ARCHIVE_AUDIT_LOG_REL = `${OPPOSITION_ARCHIVE_BASE}/opposition-archive-audit-log.json`;

export type OppositionArchiveBundle = {
  items: OppositionArchiveItemsFile;
  sources: { version: number; generatedAt: string; records: OppositionSourceRecord[] };
  quotes: { version: number; generatedAt: string; records: OppositionQuoteRecord[] };
  clips: { version: number; generatedAt: string; records: OppositionClipRecord[] };
  writings: { version: number; generatedAt: string; records: OppositionWritingRecord[] };
  retrievalTasks: OppositionRetrievalTasksFile;
};

export type OppositionArchiveAuditEvent = {
  eventId: string;
  timestamp: string;
  eventType: string;
  actor: string;
  itemId?: string;
  taskId?: string;
  notes: string;
};

function absPath(repoRoot: string, rel: string): string {
  return path.join(repoRoot, rel);
}

function readJson<T>(repoRoot: string, rel: string, fallback: T): T {
  const abs = absPath(repoRoot, rel);
  if (!existsSync(abs)) return fallback;
  return JSON.parse(readFileSync(abs, "utf8")) as T;
}

function writeJson(repoRoot: string, rel: string, data: unknown): void {
  const abs = absPath(repoRoot, rel);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function loadOppositionArchive(repoRoot: string = process.cwd()): OppositionArchiveBundle {
  const now = new Date().toISOString();
  return {
    items: readJson<OppositionArchiveItemsFile>(repoRoot, OPPOSITION_ARCHIVE_ITEMS_REL, {
      version: 1,
      generatedAt: now,
      items: [],
    }),
    sources: readJson(repoRoot, OPPOSITION_SOURCE_RECORDS_REL, {
      version: 1,
      generatedAt: now,
      records: [],
    }),
    quotes: readJson(repoRoot, OPPOSITION_QUOTE_RECORDS_REL, {
      version: 1,
      generatedAt: now,
      records: [],
    }),
    clips: readJson(repoRoot, OPPOSITION_CLIP_RECORDS_REL, {
      version: 1,
      generatedAt: now,
      records: [],
    }),
    writings: readJson(repoRoot, OPPOSITION_WRITING_RECORDS_REL, {
      version: 1,
      generatedAt: now,
      records: [],
    }),
    retrievalTasks: readJson<OppositionRetrievalTasksFile>(repoRoot, OPPOSITION_RETRIEVAL_TASKS_REL, {
      version: 1,
      generatedAt: now,
      tasks: [],
    }),
  };
}

export function saveOppositionArchive(bundle: OppositionArchiveBundle, repoRoot: string = process.cwd()): void {
  const now = new Date().toISOString();
  bundle.items.generatedAt = now;
  bundle.sources.generatedAt = now;
  bundle.quotes.generatedAt = now;
  bundle.clips.generatedAt = now;
  bundle.writings.generatedAt = now;
  bundle.retrievalTasks.generatedAt = now;
  writeJson(repoRoot, OPPOSITION_ARCHIVE_ITEMS_REL, bundle.items);
  writeJson(repoRoot, OPPOSITION_SOURCE_RECORDS_REL, bundle.sources);
  writeJson(repoRoot, OPPOSITION_QUOTE_RECORDS_REL, bundle.quotes);
  writeJson(repoRoot, OPPOSITION_CLIP_RECORDS_REL, bundle.clips);
  writeJson(repoRoot, OPPOSITION_WRITING_RECORDS_REL, bundle.writings);
  writeJson(repoRoot, OPPOSITION_RETRIEVAL_TASKS_REL, bundle.retrievalTasks);
}

export function upsertOppositionArchiveItem(
  item: OppositionArchiveItem,
  repoRoot: string = process.cwd(),
): void {
  const bundle = loadOppositionArchive(repoRoot);
  const idx = bundle.items.items.findIndex((i) => i.id === item.id);
  if (idx >= 0) bundle.items.items[idx] = item;
  else bundle.items.items.push(item);
  saveOppositionArchive(bundle, repoRoot);
}

export function appendOppositionSourceRecord(
  record: OppositionSourceRecord,
  repoRoot: string = process.cwd(),
): void {
  const bundle = loadOppositionArchive(repoRoot);
  if (!bundle.sources.records.some((r) => r.id === record.id)) {
    bundle.sources.records.push(record);
    saveOppositionArchive(bundle, repoRoot);
  }
}

export function appendOppositionQuoteRecord(
  record: OppositionQuoteRecord,
  repoRoot: string = process.cwd(),
): void {
  const bundle = loadOppositionArchive(repoRoot);
  if (!bundle.quotes.records.some((r) => r.id === record.id)) {
    bundle.quotes.records.push(record);
    saveOppositionArchive(bundle, repoRoot);
  }
}

export function appendOppositionClipRecord(
  record: OppositionClipRecord,
  repoRoot: string = process.cwd(),
): void {
  const bundle = loadOppositionArchive(repoRoot);
  if (!bundle.clips.records.some((r) => r.id === record.id)) {
    bundle.clips.records.push(record);
    saveOppositionArchive(bundle, repoRoot);
  }
}

export function appendOppositionWritingRecord(
  record: OppositionWritingRecord,
  repoRoot: string = process.cwd(),
): void {
  const bundle = loadOppositionArchive(repoRoot);
  if (!bundle.writings.records.some((r) => r.id === record.id)) {
    bundle.writings.records.push(record);
    saveOppositionArchive(bundle, repoRoot);
  }
}

export function loadOppositionRetrievalTasks(repoRoot: string = process.cwd()): OppositionRetrievalTask[] {
  return loadOppositionArchive(repoRoot).retrievalTasks.tasks;
}

export function updateOppositionRetrievalTaskStatus(
  taskId: string,
  updates: Partial<OppositionRetrievalTask>,
  repoRoot: string = process.cwd(),
): boolean {
  const bundle = loadOppositionArchive(repoRoot);
  const idx = bundle.retrievalTasks.tasks.findIndex((t) => t.id === taskId);
  if (idx < 0) return false;
  bundle.retrievalTasks.tasks[idx] = {
    ...bundle.retrievalTasks.tasks[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveOppositionArchive(bundle, repoRoot);
  return true;
}

export function appendOppositionArchiveAuditEvent(
  event: Omit<OppositionArchiveAuditEvent, "eventId" | "timestamp">,
  repoRoot: string = process.cwd(),
): void {
  const log = readJson<{ version: number; generatedAt: string; events: OppositionArchiveAuditEvent[] }>(
    repoRoot,
    OPPOSITION_ARCHIVE_AUDIT_LOG_REL,
    { version: 1, generatedAt: new Date().toISOString(), events: [] },
  );
  log.events.push({
    ...event,
    eventId: `oaa-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
  });
  log.generatedAt = new Date().toISOString();
  writeJson(repoRoot, OPPOSITION_ARCHIVE_AUDIT_LOG_REL, log);
}
