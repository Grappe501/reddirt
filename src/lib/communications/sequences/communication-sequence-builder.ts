import { describeCadence, getCadenceForSequence } from "./communication-cadence-engine";
import type { CommunicationSequence, CommunicationSequenceType, SequenceStep } from "./communication-sequence-types";

function steps(type: CommunicationSequenceType, _audience: string): SequenceStep[] {
  const cadence = getCadenceForSequence(type);
  const templates: Record<CommunicationSequenceType, string[]> = {
    volunteer_onboarding: ["Welcome + safety", "First assignment", "Check-in", "Retention thank-you"],
    host_onboarding: ["Thank you for hosting", "Prep checklist", "Day-before reminder"],
    event_followup: ["Thank attendees", "Power of 5 ask"],
    county_activation: ["County intro", "Local event invite", "Leader 1:1"],
    power_of_five_recruitment: ["Relational ask", "Helper follow-up"],
    volunteer_retention: ["Recognition", "Next event invite", "Rest check"],
    leadership_recruitment: ["Leadership opportunity", "Follow-up call"],
    campaign_team_updates: ["Weekly brief"],
    candidate_prep: ["Briefing packet", "Day-of reminders"],
    hot_wash_followup: ["Lessons learned", "Next event"],
    reimbursement_reminders: ["Receipt reminder", "Final packet"],
    training_nudges: ["Module invite", "Completion check"],
    statewide_briefing: ["Statewide priorities"],
    communications_escalation: ["CM escalation summary"],
  };
  return cadence.map((day, i) => ({
    id: `${type}_step_${i}`,
    dayOffset: day,
    channel: "email",
    purpose: templates[type][i] ?? `Step ${i + 1}`,
    templateHint: templates[type][i],
    humanReviewRequired: true,
  }));
}

export function buildCommunicationSequence(
  type: CommunicationSequenceType,
  audienceLabel: string,
  countySlug?: string,
): CommunicationSequence {
  const cadenceDays = getCadenceForSequence(type);
  const warnings = [
    "No autonomous send — preview in Message Studio or ECC",
    describeCadence(type),
  ];
  if (type === "power_of_five_recruitment" || type === "county_activation") {
    warnings.push("Political persuasion requires explicit human approval");
  }
  return {
    id: `seq_${type}_${Date.now().toString(36)}`,
    type,
    title: type.replace(/_/g, " "),
    audienceLabel,
    steps: steps(type, audienceLabel),
    cadenceDays,
    riskLevel: type === "communications_escalation" ? "high" : "medium",
    warnings,
    countySlug,
  };
}
