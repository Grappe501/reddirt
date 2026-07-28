import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { syncYouTubeTranscriptPipeline } from "@/lib/media/youtube-transcripts/sync-pipeline";
import { validateYouTubeConnection } from "@/lib/media/youtube-transcripts/oauth-client";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as {
    maxVideos?: number;
    downloadCaptions?: boolean;
  };

  const validated = await validateYouTubeConnection();
  if (!validated.ok) {
    return NextResponse.json({ ok: false, error: validated.error ?? "YouTube not connected" }, { status: 400 });
  }

  try {
    const result = await syncYouTubeTranscriptPipeline({
      maxVideos: body.maxVideos ?? 25,
      downloadCaptions: body.downloadCaptions !== false,
      author: "admin:sync",
    });
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
