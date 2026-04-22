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
