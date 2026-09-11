import "server-only";

import { sendSendGridSingleTestEmail } from "@/lib/sendgrid/mail-send";

/**
 * Temporary global operations inbox until official Google Workspace campaign addresses are wired.
 *
 * This temporary address receives all form and automation notifications until official Google
 * Workspace campaign inboxes are assigned.
 *
 * Client mailto / preview UIs must use the same default via `OPS_NOTIFICATION_PRIMARY_PUBLIC` in
 * `src/config/ops-notification-public.ts` (do not import this server-only module in client components).
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

export const INVITE_KELLY_SCHEDULER_EMAIL = "scheduler@kellygrappe.com" as const;

export function getInviteKellySchedulerToEmails(): string[] {
  const override = process.env.INVITE_KELLY_SCHEDULER_EMAIL?.trim().toLowerCase();
  const primary =
    override && override.includes("@") ? override : INVITE_KELLY_SCHEDULER_EMAIL;
  const extras = getOpsNotificationToEmails().filter((e) => e !== primary);
  return [primary, ...extras];
}

export type InviteKellySchedulerEmailPayload = {
  requesterName: string;
  email: string;
  phone: string;
  organization?: string | null;
  eventTitle: string;
  eventType: string;
  kellyRole?: string | null;
  county: string;
  city?: string | null;
  address?: string | null;
  preferredDate?: string | null;
  alternateDates?: string[] | null;
  timeWindow?: string | null;
  flexibility: string;
  audienceSize?: number | null;
  eventPurpose?: string | null;
  eventVisibility: string;
  notes?: string | null;
  intakeStatus: string;
  publicMessage: string;
  recommendedTitle: string;
  recommendedStartAt?: string;
  recommendedEndAt?: string;
  suggestedWindows: { label: string; startAt: string; reasonPublic: string }[];
  staffFlags: { flag: string; note: string }[];
  workflowIntakeId?: string | null;
  submissionId?: string | null;
};

export async function sendInviteKellySchedulerNotification(
  payload: InviteKellySchedulerEmailPayload,
): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  const fromEmail = process.env.SENDGRID_FROM_EMAIL?.trim();
  const fromName = process.env.SENDGRID_FROM_NAME?.trim() || "Kelly Grappe Campaign";

  if (!apiKey || !fromEmail) {
    console.warn("[ops-notifications] SendGrid not configured — skipping Invite Kelly scheduler email.");
    return;
  }

  const toList = getInviteKellySchedulerToEmails();
  const to = toList[0];
  if (!to) return;
  const bcc = [...getOpsNotificationBccEmails(), ...toList.slice(1)].filter((e) => e && e !== to);

  const dates = [
    payload.preferredDate ? `Preferred: ${payload.preferredDate}` : "Preferred: campaign may suggest",
    payload.alternateDates?.length ? `Other dates: ${payload.alternateDates.join(", ")}` : null,
  ].filter(Boolean);

  const windows = payload.suggestedWindows.length
    ? payload.suggestedWindows.map((w) => `  - ${w.label} (${w.startAt.slice(0, 10)}) — ${w.reasonPublic}`).join("\n")
    : "  (none)";

  const flags = payload.staffFlags.length
    ? payload.staffFlags.map((f) => `  - ${f.flag}: ${f.note}`).join("\n")
    : "  (none)";

  const lines = [
    "Invite Kelly request — calendar recommendation",
    "",
    payload.workflowIntakeId ? `Workflow intake: ${payload.workflowIntakeId}` : null,
    payload.submissionId ? `Submission: ${payload.submissionId}` : null,
    `Assistant status: ${payload.intakeStatus.replace(/_/g, " ")}`,
    "",
    "— Host —",
    `Name: ${payload.requesterName}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    payload.organization ? `Organization: ${payload.organization}` : null,
    "",
    "— Gathering —",
    `Title: ${payload.eventTitle}`,
    `Type: ${payload.eventType}`,
    payload.kellyRole ? `Kelly’s role: ${payload.kellyRole}` : null,
    `County: ${payload.county}`,
    payload.city ? `City: ${payload.city}` : null,
    payload.address ? `Venue: ${payload.address}` : null,
    payload.audienceSize != null ? `Expected crowd (approx): ${payload.audienceSize}` : null,
    `Visibility: ${payload.eventVisibility}`,
    `Flexibility: ${payload.flexibility}`,
    payload.timeWindow ? `Time of day: ${payload.timeWindow}` : null,
    ...dates,
    payload.eventPurpose ? `What they want:\n${payload.eventPurpose}` : null,
    payload.notes ? `Notes:\n${payload.notes}` : null,
    "",
    "— Recommended calendar hold —",
    `Title: ${payload.recommendedTitle}`,
    payload.recommendedStartAt ? `Start: ${payload.recommendedStartAt}` : "Start: not set",
    payload.recommendedEndAt ? `End: ${payload.recommendedEndAt}` : null,
    "",
    "— Suggested open windows —",
    windows,
    "",
    "— Internal flags —",
    flags,
    "",
    "— Public reply drafted for the host —",
    payload.publicMessage,
  ].filter((line) => line !== null) as string[];

  const text = lines.join("\n");
  const html = `<pre style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.5">${text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")}</pre>`;

  const result = await sendSendGridSingleTestEmail({
    to,
    bcc: bcc.length ? bcc : undefined,
    subject: `[Invite Kelly] ${payload.county} — ${payload.eventTitle}`,
    text,
    html,
    fromEmail,
    fromName,
    replyToEmail: payload.email,
  });

  if (!result.ok) {
    console.error("[ops-notifications] Invite Kelly scheduler email failed:", result.safeMessage);
  }
}
