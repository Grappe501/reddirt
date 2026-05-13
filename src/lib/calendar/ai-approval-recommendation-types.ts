/** Shared shapes for Kelly calendar AI approval (no server-only imports). */
import type { ApprovalContext } from "./build-approval-context";

export type AiApprovalRecommendation = {
  calendarItemId: string;
  recommendation:
    | "approve"
    | "approve_with_modification"
    | "send_local"
    | "hold"
    | "reject"
    | "ask_staff";
  confidence: number;
  headline: string;
  why: string[];
  risks: string[];
  suggestedModifications: Array<{
    field: "time" | "date" | "location" | "travel" | "overnight" | "coverage" | "verification";
    suggestion: string;
  }>;
  suggestedOptions: Array<{
    action: "approve" | "modify" | "send_local" | "hold" | "reject" | "ask_staff";
    label: string;
    reason: string;
  }>;
  localAsk?: {
    shouldSendLocal: boolean;
    suggestedSurrogateType:
      | "county_chair"
      | "county_party_contact"
      | "trusted_local"
      | "volunteer"
      | "local_elected"
      | "staff_choose";
    reason: string;
  };
  clerkVisitSuggestion?: {
    recommend: boolean;
    reason: string;
    suggestedTimeWindow?: string;
  };
  lunchSuggestion?: {
    recommend: boolean;
    reason: string;
    suggestedTimeWindow?: string;
  };
};

export type AiRecommendationApiItem = {
  calendarItemId: string;
  context: ApprovalContext;
  recommendation: AiApprovalRecommendation;
  fromCache: boolean;
};

export type AiRecommendationsPostResponse = {
  items: AiRecommendationApiItem[];
  notFound: string[];
  openaiConfigured: boolean;
  modelWarnings?: string[];
};
