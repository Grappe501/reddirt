import { prisma } from "@/lib/db";
import { parseFactCardEnvelope, serializeFactCardEnvelope, withPreservedFactCardExtensions } from "../fact-card-envelope";
import { getRecordById } from "../persistence/records";
import { emptyEventPlanningData } from "./event-planning-defaults";
import type { EventPlanningData } from "./event-planning-types";

const STORAGE_KEY = "_eventPlanning";

export function parseEventPlanning(raw: unknown): EventPlanningData {
  const base = emptyEventPlanningData();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  return {
    ...base,
    runOfShow: Array.isArray(o.runOfShow) ? (o.runOfShow as EventPlanningData["runOfShow"]) : base.runOfShow,
    packList: Array.isArray(o.packList) && o.packList.length ? (o.packList as EventPlanningData["packList"]) : base.packList,
    volunteerPlan: { ...base.volunteerPlan, ...(o.volunteerPlan as object) },
    contacts: { ...base.contacts, ...(o.contacts as object) },
    candidateBrief: { ...base.candidateBrief, ...(o.candidateBrief as object) },
    cmBrief: { ...base.cmBrief, ...(o.cmBrief as object) },
    budget: { ...base.budget, ...(o.budget as object) },
    taskPackages: Array.isArray(o.taskPackages)
      ? (o.taskPackages as EventPlanningData["taskPackages"])
      : base.taskPackages,
    sectionCompleted: { ...base.sectionCompleted, ...(o.sectionCompleted as object) },
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : base.updatedAt,
  };
}

export function readEventPlanningFromFactCard(factCardRaw: unknown): EventPlanningData {
  if (!factCardRaw || typeof factCardRaw !== "object") return emptyEventPlanningData();
  const o = factCardRaw as Record<string, unknown>;
  return parseEventPlanning(o[STORAGE_KEY]);
}

export async function loadEventPlanning(recordId: string): Promise<EventPlanningData> {
  const record = await getRecordById(recordId);
  if (!record) throw new Error("Campaign event record not found.");
  return readEventPlanningFromFactCard(record.factCard);
}

export async function saveEventPlanning(
  recordId: string,
  next: EventPlanningData,
): Promise<EventPlanningData> {
  const record = await getRecordById(recordId);
  if (!record) throw new Error("Campaign event record not found.");

  const envelope = parseFactCardEnvelope(record.factCard);
  const payload = { ...next, updatedAt: new Date().toISOString() };
  const serialized = serializeFactCardEnvelope(envelope) as Record<string, unknown>;
  const merged = { ...serialized, [STORAGE_KEY]: payload };

  await prisma.campaignEventLedgerRecord.update({
    where: { id: recordId },
    data: {
      factCard: withPreservedFactCardExtensions(merged, record.factCard) as object,
    },
  });

  return payload;
}
