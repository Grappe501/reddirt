"use server";

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

import { revalidatePath } from "next/cache";

import type { ScheduleSettlementStagedEntry, ScheduleSettlementStagedFile } from "@/lib/calendar/schedule-settlement-types";

const DATA_DIR = path.join(process.cwd(), "data", "calendar-command-center");
const STAGED = path.join(DATA_DIR, "schedule-settlement-decisions.staged.json");

const PATHS = [
  "/admin/calendar-command-center/kelly",
  "/admin/calendar-command-center/week",
  "/admin/calendar-command-center/opportunities",
];

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function readFile(): ScheduleSettlementStagedFile {
  if (!existsSync(STAGED)) return { version: 1, entries: [] };
  try {
    const raw = JSON.parse(readFileSync(STAGED, "utf8")) as ScheduleSettlementStagedFile;
    if (!raw || raw.version !== 1 || !Array.isArray(raw.entries)) return { version: 1, entries: [] };
    return raw;
  } catch {
    return { version: 1, entries: [] };
  }
}

function writeFile(data: ScheduleSettlementStagedFile) {
  ensureDir();
  writeFileSync(STAGED, JSON.stringify(data, null, 2), "utf8");
}

export async function appendScheduleSettlementDecision(formData: FormData): Promise<void> {
  const action = String(formData.get("settlementAction") ?? "").trim();
  if (!action) return;
  const planId = String(formData.get("planId") ?? "").trim() || undefined;
  const calendarItemId = String(formData.get("calendarItemId") ?? "").trim() || undefined;
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 2000) || undefined;

  const entry: ScheduleSettlementStagedEntry = {
    id: `ssd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    action,
    planId,
    calendarItemId,
    notes,
  };

  const cur = readFile();
  cur.entries.unshift(entry);
  writeFile(cur);

  for (const p of PATHS) {
    revalidatePath(p);
  }
}
