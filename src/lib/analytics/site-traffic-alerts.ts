import "server-only";

import { shouldSendCitySpike } from "@/lib/analytics/site-traffic-alert-rules";
import { getOpsNotificationBccEmails, getOpsNotificationToEmails } from "@/lib/campaign-ops/ops-notifications";
import { CAMPAIGN_WEBSITE_URL } from "@/lib/campaign-links";
import { prisma } from "@/lib/db";
import { sendSendGridSingleTestEmail } from "@/lib/sendgrid/mail-send";

const CITY_SPIKE_WINDOW_MS = 15 * 60 * 1000;
const lastCityAlert = new Map<string, number>();

export function visitorDeskIntakeUrl(intakeId: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || CAMPAIGN_WEBSITE_URL).replace(/\/$/, "");
  return `${base}/admin/site-analytics/intake/${intakeId}`;
}

export function visitorDeskHomeUrl(): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || CAMPAIGN_WEBSITE_URL).replace(/\/$/, "");
  return `${base}/admin/site-analytics?days=1`;
}

async function sendDeskMail(subject: string, lines: string[]): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  const fromEmail = process.env.SENDGRID_FROM_EMAIL?.trim();
  const fromName = process.env.SENDGRID_FROM_NAME?.trim() || "Kelly Grappe Campaign";
  if (!apiKey || !fromEmail) return;
  const toList = getOpsNotificationToEmails();
  const to = toList[0];
  if (!to) return;
  const bcc = [...getOpsNotificationBccEmails(), ...toList.slice(1)].filter((row) => row && row !== to);
  const text = lines.filter(Boolean).join("\n");
  const html = `<pre style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.5">${text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")}</pre>`;
  const result = await sendSendGridSingleTestEmail({
    to,
    bcc: bcc.length ? bcc : undefined,
    subject,
    text,
    html,
    fromEmail,
    fromName,
  });
  if (!result.ok) {
    console.error("[visitor-desk-alert] email failed:", result.safeMessage);
  }
}

export async function sendVisitorDeskConvertAlert(input: {
  name: string;
  formType: string;
  intakeId: string;
  city?: string | null;
  county?: string | null;
}): Promise<void> {
  const name = input.name.trim() || "A neighbor";
  const form = input.formType.replaceAll("_", " ");
  await sendDeskMail(`[Visitor desk] ${name} finished ${form}`, [
    "A neighbor finished a public form. The visitor desk tab does not have to be open.",
    "",
    `Name: ${name}`,
    `Form: ${form}`,
    input.city ? `City: ${input.city}` : null,
    input.county ? `County: ${input.county}` : null,
    "",
    `Open intake: ${visitorDeskIntakeUrl(input.intakeId)}`,
    `Watch desk: ${visitorDeskHomeUrl()}`,
  ].filter((row): row is string => Boolean(row)));
}

export async function maybeSendVisitorDeskCitySpikeAlert(city: string, region?: string): Promise<void> {
  const label = region ? `${city}, ${region}` : city;
  const now = Date.now();
  const last = lastCityAlert.get(label) ?? null;
  const since = new Date(now - CITY_SPIKE_WINDOW_MS);
  let hits = 0;
  try {
    hits = await prisma.analyticsEvent.count({
      where: {
        name: "page_view",
        createdAt: { gte: since },
        payload: { path: ["city"], equals: city },
      },
    });
  } catch {
    return;
  }
  if (!shouldSendCitySpike({ hits, lastSentAt: last, now })) return;
  lastCityAlert.set(label, now);
  await sendDeskMail(`[Visitor desk] ${label} is busy`, [
    `${hits} public page views from ${label} in the last 15 minutes.`,
    "",
    `Watch desk: ${visitorDeskHomeUrl()}`,
  ]);
}
