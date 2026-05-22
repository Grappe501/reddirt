/**
 * Lightweight event communication thread — stored in factCard JSON envelope.
 * Not email/Slack; operator notes until full comms platform ships.
 */

export type EventCommunicationNoteType =
  | "internal"
  | "event_update"
  | "logistics"
  | "campaign_manager"
  | "candidate"
  | "volunteer"
  | "host";

export type EventCommunicationEntry = {
  id: string;
  at: string;
  author: string;
  noteType: EventCommunicationNoteType;
  body: string;
};

export const COMMUNICATION_NOTE_TYPE_LABELS: Record<EventCommunicationNoteType, string> = {
  internal: "Internal note",
  event_update: "Event update",
  logistics: "Logistics",
  campaign_manager: "Campaign manager",
  candidate: "Candidate",
  volunteer: "Volunteer",
  host: "Host communication",
};

export function emptyCommunicationThread(): EventCommunicationEntry[] {
  return [];
}

export function parseCommunicationThread(raw: unknown): EventCommunicationEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (e): e is EventCommunicationEntry =>
      !!e &&
      typeof e === "object" &&
      typeof (e as EventCommunicationEntry).id === "string" &&
      typeof (e as EventCommunicationEntry).body === "string",
  );
}

export function appendCommunicationNote(
  thread: EventCommunicationEntry[],
  input: { author: string; noteType: EventCommunicationNoteType; body: string },
): EventCommunicationEntry[] {
  return [
    ...thread,
    {
      id: `note_${Date.now()}`,
      at: new Date().toISOString(),
      author: input.author.trim() || "Operator",
      noteType: input.noteType,
      body: input.body.trim(),
    },
  ];
}
