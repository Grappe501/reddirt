"use server";

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

import { revalidatePath } from "next/cache";
import {
  CalendarAlertChannel,
  CalendarAlertSeverity,
  CalendarAlertStatus,
  CampaignTaskPriority,
  CampaignTaskStatus,
  CampaignTaskType,
} from "@prisma/client";

import { prisma } from "@/lib/db";
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

async function persistRouteDecisionToDb(entry: ScheduleSettlementStagedEntry): Promise<boolean> {
  const label = entry.action.replace(/_/g, " ");
  try {
    const dueAt = new Date(Date.now() + 24 * 3600000);
    await prisma.calendarAlert.create({
      data: {
        calendarItemId: entry.calendarItemId ?? `route:${entry.planId ?? entry.id}`,
        alertType: "SCHEDULE_ROUTE_DECISION",
        severity: CalendarAlertSeverity.MEDIUM,
        title: `Route decision: ${label}`,
        body: [entry.planId ? `Plan: ${entry.planId}` : null, entry.notes].filter(Boolean).join("\n") || label,
        dueAt,
        channel: CalendarAlertChannel.IN_APP,
        status: CalendarAlertStatus.PENDING,
        dedupeKey: `route-decision-${entry.id}`,
        metadataJson: {
          source: "schedule_settlement",
          action: entry.action,
          planId: entry.planId ?? null,
          calendarItemId: entry.calendarItemId ?? null,
        },
      },
    });
    await prisma.campaignTask.create({
      data: {
        title: `Route settlement: ${label}`.slice(0, 200),
        description: [entry.planId ? `Plan: ${entry.planId}` : null, entry.notes].filter(Boolean).join("\n") || "Review route settlement decision.",
        taskType: CampaignTaskType.OTHER,
        status: CampaignTaskStatus.TODO,
        priority: CampaignTaskPriority.HIGH,
        dueAt,
        sourceTemplateTaskKey: `route-settlement-${entry.id}`,
      },
    });
    return true;
  } catch {
    return false;
  }
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

  const persistedToDb = await persistRouteDecisionToDb(entry);
  const cur = readFile();
  cur.entries.unshift({ ...entry, notes: [notes, persistedToDb ? "DB_BACKED:true" : "DB_BACKED:false"].filter(Boolean).join("\n") });
  writeFile(cur);

  for (const p of PATHS) {
    revalidatePath(p);
  }
}
