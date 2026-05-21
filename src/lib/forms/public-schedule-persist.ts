import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { resolveCountyFromText } from "@/lib/volunteer-intake/resolve-county";
import type { PublicSchedulingAssistantResult } from "@/lib/kelly-agent/public-scheduling-agent";
import type { ScheduleCampaignEventBody } from "@/lib/forms/public-schedule-schema";
import { estimatePublicScheduleRouteMiles } from "@/lib/calendar/public-schedule-route-estimate";
import { bridgeWebsiteIntakeToLedger } from "@/lib/campaign-events/intake/intake-ledger-bridge";

const DATA_DIR = path.join(process.cwd(), "data", "calendar-command-center");
const STAGED_FILE = path.join(DATA_DIR, "public-schedule-requests.staged.json");

export type StagedPublicScheduleFile = {
  version: 1;
  entries: StagedPublicScheduleEntry[];
};

export type StagedPublicScheduleEntry = {
  id: string;
  createdAt: string;
  payload: ScheduleCampaignEventBody;
  assistant: PublicSchedulingAssistantResult;
  routeImpactMilesEstimate: number | null;
  workflowIntakeId: string | null;
};

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

export function readStagedPublicScheduleRequests(): StagedPublicScheduleFile {
  if (!existsSync(STAGED_FILE)) return { version: 1, entries: [] };
  try {
    const raw = JSON.parse(readFileSync(STAGED_FILE, "utf8")) as StagedPublicScheduleFile;
    if (!raw || raw.version !== 1 || !Array.isArray(raw.entries)) return { version: 1, entries: [] };
    return raw;
  } catch {
    return { version: 1, entries: [] };
  }
}

export function appendStagedPublicScheduleRequest(entry: StagedPublicScheduleEntry): void {
  ensureDataDir();
  const cur = readStagedPublicScheduleRequests();
  cur.entries.unshift(entry);
  writeFileSync(STAGED_FILE, JSON.stringify(cur, null, 2), "utf8");
}

function eventRequestMetadata(body: ScheduleCampaignEventBody, assistant: PublicSchedulingAssistantResult, miles: number | null) {
  return {
    calendarLane: "TENTATIVE" as const,
    calendarStatus: "needs_verification" as const,
    source: "public_schedule_request",
    publishStatus: "private_admin_only" as const,
    needsKellyReview: true,
    googleSyncStatus: "not_synced" as const,
    publicAssistant: assistant,
    publicForm: {
      eventPurpose: body.eventPurpose ?? null,
      eventVisibility: body.eventVisibility,
      pressReleaseInterest: body.pressReleaseInterest,
      localIssueAngle: body.localIssueAngle ?? null,
      alternateDates: body.alternateDates ?? null,
      audienceSize: body.audienceSize ?? null,
      permissionToContact: body.permissionToContact,
    },
    routeImpactMilesEstimate: miles,
  } satisfies Record<string, unknown>;
}

export type PersistPublicScheduleDbResult = {
  submissionId: string;
  userId: string;
  workflowIntakeId: string;
  eventRequestId: string;
  campaignEventLedgerRecordId: string;
  ledgerCreated: boolean;
  ledgerDuplicateRisk: boolean;
  ledgerScheduleConflict: boolean;
};

