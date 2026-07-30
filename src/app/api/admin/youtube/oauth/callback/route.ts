import { NextResponse } from "next/server";
import { exchangeYouTubeCodeForTokens, validateYouTubeConnection } from "@/lib/media/youtube-transcripts/oauth-client";
import { verifyYouTubeOAuthState } from "@/lib/media/youtube-transcripts/oauth-state";
import { buildYouTubeSealedRecord, saveYouTubeSealedOAuth } from "@/lib/media/youtube-transcripts/oauth-store";
import { getYouTubeOAuthEnv } from "@/lib/media/youtube-transcripts/oauth-config";

export const dynamic = "force-dynamic";

const DEFAULT_RETURN = "/admin/media/youtube";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const stateRaw = url.searchParams.get("state");
  const err = url.searchParams.get("error");

  const fail = (returnPath: string, codeSuffix: string) =>
    NextResponse.redirect(new URL(`${returnPath}?yt_error=${encodeURIComponent(codeSuffix)}`, origin));

  if (err) return fail(DEFAULT_RETURN, err);

  const st = verifyYouTubeOAuthState(stateRaw);
  if (!code || !st) return fail(DEFAULT_RETURN, "youtube_oauth");

  try {
    const tokens = await exchangeYouTubeCodeForTokens(code);
    let sealed;
    try {
      sealed = buildYouTubeSealedRecord(tokens, {
        channelId: getYouTubeOAuthEnv().channelId ?? null,
      });
    } catch {
      return fail(st.ret, "youtube_no_encrypt_key");
    }
    saveYouTubeSealedOAuth(sealed);

    const validated = await validateYouTubeConnection();
    if (validated.ok) {
      sealed = buildYouTubeSealedRecord(tokens, {
        connectedAtIso: sealed.meta.connectedAtIso,
        channelId: validated.channelId ?? getYouTubeOAuthEnv().channelId ?? null,
        channelTitle: validated.channelTitle ?? null,
      });
      saveYouTubeSealedOAuth(sealed);
    }
  } catch {
    return fail(st.ret, "youtube_token");
  }

  const nextUrl = new URL(st.ret, origin);
  nextUrl.searchParams.set("yt", "1");
  return NextResponse.redirect(nextUrl);
}
