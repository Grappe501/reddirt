import type { WritingPurpose, WritingTone } from "./writing-orchestration-types";

export function optimizeSubjectLine(input: {
  purpose: WritingPurpose;
  tone: WritingTone;
  countyName?: string;
  eventTitle?: string;
}): string {
  const county = input.countyName ? ` — ${input.countyName}` : "";
  const event = input.eventTitle ? `: ${input.eventTitle}` : "";
  switch (input.purpose) {
    case "power_of_five":
      return `Can you help us reach five more voters${county}?`;
    case "event_promotion":
      return `Join us${event}${county}`;
    case "volunteer_recruitment":
      return `Volunteer opportunity${county}${event}`;
    case "host_prep":
      return `Host prep checklist${event}`;
    case "team_briefing":
      return `Campaign team brief — Kelly SOS${county}`;
    case "crisis_hold":
      return `[HOLD] Internal comms review required`;
    default:
      return `Kelly Grappe for SOS${county}${event}`;
  }
}
