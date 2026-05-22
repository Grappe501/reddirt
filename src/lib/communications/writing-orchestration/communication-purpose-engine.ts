import type { WritingPurpose } from "./writing-orchestration-types";

export function describePurpose(purpose: WritingPurpose): string {
  const map: Record<WritingPurpose, string> = {
    welcome: "Welcome new helper — safety + supervisor path",
    event_followup: "Thank attendees and capture next asks",
    event_promotion: "Invite to county-tagged event — human send only",
    power_of_five: "Relational organizing ask — explicit approval",
    volunteer_recruitment: "Staff shifts without pressure",
    host_prep: "Confirm logistics and materials",
    team_briefing: "Internal statewide priorities",
    training_nudge: "Point to training module — no auto-send",
    crisis_hold: "Hold pattern — no outbound until CM approves",
    county_activation: "County-specific activation message",
  };
  return map[purpose];
}
