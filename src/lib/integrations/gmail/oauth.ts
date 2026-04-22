import { google } from "googleapis";
import { getGmailEnv, isGmailOAuthConfigured } from "./env";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
];

export function createGmailOAuth2Client() {
  if (!isGmailOAuthConfigured()) throw new Error("Gmail OAuth is not configured (Gmail/Calendar client id+secret+redirect).");
  const e = getGmailEnv();
  return new google.auth.OAuth2(e.clientId, e.clientSecret, e.redirectUri);
}

export function getGmailAuthUrlForStaffUser(staffUserId: string) {
  const c = createGmailOAuth2Client();
  return c.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state: staffUserId,
  });
}

export async function exchangeGmailCodeForTokens(code: string) {
  const c = createGmailOAuth2Client();
  const { tokens } = await c.getToken(code);
  return tokens;
}
