import type { CalendarSurfaceRow } from "../load-campaign-calendar-events";
import type { HotWashMediaRecord } from "../media/hot-wash-media-types";
import type { HotWashIntelligenceData } from "./hot-wash-intelligence-types";
import type { EventBlueprint, EventBlueprintType } from "../event-blueprints/blueprint-types";
import { upsertBlueprint } from "../event-blueprints/blueprint-store";

export function scoreEventEnergy(intel: HotWashIntelligenceData): { score: number; label: string } {
  const e = intel.outcome.energyScore?.trim();
  if (!e) return { score: 0, label: "Not scored" };
  const n = parseInt(e, 10);
  if (!Number.isNaN(n)) {
    return { score: Math.min(10, Math.max(0, n)), label: `${n}/10` };
  }
  if (/high|great|strong/i.test(e)) return { score: 8, label: "High" };
  if (/low|flat|weak/i.test(e)) return { score: 3, label: "Low" };
  return { score: 5, label: e };
}

export function buildHotWashExecutiveSummary(row: CalendarSurfaceRow, intel: HotWashIntelligenceData): string {
  const parts = [
    `${row.calendar.title} (${row.dateYmd}) in ${row.likelyCity ?? "TBD"}.`,
    intel.outcome.attendanceEstimate ? `Attendance: ${intel.outcome.attendanceEstimate}.` : "",
    intel.outcome.strategicValue ? `Value: ${intel.outcome.strategicValue}.` : "",
    intel.lessons.whatWorked ? `Worked: ${intel.lessons.whatWorked.slice(0, 120)}` : "",
    intel.lessons.whatFailed ? `Failed: ${intel.lessons.whatFailed.slice(0, 120)}` : "",
  ].filter(Boolean);
  return parts.join(" ");
}

export function extractTopFindings(intel: HotWashIntelligenceData): string[] {
  const findings: string[] = [];
  if (intel.messaging.strongestIssues?.trim()) findings.push(`Top issue: ${intel.messaging.strongestIssues.split("\n")[0]}`);
  if (intel.relationships.volunteerProspects?.trim()) findings.push("Volunteer prospects identified");
  if (intel.relationships.donorProspects?.trim()) findings.push("Donor prospects identified");
  if (intel.lessons.whatWorked?.trim()) findings.push(`Strength: ${intel.lessons.whatWorked.split("\n")[0]}`);
  if (intel.lessons.whatFailed?.trim()) findings.push(`Fix next time: ${intel.lessons.whatFailed.split("\n")[0]}`);
  if (intel.countySignals.enthusiasm?.trim()) findings.push(`County enthusiasm: ${intel.countySignals.enthusiasm}`);
  return findings.slice(0, 6);
}

export function buildFollowUpRecommendations(intel: HotWashIntelligenceData): string[] {
  const tasks: string[] = [];
  if (intel.followUp.thankYouNeeded?.trim()) tasks.push(`Thank-you: ${intel.followUp.thankYouNeeded}`);
  if (intel.followUp.hostFollowUp?.trim()) tasks.push(`Host: ${intel.followUp.hostFollowUp}`);
  if (intel.followUp.volunteerOnboarding?.trim()) tasks.push(`Volunteers: ${intel.followUp.volunteerOnboarding}`);
  if (intel.followUp.donorFollowUp?.trim()) tasks.push(`Donors: ${intel.followUp.donorFollowUp}`);
  if (intel.followUp.pressFollowUp?.trim()) tasks.push(`Press: ${intel.followUp.pressFollowUp}`);
  if (intel.followUp.futureEventRecommendation?.trim()) tasks.push(`Next event: ${intel.followUp.futureEventRecommendation}`);
  return tasks.length ? tasks : ["No follow-ups captured — add in Follow-Up section."];
}

