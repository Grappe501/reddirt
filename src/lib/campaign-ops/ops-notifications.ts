import "server-only";

import { sendSendGridSingleTestEmail } from "@/lib/sendgrid/mail-send";

/**
 * Temporary global operations inbox until official Google Workspace campaign addresses are wired.
 *
 * This temporary address receives all form and automation notifications until official Google
 * Workspace campaign inboxes are assigned.
 */
export const TEMP_GLOBAL_OPS_EMAIL = "grappe4arkansas@gmail.com" as const;

/**
 * Primary recipients for transactional ops alerts (form submissions, intake signals).
 * Override with comma-separated `OPS_NOTIFICATION_EMAIL_TO` in the environment.
 */
export function getOpsNotificationToEmails(): string[] {
  const raw = process.env.OPS_NOTIFICATION_EMAIL_TO?.trim();
  if (raw) {
    return raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.includes("@"));
  }
  return [TEMP_GLOBAL_OPS_EMAIL];
}

/**
 * Optional extra BCC recipients (comma-separated `OPS_NOTIFICATION_EMAIL_BCC`).
 * Deduped against the primary `to` address by the mail sender.
 */
export function getOpsNotificationBccEmails(): string[] {
  const raw = process.env.OPS_NOTIFICATION_EMAIL_BCC?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.includes("@"));
}

export type VolunteerSignupOpsEmailPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zip: string;
  county?: string;
  city?: string;
  preferredRole: string;
  preferredLanguage: string;
  student: boolean;
  schoolCampus?: string;
  discordInterest: boolean;
  hostingInterest: boolean;
  fundraisingInterest: boolean;
  leadershipInterest: boolean;
  interests: string[];
  notes?: string;
  availability?: string;
  skills?: string;
  submissionId: string;
  workflowIntakeId: string;
  volunteerTeamSlug: string | null;
};

/**
 * Sends a single SendGrid message to ops inboxes (TO + optional BCC).
 * Fails soft: logs and returns when SendGrid from-address or API key is missing.
 */
export async function sendVolunteerSignupOpsNotification(payload: VolunteerSignupOpsEmailPayload): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  const fromEmail = process.env.SENDGRID_FROM_EMAIL?.trim();
  const fromName = process.env.SENDGRID_FROM_NAME?.trim() || "Kelly Grappe Campaign";

  if (!apiKey || !fromEmail) {
    console.warn("[ops-notifications] SendGrid not configured — skipping volunteer ops email.");
    return;
  }

  const toList = getOpsNotificationToEmails();
  const to = toList[0];
  if (!to) return;

  const bcc = [...getOpsNotificationBccEmails(), ...toList.slice(1)].filter((e) => e && e !== to);

  const lines = [
    "New volunteer signup (system-native form)",
    "",
    `Submission: ${payload.submissionId}`,
    `Workflow intake: ${payload.workflowIntakeId}`,
    payload.volunteerTeamSlug ? `Volunteer team slug: ${payload.volunteerTeamSlug}` : "Volunteer team: (not provisioned — check logs / schema)",
    "",
    `Name: ${payload.firstName} ${payload.lastName}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `ZIP: ${payload.zip}`,
    payload.county ? `County: ${payload.county}` : null,
    payload.city ? `City: ${payload.city}` : null,
    `Preferred role: ${payload.preferredRole}`,
    `Preferred language: ${payload.preferredLanguage}`,
    `Student: ${payload.student ? "yes" : "no"}`,
    payload.schoolCampus ? `School / campus: ${payload.schoolCampus}` : null,
    `Discord invite interest: ${payload.discordInterest ? "yes" : "no"}`,
    `Hosting interest: ${payload.hostingInterest ? "yes" : "no"}`,
    `Fundraising interest: ${payload.fundraisingInterest ? "yes" : "no"}`,
    `Leadership training interest: ${payload.leadershipInterest ? "yes" : "no"}`,
    payload.interests.length ? `Extra interest tokens: ${payload.interests.join(", ")}` : null,
    payload.availability ? `Availability: ${payload.availability}` : null,
    payload.skills ? `Skills: ${payload.skills}` : null,
    payload.notes ? `Notes:\n${payload.notes}` : null,
  ].filter(Boolean) as string[];

  const text = lines.join("\n");
  const html = `<pre style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.5">${text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")}</pre>`;

  const result = await sendSendGridSingleTestEmail({
    to,
    bcc: bcc.length ? bcc : undefined,
    subject: `[Volunteer] ${payload.firstName} ${payload.lastName} — ${payload.preferredRole}`,
    text,
    html,
    fromEmail,
    fromName,
    replyToEmail: payload.email,
  });

  if (!result.ok) {
    console.error("[ops-notifications] Volunteer signup email failed:", result.safeMessage);
  }
}
