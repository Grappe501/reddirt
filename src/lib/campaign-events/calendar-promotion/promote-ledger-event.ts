import {
  findKellyConfirmedCalendarSource,
  findKellyTentativeCalendarSource,
} from "@/lib/calendar/kelly-google-calendar-policy";
import { upsertGoogleEvent } from "@/lib/integrations/google/calendar";
import { prisma } from "@/lib/db";
import { loadCalendarEventDrilldown } from "../load-campaign-calendar-events";
import { recordPromotionObservation } from "./record-promotion-observation";
import { assertOfficialCalendarSafetyBlocker } from "./sprint5-tool-helpers";
import { buildGooglePayloadPreview, previewToGoogleEventBody } from "./build-google-payload";
import { getCalendarPromotionConfig } from "./promotion-config";
import { onEventOfficialPromoted } from "@/lib/volunteers/ops-automation";

import { appendPromotionAudit, persistPromotionFailure, persistPromotionSuccess } from "./promotion-audit";
import { assessPromotionReadiness } from "./promotion-readiness";
import { parsePromotionMeta } from "./promotion-meta";
import type { PromotionAttemptResult, PromotionTargetLane } from "./promotion-types";

export async function promoteLedgerEventToGoogle(input: {
  recordId: string;
  targetLane: PromotionTargetLane;
  actor: string;
  dryRun?: boolean;
  acknowledgeWarnings?: boolean;
}): Promise<PromotionAttemptResult> {
  const loaded = await loadCalendarEventDrilldown(input.recordId);
  if (!loaded) {
    return {
      ok: false,
      dryRun: Boolean(input.dryRun),
      status: "failed",
      targetLane: input.targetLane,
      error: "Event not found",
      readiness: {
        level: "BLOCKED",
        blockers: ["Record not found"],
        warnings: [],
        missingItems: [],
        promotionStatus: "PROMOTION_BLOCKED",
        suggestedTargetLane: null,
      },
    };
  }

  const { row, record } = loaded;
  const readiness = await assessPromotionReadiness(record, row, input.targetLane);
  const payload = await buildGooglePayloadPreview(record, row, input.targetLane);
  const config = await getCalendarPromotionConfig();
  const safety = assertOfficialCalendarSafetyBlocker("promote-ledger-event");

  if (input.dryRun) {
    await appendPromotionAudit(record.id, {
      at: new Date().toISOString(),
      actor: input.actor,
      action: "dry_run",
      targetLane: input.targetLane,
      message: "Payload preview only — no Google write",
    });
    return {
      ok: true,
      dryRun: true,
      status: "dry_run",
      targetLane: input.targetLane,
      payload,
      readiness,
    };
  }

  if (!config.readyToWrite) {
    await appendPromotionAudit(record.id, {
      at: new Date().toISOString(),
      actor: input.actor,
      action: "promotion_blocked",
      targetLane: input.targetLane,
      message: config.disabledReason ?? "Write disabled",
    });
    return {
      ok: false,
      dryRun: false,
      status: "skipped_disabled",
      targetLane: input.targetLane,
      error: config.disabledReason ?? undefined,
      payload,
      readiness,
    };
  }

  if (readiness.level === "BLOCKED") {
    await appendPromotionAudit(record.id, {
      at: new Date().toISOString(),
      actor: input.actor,
      action: "promotion_blocked",
      targetLane: input.targetLane,
      message: readiness.blockers.join("; "),
    });
    return {
      ok: false,
      dryRun: false,
      status: "blocked",
      targetLane: input.targetLane,
      error: readiness.blockers.join("; "),
      payload,
      readiness,
    };
  }

  if (readiness.level === "WARNING" && !input.acknowledgeWarnings) {
    await appendPromotionAudit(record.id, {
      at: new Date().toISOString(),
      actor: input.actor,
      action: "promotion_blocked",
      targetLane: input.targetLane,
      message: `Warnings require acknowledgment: ${readiness.warnings.join("; ")}`,
    });
    return {
      ok: false,
      dryRun: false,
      status: "blocked",
      targetLane: input.targetLane,
      error: "Acknowledge warnings before promoting",
      payload,
      readiness,
    };
  }

  if (readiness.warnings.length && input.acknowledgeWarnings) {
    await appendPromotionAudit(record.id, {
      at: new Date().toISOString(),
      actor: input.actor,
      action: "operator_overrode_warning",
      targetLane: input.targetLane,
      message: readiness.warnings.join("; "),
    });
  }

  const source =
    input.targetLane === "official" ? await findKellyConfirmedCalendarSource() : await findKellyTentativeCalendarSource();
  if (!source) {
    return {
      ok: false,
      dryRun: false,
      status: "blocked",
      targetLane: input.targetLane,
      error: "Calendar source not found",
      payload,
      readiness,
    };
  }

  const meta = parsePromotionMeta(record.factCard);
  const existingId =
    input.targetLane === "official" ? meta.officialGoogleEventId ?? record.googleEventId : meta.tentativeGoogleEventId ?? record.googleEventId;

  await appendPromotionAudit(record.id, {
    at: new Date().toISOString(),
    actor: input.actor,
    action: "promotion_attempted",
    targetLane: input.targetLane,
    message: safety.context,
  });

  try {
    const body = previewToGoogleEventBody(record, payload, existingId);
    const g = await upsertGoogleEvent(source, body);
    const gid = g.id;
    if (!gid) throw new Error("Google returned no event id");

    await persistPromotionSuccess({
      recordId: record.id,
      targetLane: input.targetLane,
      actor: input.actor,
      googleEventId: gid,
      googleEventUrl: g.htmlLink ?? null,
      calendarSourceId: source.id,
      externalCalendarId: source.externalCalendarId,
    });

    await recordPromotionObservation({
      recordId: record.id,
      toolId: input.targetLane === "official" ? "official-calendar-router" : "tentative-calendar-router",
      event: input.targetLane === "official" ? "official_promoted" : "tentative_promoted",
      actor: input.actor,
      meta: { googleEventId: gid },
    });
    await recordPromotionObservation({
      recordId: record.id,
      toolId: "promotion-audit-logger",
      event: "promotion_succeeded",
      actor: input.actor,
    });

    if (input.targetLane === "official") {
      await onEventOfficialPromoted({
        recordId: record.id,
        calendarSourceId: record.calendarSourceId,
      }).catch(() => undefined);
    }

    return {
      ok: true,
      dryRun: false,
      status: "succeeded",
      targetLane: input.targetLane,
      googleEventId: gid,
      googleEventUrl: g.htmlLink ?? undefined,
      payload,
      readiness,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await persistPromotionFailure({
      recordId: record.id,
      targetLane: input.targetLane,
      actor: input.actor,
      error: msg,
    });
    return {
      ok: false,
      dryRun: false,
      status: "failed",
      targetLane: input.targetLane,
      error: msg,
      payload,
      readiness,
    };
  }
}
