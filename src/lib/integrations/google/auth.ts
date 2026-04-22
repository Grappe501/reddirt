import { google } from "googleapis";
import { getGoogleCalendarEnv, isGoogleCalendarConfigured } from "@/lib/calendar/env";

export function createOAuth2Client() {
  const e = getGoogleCalendarEnv();
  if (!isGoogleCalendarConfigured()) throw new Error("GOOGLE_CALENDAR_CLIENT_ID/SECRET/REDIRECT_URI required");
  return new google.auth.OAuth2(e.clientId, e.clientSecret, e.redirectUri);
}
