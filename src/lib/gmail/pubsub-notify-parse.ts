/**
 * Pure parse for Gmail Pub/Sub notification JSON (decoded UTF-8).
 * No network, no secrets — for route + offline verification scripts.
 */

export type GmailNotifyDecoded = {
  emailAddress: string;
  historyId: string;
};

export function parseGmailNotificationJsonObject(data: unknown): GmailNotifyDecoded | null {
  if (data == null || typeof data !== "object" || Array.isArray(data)) return null;
  const o = data as Record<string, unknown>;
  const emailRaw = o.emailAddress;
  const histRaw = o.historyId;
  const emailAddress =
    typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";
  const historyId = histRaw != null && histRaw !== "" ? String(histRaw).trim() : "";
  if (!emailAddress || !historyId) return null;
  return { emailAddress, historyId };
}

export function parseGmailNotificationUtf8(decodedUtf8: string): GmailNotifyDecoded | null {
  try {
    const data = JSON.parse(decodedUtf8) as unknown;
    return parseGmailNotificationJsonObject(data);
  } catch {
    return null;
  }
}
