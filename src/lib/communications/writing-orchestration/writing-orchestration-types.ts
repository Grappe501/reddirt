export type WritingAudience =
  | "volunteer"
  | "host"
  | "county_leader"
  | "donor"
  | "campaign_team"
  | "candidate"
  | "general";

export type WritingPurpose =
  | "welcome"
  | "event_followup"
  | "event_promotion"
  | "power_of_five"
  | "volunteer_recruitment"
  | "host_prep"
  | "team_briefing"
  | "training_nudge"
  | "crisis_hold"
  | "county_activation";

export type WritingTone = "warm" | "direct" | "urgent" | "celebratory" | "calm";

export type OrchestratedDraft = {
  subject: string;
  previewText: string;
  body: string;
  cta: string;
  tone: WritingTone;
  warnings: string[];
  humanApprovalRequired: true;
  suggestedTemplateId?: string;
};
