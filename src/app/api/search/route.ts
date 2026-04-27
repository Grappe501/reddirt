import { NextResponse } from "next/server";
import { z } from "zod";
import { isOpenAIConfigured, getOpenAIClient, getOpenAIConfigFromEnv } from "@/lib/openai/client";
import { prisma } from "@/lib/db";
import { buildContextBlock, prioritizeHitsForAssistant, searchChunks } from "@/lib/openai/search";
import {
  KELLY_PUBLIC_CONTACT_EMAIL,
  SEARCH_DIALOG_GUIDE_PROMPT,
} from "@/lib/openai/prompts";
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
    const SEARCH_RESULT_LIMIT = 10;
    const wide = await searchChunks(query, 18);
    const hits = prioritizeHitsForAssistant(wide, SEARCH_RESULT_LIMIT);
    const results = hits.map((h) => ({
      path: h.path,
      title: h.title,
      snippet: h.content.slice(0, 280) + (h.content.length > 280 ? "…" : ""),
      score: h.score,
    }));

    let answer: string | null = null;
    if (includeAnswer) {
      const titlesLine = hits.length
        ? hits
            .slice(0, 8)
            .map((h) => h.title || h.path)
            .join(" · ")
        : "";

      if (hits.length === 0) {
        answer =
          `I couldn’t line up a strong match in Kelly’s site library for that search—try different keywords, a shorter phrase, or the main menu. ` +
          `If you’re after something specific about Kelly or this race, email ${KELLY_PUBLIC_CONTACT_EMAIL} and a real human can help. ` +
          `We hope we can earn your vote in November. If you’re able, donating through this site keeps the campaign reaching every county—and we’d love to have you on the team via Get involved.`;
      } else if (!isOpenAIConfigured()) {
        answer =
          `Here are the on-site pages that best matched your search (see Sources below). A full conversational summary needs the semantic index and message support enabled on the server—for now, open a title that looks right. ` +
          `Still stuck? ${KELLY_PUBLIC_CONTACT_EMAIL}. We’re building a campaign that shows up for all 75 counties, and we hope we can earn your vote in November. Chip in on Donate if you can, and Get involved if you want to join us.`;
      } else {
        try {
          const client = getOpenAIClient();
          const { model } = getOpenAIConfigFromEnv();
          const context = buildContextBlock(hits, 10000);
          const completion = await client.chat.completions.create({
            model,
            temperature: 0.36,
            messages: [
              { role: "system", content: SEARCH_DIALOG_GUIDE_PROMPT },
              {
                role: "user",
                content:
                  "RETRIEVAL: CONTEXT is re-ranked so on-site campaign excerpts (route:, brief:, docs/) come before external: background when both matched. Prefer citing those for Kelly / this race; use external excerpts only as supporting color.\n\n" +
                  `CONTEXT:\n${context}\n\nVISITOR SEARCH / QUESTION:\n${query}\n\nTOP RESULT TITLES THEY WILL SEE (for orientation only; ground claims in CONTEXT):\n${titlesLine}`,
              },
            ],
          });
          answer = completion.choices[0]?.message?.content?.trim() ?? null;
        } catch (ansErr) {
          console.error("[search] answer generation failed:", ansErr);
          answer =
            `I found pages that match your search (below), but I couldn’t write up a guided summary just now—technology had a moment. ` +
            `Click through the sources that look closest to what you need. ` +
            `If you’re still empty-handed, email ${KELLY_PUBLIC_CONTACT_EMAIL} with what you were trying to find. ` +
            `We hope we can earn your vote in November—pitch in on Donate if you’re able, and check Get involved to join the team.`;
        }
        if (!answer?.length) {
          answer =
            `Here’s what the site turned up (see Sources). Open a link for the full picture. ` +
            `Want more? Run another search or ask at ${KELLY_PUBLIC_CONTACT_EMAIL}. ` +
            `We hope we can earn your vote in November—Get involved and Donate if Kelly’s your kind of public servant.`;
        }
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
