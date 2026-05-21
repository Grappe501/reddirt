import {
  findKellyConfirmedCalendarSource,
  findKellyTentativeCalendarSource,
} from "@/lib/calendar/kelly-google-calendar-policy";
import { isGoogleCalendarConfigured } from "@/lib/calendar/env";

export type CalendarPromotionConfig = {
  writeEnabled: boolean;
  readyToWrite: boolean;
  missingConfig: string[];
  disabledReason: string | null;
  tentativeSourceReady: boolean;
  officialSourceReady: boolean;
  googleOAuthConfigured: boolean;
};

function envTruthy(raw: string | undefined): boolean {
  const v = raw?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

export async function getCalendarPromotionConfig(): Promise<CalendarPromotionConfig> {
  const writeEnabled = envTruthy(process.env.GOOGLE_CALENDAR_WRITE_ENABLED);
  const missingConfig: string[] = [];
  if (!writeEnabled) missingConfig.push("GOOGLE_CALENDAR_WRITE_ENABLED is not true");
  if (!isGoogleCalendarConfigured()) missingConfig.push("Google OAuth client env (GOOGLE_CALENDAR_* or GOOGLE_CLIENT_ID)");

  const tentative = await findKellyTentativeCalendarSource();
  const official = await findKellyConfirmedCalendarSource();
  const hasOauth = (s: { oauthJson: unknown } | null) => {
    if (!s) return false;
    const o = (s.oauthJson ?? {}) as { refresh_token?: string };
    return Boolean(o.refresh_token) && s.syncEnabled;
  };
  const tentativeSourceReady = hasOauth(tentative);
  const officialSourceReady = hasOauth(official);
  if (!tentativeSourceReady) missingConfig.push("Kelly Tentative CalendarSource + OAuth");
  if (!officialSourceReady) missingConfig.push("Kelly Confirmed/Official CalendarSource + OAuth");

  const readyToWrite = writeEnabled && missingConfig.length === 0;
  return {
    writeEnabled,
    readyToWrite,
    missingConfig,
    disabledReason: readyToWrite
      ? null
      : missingConfig.length
        ? `Google write disabled: ${missingConfig.join("; ")}`
        : "Google write disabled",
    tentativeSourceReady,
    officialSourceReady,
    googleOAuthConfigured: isGoogleCalendarConfigured(),
  };
}
