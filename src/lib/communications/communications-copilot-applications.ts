import type { RoleCopilotId } from "@/lib/agents/role-copilots/role-copilot-types";
import { composeCommunicationsIntelligenceContext } from "./communications-intelligence-engine";
import { buildCommunicationSequence } from "./sequences/communication-sequence-builder";
import { routeCampaignWriting } from "./writing-orchestration/campaign-writing-router";
export type CommunicationCopilotId =
  | "communications_lead"
  | "volunteer_communications"
  | "county_communications"
  | "candidate_messaging"
  | "host_outreach"
  | "event_promotion"
  | "power_of_five_outreach"
  | "team_briefing"
  | "social_media_coordination"
  | "crisis_communications"
  | "donor_relationship"
  | "new_volunteer_welcome";

export type CommunicationsCopilotApplication = {
  copilotId: CommunicationCopilotId;
  headline: string;
  operatorGuidance: string[];
  suggestedSequenceType?: string;
  recommendedTemplates: string[];
  escalationNote?: string;
};

const COPILOT_TO_ROLE: Partial<Record<CommunicationCopilotId, RoleCopilotId>> = {
  communications_lead: "communications_lead",
  volunteer_communications: "volunteer_coordinator",
  county_communications: "county_lead",
  candidate_messaging: "candidate",
  host_outreach: "host",
  new_volunteer_welcome: "volunteer_coordinator",
};

export function applyCommunicationsIntelToCopilot(
  copilotId: CommunicationCopilotId,
): CommunicationsCopilotApplication {
  const ctx = composeCommunicationsIntelligenceContext();
  const base: CommunicationsCopilotApplication = {
    copilotId,
    headline: `${copilotId.replace(/_/g, " ")} · communications intelligence`,
    operatorGuidance: [],
    recommendedTemplates: ["tpl-team-daily-brief", "tpl-host-followup", "tpl-volunteer-shift"],
  };

  switch (copilotId) {
    case "communications_lead":
      base.operatorGuidance = [
        ...ctx.topPriorities.slice(0, 5),
        `Mass email: ${ctx.massEmailStatus}`,
        "Use Message Studio — no autonomous send",
      ];
      base.suggestedSequenceType = "statewide_briefing";
      break;
    case "volunteer_communications":
    case "new_volunteer_welcome": {
      const seq = buildCommunicationSequence("volunteer_onboarding", "New volunteers");
      base.operatorGuidance = [
        `${ctx.volunteerEngagement.active} active volunteers · ${ctx.volunteerEngagement.atRisk} at retention risk`,
        ...ctx.fatigueWarnings.slice(0, 3),
        seq.warnings[0],
      ];
      base.suggestedSequenceType = "volunteer_onboarding";
      break;
    }
    case "county_communications": {
      const gap = ctx.countyGaps[0];
      base.operatorGuidance = gap
        ? [
            `${gap.countyName}: ${gap.issueSummary}`,
            gap.messagingAngle,
            gap.powerOfFiveLanguage,
          ]
        : ["No county gaps — review weak counties in county command center"];
      base.suggestedSequenceType = "county_activation";
      break;
    }
    case "candidate_messaging": {
      const draft = routeCampaignWriting({
        audience: "candidate",
        purpose: "team_briefing",
        urgency: "low",
      });
      base.operatorGuidance = [draft.subject, ...draft.warnings];
      base.suggestedSequenceType = "candidate_prep";
      break;
    }
    case "host_outreach": {
      const seq = buildCommunicationSequence("host_onboarding", "Event hosts");
      base.operatorGuidance = [
        ...ctx.hostFollowUpGaps.map((h) => `Host follow-up: ${h}`),
        ...seq.steps.map((s) => s.purpose),
      ];
      base.suggestedSequenceType = "host_onboarding";
      break;
    }
    case "event_promotion":
      base.operatorGuidance = [
        "Tie promotion to county event recommendation",
        ctx.countyGaps[0]?.eventPromotionIdea ?? "Select county in intelligence dashboard",
      ];
      base.suggestedSequenceType = "event_followup";
      break;
    case "power_of_five_outreach":
      base.operatorGuidance = [
        ctx.countyGaps[0]?.powerOfFiveLanguage ?? "Connect county PO5 targets",
        "Human approval required for relational asks",
      ];
      base.suggestedSequenceType = "power_of_five_recruitment";
      break;
    case "team_briefing":
      base.operatorGuidance = ctx.topPriorities;
      base.suggestedSequenceType = "campaign_team_updates";
      break;
    case "social_media_coordination":
      base.operatorGuidance = [
        "Draft only — coordinate with owned media",
        "No auto-publish",
      ];
      break;
    case "crisis_communications":
      base.operatorGuidance = [
        "Crisis hold — no outbound until CM approves",
        ...ctx.bottlenecks.slice(0, 3),
      ];
      base.escalationNote = "Campaign manager + compliance";
      base.suggestedSequenceType = "communications_escalation";
      break;
    case "donor_relationship":
      base.operatorGuidance = ctx.inactiveSupporters.map((n) => `Re-engage supporter: ${n}`).slice(0, 5);
      break;
  }

  return base;
}

export function listCommunicationCopilotIds(): CommunicationCopilotId[] {
  return [
    "communications_lead",
    "volunteer_communications",
    "county_communications",
    "candidate_messaging",
    "host_outreach",
    "event_promotion",
    "power_of_five_outreach",
    "team_briefing",
    "social_media_coordination",
    "crisis_communications",
    "donor_relationship",
    "new_volunteer_welcome",
  ];
}

export function applyCommunicationsForRole(role: RoleCopilotId): CommunicationsCopilotApplication | null {
  const entry = Object.entries(COPILOT_TO_ROLE).find(([, r]) => r === role);
  if (!entry) return null;
  return applyCommunicationsIntelToCopilot(entry[0] as CommunicationCopilotId);
}
