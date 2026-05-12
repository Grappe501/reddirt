/**
 * Server-only Gmail API client wiring (no token exposure).
 */

import { gmail } from "@googleapis/gmail";
import { prisma } from "@/lib/db";
import { getGmailAuthForUser } from "@/lib/integrations/gmail/gmail-api";

export async function getGmailApiForStaffUser(userId: string) {
  const auth = await getGmailAuthForUser(userId);
  if (!auth) return null;
  try {
    await auth.getAccessToken();
  } catch {
    return null;
  }
  return gmail({ version: "v1", auth });
}

export async function getConnectedStaffGmailRow(userId: string) {
  return prisma.staffGmailAccount.findUnique({
    where: { userId, isActive: true },
  });
}

/** @alias Operator/admin monitor naming — same as {@link getConnectedStaffGmailRow}. */
export const getConnectedGmailAccountForAdmin = getConnectedStaffGmailRow;

/**
 * Refresh OAuth access token if expired (uses refresh_token when present).
 * Server-only; never log tokens.
 */
export async function refreshGmailAccessTokenIfNeeded(userId: string): Promise<boolean> {
  const auth = await getGmailAuthForUser(userId);
  if (!auth) return false;
  try {
    await auth.getAccessToken();
    return true;
  } catch {
    return false;
  }
}

/**
 * Server-only helper for API calls that need a raw Bearer value.
 * Never return this to client components, never log it.
 */
export async function getDecryptedGmailAccessTokenForAccount(userId: string): Promise<string | null> {
  const auth = await getGmailAuthForUser(userId);
  if (!auth) return null;
  try {
    const t = await auth.getAccessToken();
    return t.token ?? null;
  } catch {
    return null;
  }
}
