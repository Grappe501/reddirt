import type { VolunteerCommunicationDraft, VolunteerProfile } from "./volunteer-types";

export type VolunteerCommWorkflowType = VolunteerCommunicationDraft["workflowType"];

const TEMPLATES: Record<
  VolunteerCommWorkflowType,
  { subject: string; body: string; consentWarning?: string }
> = {
  welcome: {
    subject: "Welcome to the Kelly Grappe for SOS volunteer team",
    body: "Hi {{firstName}},\n\nThank you for signing up. Your next step: complete onboarding at {{onboardingUrl}}.\n\n— Volunteer team",
    consentWarning: "Confirm consent before sending.",
  },
  training_reminder: {
    subject: "Training reminder: {{moduleTitle}}",
    body: "Hi {{firstName}},\n\nPlease complete {{moduleTitle}} before your next assignment.\n\n— Training team",
  },
  event_assignment: {
    subject: "Volunteer assignment: {{eventTitle}}",
    body: "Hi {{firstName}},\n\nYou are invited to help as {{role}} on {{eventDate}}.\n\nReply to confirm. Assignment is not final until a coordinator approves.\n\n— Field team",
    consentWarning: "Human must approve assignment before send.",
  },
  event_reminder: {
    subject: "Reminder: {{eventTitle}} tomorrow",
    body: "Hi {{firstName}},\n\nSee you at {{eventLocation}}. Arrival: {{arrivalTime}}.\n\n— Team",
  },
  thank_you: {
    subject: "Thank you for volunteering",
    body: "Hi {{firstName}},\n\nThank you for serving at {{eventTitle}}. Your work matters for Arkansas.\n\n— Kelly campaign",
  },
  urgent_need: {
    subject: "Urgent volunteer need in {{county}}",
    body: "Hi {{firstName}},\n\nWe have an urgent need for {{role}} on short notice. Can you help?\n\n— Coordinator",
    consentWarning: "High-touch — coordinator approval required.",
  },
  power_of_five: {
    subject: "Power of 5 — bring five people in",
    body: "Hi {{firstName}},\n\nOur goal in {{county}}: {{goal}} relational contacts. Can you list five people you will reach this week?\n\n— Organizing team",
  },
  county_ask: {
    subject: "{{county}} county volunteer opportunity",
    body: "Hi {{firstName}},\n\n{{county}} needs help with {{ask}}. Reply if you can assist.\n\n— County team",
  },
  leadership_ask: {
    subject: "Leadership opportunity on the Kelly team",
    body: "Hi {{firstName}},\n\nBased on your reliability, we'd like to discuss a captain/lead role. A coordinator will follow up.\n\n— Campaign manager",
    consentWarning: "Leadership ask — CM or coordinator approval.",
  },
};

export function buildVolunteerCommunicationDraft(
  profile: VolunteerProfile,
  workflowType: VolunteerCommWorkflowType,
  vars: Record<string, string> = {},
): VolunteerCommunicationDraft {
  const tpl = TEMPLATES[workflowType];
  let subject = tpl.subject;
  let body = tpl.body;
  const merged = {
    firstName: profile.firstName,
    county: profile.county ?? "your county",
    ...vars,
  };
  for (const [k, v] of Object.entries(merged)) {
    subject = subject.replaceAll(`{{${k}}}`, v);
    body = body.replaceAll(`{{${k}}}`, v);
  }
  const consentWarning =
    tpl.consentWarning ??
    (profile.consentStatus === "unknown" ? "Consent/source unknown — do not send until reviewed." : undefined);

  return {
    id: `vcd_${Date.now().toString(36)}`,
    volunteerId: profile.id,
    workflowType,
    subject,
    body,
    humanApprovalRequired: true,
    consentWarning,
    suppressionChecked: false,
    createdAt: new Date().toISOString(),
  };
}

/** No send — draft only. */
export const VOLUNTEER_COMMS_SAFETY_NOTE =
  "Volunteer communications are draft-only. Human approval, consent review, and ECC suppression check required before any send.";
