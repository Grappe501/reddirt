/**
 * Event verification status — calendar intelligence layer.
 *
 * Effective rank = Campaign Impact Score × Verification Confidence
 */

export type EventVerificationStatus = "verified" | "tentative" | "historical" | "missing";

export type EventVerificationRecord = {
  eventId: string;
  status: EventVerificationStatus;
  confidence: number;
  eventDate: string | null;
  dateSource?: string;
  notes?: string;
};

/** Confidence multipliers for effective scoring. */
export const VERIFICATION_CONFIDENCE: Record<EventVerificationStatus, number> = {
  verified: 1.0,
  tentative: 0.75,
  historical: 0.55,
  missing: 0.35,
};

export function effectiveOpportunityScore(campaignImpactScore: number, confidence: number): number {
  return Math.round(campaignImpactScore * confidence);
}

export function statusLabel(status: EventVerificationStatus): string {
  const labels: Record<EventVerificationStatus, string> = {
    verified: "Date confirmed",
    tentative: "Expected but not confirmed",
    historical: "Last year's date only",
    missing: "No usable date",
  };
  return labels[status];
}

type VerifyInput = {
  eventId: string;
  rawVerificationStatus?: string;
  reconcileStatus?: string;
  confirmedDate?: string | null;
  historicalDate?: string | null;
  overrideStatus?: EventVerificationStatus;
};

/** Classify event date verification from inventory + festival leads + overrides. */
export function classifyEventVerification(input: VerifyInput): EventVerificationRecord {
  if (input.overrideStatus) {
    const status = input.overrideStatus;
    return {
      eventId: input.eventId,
      status,
      confidence: VERIFICATION_CONFIDENCE[status],
      eventDate: input.confirmedDate ?? input.historicalDate ?? null,
      dateSource: "override",
    };
  }

  if (input.confirmedDate) {
    const tentative =
      input.reconcileStatus === "needs_confirmation" ||
      input.rawVerificationStatus === "needs_confirmation" ||
      input.rawVerificationStatus === "tentative";
    return {
      eventId: input.eventId,
      status: tentative ? "tentative" : "verified",
      confidence: VERIFICATION_CONFIDENCE[tentative ? "tentative" : "verified"],
      eventDate: input.confirmedDate,
      dateSource: tentative ? "festival_lead_unconfirmed" : "confirmed_date",
    };
  }

  if (input.historicalDate) {
    return {
      eventId: input.eventId,
      status: "historical",
      confidence: VERIFICATION_CONFIDENCE.historical,
      eventDate: input.historicalDate,
      dateSource: "historical_pattern",
      notes: "Use for planning only — confirm 2026 schedule in field",
    };
  }

  const raw = (input.rawVerificationStatus ?? "").toLowerCase();
  if (raw === "verified" || raw === "date_confirmed") {
    return {
      eventId: input.eventId,
      status: "verified",
      confidence: VERIFICATION_CONFIDENCE.verified,
      eventDate: null,
      dateSource: raw,
    };
  }

  if (
    raw === "tentative" ||
    raw === "needs_confirmation" ||
    input.reconcileStatus === "needs_confirmation" ||
    input.reconcileStatus === "web_supplemental_lead"
  ) {
    return {
      eventId: input.eventId,
      status: "tentative",
      confidence: VERIFICATION_CONFIDENCE.tentative,
      eventDate: null,
      dateSource: raw || input.reconcileStatus,
    };
  }

  return {
    eventId: input.eventId,
    status: "missing",
    confidence: VERIFICATION_CONFIDENCE.missing,
    eventDate: null,
    dateSource: raw || "date_not_posted",
  };
}

export function verificationSummary(records: EventVerificationRecord[]): Record<EventVerificationStatus, number> {
  const summary: Record<EventVerificationStatus, number> = {
    verified: 0,
    tentative: 0,
    historical: 0,
    missing: 0,
  };
  for (const r of records) summary[r.status]++;
  return summary;
}
