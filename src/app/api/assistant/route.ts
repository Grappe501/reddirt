import { NextResponse } from "next/server";
import { z } from "zod";
import {
  formatOpenAIErrorForClient,
  getOpenAIClient,
  getOpenAIConfigFromEnv,
  isOpenAIConfigured,
} from "@/lib/openai/client";
import { buildContextBlock, prioritizeHitsForAssistant, searchChunks } from "@/lib/openai/search";
import { pathToHref } from "@/lib/search/paths";
import {
  formatConversationForPrompt,
  normalizeHistory,
  searchQueryFromTurns,
} from "@/lib/assistant/conversation";
import { detectPlaybook, mergeSuggestions, playbookPromptBlock } from "@/lib/assistant/playbooks";
import { runCampaignAssistantCompletion } from "@/lib/assistant/run-completion";
import { replyChunks, sseEncode } from "@/lib/assistant/sse";
import { ASSISTANT_API_VERSION, ASSISTANT_CAPABILITIES } from "@/lib/assistant/version";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const historyEntrySchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().max(6000),
});

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  /** Prior turns (v2). Excludes the current `message`; typically all chat lines before this send. */
  history: z.array(historyEntrySchema).max(20).optional(),
  /** Client hint; server responds with its own `version`. */
  version: z.string().max(8).optional(),
  /** v3: SSE stream of `data:` JSON events (meta → deltas → done). */
  stream: z.boolean().optional(),
  /** v3: answer shape — concise recommended for the dock. */
  responseStyle: z.enum(["concise", "normal", "detailed"]).optional(),
  journeyBeatId: z.string().max(80).optional(),
  journeyBeatLabel: z.string().max(120).optional(),
  journeyBeatDescription: z.string().max(600).optional(),
  pathname: z.string().max(256).optional(),
});

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "assistant",
    version: ASSISTANT_API_VERSION,
    capabilities: [...ASSISTANT_CAPABILITIES],
    openai: isOpenAIConfigured(),
  });
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`assistant:${ip}`, 3, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: "rate_limited",
        version: ASSISTANT_API_VERSION,
        message:
          "Slow down, speedster—this guide caps at 3 questions per minute. Take a breath, click around the site, and try again in a moment.",
        retryAfterMs: rl.retryAfterMs,
      },
      { status: 429 },
    );
  }

  if (!isOpenAIConfigured()) {
    return NextResponse.json(
      {
        error: "not_configured",
        version: ASSISTANT_API_VERSION,
        message:
          "The campaign guide needs OPENAI_API_KEY in the server environment (.env). Add your key and restart the dev server.",
      },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", version: ASSISTANT_API_VERSION, message: "Request body was not valid JSON." },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "validation",
        version: ASSISTANT_API_VERSION,
        message: "Send a non-empty `message` (max 2000 characters).",
      },
      { status: 400 },
    );
  }

  const {
    message,
    history: rawHistory,
    stream: wantStream,
    responseStyle,
    journeyBeatId,
    journeyBeatLabel,
    journeyBeatDescription,
    pathname,
  } = parsed.data;

  const history = normalizeHistory(rawHistory);
  const playbookHint = [message, ...history.filter((t) => t.role === "user").slice(-2).map((t) => t.text)]
    .join(" ")
    .slice(0, 1200);
  const playbook = detectPlaybook(playbookHint, journeyBeatId, pathname);
  const playbookBlock = playbookPromptBlock(playbook);

  const journeyBlock =
    journeyBeatId != null
      ? `VISITOR POSITION:\n- URL path: ${pathname ?? "/"}\n- Journey chapter id: ${journeyBeatId}\n- Chapter: ${journeyBeatLabel ?? "n/a"}\n- Intent: ${journeyBeatDescription ?? "n/a"}\n\n`
      : pathname != null
        ? `VISITOR POSITION:\n- URL path: ${pathname}\n\n`
        : "";

  let hits;
  try {
    const searchQuery = searchQueryFromTurns(message, history);
    const wide = await searchChunks(searchQuery, 14);
    hits = prioritizeHitsForAssistant(wide, 8);
  } catch (e) {
    console.error("[assistant] searchChunks", e);
    const hint =
      e instanceof Error && /prisma|database|connect/i.test(e.message)
        ? " Check DATABASE_URL and run migrations (`npx prisma migrate deploy`)."
        : e instanceof Error && /401|API key|invalid/i.test(e.message)
          ? " Check OPENAI_API_KEY is valid."
          : "";
    const detail = formatOpenAIErrorForClient(e);
    return NextResponse.json(
      {
        error: "search_failed",
        version: ASSISTANT_API_VERSION,
        message: `Could not search site content.${hint} Details: ${detail}`,
      },
      { status: 503 },
    );
  }

  if (!hits.length) {
    return NextResponse.json({
      version: ASSISTANT_API_VERSION,
      playbook,
      reply:
        "I’m supposed to answer from what the campaign has loaded into my notebook—and right now that notebook is blank on this server. You can still browse everything on the site the old-fashioned way (menus, links—revolutionary, I know). If you came for something specific about Kelly or this race and I’m useless, email kelly@kellygrappe.com with what you were trying to find—I only know what the campaign has taught me.",
      suggestions: [
        { label: "Office priorities", href: "/priorities" },
        { label: "Direct democracy", href: "/direct-democracy" },
        { label: "Meet Kelly", href: "/about" },
        { label: "Get involved", href: "/get-involved" },
      ],
    });
  }

  try {
    const client = getOpenAIClient();
    const { model } = getOpenAIConfigFromEnv();
    const context = buildContextBlock(hits, 10000);

    const conversationBlock = formatConversationForPrompt(history);
    const userPayload = [
      conversationBlock,
      "RETRIEVAL: CONTEXT is re-ranked so on-site campaign excerpts (route:, brief:, docs/) come before external: background when both matched. Prefer citing those for Kelly / this race; use external excerpts only as supporting color.\n\n",
      `CONTEXT:\n${context}\n\n`,
      playbookBlock,
      "\n",
      journeyBlock,
      "VISITOR QUESTION:\n",
      message,
    ].join("");

    let reply: string;
    let toolsUsed: string[] = [];
    try {
      const out = await runCampaignAssistantCompletion(client, model, userPayload, {
        hasConversationHistory: history.length > 0,
        responseStyle,
      });
      reply = out.reply;
      toolsUsed = out.toolCallsUsed;
      if (out.toolCallsUsed.length) {
        // eslint-disable-next-line no-console
        console.info("[assistant] tools:", out.toolCallsUsed.join(", "));
      }
    } catch (e) {
      console.error("[assistant] chat.completions", e);
      const msg = formatOpenAIErrorForClient(e);
      return NextResponse.json(
        {
          error: "openai_chat_failed",
          version: ASSISTANT_API_VERSION,
          message: `The model could not answer: ${msg}`,
        },
        { status: 502 },
      );
    }

    const fromHits = hits.slice(0, 4).map((h) => ({
      label: h.title || h.path,
      href: pathToHref(h.path),
    }));
    const suggestions = mergeSuggestions(playbook, fromHits, 5);

    if (wantStream) {
      const streamOut = new ReadableStream<Uint8Array>({
        start(controller) {
          try {
            controller.enqueue(
              sseEncode({ type: "meta", version: ASSISTANT_API_VERSION, playbook }),
            );
            const text = reply || "No text was returned from the model.";
            for (const chunk of replyChunks(text)) {
              controller.enqueue(sseEncode({ type: "delta", text: chunk }));
            }
            controller.enqueue(sseEncode({ type: "done", suggestions, toolsUsed }));
          } catch (e) {
            controller.enqueue(
              sseEncode({
                type: "error",
                message: e instanceof Error ? e.message : "Stream failed.",
              }),
            );
          } finally {
            controller.close();
          }
        },
      });

      return new Response(streamOut, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Assistant-Version": ASSISTANT_API_VERSION,
        },
      });
    }

    return NextResponse.json({
      version: ASSISTANT_API_VERSION,
      playbook,
      toolsUsed,
      reply: reply || "No text was returned from the model.",
      suggestions,
    });
  } catch (e) {
    console.error("[assistant] unexpected", e);
    const msg = e instanceof Error ? e.message : "Unknown error.";
    return NextResponse.json(
      {
        error: "assistant_failed",
        version: ASSISTANT_API_VERSION,
        message: `The guide hit an unexpected error: ${msg}`,
      },
      { status: 500 },
    );
  }
}
