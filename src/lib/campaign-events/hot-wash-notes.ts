import { parseFactCardEnvelope, serializeFactCardEnvelope, withPreservedFactCardExtensions } from "./fact-card-envelope";
import { getRecordById } from "./persistence/records";
import { prisma } from "@/lib/db";

export type HotWashNotes = {
  whatHappened?: string;
  whatWorked?: string;
  whatDidNot?: string;
  crowdSize?: string;
  notableConversations?: string;
  followUpNeeds?: string;
  quotes?: string;
  mediaNotes?: string;
  countyLearnings?: string;
};

export const HOT_WASH_NOTE_FIELDS: Array<{ key: keyof HotWashNotes; label: string; rows?: number }> = [
  { key: "whatHappened", label: "What happened", rows: 3 },
  { key: "whatWorked", label: "What worked", rows: 2 },
  { key: "whatDidNot", label: "What did not work", rows: 2 },
  { key: "crowdSize", label: "Crowd size", rows: 1 },
  { key: "notableConversations", label: "Notable conversations", rows: 2 },
  { key: "followUpNeeds", label: "Follow-up needs", rows: 2 },
  { key: "quotes", label: "Quotes", rows: 2 },
  { key: "mediaNotes", label: "Media notes", rows: 2 },
  { key: "countyLearnings", label: "County learnings", rows: 2 },
];

export function parseHotWashNotes(raw: unknown): HotWashNotes {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const out: HotWashNotes = {};
  for (const { key } of HOT_WASH_NOTE_FIELDS) {
    const v = o[key];
    if (typeof v === "string" && v.trim()) out[key] = v.trim();
  }
  return out;
}

export async function loadHotWashNotes(recordId: string): Promise<HotWashNotes> {
  const record = await getRecordById(recordId);
  if (!record) return {};
  const raw = (record.factCard as Record<string, unknown> | null)?._hotWash;
  return parseHotWashNotes(raw);
}

export async function saveHotWashNotes(recordId: string, notes: HotWashNotes): Promise<void> {
  const record = await getRecordById(recordId);
  if (!record) throw new Error("Campaign event record not found.");
  const envelope = parseFactCardEnvelope(record.factCard);
  const serialized = withPreservedFactCardExtensions(serializeFactCardEnvelope(envelope), record.factCard) as Record<string, unknown>;
  serialized._hotWash = notes;
  await prisma.campaignEventLedgerRecord.update({
    where: { id: recordId },
    data: { factCard: serialized as object },
  });
}
