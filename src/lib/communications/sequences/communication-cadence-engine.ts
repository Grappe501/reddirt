import type { CommunicationSequenceType } from "./communication-sequence-types";

const CADENCE: Record<CommunicationSequenceType, number[]> = {
  volunteer_onboarding: [0, 3, 7, 14],
  host_onboarding: [0, 2, 5],
  event_followup: [1, 7],
  county_activation: [0, 7, 21],
  power_of_five_recruitment: [0, 5, 12],
  volunteer_retention: [0, 14, 30],
  leadership_recruitment: [0, 10],
  campaign_team_updates: [0],
  candidate_prep: [0, 1],
  hot_wash_followup: [1, 14],
  reimbursement_reminders: [0, 7],
  training_nudges: [0, 5],
  statewide_briefing: [0],
  communications_escalation: [0],
};

export function getCadenceForSequence(type: CommunicationSequenceType): number[] {
  return CADENCE[type] ?? [0, 7];
}

export function describeCadence(type: CommunicationSequenceType): string {
  const days = getCadenceForSequence(type);
  return `Touch days: ${days.join(", ")} — all steps human-reviewed before send`;
}
