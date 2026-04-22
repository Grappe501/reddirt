import { NextResponse } from "next/server";
import { z } from "zod";
import { isOpenAIConfigured, getOpenAIClient, getOpenAIConfigFromEnv } from "@/lib/openai/client";
import { prisma } from "@/lib/db";
import { searchChunks, buildContextBlock } from "@/lib/openai/search";
import { RAG_ANSWER_SYSTEM_PROMPT } from "@/lib/openai/prompts";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { databaseUnavailableResponse, isDatabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  query: z.string().min(1).max(500),
  includeAnswer: z.boolean().optional(),
});

export async function GET() {
  let chunkCount = 0;
  if (isDatabaseConfigured()) {
    try {
      chunkCount = await prisma.searchChunk.count();
    } catch {
      chunkCount = 0;
    }
  }
  return NextResponse.json({
    ok: true,
    route: "search",
    database: isDatabaseConfigured(),
    chunkCount,
    openai: isOpenAIConfigured(),
  });
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`search:${ip}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "rate_limited", retryAfterMs: rl.retryAfterMs }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation", message: "`query` required" }, { status: 400 });
  }

  const { query, includeAnswer } = parsed.data;

  if (!isDatabaseConfigured()) {
    return NextResponse.json(databaseUnavailableResponse(), { status: 503 });
  }

  try {
    const hits = await searchChunks(query, 10);
    const results = hits.map((h) => ({
      path: h.path,
      title: h.title,
      snippet: h.content.slice(0, 280) + (h.content.length > 280 ? "…" : ""),
      score: h.score,
    }));

    let answer: string | null = null;
    if (includeAnswer && isOpenAIConfigured() && hits.length) {
      try {
        const client = getOpenAIClient();
        const { model } = getOpenAIConfigFromEnv();
        const context = buildContextBlock(hits, 10000);
        const completion = await client.chat.completions.create({
          model,
          temperature: 0.3,
          messages: [
            { role: "system", content: RAG_ANSWER_SYSTEM_PROMPT },
            {
              role: "user",
              content: `CONTEXT:\n${context}\n\nQUESTION:\n${query}\n\nAnswer using CONTEXT only. If insufficient, say what is missing and suggest a page path from CONTEXT.`,
            },
          ],
        });
        answer = completion.choices[0]?.message?.content?.trim() ?? null;
      } catch (ansErr) {
        console.error("[search] answer generation failed:", ansErr);
      }
    }

    return NextResponse.json({ ok: true, results, answer });
  } catch (e) {
    console.error("[search]", e);
    const detail = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json(
      {
        ok: false,
        error: "search_failed",
        message: `Search failed: ${detail}. Check DATABASE_URL, run migrations, and try \`npm run ingest\` to populate the index.`,
      },
      { status: 500 },
    );
  }
}
