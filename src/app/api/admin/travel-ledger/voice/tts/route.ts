import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;
  const { text } = (await request.json()) as { text?: string };
  if (!process.env.ELEVENLABS_API_KEY) {
    return NextResponse.json({
      ok: true,
      mode: "browser-fallback",
      message: text ?? "Voice is not configured. Use manual wizard controls.",
    });
  }
  return NextResponse.json({
    ok: false,
    mode: "server-side-pending",
    error: "ElevenLabs server TTS wiring is intentionally deferred in this RedDirt integration pass.",
  }, { status: 501 });
}
