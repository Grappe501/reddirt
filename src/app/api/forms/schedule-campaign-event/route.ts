import { NextResponse } from "next/server";

import { bodyToPublicSchedulingRequest, scheduleCampaignEventBodySchema, toPersistedPublicScheduleBody } from "@/lib/forms/public-schedule-schema";
import { persistPublicScheduleRequest } from "@/lib/forms/public-schedule-persist";
import { formatZodErrors } from "@/lib/forms/validate";
import { loadTravelCalendarItems } from "@/lib/calendar/load-travel-calendar-data";
import { estimatePublicScheduleRouteMiles } from "@/lib/calendar/public-schedule-route-estimate";
import {
  runPublicSchedulingAssistant,
  stripPrivateStaffFlagsForPublicResponse,
} from "@/lib/kelly-agent/public-scheduling-agent";
import { sendInviteKellySchedulerNotification } from "@/lib/campaign-ops/ops-notifications";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`schedule-campaign:${ip}`, 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", retryAfterMs: rl.retryAfterMs },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = scheduleCampaignEventBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation", fields: formatZodErrors(parsed.error) },
      { status: 400 },
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true, accepted: true }, { status: 200 });
  }

  const clean = toPersistedPublicScheduleBody(parsed.data);
  const travel = loadTravelCalendarItems();
  const psReq = bodyToPublicSchedulingRequest(clean);
  const routeMiles = estimatePublicScheduleRouteMiles(clean.county);

  const assistant = await runPublicSchedulingAssistant({
    request: psReq,
    travelItems: travel,
    routeImpactMilesEstimate: routeMiles,
  });

  const persist = await persistPublicScheduleRequest({
    body: clean,
    assistant,
  });

  if (!persist.ok) {
    return NextResponse.json({ ok: false, error: persist.error }, { status: 500 });
  }

  const publicAssistant = stripPrivateStaffFlagsForPublicResponse(assistant);

  await sendInviteKellySchedulerNotification({
    requesterName: clean.requesterName,
    email: clean.email,
    phone: clean.phone,
    organization: clean.organization,
    eventTitle: clean.eventTitle,
    eventType: clean.eventType,
    kellyRole: clean.kellyRole,
    county: clean.county,
    city: clean.city,
    address: clean.address,
    preferredDate: clean.preferredDate,
    alternateDates: clean.alternateDates,
    flexibility: clean.flexibility,
    audienceSize: clean.audienceSize,
    eventPurpose: clean.eventPurpose,
    eventVisibility: clean.eventVisibility,
    notes: clean.notes,
    intakeStatus: assistant.intakeStatus,
    publicMessage: assistant.publicMessage,
    recommendedTitle: assistant.recommendedTentativeEvent.title,
    recommendedStartAt: assistant.recommendedTentativeEvent.startAt,
    recommendedEndAt: assistant.recommendedTentativeEvent.endAt,
    suggestedWindows: assistant.suggestedWindows,
    staffFlags: assistant.privateStaffFlags,
    workflowIntakeId: persist.mode === "database" ? persist.result.workflowIntakeId : null,
    submissionId: persist.mode === "database" ? persist.result.submissionId : persist.stagedId,
  });

  if (persist.mode === "database") {
    return NextResponse.json({
      ok: true,
      mode: "database",
      submissionId: persist.result.submissionId,
      workflowIntakeId: persist.result.workflowIntakeId,
      eventRequestId: persist.result.eventRequestId,
      campaignEventLedgerRecordId: persist.result.campaignEventLedgerRecordId,
      ledgerCreated: persist.result.ledgerCreated,
      ledgerDuplicateRisk: persist.result.ledgerDuplicateRisk,
      ledgerScheduleConflict: persist.result.ledgerScheduleConflict,
      publicAssistant,
    });
  }

  return NextResponse.json({
    ok: true,
    mode: "staged",
    stagedId: persist.stagedId,
    workflowIntakeId: null,
    publicAssistant,
  });
}
