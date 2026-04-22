import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";
import { Credentials } from "google-auth-library";
import { createGmailOAuth2Client } from "./oauth";
import { prisma } from "@/lib/db";
import { isGmailOAuthConfigured } from "./env";

function b64url(buf: Buffer) {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function buildRfc822(params: {
  from: string;
  to: string;
  subject: string;
  body: string;
  inReplyTo?: string | null;
  references?: string | null;
}) {
  const lines = [
    `From: ${params.from}`,
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
  ];
  if (params.inReplyTo) lines.push(`In-Reply-To: ${params.inReplyTo}`);
  if (params.references) lines.push(`References: ${params.references}`);
  lines.push("", params.body);
  return lines.join("\r\n");
}

export async function getGmailAuthForUser(userId: string): Promise<OAuth2Client | null> {
  const acc = await prisma.staffGmailAccount.findUnique({ where: { userId } });
  if (!acc || !acc.isActive) return null;
  if (!isGmailOAuthConfigured()) return null;
  const tokens = acc.oauthJson as unknown as Credentials;
  if (!tokens?.refresh_token && !tokens?.access_token) return null;
  const client = createGmailOAuth2Client();
  client.setCredentials(tokens);
  return client;
}

export async function sendStaffGmailMessage(params: {
  userId: string;
  to: string;
  subject: string;
  body: string;
  threadId?: string | null;
}): Promise<{ id: string; threadId: string | null; rawError?: string }> {
  const auth = await getGmailAuthForUser(params.userId);
  if (!auth) {
    return { id: "", threadId: null, rawError: "Gmail not connected for staff user" };
  }
  const acc = await prisma.staffGmailAccount.findUnique({ where: { userId: params.userId } });
  if (!acc) {
    return { id: "", threadId: null, rawError: "Gmail account row missing" };
  }
  const from = acc.sendAsEmail;
  const rfc = buildRfc822({
    from,
    to: params.to.trim(),
    subject: params.subject,
    body: params.body,
  });
  const raw = b64url(Buffer.from(rfc, "utf8"));
  const gmail = google.gmail({ version: "v1", auth });
  const body: { raw: string; threadId?: string } = { raw };
  if (params.threadId) body.threadId = params.threadId;
  try {
    const res = await gmail.users.messages.send({ userId: "me", requestBody: body });
    return { id: res.data.id ?? "", threadId: res.data.threadId ?? null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { id: "", threadId: null, rawError: msg };
  }
}

export async function fetchGmailUserEmail(userId: string): Promise<string | null> {
  const auth = await getGmailAuthForUser(userId);
  if (!auth) return null;
  const gmail = google.gmail({ version: "v1", auth });
  const p = await gmail.users.getProfile({ userId: "me" });
  return p.data.emailAddress ?? null;
}
