import { prisma } from "@/lib/db";
import { parseFactCardEnvelope, serializeFactCardEnvelope, withPreservedFactCardExtensions } from "../fact-card-envelope";
import { getRecordById } from "../persistence/records";
import { parseHotWashNotes, type HotWashNotes } from "../hot-wash-notes";
import { emptyHotWashIntelligence, migrateLegacyHotWashNotes } from "./hot-wash-intelligence-defaults";
import type { HotWashIntelligenceData } from "./hot-wash-intelligence-types";

const STORAGE_KEY = "_hotWashIntelligence";
const LEGACY_KEY = "_hotWash";

export function parseHotWashIntelligence(raw: unknown): HotWashIntelligenceData {
  const base = emptyHotWashIntelligence();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  return {
    ...base,
    outcome: { ...base.outcome, ...(o.outcome as object) },
    lessons: { ...base.lessons, ...(o.lessons as object) },
    messaging: { ...base.messaging, ...(o.messaging as object) },
    relationships: { ...base.relationships, ...(o.relationships as object) },
    countySignals: { ...base.countySignals, ...(o.countySignals as object) },
    followUp: { ...base.followUp, ...(o.followUp as object) },
    executiveSummary: typeof o.executiveSummary === "string" ? o.executiveSummary : base.executiveSummary,
    topFindings: Array.isArray(o.topFindings) ? (o.topFindings as string[]) : base.topFindings,
    sectionCompleted: { ...base.sectionCompleted, ...(o.sectionCompleted as object) },
    completedAt: typeof o.completedAt === "string" ? o.completedAt : undefined,
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : undefined,
  };
}

export async function loadHotWashIntelligence(recordId: string): Promise<HotWashIntelligenceData> {
  const record = await getRecordById(recordId);
  if (!record) return emptyHotWashIntelligence();
  const raw = record.factCard as Record<string, unknown> | null;
  let intel = parseHotWashIntelligence(raw?.[STORAGE_KEY]);
  const legacy = parseHotWashNotes(raw?.[LEGACY_KEY]);
  if (Object.keys(legacy).length) intel = migrateLegacyHotWashNotes(intel, legacy);
  return intel;
}

export async function saveHotWashIntelligence(
  recordId: string,
  data: HotWashIntelligenceData,
  options?: { markCompleted?: boolean },
): Promise<HotWashIntelligenceData> {
  const record = await getRecordById(recordId);
  if (!record) throw new Error("Campaign event record not found.");
  const envelope = parseFactCardEnvelope(record.factCard);
  const payload: HotWashIntelligenceData = {
    ...data,
    updatedAt: new Date().toISOString(),
    completedAt: options?.markCompleted ? new Date().toISOString() : data.completedAt,
  };
  const serialized = serializeFactCardEnvelope(envelope) as Record<string, unknown>;
  const merged = { ...serialized, [STORAGE_KEY]: payload };
  await prisma.campaignEventLedgerRecord.update({
    where: { id: recordId },
    data: { factCard: withPreservedFactCardExtensions(merged, record.factCard) as object },
  });
  return payload;
}

/** Keep legacy notes in sync for any code still reading _hotWash only. */
export function intelligenceToLegacyNotes(data: HotWashIntelligenceData): HotWashNotes {
  return {
    whatHappened: data.executiveSummary,
    whatWorked: data.lessons.whatWorked,
    whatDidNot: data.lessons.whatFailed,
    crowdSize: data.outcome.attendanceEstimate,
    notableConversations: data.relationships.influentialAttendees,
    followUpNeeds: data.relationships.followUpNeeds,
    quotes: data.messaging.applauseLines,
    mediaNotes: data.outcome.mediaOutcome,
    countyLearnings: data.lessons.futureRecommendations,
  };
}
