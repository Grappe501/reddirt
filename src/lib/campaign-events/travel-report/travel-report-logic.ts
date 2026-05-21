import { CAMPAIGN_EVENT_REIMBURSEMENT_RATE_USD_PER_MILE } from "../constants";
import type { WorkbenchEventRow } from "../merge-persisted-row";
import type { TravelReportFilter, TravelReportLine, TravelReportSummary, TravelReportTotals } from "./travel-report-types";

const PHYSICAL_TYPES = new Set([
  "campaign_event",
  "community_event",
  "fair_festival",
  "county_party_meeting",
  "fundraiser",
  "house_meet_greet",
  "media",
]);

/** Tentative website intake stays visible on travel log but not in finalized reimbursement until approved. */
export function isReimbursementEligible(row: WorkbenchEventRow): boolean {
  if (row.isWebsiteIntake && row.rawEventStatus === "TENTATIVE" && row.rawDecision !== "approved") return false;
  return true;
}

export function isTravelReportCandidate(row: WorkbenchEventRow): boolean {
  if (row.roundTripMiles != null && row.roundTripMiles > 0) return true;
  if (row.reimbursementAmount != null && row.reimbursementAmount > 0) return true;
  const t = row.factCard.travel;
  if (t.assumedOriginCity?.trim() || t.assumedDestinationCity?.trim() || t.originOverrideCity?.trim() || t.destinationOverrideCity?.trim()) {
    return true;
  }
  if (row.travelLine && !row.travelLine.includes("(city TBD)") && row.travelLine.includes("→")) return true;
  if (PHYSICAL_TYPES.has(row.classification)) return true;
  if (row.rawEventStatus !== "CANCELLED" && row.classification !== "virtual_statewide" && row.classification !== "personal_admin") {
    return true;
  }
  return false;
}

export function rowToTravelLine(row: WorkbenchEventRow): TravelReportLine {
  const t = row.factCard.travel;
  const origin =
    t.originOverrideCity?.trim() ||
    t.assumedOriginCity?.trim() ||
    row.travelOrigin.originCity ||
    row.travelOrigin.originLabel;
  const dest =
    t.destinationOverrideCity?.trim() ||
    t.assumedDestinationCity?.trim() ||
    row.likelyCity ||
    "TBD";
  const rate = t.reimbursementRate ?? CAMPAIGN_EVENT_REIMBURSEMENT_RATE_USD_PER_MILE;
  const miles = row.roundTripMiles ?? t.roundTripMiles ?? null;
  const reimbursement = row.reimbursementAmount ?? t.reimbursementAmount ?? (miles != null ? miles * rate : null);

  return {
    recordId: row.recordId,
    dateYmd: row.dateYmd,
    timeLabel: row.timeLabel,
    title: row.calendar.title,
    city: row.likelyCity ?? "",
    county: row.county ?? "",
    origin,
    destination: dest,
    miles,
    rate,
    reimbursement: reimbursement != null ? Math.round(reimbursement * 100) / 100 : null,
    reviewStatus: row.reviewStatus,
    decisionLabel: row.decisionLabel,
    rawDecision: row.rawDecision,
    workHoursWarning: row.hasWorkHoursWarning,
    lrOriginNote: row.travelOrigin.rule === "little_rock_tue_fri",
    row,
  };
}

export function filterTravelLines(lines: TravelReportLine[], filter: TravelReportFilter): TravelReportLine[] {
  switch (filter) {
    case "approved_only":
      return lines.filter((l) => l.rawDecision === "approved");
    case "needs_travel_info":
      return lines.filter((l) => !l.city?.trim() || !l.county?.trim() || l.miles == null);
    case "reimbursable_only":
      return lines.filter((l) => l.miles != null && l.miles > 0);
    default:
      return lines;
  }
}

export function buildTravelLines(rows: WorkbenchEventRow[]): TravelReportLine[] {
  return rows.filter(isTravelReportCandidate).map(rowToTravelLine).sort((a, b) => {
    const d = a.dateYmd.localeCompare(b.dateYmd);
    if (d !== 0) return d;
    return a.timeLabel.localeCompare(b.timeLabel);
  });
}

