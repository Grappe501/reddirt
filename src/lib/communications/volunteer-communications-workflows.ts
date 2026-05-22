import { buildCommunicationSequence } from "./sequences/communication-sequence-builder";
import { routeCampaignWriting } from "./writing-orchestration/campaign-writing-router";

export function buildVolunteerWelcomeSequence() {
  return buildCommunicationSequence("volunteer_onboarding", "New volunteers");
}

export function buildVolunteerRetentionNudge(displayName: string) {
  return routeCampaignWriting({
    audience: "volunteer",
    purpose: "volunteer_recruitment",
    displayName,
    urgency: "low",
  });
}

export function buildVolunteerTrainingReminder(displayName: string) {
  return buildCommunicationSequence("training_nudges", displayName);
}

export function buildPowerOfFiveVolunteerAsk(countySlug: string, displayName: string) {
  return routeCampaignWriting({
    audience: "volunteer",
    purpose: "power_of_five",
    displayName,
    countySlug,
    urgency: "medium",
  });
}
