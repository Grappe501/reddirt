import { OAuth2Client } from "google-auth-library";
import { getGoogleCalendarEnv, isGoogleCalendarConfigured } from "@/lib/calendar/env";

export function createOAuth2Client() {
  const e = getGoogleCalendarEnv();
  if (!isGoogleCalendarConfigured()) throw new Error("GOOGLE_CALENDAR_CLIENT_ID/SECRET/REDIRECT_URI required");
  return new OAuth2Client(e.clientId, e.clientSecret, e.redirectUri);
}
