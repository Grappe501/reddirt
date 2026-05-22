import type { CalendarSurfaceRow } from "../load-campaign-calendar-events";
import type { HotWashIntelligenceData } from "../hot-wash-intelligence/hot-wash-intelligence-types";
import { loadCountyMemory, saveCountyMemory, emptyCountyMemory } from "./county-memory-store";
import type { CountyMemoryRecord } from "./county-memory-types";

function pushUnique(arr: string[], value: string, max = 24) {
  const v = value.trim();
  if (!v || arr.includes(v)) return;
  arr.push(v);
  while (arr.length > max) arr.shift();
}

function linesFromText(text: string): string[] {
  return text
    .split(/\n|;/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Additive merge — never destructive overwrite of prior county intelligence. */
export async function applyHotWashToCountyMemory(
  row: CalendarSurfaceRow,
  intel: HotWashIntelligenceData,
): Promise<CountyMemoryRecord> {
  const label = row.county?.trim() || row.likelyCity || "Unknown county";
  const prev = await loadCountyMemory(label);
  const mem: CountyMemoryRecord = { ...prev, countyLabel: label };

  mem.eventCount += 1;
  pushUnique(mem.recentEventIds, row.recordId, 12);

  for (const issue of linesFromText(intel.messaging.strongestIssues)) pushUnique(mem.recurringIssues, issue);
  for (const issue of linesFromText(intel.messaging.localIssuePatterns)) pushUnique(mem.recurringIssues, issue);
  for (const v of linesFromText(intel.relationships.volunteerProspects)) pushUnique(mem.recurringVolunteers, v);
  for (const h of linesFromText(row.factCard.who.hostName ?? "")) pushUnique(mem.recurringHosts, h);
  for (const d of linesFromText(intel.relationships.donorProspects)) pushUnique(mem.recurringDonors, d);
  if (intel.messaging.applauseLines?.trim()) pushUnique(mem.strongestMessaging, intel.messaging.applauseLines.slice(0, 120));
  if (intel.lessons.whatFailed?.trim()) pushUnique(mem.weakMessaging, intel.lessons.whatFailed.slice(0, 120));
  if (intel.outcome.attendanceEstimate?.trim()) {
    pushUnique(mem.turnoutPatterns, `${row.dateYmd}: ${intel.outcome.attendanceEstimate}`);
  }
  if (row.likelyCity?.trim()) pushUnique(mem.geographyPatterns, `${row.likelyCity} (${row.dateYmd})`);
  const fmt = row.factCard.why.eventType ?? row.classificationLabel;
  if (fmt) pushUnique(mem.bestEventFormats, `${fmt} — ${intel.outcome.strategicValue || "reviewed"}`);
  if (intel.outcome.organizerPerformance?.trim()) {
    pushUnique(mem.organizerReliability, `${row.dateYmd}: ${intel.outcome.organizerPerformance}`);
  }

  mem.additiveLog.push({
    at: new Date().toISOString(),
    sourceEventId: row.recordId,
    eventTitle: row.calendar.title,
    summary: intel.executiveSummary?.slice(0, 280) || "Hot wash intelligence saved",
  });
  while (mem.additiveLog.length > 40) mem.additiveLog.shift();

  await saveCountyMemory(mem);
  return mem;
}

export function summarizeCountyTrends(records: CountyMemoryRecord[]): {
  topIssues: string[];
  topFormats: string[];
  countiesWithSignals: number;
} {
  const issues: string[] = [];
  const formats: string[] = [];
  for (const r of records) {
    issues.push(...r.recurringIssues.slice(-2));
    formats.push(...r.bestEventFormats.slice(-1));
  }
  return {
    topIssues: [...new Set(issues)].slice(0, 8),
    topFormats: [...new Set(formats)].slice(0, 6),
    countiesWithSignals: records.filter((r) => r.eventCount > 0).length,
  };
}
