import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdminApi } from "@/lib/admin/require-admin";
import {
  formatConversationForPrompt,
  normalizeHistory,
  searchQueryFromTurns,
} from "@/lib/assistant/conversation";
import {
  formatOpenAIErrorForClient,
  getOpenAIClient,
  getOpenAIConfigFromEnv,
  isOpenAIConfigured,
} from "@/lib/openai/client";
import {
  buildStrategyPartnerContextBlock,
  selectStrategyManualChunksForQuery,
} from "@/lib/campaign-strategy/strategy-partner-retrieval";
import { runStrategyPartnerCompletion } from "@/lib/campaign-strategy/strategy-partner-completion";
import { getCachedAllStrategyManualChunks, toIndexRow } from "@/lib/campaign-strategy/strategy-chunking";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const historyEntrySchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().max(6000),
});

const bodySchema = z.object({
  message: z.string().min(1).max(4000),
  history: z.array(historyEntrySchema).max(16).optional(),
  /** Same as campaign-strategy route segment; biases retrieval. Omit to search entire manual. */
  pathKey: z.string().max(120).optional(),
});

export async function GET() {
  const denied = await assertAdminApi();
  if (denied) return denied;
  return NextResponse.json({
    ok: true,
    route: "admin/campaign-strategy/strategy-partner",
    openai: isOpenAIConfigured(),
    post: "Send { message, optional history, optional pathKey }.",
  });
}

export async function POST(req: Request) {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const ip = clientIp(req);
  const rl = rateLimit(`strategy-partner:${ip}`, 12, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Too many strategy partner requests. Try again shortly.",
        retryAfterMs: rl.retryAfterMs,
      },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json", message: "Body must be JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", message: "Send a non-empty `message` (max 4000 characters)." },
      { status: 400 },
    );
  }

  const { message, pathKey: pathKeyRaw } = parsed.data;
  const history = normalizeHistory(parsed.data.history);
  const pathKey = pathKeyRaw !== undefined ? pathKeyRaw.trim() : undefined;

  if (!isOpenAIConfigured()) {
    return NextResponse.json(
      {
        error: "not_configured",
        message: "OpenAI is not configured (OPENAI_API_KEY).",
      },
      { status: 503 },
    );
  }

  let all;
  try {
    all = await getCachedAllStrategyManualChunks();
  } catch (e) {
    console.error("[strategy-partner] chunk load", e);
    return NextResponse.json(
      { error: "chunks_unavailable", message: "Could not load strategy manual chunks from disk." },
      { status: 500 },
    );
  }

  const retrievalQuery = searchQueryFromTurns(message, history);
  const selected = selectStrategyManualChunksForQuery(all, retrievalQuery, {
    pathKey,
    topK: 10,
  });
  const context = buildStrategyPartnerContextBlock(selected, 14_000);
  const conversationBlock = formatConversationForPrompt(history);
  const scopeNote =
    pathKey !== undefined
      ? `Retrieval scope: biased toward chapter pathKey=${pathKey === "" ? '"" (overview)' : pathKey}.\n\n`
      : "Retrieval scope: full index (Kelly SOS strategic plan + campaign-system-manual).\n\n";

  const userPayload = [
    conversationBlock,
    scopeNote,
    `CONTEXT:\n${context}\n\n`,
    "OPERATOR QUESTION:\n",
    message,
  ].join("");

  try {
    const client = getOpenAIClient();
    const { model } = getOpenAIConfigFromEnv();
    const reply = await runStrategyPartnerCompletion(client, model, userPayload);
    if (!reply) {
      return NextResponse.json(
        { error: "empty_reply", message: "The model returned no text." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      reply,
      chunksUsed: selected.map((c) => {
        const row = toIndexRow(c);
        return {
          id: c.id,
          manualDomain: c.manualDomain,
          repoRelativePath: row.repoRelativePath,
          adminReaderUrl: row.adminReaderUrl,
          navLabel: c.navLabel,
          heading: c.heading,
        };
      }),
    });
  } catch (e) {
    console.error("[strategy-partner] openai", e);
    const msg = formatOpenAIErrorForClient(e);
    return NextResponse.json({ error: "openai_failed", message: msg }, { status: 502 });
  }
}
