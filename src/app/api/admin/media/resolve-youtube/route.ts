import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { resolveCampaignMediaImport } from "@/lib/media/campaign-media-import";

export const dynamic = "force-dynamic";

/**
 * Resolve a pasted YouTube URL/id against the campaign media registry.
 * Duplicates return OPEN_EXISTING — never invent a second record here.
 */
export async function POST(request: Request) {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as { input?: string };
  const resolution = resolveCampaignMediaImport(String(body.input ?? ""));
  return NextResponse.json({
    ok: resolution.action !== "INVALID_INPUT",
    ...resolution,
    media: resolution.media
      ? {
          id: resolution.media.id,
          slug: resolution.media.slug,
          title: resolution.media.title,
          youtubeVideoId: resolution.media.youtubeVideoId,
          format: resolution.media.format,
          publicationStatus: resolution.media.publicationStatus,
          transcriptStatus: resolution.media.transcript.status,
        }
      : null,
  });
}