export function detectVolunteerProspects(intel: HotWashIntelligenceData): string[] {
  return intel.relationships.volunteerProspects
    .split(/\n|;/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function detectDonorProspects(intel: HotWashIntelligenceData): string[] {
  return intel.relationships.donorProspects
    .split(/\n|;/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function inferBlueprintType(row: CalendarSurfaceRow): EventBlueprintType | null {
  const t = `${row.factCard.why.eventType} ${row.calendar.title}`.toLowerCase();
  if (/house|meet|greet|coffee/.test(t)) return "successful_house_party";
  if (/fundrais|dinner|gal/.test(t)) return "successful_fundraiser";
  if (/speak|forum|debate/.test(t)) return "successful_speaking_event";
  if (/volunteer|canvass|phone/.test(t)) return "successful_volunteer_event";
  if (/county|party|meeting/.test(t)) return "successful_county_meeting";
  return null;
}

export function generateEventBlueprint(row: CalendarSurfaceRow, intel: HotWashIntelligenceData): EventBlueprint | null {
  const type = inferBlueprintType(row);
  if (!type) return null;
  const id = `bp-${type}-${row.recordId.slice(0, 8)}`;
  const bp: EventBlueprint = {
    id,
    type,
    title: `Learned: ${row.calendar.title}`,
    learnedFromEventIds: [row.recordId],
    prepTimeline: "T-7 confirm host · T-3 materials · T-1 volunteer reminder · day-of run of show",
    materials: intel.lessons.whatWorked || "Standard literature + signage kit",
    volunteerNeeds: intel.lessons.volunteerObservations || "See volunteer plan on similar events",
    roomSetup: intel.lessons.venueIssues ? `Avoid: ${intel.lessons.venueIssues}` : "Arrival setup 30–45 min early",
    messaging: intel.messaging.strongestIssues || intel.messaging.applauseLines || "County-specific SOS themes",
    risks: intel.lessons.whatFailed || intel.messaging.oppositionThemes || "Monitor timing and venue constraints",
    idealAttendance: intel.outcome.attendanceEstimate || "Set after first successful run",
    followUpPattern: intel.followUp.futureEventRecommendation || buildFollowUpRecommendations(intel).join("; "),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return bp;
}

export async function persistBlueprintFromEvent(row: CalendarSurfaceRow, intel: HotWashIntelligenceData): Promise<EventBlueprint | null> {
  const bp = generateEventBlueprint(row, intel);
  if (!bp) return null;
  await upsertBlueprint(bp);
  return bp;
}

export function isSuccessfulEvent(intel: HotWashIntelligenceData): boolean {
  const energy = scoreEventEnergy(intel);
  return energy.score >= 6 && Boolean(intel.lessons.whatWorked?.trim());
}

export function estimateCountyMood(intel: HotWashIntelligenceData): string {
  const e = intel.countySignals.enthusiasm?.trim();
  if (e) return e;
  const energy = scoreEventEnergy(intel);
  if (energy.score >= 7) return "Strong enthusiasm signal";
  if (energy.score <= 4) return "Cautious — rebuild energy";
  return "Mixed — needs more county events";
}

export function analyzeAudienceReactions(intel: HotWashIntelligenceData): string {
  return [intel.messaging.strongestReactions, intel.messaging.emotionalTone, intel.messaging.applauseLines]
    .filter(Boolean)
    .join(" · ") || "No audience reaction notes yet";
}

export function buildMessagingIntelligence(intel: HotWashIntelligenceData): HotWashIntelligenceData["messaging"] {
  return { ...intel.messaging };
}

export function observeCandidatePerformance(intel: HotWashIntelligenceData): string {
  return intel.outcome.candidatePerformance?.trim() || "Not recorded — add in Outcome summary";
}

export function observeOrganizerPerformance(intel: HotWashIntelligenceData): string {
  return intel.outcome.organizerPerformance?.trim() || "Not recorded — add in Outcome summary";
}

export function detectRelationshipOpportunities(intel: HotWashIntelligenceData): string[] {
  const opps: string[] = [];
  if (intel.relationships.coalitionOpportunities?.trim()) opps.push("Coalition opportunity");
  if (intel.relationships.influentialAttendees?.trim()) opps.push("Influential attendee follow-up");
  if (intel.relationships.newLeadersMet?.trim()) opps.push("New leader relationship");
  return opps;
}

export function detectIssuePatterns(intel: HotWashIntelligenceData): string[] {
  return [
    ...intel.messaging.strongestIssues.split(/\n/).map((s) => s.trim()).filter(Boolean),
    ...intel.messaging.localIssuePatterns.split(/\n/).map((s) => s.trim()).filter(Boolean),
  ].slice(0, 10);
}

export function scaffoldMediaIntelligenceMeta(item: HotWashMediaRecord): HotWashMediaRecord["intelligence"] {
  const base = item.intelligence ?? {};
  if (item.mediaType === "image") {
    return {
      ...base,
      facesCountPlaceholder: base.facesCountPlaceholder ?? 0,
      signsBannersDetected: base.signsBannersDetected ?? "pending_vision_v2",
      crowdEstimatePlaceholder: base.crowdEstimatePlaceholder ?? "pending_vision_v2",
      ocrPlaceholder: base.ocrPlaceholder ?? "pending_ocr_v2",
    };
  }
  if (item.mediaType === "video") {
    return {
      ...base,
      durationSeconds: base.durationSeconds ?? 0,
      transcriptPlaceholder: base.transcriptPlaceholder ?? "pending_transcription_v2",
      clipMarkers: base.clipMarkers ?? [],
      speechDetectionPlaceholder: base.speechDetectionPlaceholder ?? "pending_v2",
      keyMomentsPlaceholder: base.keyMomentsPlaceholder ?? [],
    };
  }
  if (item.mediaType === "speech" || item.mediaType === "audio") {
    return {
      ...base,
      transcriptPlaceholder: base.transcriptPlaceholder ?? "pending_transcription_v2",
      quoteExtractionPlaceholder: base.quoteExtractionPlaceholder ?? [],
      issueTags: base.issueTags ?? [],
      speakerTags: base.speakerTags ?? ["Kelly Grappe"],
    };
  }
  return base;
}
