import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";
import { semanticSearch, buildContextBlock } from "@/lib/openai/search";
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

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`assistant:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "rate_limited", retryAfterMs: rl.retryAfterMs }, { status: 429 });
  }

  if (!isOpenAIConfigured()) {
    return NextResponse.json(
      {
        error: "not_configured",
        message: "OPENAI_API_KEY is not set.",
      },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation", message: "`message` required" }, { status: 400 });
  }

  const { message, journeyBeatId, journeyBeatLabel, journeyBeatDescription, pathname } = parsed.data;

  const journeyBlock =
    journeyBeatId != null
      ? `VISITOR POSITION:\n- URL path: ${pathname ?? "/"}\n- Journey chapter id: ${journeyBeatId}\n- Chapter: ${journeyBeatLabel ?? "n/a"}\n- Intent: ${journeyBeatDescription ?? "n/a"}\n\n`
      : pathname != null
        ? `VISITOR POSITION:\n- URL path: ${pathname}\n\n`
        : "";

  try {
    const hits = await semanticSearch(message, 8);
    if (!hits.length) {
      return NextResponse.json({
        reply:
          "I don’t have indexed site content yet. Ask an organizer to run `npx tsx scripts/ingest-docs.ts` after setting DATABASE_URL and OPENAI_API_KEY.",
        suggestions: [
          { label: "Office priorities", href: "/priorities" },
          { label: "Direct democracy", href: "/direct-democracy" },
          { label: "Get involved", href: "/get-involved" },
        ],
      });
    }

    const client = getOpenAIClient();
    const { model } = getOpenAIConfigFromEnv();
    const context = buildContextBlock(hits, 10000);
    const completion = await client.chat.completions.create({
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

    const reply = completion.choices[0]?.message?.content?.trim() ?? "";
    const suggestions = hits.slice(0, 3).map((h) => ({
      label: h.title || h.path,
      href: pathToHref(h.path),
    }));

    return NextResponse.json({ reply, suggestions });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "assistant_failed" }, { status: 500 });
  }
}
