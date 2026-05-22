import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { CommunicationsMemoryEntry, CommunicationsMemoryStore } from "./communications-memory-types";

const MEM_FILE = "data/campaign-events/communications/communications-memory.json";

function memPath(repoRoot?: string): string {
  return path.join(repoRoot ?? process.cwd(), MEM_FILE);
}

export function loadCommunicationsMemory(repoRoot?: string): CommunicationsMemoryStore {
  const p = memPath(repoRoot);
  if (!existsSync(p)) {
    return { entries: [], updatedAt: new Date().toISOString() };
  }
  try {
    return JSON.parse(readFileSync(p, "utf8")) as CommunicationsMemoryStore;
  } catch {
    return { entries: [], updatedAt: new Date().toISOString() };
  }
}

export function appendCommunicationsMemory(
  entry: Omit<CommunicationsMemoryEntry, "id" | "createdAt" | "updatedAt" | "humanReviewed"> & {
    id?: string;
    humanReviewed?: boolean;
  },
  repoRoot?: string,
): CommunicationsMemoryEntry {
  const store = loadCommunicationsMemory(repoRoot);
  const full: CommunicationsMemoryEntry = {
    ...entry,
    id: entry.id ?? `cmem_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    humanReviewed: entry.humanReviewed ?? false,
  };
  store.entries.push(full);
  store.updatedAt = new Date().toISOString();
  const p = memPath(repoRoot);
  const dir = path.dirname(p);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(p, JSON.stringify(store, null, 2), "utf8");
  return full;
}

export function deleteCommunicationsMemoryEntry(id: string, repoRoot?: string): boolean {
  const store = loadCommunicationsMemory(repoRoot);
  const next = store.entries.filter((e) => e.id !== id);
  if (next.length === store.entries.length) return false;
  store.entries = next;
  store.updatedAt = new Date().toISOString();
  writeFileSync(memPath(repoRoot), JSON.stringify(store, null, 2), "utf8");
  return true;
}
