import meetingSource from "../../../data/campaign-brain/ownership/meeting-accountability.source.json";

export type MeetingActionItem = {
  id: string;
  item: string;
  owner: string;
  dueDate: string;
  status: "open" | "in_progress" | "done" | "blocked";
  committedWeek: string | null;
};

export type CampaignMeeting = {
  id: string;
  title: string;
  day: string;
  durationMinutes: number;
  attendees: string[];
  purpose: string;
  href: string;
  dashboardMetrics: Array<{ id: string; label: string; source: string }>;
  agenda: Array<{ segment: string; minutes: number; owner: string }>;
  requiredOutput: { label: string; items: string[] };
  actionItems: MeetingActionItem[];
  notes: string;
};

export type MeetingAccountabilityModel = {
  doctrine: string;
  fourQuestions: Array<{ id: string; question: string }>;
  underTenMinutes: string;
  meetings: CampaignMeeting[];
};

export function getMeetingAccountability(): MeetingAccountabilityModel {
  return meetingSource as MeetingAccountabilityModel;
}

export function getMeetingById(meetingId: string): CampaignMeeting | null {
  return getMeetingAccountability().meetings.find((m) => m.id === meetingId) ?? null;
}

export function meetingsHubHref(): string {
  return "/election-plan/meetings";
}

export function meetingHref(meetingId: string): string {
  return `/election-plan/meetings/${meetingId}`;
}

export function getMeetingAccountabilityRollup() {
  const model = getMeetingAccountability();
  const allItems = model.meetings.flatMap((m) => m.actionItems);
  return {
    meetingCount: model.meetings.length,
    openActions: allItems.filter((a) => a.status === "open").length,
    inProgressActions: allItems.filter((a) => a.status === "in_progress").length,
    blockedActions: allItems.filter((a) => a.status === "blocked").length,
    doneActions: allItems.filter((a) => a.status === "done").length,
  };
}
