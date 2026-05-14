import { createHash, randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EventWorkflowState, Prisma } from "@prisma/client";

import { prisma } from "../../src/lib/db";
import { loadTravelCalendarItems } from "../../src/lib/calendar/load-travel-calendar-data";
import {
  mapCalendarStatusToCampaignStatus,
  mapJsonEventType,
  parseCalendarItemEnd,
  resolveCalendarCountyId,
} from "../../src/lib/calendar/kelly-promote-json-item";
import type { CampaignCalendarItem } from "../../src/lib/calendar/campaign-calendar-item";
import { loadRedDirtEnv } from "../load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..", "..");
loadRedDirtEnv(REPO);

type Report = {
  created: number;
  updated: number;
  skipped: number;
  conflicts: Array<{ itemId: string; reason: string }>;
  needsHumanReview: Array<{ itemId: string; reason: string }>;
};

function fingerprint(item: CampaignCalendarItem): string {
  return createHash("sha256")
    .update([item.title.trim().toLowerCase(), item.start.slice(0, 16), item.county?.trim().toLowerCase() ?? ""].join("|"))
    .digest("hex")
    .slice(0, 24);
}

async function uniqueSlug(item: CampaignCalendarItem): Promise<string> {
  const base = `kelly-${fingerprint(item)}`;
  let slug = base;
  for (let i = 0; i < 8; i++) {
    const clash = await prisma.campaignEvent.findUnique({ where: { slug }, select: { id: true } });
    if (!clash) return slug;
    slug = `${base}-${randomBytes(2).toString("hex")}`;
  }
  return `${base}-${randomBytes(4).toString("hex")}`;
}

function workflowFor(item: CampaignCalendarItem): EventWorkflowState {
  if (item.calendarStatus === "confirmed") return EventWorkflowState.APPROVED;
  if (item.calendarStatus === "declined") return EventWorkflowState.CANCELED;
  return EventWorkflowState.PENDING_APPROVAL;
}

function metadataFor(item: CampaignCalendarItem): Prisma.InputJsonValue {
  return {
    kellyCockpit: {
      stagedItemId: item.id,
      sourceId: item.sourceId ?? null,
      source: item.source,
      calendarStatus: item.calendarStatus,
      publishStatus: item.publishStatus,
      eventType: item.eventType,
      routeCluster: item.routeCluster ?? null,
      overnightRequired: item.overnightRequired ?? false,
      overnightCity: item.overnightCity ?? null,
      countyTouchCounts: item.countyTouchCounts,
      verificationConfidence: item.verificationConfidence,
      drillDown: {
        kellyRole: item.drillDown?.kellyRole ?? null,
        host: item.drillDown?.host ?? null,
        anchorClassification: item.drillDown?.anchorClassification ?? null,
        spreadsheetTab: item.drillDown?.spreadsheetTab ?? null,
        rowHint: item.drillDown?.rowHint ?? null,
        hasPrivateContacts: Boolean(item.drillDown?.contacts || item.drillDown?.adminLocalGuide?.phone),
      },
    },
  };
}

async function findExisting(item: CampaignCalendarItem) {
  const promotion = await prisma.kellyCalendarPromotion.findUnique({
    where: { calendarItemId: item.id },
    select: { campaignEventId: true },
  });
  if (promotion) {
    return prisma.campaignEvent.findUnique({ where: { id: promotion.campaignEventId } });
  }

  const matchedCampaignId = item.drillDown?.matchedDb?.kind === "CampaignEvent" ? item.drillDown.matchedDb.id : null;
  if (matchedCampaignId) {
    const event = await prisma.campaignEvent.findUnique({ where: { id: matchedCampaignId } });
    if (event) return event;
  }

  const startAt = new Date(item.start);
  const countyId = await resolveCalendarCountyId(item.county);
  return prisma.campaignEvent.findFirst({
    where: {
      title: item.title,
      startAt,
      countyId: countyId ?? undefined,
    },
  });
}

async function promoteOne(item: CampaignCalendarItem, report: Report) {
  if (item.excludeFromKellyCockpit) {
    report.skipped += 1;
    return;
  }
  const startAt = new Date(item.start);
  if (Number.isNaN(startAt.getTime())) {
    report.conflicts.push({ itemId: item.id, reason: "invalid start date" });
    return;
  }
  const endAt = parseCalendarItemEnd(startAt, item);
  const countyId = await resolveCalendarCountyId(item.county);
  const metadata = metadataFor(item);
  const workflow = workflowFor(item);
  const existing = await findExisting(item);

  const data = {
    title: item.title.slice(0, 500),
    description: item.notes?.slice(0, 8000) ?? null,
    eventType: mapJsonEventType(item.eventType),
    status: mapCalendarStatusToCampaignStatus(item.calendarStatus),
    countyId: countyId ?? undefined,
    locationName: [item.city, item.location].filter(Boolean).join(" · ").slice(0, 500) || null,
    startAt,
    endAt,
    timezone: "America/Chicago",
    eventWorkflowState: workflow,
    isPublicOnWebsite: false,
    internalSummary: [
      item.drillDown?.host ? `Host (internal): ${item.drillDown.host}` : null,
      item.drillDown?.contacts ? "Private contacts withheld from Google/public descriptions." : null,
      item.overnightRequired ? `Overnight: ${item.overnightCity ?? "required"}` : null,
      item.drillDown?.rowHint ? `Row hint: ${item.drillDown.rowHint}` : null,
    ].filter(Boolean).join("\n") || null,
    commsStateJson: metadata,
  };

  const event = existing
    ? await prisma.campaignEvent.update({ where: { id: existing.id }, data })
    : await prisma.campaignEvent.create({ data: { slug: await uniqueSlug(item), visibility: "INTERNAL", ...data } });

  await prisma.kellyCalendarPromotion.upsert({
    where: { calendarItemId: item.id },
    create: { calendarItemId: item.id, campaignEventId: event.id, promotedByUserId: "calendar-promote-staged-to-db" },
    update: { campaignEventId: event.id },
  });

  await prisma.kellyCalendarDecision.updateMany({
    where: { calendarItemId: item.id, campaignEventId: null },
    data: { campaignEventId: event.id },
  });

  await prisma.eventStageChangeLog.create({
    data: {
      eventId: event.id,
      fromState: existing ? existing.eventWorkflowState : null,
      toState: workflow,
      actorUserId: null,
      note: `Promoted/updated from staged calendar item ${item.id}`,
    },
  });

  if (item.calendarStatus === "needs_verification" || item.calendarStatus === "conflict") {
    report.needsHumanReview.push({ itemId: item.id, reason: item.calendarStatus });
  }
  if (existing) report.updated += 1;
  else report.created += 1;
}

async function main() {
  const report: Report = { created: 0, updated: 0, skipped: 0, conflicts: [], needsHumanReview: [] };
  const items = loadTravelCalendarItems();
  for (const item of items) await promoteOne(item, report);
  console.log(JSON.stringify({ ok: true, total: items.length, ...report }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
