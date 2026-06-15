/** Phase 13 — Forward Motion Activation types (draft/review only, no live sends). */

export type ActivationStatus =
  | "not_started"
  | "draft_needed"
  | "drafted"
  | "approved"
  | "published"
  | "sent";

export type GraphicsStatus =
  | "not_started"
  | "needed"
  | "requested"
  | "drafted"
  | "approved"
  | "posted";

export type PhoneBankStatus =
  | "not_started"
  | "list_needed"
  | "script_ready"
  | "scheduled"
  | "completed";

export type PostcardStatus =
  | "not_started"
  | "design_needed"
  | "printed"
  | "written"
  | "mailed";

export type CanvassDoorStatus =
  | "future"
  | "not_started"
  | "turf_needed"
  | "design_needed"
  | "scheduled"
  | "printed"
  | "completed"
  | "hung";

export type StoryWorkflowStatus =
  | "not_started"
  | "capture_plan_ready"
  | "drafted"
  | "published";

export type UpcomingStopActivation = {
  eventId: string;
  eventName: string;
  county: string;
  city: string;
  date: string;
  verificationStatus: "verified" | "tentative" | "missing";
  confidence: number;
  campaignImpactScore: number;
  effectiveScore: number;
  assignment: "Kelly" | "Surrogate" | "County Team";
  cluster: string;
  countyTier: string;
  primaryLane: string;
  mobilizeStatus: ActivationStatus;
  facebookStatus: ActivationStatus;
  newsReleaseStatus: ActivationStatus;
  graphicsStatus: GraphicsStatus;
  phoneBankStatus: PhoneBankStatus;
  postcardStatus: PostcardStatus;
  canvassStatus: CanvassDoorStatus;
  doorHangerStatus: CanvassDoorStatus;
  storyWorkflowStatus: StoryWorkflowStatus;
  activationReadinessPct: number;
  nextAction: string;
  source: string;
};

export type UpcomingStopsQueueFile = {
  version: number;
  generatedAt: string;
  note: string;
  horizonDays: number;
  priorityWindowDays: number;
  stops: UpcomingStopActivation[];
};
