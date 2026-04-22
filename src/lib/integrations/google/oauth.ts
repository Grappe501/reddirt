import { createOAuth2Client } from "./auth";

const SCOPE = ["https://www.googleapis.com/auth/calendar"];

export function getGoogleCalendarAuthUrl(state: string) {
  return createOAuth2Client().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPE,
    state,
  });
}

export async function exchangeCodeForTokens(code: string) {
  const c = createOAuth2Client();
  const { tokens } = await c.getToken(code);
  return tokens;
}
