import { NextResponse } from "next/server";
import { z } from "zod";
import { events } from "@/content/events";
import { queryPublicCampaignEvents } from "@/lib/calendar/public-events";
import { isOpenAIConfigured, getOpenAIClient, getOpenAIConfigFromEnv } from "@/lib/openai/client";
import {
  buildBusyDayDigest,
  movementAndPublicToPlanningEvents,
} from "@/lib/planning/campaign-calendar-planning";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  notes: z.string().min(1).max(2000),
  countyHint: z.string().max(120).optional(),
});

/**
 * Calendar-aware host date suggestions using the same live digest hosts see (public + movement).
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const rl = rateLimit(`planning-ai:${ip}`, 12, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "rate_limited", retryAfterMs: rl.retryAfterMs }, { status: 429 });
  }

  if (!isOpenAIConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "openai_unconfigured",
        message: "Date suggestions aren’t available on this site build yet—the planning helper needs the server-side search service enabled.",
      },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation", message: "Send { notes, countyHint? }." }, { status: 400 });
  }

  const publicRows = await queryPublicCampaignEvents({ range: "all_upcoming" }, { take: 400 });
  const planningEvents = movementAndPublicToPlanningEvents(events, publicRows);
  const digest = buildBusyDayDigest(planningEvents, 90).join("\n");

  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();

  const userBlock = [
    "Host / organizer notes:",
    parsed.data.notes.trim(),
    parsed.data.countyHint ? `County hint: ${parsed.data.countyHint}` : null,
    "",
    "Next ~90 days (America/Chicago). “open” days have no published stops; travel baseline is Rose Bud, AR when empty.",
    digest,
  ]
    .filter(Boolean)
    .join("\n");

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.35,
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content: `You help the Kelly Grappe for Arkansas Secretary of State campaign suggest host-gathering dates.
Rules:
- Use ONLY the calendar digest for busy vs open; prefer "open" days when possible.
- Respect travel: avoid sandwiching a host between two distant cities without a gap if the digest shows that pattern.
- Suggest at most 3 concrete dates as YYYY-MM-DD in America/Chicago.
- Output valid JSON only, no markdown: {"suggestions":[{"date":"YYYY-MM-DD","reason":"one short sentence"}],"caveat":"one sentence about confirming with staff"}`,
      },
      { role: "user", content: userBlock },
    ],
  });

  let raw = completion.choices[0]?.message?.content?.trim() ?? "";
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) raw = fenced[1].trim();
  try {
    const parsedJson = JSON.parse(raw) as {
      suggestions?: Array<{ date?: string; reason?: string }>;
      caveat?: string;
    };
    const suggestions = (parsedJson.suggestions ?? [])
      .filter((s) => s.date && s.reason)
      .slice(0, 3)
      .map((s) => ({ date: s.date!, reason: s.reason! }));
    return NextResponse.json({
      ok: true,
      suggestions,
      caveat: parsedJson.caveat ?? "Staff still confirms every date against the full internal calendar.",
    });
  } catch {
    return NextResponse.json({
      ok: true,
      suggestions: [] as { date: string; reason: string }[],
      caveat: "Could not parse the planning response; try again or pick a date with the calendar helper above.",
      raw,
    });
  }
}
