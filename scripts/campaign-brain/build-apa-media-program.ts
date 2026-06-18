/**
 * APA media program — statewide monthly LTE + visit-linked print/radio queue.
 *
 * Usage: npm run campaign-brain:apa-media:build
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_DATA, BRAIN_ROOT, readJson } from "./lib/inputs";

const SOURCE = path.join(BRAIN_DATA, "media-outreach/apa-media-program.source.json");
const OUT_DATA = path.join(BRAIN_DATA, "media-outreach/apa-media-program.json");
const OUT_DOCS = path.join(BRAIN_ROOT, "media-outreach");

type Source = {
  version: number;
  updatedAt: string;
  note: string;
  partner: { name: string; shortName: string; relationshipStatus: string; contactNote: string };
  programs: Record<
    string,
    {
      id: string;
      label: string;
      cadence: string;
      costPerMonth?: number;
      monthsBudgeted?: number;
      campaignTotal?: number;
      papersPerVisit?: number;
      preferredUnit?: string;
      leadTimeDays?: number;
      leadTimeDaysBeforeVisit?: number;
      pricingStatus?: string;
      pricingNote?: string;
      budgetPoolNote?: string;
      status?: string;
      author?: string;
      approvalRequired: boolean;
      notes?: string;
    }
  >;
  ruralVisitCriteria: { countyTiers: string[]; alsoIncludeTiers: string[]; tierBWhenPrimaryLaneMatches: string[] };
  monthlyLteSchedule: Array<{
    month: string;
    label: string;
    targetSendDate: string;
    theme: string;
    status: string;
  }>;
};

type Stop = {
  eventId: string;
  eventName: string;
  county: string;
  city: string;
  date: string;
  countyTier: string;
  primaryLane: string;
  assignment: string;
  verificationStatus: string;
};

function daysUntil(dateYmd: string, ref = "2026-06-15"): number {
  const t = new Date(`${ref}T12:00:00`);
  const d = new Date(`${dateYmd}T12:00:00`);
  return Math.round((d.getTime() - t.getTime()) / 86_400_000);
}

function normalizeCounty(c: string): string {
  return c.replace(/\s+County$/i, "").trim();
}

function isRuralStop(stop: Stop, criteria: Source["ruralVisitCriteria"]): boolean {
  if (criteria.countyTiers.includes(stop.countyTier)) return true;
  if (criteria.alsoIncludeTiers.includes(stop.countyTier)) {
    return criteria.tierBWhenPrimaryLaneMatches.some((lane) => stop.primaryLane.includes(lane));
  }
  return false;
}

function printStatus(stop: Stop, leadDays: number, ref: string): string {
  const days = daysUntil(stop.date, ref);
  if (days < 0) return "past";
  if (days <= leadDays) return "urgent_book";
  if (days <= leadDays + 7) return "quote_needed";
  return "planned";
}

function radioStatus(stop: Stop, leadDays: number, ref: string): string {
  const days = daysUntil(stop.date, ref);
  if (days < 0) return "past";
  if (days <= leadDays) return "quote_urgent";
  if (days <= 21) return "research_stations";
  return "queued";
}

function nextActionForVisit(
  stop: Stop,
  printLead: number,
  radioLead: number,
  ref: string,
): string {
  const ps = printStatus(stop, printLead, ref);
  const rs = radioStatus(stop, radioLead, ref);
  if (ps === "urgent_book" || rs === "quote_urgent")
    return "Contact APA immediately — visit within lead window";
  if (ps === "quote_needed") return "Request APA quote — 2 local papers · 1/8 page or best deal";
  if (rs === "research_stations") return "Identify rural radio stations · request APA or direct quotes";
  return "Hold for APA visit-ad package when date firms up";
}

function buildMarkdown(payload: ReturnType<typeof buildPayload>): string {
  const { summary, monthlyLte, visitPlacements, programs, partner } = payload;
  const visitRows = visitPlacements
    .slice(0, 40)
    .map(
      (v) =>
        `| ${v.visitDate} | ${v.eventName} | ${v.county} | ${v.printStatus} | ${v.radioStatus} | ${v.nextAction} |`,
    )
    .join("\n");

  const lteRows = monthlyLte
    .map((m) => `| ${m.label} | ${m.targetSendDate} | $300 | ${m.theme} | ${m.status} |`)
    .join("\n");

  return `# APA Media Program

> ${payload.disclaimer}

**Partner:** ${partner.name} (${partner.shortName}) · ${partner.relationshipStatus}

## Programs

| Program | Cadence | Budget |
| ------- | ------- | ------: |
| Statewide LTE (candidate byline) | Monthly | $${programs.statewideLte.costPerMonth}/mo · $${programs.statewideLte.campaignTotal} campaign |
| Visit local print (2 papers) | Per rural visit | ${programs.visitLocalPrint.budgetPoolNote} |
| Rural radio | Per rural visit | ${programs.visitRuralRadio.budgetPoolNote} |

## Monthly statewide LTE queue

| Month | Target send | Cost | Theme | Status |
| ----- | ----------- | ---: | ----- | ------ |
${lteRows}

## Visit-adjacent placements (${summary.ruralVisitCount} rural stops queued)

| Visit date | Event | County | Print | Radio | Next action |
| ---------- | ----- | ------ | ----- | ----- | ----------- |
${visitRows || "| _None in horizon_ | — | — | — | — | — |"}

## Summary

| Metric | Count |
| ------ | ----: |
| Rural visits in queue | ${summary.ruralVisitCount} |
| Print urgent (≤14d lead) | ${summary.printUrgentCount} |
| Radio research window (≤21d) | ${summary.radioResearchCount} |
| LTE drafts needed | ${summary.lteDraftNeeded} |

Rebuild: \`npm run campaign-brain:apa-media:build\`
`;
}

function buildPayload(source: Source, stops: Stop[], refDate: string) {
  const printLead = source.programs.visitLocalPrint.leadTimeDaysBeforeVisit ?? 14;
  const radioLead = source.programs.visitRuralRadio.leadTimeDaysBeforeVisit ?? 10;

  const futureStops = stops
    .filter((s) => s.date >= refDate && s.verificationStatus !== "missing")
    .sort((a, b) => a.date.localeCompare(b.date));

  const visitPlacements = futureStops
    .filter((s) => isRuralStop(s, source.ruralVisitCriteria))
    .map((s) => ({
      eventId: s.eventId,
      eventName: s.eventName,
      county: normalizeCounty(s.county),
      city: s.city,
      visitDate: s.date,
      countyTier: s.countyTier,
      assignment: s.assignment,
      papersTargeted: source.programs.visitLocalPrint.papersPerVisit ?? 2,
      printUnit: source.programs.visitLocalPrint.preferredUnit ?? "one_eighth_page",
      printStatus: printStatus(s, printLead, refDate),
      radioStatus: radioStatus(s, radioLead, refDate),
      apaCoordination: true,
      nextAction: nextActionForVisit(s, printLead, radioLead, refDate),
    }));

  const printUrgentCount = visitPlacements.filter((v) => v.printStatus === "urgent_book" || v.printStatus === "quote_needed").length;
  const radioResearchCount = visitPlacements.filter((v) =>
    ["research_stations", "quote_urgent"].includes(v.radioStatus),
  ).length;
  const lteDraftNeeded = source.monthlyLteSchedule.filter((m) =>
    ["draft_needed", "not_started"].includes(m.status),
  ).length;

  return {
    generatedAt: new Date().toISOString(),
    referenceDate: refDate,
    disclaimer: source.note,
    partner: source.partner,
    programs: source.programs,
    monthlyLte: source.monthlyLteSchedule,
    visitPlacements,
    summary: {
      ruralVisitCount: visitPlacements.length,
      printUrgentCount,
      radioResearchCount,
      lteDraftNeeded,
      statewideLteMonthlyCost: source.programs.statewideLte.costPerMonth ?? 300,
      statewideLteCampaignTotal: source.programs.statewideLte.campaignTotal ?? 1800,
    },
  };
}

function main() {
  mkdirSync(path.dirname(OUT_DATA), { recursive: true });
  mkdirSync(OUT_DOCS, { recursive: true });

  const source = readJson<Source>(SOURCE);
  if (!source) throw new Error(`Missing ${SOURCE}`);

  const queue = readJson<{ stops: Stop[] }>(path.join(BRAIN_DATA, "upcoming-stops-activation-queue.json"));
  const locked = readJson<{ events: Array<{ id: string; eventName: string; date: string; county: string; city: string }> }>(
    path.join(BRAIN_DATA, "locked-events-steve.json"),
  );

  const refDate = source.updatedAt ?? "2026-06-15";

  const lockedStops: Stop[] = (locked?.events ?? [])
    .filter((e) => e.date >= refDate)
    .map((e) => ({
      eventId: e.id,
      eventName: e.eventName,
      county: e.county,
      city: e.city,
      date: e.date,
      countyTier: "B",
      primaryLane: "Relationship + persuasion",
      assignment: "Kelly",
      verificationStatus: "verified",
    }));

  const queueStops = queue?.stops ?? [];
  const byId = new Map<string, Stop>();
  for (const s of [...queueStops, ...lockedStops]) {
    const existing = byId.get(s.eventId);
    if (!existing || s.verificationStatus === "verified") byId.set(s.eventId, s);
  }

  const payload = buildPayload(source, [...byId.values()], refDate);

  writeFileSync(OUT_DATA, JSON.stringify(payload, null, 2), "utf8");
  writeFileSync(path.join(OUT_DOCS, "APA-MEDIA-PROGRAM.md"), buildMarkdown(payload), "utf8");

  console.log(
    `APA media program: ${payload.summary.ruralVisitCount} rural visit placements · ${payload.monthlyLte.length} monthly LTE slots · $${payload.summary.statewideLteCampaignTotal} statewide LTE budget`,
  );
}

main();
