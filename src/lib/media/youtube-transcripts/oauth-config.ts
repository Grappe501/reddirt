/**
 * YouTube OAuth config for caption download/upload (campaign channel owner).
 */

export const YOUTUBE_CAPTION_SCOPES = [
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/youtube.readonly",
] as const;

export type YouTubeOAuthConfigStatus = {
  isConfigured: boolean;
  gaps: Array<{ missingEnvVars: string[] }>;
  clientIdPresent: boolean;
  clientSecretPresent: boolean;
  redirectUriPresent: boolean;
  encryptionPresent: boolean;
  channelIdPresent: boolean;
};

function firstEnv(...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = process.env[k]?.trim();
    if (v) return v;
  }
  return undefined;
}

export function getYouTubeOAuthEnv() {
  const clientId = firstEnv(
    "YOUTUBE_OAUTH_CLIENT_ID",
    "GOOGLE_YOUTUBE_CLIENT_ID",
    "GOOGLE_GMAIL_CLIENT_ID",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CALENDAR_CLIENT_ID",
  );
  const clientSecret = firstEnv(
    "YOUTUBE_OAUTH_CLIENT_SECRET",
    "GOOGLE_YOUTUBE_CLIENT_SECRET",
    "GOOGLE_GMAIL_CLIENT_SECRET",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CALENDAR_CLIENT_SECRET",
  );
  const redirectUri = firstEnv(
    "YOUTUBE_OAUTH_REDIRECT_URI",
    "GOOGLE_YOUTUBE_REDIRECT_URI",
  );
  const channelId = firstEnv("YOUTUBE_CHANNEL_ID");
  return { clientId, clientSecret, redirectUri, channelId };
}

export function getYouTubeOAuthConfigStatus(): YouTubeOAuthConfigStatus {
  const e = getYouTubeOAuthEnv();
  const encryptionPresent = Boolean(
    process.env.YOUTUBE_TOKEN_ENCRYPTION_KEY?.trim() || process.env.GMAIL_TOKEN_ENCRYPTION_KEY?.trim(),
  );
  const missing: string[] = [];
  if (!e.clientId) missing.push("YOUTUBE_OAUTH_CLIENT_ID (or GOOGLE_*_CLIENT_ID)");
  if (!e.clientSecret) missing.push("YOUTUBE_OAUTH_CLIENT_SECRET (or GOOGLE_*_CLIENT_SECRET)");
  if (!e.redirectUri) missing.push("YOUTUBE_OAUTH_REDIRECT_URI");
  if (!encryptionPresent) missing.push("YOUTUBE_TOKEN_ENCRYPTION_KEY");
  return {
    isConfigured: missing.length === 0,
    gaps: missing.length ? [{ missingEnvVars: missing }] : [],
    clientIdPresent: Boolean(e.clientId),
    clientSecretPresent: Boolean(e.clientSecret),
    redirectUriPresent: Boolean(e.redirectUri),
    encryptionPresent,
    channelIdPresent: Boolean(e.channelId),
  };
}

export function isYouTubeOAuthCoreConfigured(): boolean {
  return getYouTubeOAuthConfigStatus().isConfigured;
}

export function getRequestedYouTubeScopes(): readonly string[] {
  return YOUTUBE_CAPTION_SCOPES;
}