export async function persistPublicScheduleToDatabase(input: {
  body: ScheduleCampaignEventBody;
  assistant: PublicSchedulingAssistantResult;
  routeImpactMilesEstimate: number | null;
}): Promise<PersistPublicScheduleDbResult> {
  const { body, assistant, routeImpactMilesEstimate } = input;
  const email = body.email.toLowerCase().trim();
  const counties = await prisma.county.findMany({ select: { id: true, slug: true, displayName: true, fips: true } });
  const countyMatch = resolveCountyFromText(body.county, counties);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: sanitizePlainText(body.requesterName, 120),
      phone: body.phone.trim() || null,
      county: sanitizePlainText(body.county, 80),
    },
    update: {
      name: sanitizePlainText(body.requesterName, 120),
      phone: body.phone.trim() || undefined,
      county: sanitizePlainText(body.county, 80),
    },
  });

  const summaryLines = [
    `Public schedule request: ${body.eventTitle}`,
    `Type: ${body.eventType}`,
    `Where: ${body.county}${body.city ? ` / ${body.city}` : ""}`,
    body.preferredDate ? `Preferred date: ${body.preferredDate}` : "Preferred date: (campaign suggests)",
    `Flexibility: ${body.flexibility}`,
    `Visibility: ${body.eventVisibility}`,
    `Press invited: ${body.pressInvited ? "yes" : "no"}`,
    `Press release interest: ${body.pressReleaseInterest}`,
    body.eventPurpose ? `Purpose: ${body.eventPurpose}` : "",
  ].filter(Boolean);

  const structuredData: Prisma.InputJsonValue = {
    kind: "public_schedule_request",
    eventTitle: sanitizePlainText(body.eventTitle, 200),
    eventType: body.eventType,
    county: sanitizePlainText(body.county, 100),
    city: body.city ? sanitizePlainText(body.city, 120) : null,
    address: body.address ? sanitizePlainText(body.address, 500) : null,
    preferredDate: body.preferredDate ?? null,
    alternateDates: body.alternateDates ?? [],
    preferredStartTime: body.preferredStartTime ?? null,
    preferredEndTime: body.preferredEndTime ?? null,
    flexibility: body.flexibility,
    audienceSize: body.audienceSize ?? null,
    eventPurpose: body.eventPurpose ? sanitizePlainText(body.eventPurpose, 4000) : null,
    eventVisibility: body.eventVisibility,
    pressInvited: body.pressInvited,
    pressReleaseInterest: body.pressReleaseInterest,
    localIssueAngle: body.localIssueAngle ? sanitizePlainText(body.localIssueAngle, 2000) : null,
    speakingRequested: body.speakingRequested,
    localHostAvailable: body.localHostAvailable,
    notes: body.notes ? sanitizePlainText(body.notes, 8000) : null,
    organization: body.organization ? sanitizePlainText(body.organization, 200) : null,
    routeImpactMilesEstimate: routeImpactMilesEstimate,
  };

  const submission = await prisma.submission.create({
    data: {
      userId: user.id,
      type: "public_schedule_request",
      content: sanitizePlainText(summaryLines.join("\n"), 8000),
      structuredData,
    },
  });

  const intakeTitle = sanitizePlainText(`Public schedule: ${body.eventTitle} (${body.county})`, 240);

  const intake = await prisma.workflowIntake.create({
    data: {
      submissionId: submission.id,
      countyId: countyMatch?.countyId ?? null,
      status: "PENDING",
      title: intakeTitle,
      source: "public_schedule_request",
      metadata: {
        publicScheduling: true,
        assistant,
        routeImpactMilesEstimate,
        availabilityNote: "Sanitized public-availability.json-derived summary only (no private titles).",
      } as Prisma.InputJsonValue,
    },
  });

  const erMeta = eventRequestMetadata(body, assistant, routeImpactMilesEstimate);

  const eventRequest = await prisma.eventRequest.create({
    data: {
      workflowIntakeId: intake.id,
      status: "OPEN",
      requestedStartAt: assistant.recommendedTentativeEvent.startAt
        ? new Date(assistant.recommendedTentativeEvent.startAt)
        : null,
      requestedEndAt: assistant.recommendedTentativeEvent.endAt ? new Date(assistant.recommendedTentativeEvent.endAt) : null,
      timezone: "America/Chicago",
      locationName: body.city ? sanitizePlainText(body.city, 120) : null,
      address: body.address ? sanitizePlainText(body.address, 4000) : null,
      requestDetails: sanitizePlainText(
        [body.eventPurpose, body.notes].filter(Boolean).join("\n\n---\n\n") || body.eventTitle,
        12_000,
      ),
      metadata: erMeta as Prisma.InputJsonValue,
    },
  });

  const bridge = await bridgeWebsiteIntakeToLedger({
    body,
    assistant,
    routeImpactMilesEstimate,
    workflowIntakeId: intake.id,
    eventRequestId: eventRequest.id,
    submissionId: submission.id,
  });

  return {
    submissionId: submission.id,
    userId: user.id,
    workflowIntakeId: intake.id,
    eventRequestId: eventRequest.id,
    campaignEventLedgerRecordId: bridge.recordId,
    ledgerCreated: bridge.created,
    ledgerDuplicateRisk: bridge.duplicateRisk,
    ledgerScheduleConflict: bridge.scheduleConflict,
  };
}

export async function persistPublicScheduleRequest(input: {
  body: ScheduleCampaignEventBody;
  assistant: PublicSchedulingAssistantResult;
}): Promise<
  | { ok: true; mode: "database"; result: PersistPublicScheduleDbResult }
  | { ok: true; mode: "staged"; stagedId: string }
  | { ok: false; error: string }
> {
  const miles = estimatePublicScheduleRouteMiles(input.body.county);
  try {
    const result = await persistPublicScheduleToDatabase({
      body: input.body,
      assistant: input.assistant,
      routeImpactMilesEstimate: miles,
    });
    return { ok: true, mode: "database", result };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("persistPublicScheduleToDatabase failed, staging", msg);
    const id = `stg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    appendStagedPublicScheduleRequest({
      id,
      createdAt: new Date().toISOString(),
      payload: input.body,
      assistant: input.assistant,
      routeImpactMilesEstimate: miles,
      workflowIntakeId: null,
    });
    return { ok: true, mode: "staged", stagedId: id };
  }
}
