import { assertAdminApi } from "@/lib/admin/require-admin";

export const maxDuration = 60;

const MAX_TEXT_CHARS = 1200;

/**
 * Server-only ElevenLabs TTS for admin onboarding. Requires admin session cookie; API key stays on server.
 * POST { text: string } → audio/mpeg, or JSON error (no stack traces).
 */
export async function POST(req: Request) {
  const auth = await assertAdminApi();
  if (auth) return auth;

  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim();
  if (!apiKey || !voiceId) {
    return Response.json(
      {
        error: "Voice assist is not available for this site until environment setup is complete.",
        code: "tts_unconfigured",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const rawText = (body as { text?: unknown }).text;
  const text = typeof rawText === "string" ? rawText : "";
  const trimmed = text.trim();
  if (!trimmed) {
    return Response.json({ error: "Text is required." }, { status: 400 });
  }
  if (trimmed.length > MAX_TEXT_CHARS) {
    return Response.json(
      { error: `Text must be at most ${MAX_TEXT_CHARS} characters.` },
      { status: 400 },
    );
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`;

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: trimmed,
        model_id: "eleven_flash_v2_5",
      }),
    });

    if (!upstream.ok) {
      return Response.json(
        { error: "Voice assist could not complete that request. Try again in a moment." },
        { status: 502 },
      );
    }

    const buffer = await upstream.arrayBuffer();
    if (!buffer.byteLength) {
      return Response.json(
        { error: "Voice assist returned no audio. Try again in a moment." },
        { status: 502 },
      );
    }

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[api/ask-kelly/tts]", e);
    return Response.json(
      { error: "Voice assist is temporarily unavailable. Try again later." },
      { status: 502 },
    );
  }
}
