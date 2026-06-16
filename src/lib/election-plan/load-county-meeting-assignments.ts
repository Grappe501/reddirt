import assignmentsSource from "../../../data/campaign-brain/county-party-intelligence/county-meeting-assignments.source.json";
import {
  getCountyMeetingCandidatesForCounty,
  getCountyPartyProfileBySlug,
  type CountyPartyProfile,
} from "./load-county-party-intelligence";
import { getImmersionMissionById } from "./load-immersion-county-missions";

export type MeetingAttendancePlan =
  | "candidate_can_attend"
  | "surrogate_should_attend"
  | "virtual_appearance"
  | "letter_or_video"
  | "county_team_follow_up"
  | "needs_confirmation";

export type CountyMeetingAssignment = {
  countySlug: string;
  county: string;
  volunteerCaptain: string;
  countyMissionId: string | null;
  countyMissionHeadline: string | null;
  lastKellyVisit: string | null;
  nextKellyVisit: string | null;
  meetingAttendancePlan: MeetingAttendancePlan;
  meetingAttendanceLabel: string;
  nextMeetingCandidateDate: string | null;
  notes: string | null;
  profile: CountyPartyProfile | null;
  countyChair: string | null;
  meetingInfoRaw: string | null;
};

const labels = (assignmentsSource as { assignmentLabels: Record<string, string> }).assignmentLabels;

function slugToCounty(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function getCountyMeetingAssignments(): CountyMeetingAssignment[] {
  const rows = (assignmentsSource as { assignments: Array<Omit<CountyMeetingAssignment, "county" | "profile" | "countyChair" | "meetingInfoRaw" | "countyMissionHeadline" | "meetingAttendanceLabel"> & { countySlug: string }> })
    .assignments;

  return rows.map((row) => {
    const profile = getCountyPartyProfileBySlug(row.countySlug);
    const mission = row.countyMissionId ? getImmersionMissionById(row.countyMissionId) : null;
    return {
      ...row,
      county: profile?.county ?? slugToCounty(row.countySlug),
      countyMissionHeadline: mission?.headline ?? null,
      meetingAttendanceLabel: labels[row.meetingAttendancePlan] ?? row.meetingAttendancePlan,
      profile,
      countyChair: profile?.countyChair ?? null,
      meetingInfoRaw: profile?.meetingInfoRaw ?? null,
    };
  });
}

export function getCountyMeetingAssignment(countySlug: string): CountyMeetingAssignment | null {
  return getCountyMeetingAssignments().find((a) => a.countySlug === countySlug.toLowerCase()) ?? null;
}

export function getUpcomingCountyMeetingsWithAssignments(limit = 20) {
  const today = new Date().toISOString().slice(0, 10);
  const assigned = new Map(getCountyMeetingAssignments().map((a) => [a.countySlug, a]));

  const meetings: Array<{
    date: string;
    county: string;
    countySlug: string;
    timeLocal: string | null;
    location: string | null;
    assignment: CountyMeetingAssignment | null;
    routingRecommendation: string;
  }> = [];

  for (const [slug, assignment] of assigned) {
    const candidates = getCountyMeetingCandidatesForCounty(slug).filter(
      (c) => c.status === "candidate" && c.date >= today,
    );
    const next = candidates[0];
    if (next) {
      meetings.push({
        date: next.date,
        county: next.county,
        countySlug: slug,
        timeLocal: next.timeLocal,
        location: next.location,
        assignment,
        routingRecommendation: next.routingRecommendation,
      });
    } else if (assignment.nextMeetingCandidateDate && assignment.nextMeetingCandidateDate >= today) {
      meetings.push({
        date: assignment.nextMeetingCandidateDate,
        county: assignment.county,
        countySlug: slug,
        timeLocal: null,
        location: null,
        assignment,
        routingRecommendation: assignment.meetingAttendancePlan,
      });
    }
  }

  return meetings.sort((a, b) => a.date.localeCompare(b.date)).slice(0, limit);
}
