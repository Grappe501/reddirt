import { timingSafeEqual } from "crypto";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getGmailPubSubVerificationTokenFromEnv,
  isGmailPubSubVerificationConfigured,
} from "@/lib/gmail/watch-config";
import { mergeGmailSyncStatePatch, parseGmailSyncState } from "@/lib/gmail/gmail-sync-state";
import { parseGmailNotificationUtf8 } from "@/lib/gmail/pubsub-notify-parse";

export const dynamic = "force-dynamic";

function timingSafeTokenMatch(expected: string, received: string): boolean {
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(received, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

type PubSubEnvelope = {
  message?: { data?: string; messageId?: string; publishTime?: string };
  subscription?: string;
};

/**
 * Gmail Pub/Sub push **scaffold** — records notification metadata only.
 * Requires `GMAIL_PUBSUB_VERIFICATION_TOKEN` or `GOOGLE_PUBSUB_VERIFICATION_TOKEN` and header `x-gmail-pubsub-token`.
 * Does not fetch messages or bodies; does not create queue items.
 */
export async function POST(req: Request): Promise<Response> {
  if (!isGmailPubSubVerificationConfigured()) {
    return NextResponse.json({ error: "pubsub_verification_not_configured" }, { status: 403 });
  }

  const expected = getGmailPubSubVerificationTokenFromEnv();
  const hdr = req.headers.get("x-gmail-pubsub-token")?.trim() ?? "";
  if (!timingSafeTokenMatch(expected, hdr)) {
    return new NextResponse(null, { status: 401 });
  }

  let body: PubSubEnvelope;
  try {
    body = (await req.json()) as PubSubEnvelope;
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const rawB64 = body.message?.data;
  if (!rawB64) {
    return new NextResponse(null, { status: 204 });
  }

  let decoded: string;
  try {
    decoded = Buffer.from(rawB64, "base64").toString("utf8");
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const parsed = parseGmailNotificationUtf8(decoded);
  if (!parsed) {
    return new NextResponse(null, { status: 400 });
  }
  const { emailAddress, historyId } = parsed;

  const row = await prisma.staffGmailAccount.findFirst({
    where: { isActive: true, sendAsEmail: { equals: emailAddress, mode: "insensitive" } },
  });

  if (!row) {
    return new NextResponse(null, { status: 204 });
  }

  const nowIso = new Date().toISOString();
  const prior = parseGmailSyncState(row.gmailSyncState);
  const count = prior.pubSubNotificationCount ?? 0;

  const next = mergeGmailSyncStatePatch(row.gmailSyncState, {
    lastPubSubNotificationAt: nowIso,
    lastPubSubHistoryId: historyId,
    pendingHistoryId: historyId,
    pubSubNotificationCount: count + 1,
  });

  await prisma.staffGmailAccount.update({
    where: { id: row.id },
    data: { gmailSyncState: next as unknown as Prisma.InputJsonValue },
  });

  return new NextResponse(null, { status: 204 });
}
