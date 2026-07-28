import { NextResponse } from "next/server";
import { recordTranscriptAnalytics, type TranscriptAnalyticsEventType } from "@/lib/media/youtube-transcripts/analytics";

export const dynamic = "force-dynamic";

const ALLOWED: TranscriptAnalyticsEventType[] = [
  "TRANSCRIPT_OPEN",
  "TRANSCRIPT_SEARCH",
  "TRANSCRIPT_DOWNLOAD",
  "TRANSCRIPT_COPY_QUOTE",
  "PAGE_VIEW",
];

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    type?: string;
    youtubeVideoId?: string;
    slug?: string;
  };
  if (!body.type || !ALLOWED.includes(body.type as TranscriptAnalyticsEventType)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    recordTranscriptAnalytics({
      type: body.type as TranscriptAnalyticsEventType,
      youtubeVideoId: body.youtubeVideoId?.slice(0, 32),
      slug: body.slug?.slice(0, 120),
    });
  } catch {
    /* analytics must not break UX — especially on read-only deploys */
  }
  return NextResponse.json({ ok: true });
}
