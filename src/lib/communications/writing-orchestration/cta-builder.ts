import type { WritingPurpose } from "./writing-orchestration-types";

export function buildCta(purpose: WritingPurpose): string {
  const map: Record<WritingPurpose, string> = {
    welcome: "Reply to confirm you received this and who your supervisor is.",
    event_followup: "Reply with one thing we should do differently next time.",
    event_promotion: "RSVP using the link your coordinator sends — do not forward widely.",
    power_of_five: "Reply YES if you can identify five relational contacts this week.",
    volunteer_recruitment: "Reply with your availability — we will confirm shifts manually.",
    host_prep: "Reply to confirm venue address and day-of contact.",
    team_briefing: "Open the command center briefing — no reply required.",
    training_nudge: "Complete the linked training module when you have 20 minutes.",
    crisis_hold: "Do not send — await campaign manager approval.",
    county_activation: "Contact your county lead to schedule the next local touch.",
  };
  return map[purpose];
}
