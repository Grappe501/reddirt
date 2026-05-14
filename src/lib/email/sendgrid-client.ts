import {
  appendEmailSendLog,
  loadEmailDrafts,
  loadEmailSuppressions,
  normalizeEmail,
} from "@/lib/email/email-staged-store";
import { buildEmailAudience } from "@/lib/email/build-email-audience";
import type { EmailCampaignDraft } from "@/lib/email/email-campaign-types";
import { getEmailReadinessReport } from "@/lib/email/email-readiness";

const SENDGRID_URL = "https://api.sendgrid.com/v3/mail/send";
const DEFAULT_LIVE_BATCH_LIMIT = 25;

function fromName(): string {
  return process.env.SENDGRID_FROM_NAME?.trim() || "Kelly for Secretary of State";
}

function replyTo(draft: EmailCampaignDraft): string | undefined {
  return draft.replyTo?.trim() || process.env.SENDGRID_REPLY_TO_EMAIL?.trim() || draft.fromEmail;
}

function logId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function findDraft(draftId: string): Promise<EmailCampaignDraft | null> {
  const rows = await loadEmailDrafts();
  return rows.find((d) => d.id === draftId) ?? null;
}

async function postSendGrid(args: {
  draft: EmailCampaignDraft;
  recipients: string[];
}): Promise<{ ok: true; statusCode: number } | { ok: false; message: string }> {
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  if (!apiKey) return { ok: false, message: "SENDGRID_API_KEY not configured" };
  const rendered = renderEmailWithComplianceFooter(args.draft);
  const personalizations = args.recipients.map((email) => ({ to: [{ email }] }));
  const payload: Record<string, unknown> = {
    personalizations,
    from: { email: args.draft.fromEmail, name: fromName() },
    subject: args.draft.subject,
    content: [
      { type: "text/plain", value: rendered.text },
      { type: "text/html", value: rendered.html },
    ],
  };
  const rt = replyTo(args.draft);
  if (rt) payload.reply_to = { email: rt };

  const res = await fetch(SENDGRID_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.status >= 200 && res.status < 300) return { ok: true, statusCode: res.status };
  return { ok: false, message: `SendGrid HTTP ${res.status}` };
}

export function renderEmailWithComplianceFooter(draft: EmailCampaignDraft): { html: string; text: string } {
  const footerText = `\n\n---\nPaid for by Kelly for Secretary of State.\n${draft.physicalAddress}\nUnsubscribe: ${draft.unsubscribeUrl}`;
  const footerHtml = `
<hr>
<p style="font-size:12px;color:#555">Paid for by Kelly for Secretary of State.<br>${draft.physicalAddress}<br><a href="${draft.unsubscribeUrl}">Unsubscribe</a></p>`;
  return {
    html: `${draft.html}${footerHtml}`,
    text: `${draft.text}${footerText}`,
  };
}

export async function sendTestEmail(draftId: string, testRecipients: string[]) {
  const draft = await findDraft(draftId);
  const recipients = [...new Set(testRecipients.map(normalizeEmail).filter((e) => e.includes("@")))];
  if (!draft || recipients.length === 0) {
    await appendEmailSendLog({ id: logId("blocked"), draftId, kind: "blocked", status: "blocked", recipients, recipientCount: recipients.length, message: "Missing draft or test recipients", createdAt: new Date().toISOString() });
    return { ok: false, message: "Missing draft or test recipients" };
  }
  if (!["approved_for_test", "test_sent", "approved_for_live"].includes(draft.status)) {
    await appendEmailSendLog({ id: logId("blocked"), draftId, kind: "blocked", status: "blocked", recipients, recipientCount: recipients.length, message: `Draft status ${draft.status} is not test-approved`, createdAt: new Date().toISOString() });
    return { ok: false, message: "Draft must be approved for test" };
  }
  const readiness = await getEmailReadinessReport();
  if (!readiness.canSendTest) {
    await appendEmailSendLog({ id: logId("blocked"), draftId, kind: "blocked", status: "blocked", recipients, recipientCount: recipients.length, message: readiness.blockers.join("; "), createdAt: new Date().toISOString() });
    return { ok: false, message: "Email readiness blocks test send" };
  }
  const result = await postSendGrid({ draft, recipients });
  await appendEmailSendLog({
    id: logId("test"),
    draftId,
    kind: "test",
    status: result.ok ? "sent" : "failed",
    recipients,
    recipientCount: recipients.length,
    message: result.ok ? `SendGrid accepted (${result.statusCode})` : result.message,
    createdAt: new Date().toISOString(),
  });
  return result.ok ? { ok: true, recipients: recipients.length } : { ok: false, message: result.message };
}

export async function sendApprovedEmailBatch(draftId: string, limit = DEFAULT_LIVE_BATCH_LIMIT) {
  const draft = await findDraft(draftId);
  if (!draft) return { ok: false, message: "Draft not found" };
  if (draft.status !== "approved_for_live") {
    await appendEmailSendLog({ id: logId("blocked"), draftId, kind: "blocked", status: "blocked", recipients: [], recipientCount: 0, message: `Draft status ${draft.status} is not approved_for_live`, createdAt: new Date().toISOString() });
    return { ok: false, message: "Draft must be approved for live" };
  }
  if (process.env.CONFIRM_LIVE_EMAIL_SEND !== "true") {
    await appendEmailSendLog({ id: logId("blocked"), draftId, kind: "blocked", status: "blocked", recipients: [], recipientCount: 0, message: "CONFIRM_LIVE_EMAIL_SEND=true required", createdAt: new Date().toISOString() });
    return { ok: false, message: "CONFIRM_LIVE_EMAIL_SEND=true required" };
  }
  const readiness = await getEmailReadinessReport();
  if (!readiness.canSendLive) return { ok: false, message: "Email readiness blocks live send" };

  const audience = await buildEmailAudience();
  const suppressions = new Set((await loadEmailSuppressions()).map((s) => normalizeEmail(s.email)));
  const tags = draft.audienceFilter.tags ?? [];
  const recipients = audience.eligible
    .filter((m) => !draft.audienceFilter.counties?.length || (m.county && draft.audienceFilter.counties.includes(m.county)))
    .filter((m) => !tags.length || tags.some((tag) => m.tags.includes(tag)))
    .map((m) => m.email)
    .filter((email) => !suppressions.has(email))
    .slice(0, Math.max(1, Math.min(limit, DEFAULT_LIVE_BATCH_LIMIT)));

  if (!recipients.length) return { ok: false, message: "No eligible recipients after filters/suppressions" };
  const result = await postSendGrid({ draft, recipients });
  await appendEmailSendLog({
    id: logId("live"),
    draftId,
    kind: "live_batch",
    status: result.ok ? "sent" : "failed",
    recipients,
    recipientCount: recipients.length,
    message: result.ok ? `SendGrid accepted live batch (${result.statusCode})` : result.message,
    createdAt: new Date().toISOString(),
  });
  return result.ok ? { ok: true, recipients: recipients.length } : { ok: false, message: result.message };
}
