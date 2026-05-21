import "server-only";

import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { parseFactCardEnvelope, serializeFactCardEnvelope, withPreservedFactCardExtensions } from "../fact-card-envelope";
import type { AiObservationEntry, ApprovalObservationEvent } from "./observations";
import { parseAiObservations } from "./observations";

function newObservationId(): string {
  return `aio_${randomBytes(8).toString("hex")}`;
}

export async function appendAiObservation(input: {
  recordId?: string | null;
  toolId: string;
  event: ApprovalObservationEvent;
  actor?: string;
  meta?: Record<string, string | number | boolean | null>;
}): Promise<AiObservationEntry> {
  const entry: AiObservationEntry = {
    id: newObservationId(),
    toolId: input.toolId,
    event: input.event,
    recordId: input.recordId ?? null,
    at: new Date().toISOString(),
    actor: input.actor ?? "system",
    meta: input.meta,
  };

  if (!input.recordId) return entry;

  const record = await prisma.campaignEventLedgerRecord.findUnique({ where: { id: input.recordId } });
  if (!record) return entry;

  const prev = parseAiObservations(record.factCard);
  const envelope = parseFactCardEnvelope(record.factCard);
  const serialized = withPreservedFactCardExtensions(serializeFactCardEnvelope(envelope), {
    ...(record.factCard as object),
    _aiObservations: [...prev, entry].slice(-200),
  });

  await prisma.campaignEventLedgerRecord.update({
    where: { id: input.recordId },
    data: { factCard: serialized as object },
  });

  return entry;
}

export async function loadAiObservationsForRecord(recordId: string): Promise<AiObservationEntry[]> {
  const record = await prisma.campaignEventLedgerRecord.findUnique({ where: { id: recordId } });
  if (!record) return [];
  return parseAiObservations(record.factCard);
}
