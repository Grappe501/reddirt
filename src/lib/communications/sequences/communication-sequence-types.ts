export type CommunicationSequenceType =
  | "volunteer_onboarding"
  | "host_onboarding"
  | "event_followup"
  | "county_activation"
  | "power_of_five_recruitment"
  | "volunteer_retention"
  | "leadership_recruitment"
  | "campaign_team_updates"
  | "candidate_prep"
  | "hot_wash_followup"
  | "reimbursement_reminders"
  | "training_nudges"
  | "statewide_briefing"
  | "communications_escalation";

export type SequenceStep = {
  id: string;
  dayOffset: number;
  channel: "email" | "call" | "in_person" | "internal_note";
  purpose: string;
  templateHint?: string;
  humanReviewRequired: true;
};

export type CommunicationSequence = {
  id: string;
  type: CommunicationSequenceType;
  title: string;
  audienceLabel: string;
  steps: SequenceStep[];
  cadenceDays: number[];
  riskLevel: "low" | "medium" | "high";
  warnings: string[];
  countySlug?: string;
};
