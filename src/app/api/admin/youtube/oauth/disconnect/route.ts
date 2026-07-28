import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { clearYouTubeOAuthStore } from "@/lib/media/youtube-transcripts/oauth-store";

export const dynamic = "force-dynamic";

export async function POST() {
  const denied = await assertAdminApi();
  if (denied) return denied;
  clearYouTubeOAuthStore();
  return NextResponse.json({ ok: true });
}
