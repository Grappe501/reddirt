import { OAuth2Client } from "google-auth-library";
import {
  getGmailEnvForOAuth,
  getRequestedGmailScopes,
  isGmailOAuthCoreConfigured,
} from "@/lib/gmail/config";

export function createGmailOAuth2Client() {
  if (!isGmailOAuthCoreConfigured()) {
    throw new Error("Gmail OAuth is not configured (Gmail/Calendar client id+secret+redirect).");
  }
  const e = getGmailEnvForOAuth();
  return new OAuth2Client(e.clientId, e.clientSecret, e.redirectUri);
}

/** Build Google consent URL with signed `state` (caller supplies state string). */
export function getGmailAuthUrl(state: string) {
  const c = createGmailOAuth2Client();
  return c.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [...getRequestedGmailScopes()],
    state,
  });
}

export async function exchangeGmailCodeForTokens(code: string) {
  const c = createGmailOAuth2Client();
  const { tokens } = await c.getToken(code);
  return tokens;
}
