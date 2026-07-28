import { OAuth2Client, type Credentials } from "google-auth-library";
import {
  getRequestedYouTubeScopes,
  getYouTubeOAuthEnv,
  isYouTubeOAuthCoreConfigured,
} from "./oauth-config";
import {
  buildYouTubeSealedRecord,
  extractYouTubeCredentials,
  loadYouTubeSealedOAuth,
  saveYouTubeSealedOAuth,
} from "./oauth-store";

export function createYouTubeOAuth2Client(): OAuth2Client {
  if (!isYouTubeOAuthCoreConfigured()) {
    throw new Error("YouTube OAuth is not configured (client id/secret/redirect + encryption key).");
  }
  const e = getYouTubeOAuthEnv();
  return new OAuth2Client(e.clientId, e.clientSecret, e.redirectUri);
}

export function getYouTubeAuthUrl(state: string): string {
  const c = createYouTubeOAuth2Client();
  return c.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [...getRequestedYouTubeScopes()],
    state,
  });
}

export async function exchangeYouTubeCodeForTokens(code: string): Promise<Credentials> {
  const c = createYouTubeOAuth2Client();
  const { tokens } = await c.getToken(code);
  return tokens;
}

/**
 * Returns a valid access token, refreshing and re-sealing when needed.
 * Never returns refresh_token to callers beyond Credentials used server-side.
 */
export async function getValidYouTubeAccessToken(repoRoot: string = process.cwd()): Promise<{
  accessToken: string;
  credentials: Credentials;
}> {
  const sealed = loadYouTubeSealedOAuth(repoRoot);
  const creds = extractYouTubeCredentials(sealed);
  if (!creds?.refresh_token && !creds?.access_token) {
    throw new Error("YouTube channel is not connected.");
  }

  const client = createYouTubeOAuth2Client();
  client.setCredentials(creds);

  const expiry = creds.expiry_date ?? 0;
  const needsRefresh = !creds.access_token || expiry < Date.now() + 60_000;
  if (needsRefresh) {
    if (!creds.refresh_token) throw new Error("YouTube OAuth expired — reconnect the channel.");
    const refreshed = await client.refreshAccessToken();
    const next = refreshed.credentials;
    // Preserve refresh_token if Google omits it on refresh
    const merged: Credentials = {
      ...creds,
      ...next,
      refresh_token: next.refresh_token ?? creds.refresh_token,
    };
    client.setCredentials(merged);
    const nextSealed = buildYouTubeSealedRecord(merged, {
      connectedAtIso: sealed?.meta.connectedAtIso,
      channelId: sealed?.meta.channelId ?? null,
      channelTitle: sealed?.meta.channelTitle ?? null,
      accountEmail: sealed?.meta.accountEmail ?? null,
    });
    saveYouTubeSealedOAuth(nextSealed, repoRoot);
    if (!merged.access_token) throw new Error("YouTube token refresh failed.");
    return { accessToken: merged.access_token, credentials: merged };
  }

  if (!creds.access_token) throw new Error("YouTube access token missing.");
  return { accessToken: creds.access_token, credentials: creds };
}

export async function validateYouTubeConnection(repoRoot: string = process.cwd()): Promise<{
  ok: boolean;
  error?: string;
  channelId?: string | null;
  channelTitle?: string | null;
}> {
  try {
    const { accessToken } = await getValidYouTubeAccessToken(repoRoot);
    const res = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" },
    );
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `YouTube API ${res.status}: ${text.slice(0, 180)}` };
    }
    const json = (await res.json()) as {
      items?: Array<{ id?: string; snippet?: { title?: string } }>;
    };
    const item = json.items?.[0];
    return {
      ok: true,
      channelId: item?.id ?? null,
      channelTitle: item?.snippet?.title ?? null,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
