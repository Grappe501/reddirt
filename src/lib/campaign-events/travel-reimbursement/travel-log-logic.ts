import type { WorkbenchEventRow } from "../merge-persisted-row";
import { buildTravelLines, isTravelReportCandidate } from "../travel-report/travel-report-logic";
import type { TravelReportLine } from "../travel-report/travel-report-types";

export type TravelLogFilter =
  | "all"
  | "needs_city_county"
  | "needs_mileage"
  | "unreviewed"
  | "approved"
  | "denied"
  | "hold"
  | "reimbursable_only"
  | "needs_approval";

export type TravelLogLine = TravelReportLine & {
  dayOfWeek: string;
  zip: string;
  eventStatus: string;
  travelStatus: string;
  missingFields: string[];
  editHref: string;
};

export function filterRowsByDateRange(
  rows: WorkbenchEventRow[],
  startYmd?: string | null,
  endYmd?: string | null,
): WorkbenchEventRow[] {
  if (!startYmd && !endYmd) return rows;
  return rows.filter((r) => {
    if (startYmd && r.dateYmd < startYmd) return false;
    if (endYmd && r.dateYmd > endYmd) return false;
    return true;
  });
}

function dayOfWeek(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d, 12)),
  );
}

function travelStatusLabel(row: WorkbenchEventRow): string {
  if (!row.rawDecision) return "Needs approval";
  if (row.rawDecision === "approved") return "Approved for reimbursement";
  if (row.rawDecision === "denied") return "Denied — retained, not paid";
  if (row.rawDecision === "hold") return "On hold";
  if (row.rawDecision === "request_confirmation") return "Needs more information";
  return row.decisionLabel ?? row.rawDecision;
}

function missingFieldsForRow(row: WorkbenchEventRow): string[] {
  const missing: string[] = [];
  if (!row.likelyCity?.trim()) missing.push("city");
  if (!row.county?.trim()) missing.push("county");
  if (!row.factCard.where.zipCode?.trim()) missing.push("ZIP");
  if (isTravelReportCandidate(row) && row.roundTripMiles == null) missing.push("mileage");
  if (!row.rawDecision) missing.push("decision");
  return missing;
}

export function rowToTravelLogLine(row: WorkbenchEventRow, month: string): TravelLogLine {
  const base = buildTravelLines([row])[0];
  if (!base) {
    const t = row.factCard.travel;
    return {
      recordId: row.recordId,
      dateYmd: row.dateYmd,
      timeLabel: row.timeLabel,
      title: row.calendar.title,
      city: row.likelyCity ?? "",
      county: row.county ?? "",
      origin: t.assumedOriginCity ?? "",
      destination: t.assumedDestinationCity ?? row.likelyCity ?? "",
      miles: row.roundTripMiles,
      rate: t.reimbursementRate ?? 0.7,
      reimbursement: row.reimbursementAmount,
      reviewStatus: row.reviewStatus,
      decisionLabel: row.decisionLabel,
      rawDecision: row.rawDecision,
      workHoursWarning: row.hasWorkHoursWarning,
      lrOriginNote: false,
      row,
      dayOfWeek: dayOfWeek(row.dateYmd),
      zip: row.factCard.where.zipCode ?? "",
      eventStatus: row.rawEventStatus,
      travelStatus: travelStatusLabel(row),
      missingFields: missingFieldsForRow(row),
      editHref: `/admin/campaign-events/${row.recordId}?month=${month}`,
    };
  }
  return {
    ...base,
    dayOfWeek: dayOfWeek(base.dateYmd),
    zip: row.factCard.where.zipCode ?? "",
    eventStatus: row.rawEventStatus,
    travelStatus: travelStatusLabel(row),
    missingFields: missingFieldsForRow(row),
    editHref: `/admin/campaign-events/${row.recordId}?month=${month}`,
  };
}

export function buildTravelLogLines(rows: WorkbenchEventRow[], month: string): TravelLogLine[] {
  return rows
    .filter(isTravelReportCandidate)
    .map((r) => rowToTravelLogLine(r, month))
    .sort((a, b) => a.dateYmd.localeCompare(b.dateYmd) || a.timeLabel.localeCompare(b.timeLabel));
}

export function filterTravelLogLines(lines: TravelLogLine[], filter: TravelLogFilter): TravelLogLine[] {
  switch (filter) {
    case "needs_city_county":
      return lines.filter((l) => !l.city?.trim() || !l.county?.trim());
    case "needs_mileage":
      return lines.filter((l) => l.miles == null);
    case "unreviewed":
      return lines.filter((l) => !l.rawDecision);
    case "approved":
      return lines.filter((l) => l.rawDecision === "approved");
    case "denied":
      return lines.filter((l) => l.rawDecision === "denied");
    case "hold":
      return lines.filter((l) => l.rawDecision === "hold" || l.rawDecision === "request_confirmation");
    case "reimbursable_only":
      return lines.filter((l) => l.miles != null && l.miles > 0);
    case "needs_approval":
      return lines.filter(
        (l) => !l.rawDecision || l.rawDecision === "hold" || l.rawDecision === "request_confirmation",
      );
    default:
      return lines;
  }
}

export function travelLogLinesToCsv(lines: TravelLogLine[]): string {
  const headers = [
    "date",
    "day",
    "time",
    "title",
    "city",
    "county",
    "zip",
    "origin",
    "destination",
    "miles",
    "rate",
    "reimbursement",
    "event_status",
    "travel_status",
    "decision",
    "missing_fields",
    "record_id",
  ];
  const esc = (v: string | number | null) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = lines.map((l) =>
    [
      l.dateYmd,
      l.dayOfWeek,
      l.timeLabel,
      l.title,
      l.city,
      l.county,
      l.zip,
      l.origin,
      l.destination,
      l.miles ?? "",
      l.rate,
      l.reimbursement ?? "",
      l.eventStatus,
      l.travelStatus,
      l.decisionLabel ?? "",
      l.missingFields.join("; "),
      l.recordId,
    ]
      .map(esc)
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}
