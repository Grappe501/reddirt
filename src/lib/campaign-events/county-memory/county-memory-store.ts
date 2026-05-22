import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { CountyMemoryRecord } from "./county-memory-types";

const REL_DIR = "data/campaign-events/county-memory";

function slugify(county: string): string {
  return county
    .trim()
    .toLowerCase()
    .replace(/ county$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "unknown";
}

function filePath(slug: string) {
  return path.join(process.cwd(), REL_DIR, `${slug}.json`);
}

export function countyToSlug(countyLabel: string): string {
  return slugify(countyLabel);
}

export function emptyCountyMemory(countyLabel: string): CountyMemoryRecord {
  const countySlug = countyToSlug(countyLabel);
  return {
    countySlug,
    countyLabel: countyLabel.trim() || "Unknown",
    updatedAt: new Date().toISOString(),
    eventCount: 0,
    recurringIssues: [],
    recurringVolunteers: [],
    recurringHosts: [],
    recurringDonors: [],
    strongestMessaging: [],
    weakMessaging: [],
    turnoutPatterns: [],
    geographyPatterns: [],
    bestEventFormats: [],
    organizerReliability: [],
    relationshipGraphPlaceholder: "V2 — relationship graph not built",
    recentEventIds: [],
    additiveLog: [],
  };
}

export async function loadCountyMemory(countyLabel: string): Promise<CountyMemoryRecord> {
  const slug = countyToSlug(countyLabel);
  try {
    const raw = await readFile(filePath(slug), "utf8");
    return JSON.parse(raw) as CountyMemoryRecord;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return emptyCountyMemory(countyLabel);
    throw e;
  }
}

export async function saveCountyMemory(record: CountyMemoryRecord): Promise<void> {
  await mkdir(path.join(process.cwd(), REL_DIR), { recursive: true });
  record.updatedAt = new Date().toISOString();
  await writeFile(filePath(record.countySlug), `${JSON.stringify(record, null, 2)}\n`, "utf8");
}

export async function listCountyMemorySlugs(): Promise<string[]> {
  const dir = path.join(process.cwd(), REL_DIR);
  try {
    const { readdir } = await import("node:fs/promises");
    const files = await readdir(dir);
    return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
  } catch {
    return [];
  }
}

export async function loadAllCountyMemories(): Promise<CountyMemoryRecord[]> {
  const slugs = await listCountyMemorySlugs();
  const out: CountyMemoryRecord[] = [];
  for (const slug of slugs) {
    try {
      const raw = await readFile(filePath(slug), "utf8");
      out.push(JSON.parse(raw) as CountyMemoryRecord);
    } catch {
      /* skip */
    }
  }
  return out;
}
