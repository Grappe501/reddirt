/** Automation / action queue scaffold (Script 6) — persistence in a later pass. */

export type AutomationLane =
  | "events"
  | "social-media"
  | "power-of-5"
  | "cross"
  | "fundraising"
  | "media"
  | "gotv";

export type TeamActionEventType =
  | "viewed"
  | "marked_complete"
  | "need_help"
  | "email_campaign"
  | "skipped"
  | "advanced";

export type AutomationSequence = {
  id: string;
  name: string;
  lane: AutomationLane | "multi";
  audience: string;
  trigger: string;
  steps: AutomationStep[];
};

export type AutomationStep = {
  id: string;
  sequenceId: string;
  order: number;
  title: string;
  summary: string;
  lane: AutomationLane;
  ownerRole: string;
  dueTiming: string;
  emailSubject: string;
  emailBody: string;
  dashboardTaskCopy: string;
  completionAction: string;
  nextStepId: string | null;
};

export type TeamActionQueue = {
  teamId: string;
  neededNow: AutomationStep;
  comingUp: AutomationStep;
  nextAfterThat: AutomationStep;
  hiddenFutureSteps: AutomationStep[];
};

export type TeamActionEvent = {
  teamId: string;
  stepId: string;
  eventType: TeamActionEventType;
  createdAt: string;
  createdBy: string;
  notes?: string;
};

export type AutomationEmailReviewStatus = "draft" | "internal_review" | "approved";

export type AutomationEmailTemplate = {
  id: string;
  title: string;
  audience: string;
  lane: AutomationLane | "multi";
  subject: string;
  previewText: string;
  body: string;
  ctaLabel: string;
  ctaTarget: string;
  reviewStatus: AutomationEmailReviewStatus;
};
