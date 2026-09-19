import { AEAC_BASE } from "./catalog";

export type AeacMeetingStatus = "planned" | "scheduled" | "complete";

export type AeacMeetingDocument = {
  title: string;
  href: string;
  kind: "agenda" | "notes" | "findings" | "supporting";
};

export type AeacMeeting = {
  slug: string;
  title: string;
  status: AeacMeetingStatus;
  timingLabel: string;
  locationLabel: string;
  summary: string;
  notes: string;
  documents: AeacMeetingDocument[];
};

export const aeacMeetings: AeacMeeting[] = [
  {
    slug: "founding-kickoff",
    title: "Founding kickoff meeting",
    status: "planned",
    timingLabel: "Expected a few weeks after public launch",
    locationLabel: "To be announced",
    summary:
      "The first working session after founding members are identified. The Commission is being organized now so the kickoff can start with a shared mission, not a predetermined conclusion.",
    notes:
      "Kelly Grappe is identifying Arkansas people with different expertise and perspectives—including people who are likely to disagree on methods. County and state officials who should not participate while Kelly is a candidate will have seats reserved for after the election. A third-party, nonpartisan facilitator is being sought so the conversation can stay open, factual, and focused on Arkansas.",
    documents: [],
  },
];

export function getAeacMeeting(slug: string): AeacMeeting | undefined {
  return aeacMeetings.find((meeting) => meeting.slug === slug);
}

export function aeacMeetingHref(slug: string): string {
  return `${AEAC_BASE}/meetings/${slug}`;
}

export function aeacMeetingStatusLabel(status: AeacMeetingStatus): string {
  if (status === "complete") return "Complete";
  if (status === "scheduled") return "Scheduled";
  return "Being planned";
}
