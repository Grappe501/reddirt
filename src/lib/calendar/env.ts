/** Google Calendar OAuth + API — set in `.env` (never commit secrets). */
export function getGoogleCalendarEnv() {
  return {
    clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID?.trim() ?? "",
    clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET?.trim() ?? "",
    redirectUri:
      process.env.GOOGLE_CALENDAR_REDIRECT_URI?.trim() ??
      (process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/api/calendar/google/callback`
        : ""),
  };
}

export function isGoogleCalendarConfigured(): boolean {
  const e = getGoogleCalendarEnv();
  return Boolean(e.clientId && e.clientSecret && e.redirectUri);
}

/**
 * When true, events **ingested** from a `CalendarSource` with `isPublicFacing` are published to the
 * public site immediately (and Google remains the copy source for title/time/location/description).
 * Requires cron or webhook sync to be running. Off by default so staff can review first.
 */
export function isGoogleCalendarAutoPublishPublicFacingIngestEnabled(): boolean {
  const v = process.env.GOOGLE_CALENDAR_AUTO_PUBLISH_PUBLIC_FACING?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}
