import type { CityLocationBrief } from "@/lib/election-plan/load-city-location-brief";
import type { ElectionPlanCounty, ElectionPlanWorkbenchSnapshot } from "@/lib/election-plan/types";
import type { ExecutiveCalendarEntry } from "@/lib/election-plan/field-event-worksheet-storage";

import type { ForwardMotionStop } from "@/lib/election-plan/forward-motion-links";

export type PromotionItem = {
  id: string;
  label: string;
  status: string;
  score: number;
};

export type PromotionTimelineMilestone = {
  daysBefore: number;
  label: string;
  dueDate: string;
  tasks: string[];
  isPast: boolean;
};

export type CoalitionTargetLane = {
  id: string;
  label: string;
  owner: string;
  invitePrompt: string;
};

export type StoryTarget = {
  id: string;
  label: string;
  phase: "before" | "after";
};

export type HousePartyFormat = {
  id: string;
  label: string;
};

export type PowerOf5GoalRow = {
  id: string;
  label: string;
  goal: number;
};

export type EndorsementRole = {
  id: string;
  label: string;
};

export type CampusActivation = {
  campus: string;
  city: string;
  captain: string | null;
  studentRecruitmentGoal: number;
  registrationGoal: number;
  freshmanWeekOpportunity: string;
  fundraiserOpportunity: string;
  kellyAppearanceStatus: string;
};

export type StopReadinessBreakdown = {
  promotion: number;
  coalition: number;
  volunteers: number;
  story: number;
  houseParties: number;
  endorsements: number;
  composite: number;
};

export type StopCommandCenterView = {
  stop: ForwardMotionStop;
  stopSlug: string;
  calendarEntry: ExecutiveCalendarEntry | null;
  fieldWorksheetHref: string | null;
  county: ElectionPlanCounty | null;
  countySlug: string | null;
  countyPlaybookHref: string | null;
  cityBrief: CityLocationBrief | null;
  cityBriefHref: string | null;
  priorityCities: ElectionPlanWorkbenchSnapshot["cities"];
  lastVisitDate: string | null;
  visitCount: number;
  whyItMatters: string;
  venue: string | null;
  timeLabel: string | null;
  attendanceEstimate: string | null;
  coalitionImportance: string;
  promotionItems: PromotionItem[];
  promotionTimeline: PromotionTimelineMilestone[];
  coalitionTargets: CoalitionTargetLane[];
  storyTargets: StoryTarget[];
  contentRequired: StoryTarget[];
  housePartyFormats: HousePartyFormat[];
  powerOf5Goals: PowerOf5GoalRow[];
  endorsementRoles: EndorsementRole[];
  countyEndorsementTargets: ElectionPlanWorkbenchSnapshot["endorsementAcquisition"]["pendingTargets"];
  campusActivation: CampusActivation | null;
  substackAngle: string | null;
  readiness: StopReadinessBreakdown;
  briefingSlug: string | null;
};