export function computeTravelTotals(lines: TravelReportLine[]): TravelReportTotals {
  let totalMiles = 0;
  let totalReimbursement = 0;
  let approvedMiles = 0;
  let approvedReimbursement = 0;
  let needsReviewCount = 0;
  let missingCity = 0;
  let missingCounty = 0;
  let missingMileage = 0;
  let unapprovedReimbursementCount = 0;
  let workHoursWarnings = 0;
  let lrOriginEvents = 0;

  for (const l of lines) {
    if (l.miles != null) totalMiles += l.miles;
    if (l.reimbursement != null) totalReimbursement += l.reimbursement;
    if (l.rawDecision === "approved") {
      if (l.miles != null) approvedMiles += l.miles;
      if (l.reimbursement != null) approvedReimbursement += l.reimbursement;
    }
    if (!l.rawDecision || l.rawDecision === "hold" || l.rawDecision === "request_confirmation") needsReviewCount++;
    if (!l.city?.trim()) missingCity++;
    if (!l.county?.trim()) missingCounty++;
    if (l.miles == null) missingMileage++;
    if (l.reimbursement != null && l.rawDecision !== "approved") unapprovedReimbursementCount++;
    if (l.workHoursWarning) workHoursWarnings++;
    if (l.lrOriginNote) lrOriginEvents++;
  }

  return {
    lineCount: lines.length,
    totalMiles: Math.round(totalMiles * 10) / 10,
    totalReimbursement: Math.round(totalReimbursement * 100) / 100,
    approvedMiles: Math.round(approvedMiles * 10) / 10,
    approvedReimbursement: Math.round(approvedReimbursement * 100) / 100,
    needsReviewCount,
    missingCity,
    missingCounty,
    missingMileage,
    unapprovedReimbursementCount,
    workHoursWarnings,
    lrOriginEvents,
  };
}

export function buildTravelReportSummary(month: string, lines: TravelReportLine[]): TravelReportSummary {
  const totals = computeTravelTotals(lines);
  const [y, m] = month.split("-");
  const monthLabel = new Date(Number(y), Number(m) - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });

  const fmtUsd = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const narrative = `${monthLabel} has ${totals.lineCount} travel-related campaign event${totals.lineCount === 1 ? "" : "s"}, ${totals.totalMiles.toFixed(1)} estimated miles, and ${fmtUsd(totals.totalReimbursement)} estimated reimbursement. ${totals.needsReviewCount} event${totals.needsReviewCount === 1 ? "" : "s"} still need approval or travel review.`;

  const bullets: string[] = [];
  if (totals.missingCity) bullets.push(`${totals.missingCity} missing city`);
  if (totals.missingCounty) bullets.push(`${totals.missingCounty} missing county`);
  if (totals.missingMileage) bullets.push(`${totals.missingMileage} missing mileage`);
  if (totals.unapprovedReimbursementCount) bullets.push(`${totals.unapprovedReimbursementCount} with reimbursement not yet approved`);
  if (totals.workHoursWarnings) bullets.push(`${totals.workHoursWarnings} work-hours travel warnings`);
  if (totals.lrOriginEvents) bullets.push(`${totals.lrOriginEvents} events use Tuesday/Friday Little Rock origin rule`);

  return { monthLabel, narrative, bullets, totals };
}

export function travelLinesToCsv(lines: TravelReportLine[]): string {
  const headers = [
    "date",
    "time",
    "title",
    "city",
    "county",
    "origin",
    "destination",
    "miles",
    "rate",
    "reimbursement",
    "review_status",
    "decision",
    "record_id",
  ];
  const esc = (v: string | number | null) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = lines.map((l) =>
    [
      l.dateYmd,
      l.timeLabel,
      l.title,
      l.city,
      l.county,
      l.origin,
      l.destination,
      l.miles ?? "",
      l.rate,
      l.reimbursement ?? "",
      l.reviewStatus,
      l.decisionLabel ?? "",
      l.recordId,
    ]
      .map(esc)
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}
