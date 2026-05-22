import { buildCommunicationSequence } from "./sequences/communication-sequence-builder";
import { routeCampaignWriting } from "./writing-orchestration/campaign-writing-router";

export function buildHostOnboardingSequence(hostName: string) {
  return buildCommunicationSequence("host_onboarding", hostName);
}

export function buildHostEventPrepDraft(hostName: string, eventTitle: string) {
  return routeCampaignWriting({
    audience: "host",
    purpose: "host_prep",
    displayName: hostName,
    eventTitle,
    urgency: "medium",
  });
}

export function buildHostFollowUpSequence(hostName: string) {
  return buildCommunicationSequence("event_followup", hostName);
}

export function buildHostReflectionNote(hostName: string, lesson: string) {
  return `Host reflection — ${hostName}: ${lesson} (save to communications memory — human review)`;
}
