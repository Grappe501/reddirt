/**
 * Staff Gmail uses the same Google Cloud OAuth client as Calendar when
 * `GOOGLE_GMAIL_CLIENT_*` is unset, but a **dedicated redirect URI** for
 * `/api/gmail/oauth/callback` (add it in Google Cloud console).
 */
export function getGmailEnv() {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const defaultRedirect = site ? `${site}/api/gmail/oauth/callback` : "";
  return {
    clientId:
      process.env.GOOGLE_GMAIL_CLIENT_ID?.trim() || process.env.GOOGLE_CALENDAR_CLIENT_ID?.trim() || "",
    clientSecret:
      process.env.GOOGLE_GMAIL_CLIENT_SECRET?.trim() || process.env.GOOGLE_CALENDAR_CLIENT_SECRET?.trim() || "",
    redirectUri: process.env.GOOGLE_GMAIL_REDIRECT_URI?.trim() || defaultRedirect,
  };
}

export function isGmailOAuthConfigured(): boolean {
  const e = getGmailEnv();
  return Boolean(e.clientId && e.clientSecret && e.redirectUri);
}
