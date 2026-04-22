import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";
import { searchChunks, buildContextBlock } from "@/lib/openai/search";
import { pathToHref } from "@/lib/search/paths";
import { RAG_ANSWER_SYSTEM_PROMPT } from "@/lib/openai/prompts";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  journeyBeatId: z.string().max(80).optional(),
  journeyBeatLabel: z.string().max(120).optional(),
  journeyBeatDescription: z.string().max(600).optional(),
  pathname: z.string().max(256).optional(),
});

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "assistant",
    openai: isOpenAIConfigured(),
  });
}

function errPayload(error: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error, message, ...extra }, { status: error === "rate_limited" ? 429 : 503 });
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`assistant:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Too many questions in a short time. Wait a moment and try again.",
        retryAfterMs: rl.retryAfterMs,
      },
      { status: 429 },
    );
  }

  if (!isOpenAIConfigured()) {
    return errPayload(
      "not_configured",
      "The campaign guide needs OPENAI_API_KEY in the server environment (.env). Add your key and restart the dev server.",
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json", message: "Request body was not valid JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", message: "Send a non-empty `message` (max 2000 characters)." },
      { status: 400 },
    );
  }

  const { message, journeyBeatId, journeyBeatLabel, journeyBeatDescription, pathname } = parsed.data;

  const journeyBlock =
    journeyBeatId != null
      ? `VISITOR POSITION:\n- URL path: ${pathname ?? "/"}\n- Journey chapter id: ${journeyBeatId}\n- Chapter: ${journeyBeatLabel ?? "n/a"}\n- Intent: ${journeyBeatDescription ?? "n/a"}\n\n`
      : pathname != null
        ? `VISITOR POSITION:\n- URL path: ${pathname}\n\n`
        : "";

  let hits;
  try {
    hits = await searchChunks(message, 8);
  } catch (e) {
    console.error("[assistant] searchChunks", e);
    const hint =
      e instanceof Error && /prisma|database|connect/i.test(e.message)
        ? " Check DATABASE_URL and run migrations (`npx prisma migrate deploy`)."
        : e instanceof Error && /401|API key|invalid/i.test(e.message)
          ? " Check OPENAI_API_KEY is valid."
          : "";
    return NextResponse.json(
      {
        error: "search_failed",
        message:
          `Could not search site content.${hint} Details: ${e instanceof Error ? e.message : "unknown error"}`,
      },
      { status: 503 },
    );
  }

  if (!hits.length) {
    return NextResponse.json({
      reply:
        "I don’t have indexed site content yet. Ask an organizer to run `npx tsx scripts/ingest-docs.ts` (with DATABASE_URL and OPENAI_API_KEY set) so I can answer from your pages.",
      suggestions: [
        { label: "Office priorities", href: "/priorities" },
        { label: "Direct democracy", href: "/direct-democracy" },
        { label: "Arkansas ballot initiative process", href: "/direct-democracy/ballot-initiative-process" },
        { label: "Get involved", href: "/get-involved" },
      ],
    });
  }

  try {
    const client = getOpenAIClient();
    const { model } = getOpenAIConfigFromEnv();
    const context = buildContextBlock(hits, 10000);

    let completion;
    try {
      completion = await client.chat.completions.create({
        model,
        temperature: 0.25,
        messages: [
          { role: "system", content: RAG_ANSWER_SYSTEM_PROMPT },
          {
            role: "user",
            content: `CONTEXT:\n${context}\n\n${journeyBlock}VISITOR QUESTION:\n${message}`,
          },
        ],
      });
    } catch (e) {
      console.error("[assistant] chat.completions", e);
      const msg = e instanceof Error ? e.message : "OpenAI request failed.";
      return NextResponse.json(
        {
          error: "openai_chat_failed",
          message: `The model could not answer: ${msg}`,
        },
        { status: 502 },
      );
    }

    const reply = completion.choices[0]?.message?.content?.trim() ?? "";
    const suggestions = hits.slice(0, 3).map((h) => ({
      label: h.title || h.path,
      href: pathToHref(h.path),
    }));

    return NextResponse.json({ reply: reply || "No text was returned from the model.", suggestions });
  } catch (e) {
    console.error("[assistant] unexpected", e);
    const msg = e instanceof Error ? e.message : "Unknown error.";
    return NextResponse.json(
      {
        error: "assistant_failed",
        message: `The guide hit an unexpected error: ${msg}`,
      },
      { status: 500 },
    );
  }
}
