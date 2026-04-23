function calendarCred(value: string | undefined): string {
  const t = value?.trim() ?? "";
  if (!t) return "";
  const lower = t.toLowerCase();
  if (
    lower === "your_client_id" ||
    lower === "your_client_secret" ||
    lower.startsWith("your_") ||
    lower === "xxx" ||
    lower === "changeme"
  ) {
    return "";
  }
  return t;
}

/** Google Calendar OAuth + API — set in `.env` (never commit secrets). */
export function getGoogleCalendarEnv() {
  const clientId =
    calendarCred(process.env.GOOGLE_CALENDAR_CLIENT_ID) ||
    calendarCred(process.env.GOOGLE_GMAIL_CLIENT_ID) ||
    calendarCred(process.env.GOOGLE_CLIENT_ID) ||
    "";
  const clientSecret =
    calendarCred(process.env.GOOGLE_CALENDAR_CLIENT_SECRET) ||
    calendarCred(process.env.GOOGLE_GMAIL_CLIENT_SECRET) ||
    calendarCred(process.env.GOOGLE_CLIENT_SECRET) ||
    "";
  return {
    clientId,
    clientSecret,
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
