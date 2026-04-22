import { getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";
import { prisma } from "@/lib/db";

export type EventLine = { title: string; startAt: Date; endAt: Date; county?: string | null; quadrant?: string };

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

/** Heuristic: flag days with &gt; 4h of event blocks (simple sum of durations). */
export function detectOverpackedDays(events: EventLine[]) {
  const byDay = new Map<string, number>();
  for (const e of events) {
    const k = e.startAt.toDateString();
    const ms = +e.endAt - +e.startAt;
    byDay.set(k, (byDay.get(k) ?? 0) + ms);
  }
  const out: string[] = [];
  for (const [d, ms] of byDay) {
    if (ms > 4 * 60 * 60 * 1000) out.push(`${d}: ~${(ms / 3600000).toFixed(1)}h scheduled`);
  }
  return out;
}

export function detectScheduleOverlaps(events: EventLine[]) {
  const sorted = [...events].sort((a, b) => +a.startAt - +b.startAt);
  const out: string[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!;
    const cur = sorted[i]!;
    if (sameDay(prev.startAt, cur.startAt) && +cur.startAt < +prev.endAt) {
      out.push(`Overlap: “${prev.title}” / “${cur.title}”`);
    }
  }
  return out;
}

export function countScheduleConflicts(events: EventLine[]) {
  return detectScheduleOverlaps(events).length;
}

type CommandLine = EventLine & { timeMatrixQuadrant?: string };

export type CommandCenterAiInput = {
  weekKey: string;
  mission?: string | null;
  outcome1?: string | null;
  outcome2?: string | null;
  outcome3?: string | null;
  lines: CommandLine[];
  matrix: { Q1: number; Q2: number; Q3: number; Q4: number; totalH: number; q2Share: number; reactiveUrgent: number };
  overpacked: string[];
  overlapLines: string[];
  countyGaps: string[];
  travelLoadLabel: string;
};

/**
 * Executive weekly read — overpacked / neglect / prep gaps / travel compression, aligned to FranklinCovey Q1–Q4.
 */
export async function runCommandCenterAi(data: CommandCenterAiInput) {
  const header = `Week starting ${data.weekKey}. Mission: ${data.mission ?? "—"}. Outcomes: ${[data.outcome1, data.outcome2, data.outcome3].filter(Boolean).join(" | ") || "—"}`;
  const eventsBlock = data.lines
    .map(
      (e) =>
        `${e.startAt.toISOString()}\tQ${e.timeMatrixQuadrant ?? e.quadrant ?? "?"}\t${e.county ?? "no county"}\t${e.title}`
    )
    .join("\n");
  const matrix = `Q2 share ${(data.matrix.q2Share * 100).toFixed(0)}%; reactive+urgent (Q1+Q3 est.) ${(data.matrix.reactiveUrgent * 100).toFixed(0)}% of time`;
  if (!isOpenAIConfigured()) {
    return {
      text: `OpenAI not configured. Heuristics only.\n\n${header}\n\n${matrix}\n\nOverpacked:\n${data.overpacked.join("\n") || "—"}\n\nConflicts:\n${data.overlapLines.join("\n") || "—"}\n\nCounty gaps:\n${data.countyGaps.join("\n") || "—"}\n\nTravel: ${data.travelLoadLabel}`,
    };
  }
  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();
  const res = await client.chat.completions.create({
    model,
    temperature: 0.3,
    max_tokens: 800,
    messages: [
      {
        role: "system",
        content:
          "You are a senior campaign chief of staff. Output a tight weekly command briefing: (1) schedule summary tied to the mission, (2) overpacked or travel-compression risks, (3) county neglect or gaps, (4) events missing prep/follow-up focus, (5) if Q2 (important, not urgent) time is too low, say so. Short bullets, no filler.",
      },
      {
        role: "user",
        content: `${header}\n\n${matrix}\n\nTravel: ${data.travelLoadLabel}\n\nHeuristic conflicts:\n${data.overlapLines.join("\n") || "none"}\n\nHeavy days:\n${data.overpacked.join("\n") || "none"}\n\nCounty coverage gaps (45d+):\n${data.countyGaps.join("\n") || "none"}\n\nEvents:\n${eventsBlock || "none"}`,
      },
    ],
  });
  const text = res.choices[0]?.message?.content?.trim() ?? "";
  return { text, overpacked: data.overpacked, overlapLines: data.overlapLines, countyGaps: data.countyGaps };
}
export async function runCalendarAiBriefing() {
  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + 14);
  const ev = await prisma.campaignEvent.findMany({
    where: { startAt: { gte: from, lte: to } },
    take: 80,
    orderBy: { startAt: "asc" },
    include: { county: { select: { displayName: true } } },
  });
  const lines: EventLine[] = ev.map((e) => ({
    title: e.title,
    startAt: e.startAt,
    endAt: e.endAt,
    county: e.county?.displayName ?? null,
  }));
  const overlaps = detectScheduleOverlaps(lines);
  const heavy = detectOverpackedDays(lines);

  if (!isOpenAIConfigured()) {
    return {
      text: `OpenAI not configured. Heuristics only.\n\nOverlaps:\n${overlaps.join("\n") || "—"}\n\nHeavy days:\n${heavy.join("\n") || "—"}`,
    };
  }
  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();
  const brief = ev
    .map((e) => `${e.startAt.toISOString()}–${e.endAt.toISOString()}: ${e.title} (${e.county?.displayName ?? "no county"})`)
    .join("\n");
  const res = await client.chat.completions.create({
    model,
    temperature: 0.35,
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content:
          "You are a campaign operations assistant. Summarize schedule risks, missing prep, travel load, and counties with no events recently. Be concise, actionable, bullet list.",
      },
      {
        role: "user",
        content: `Upcoming events (14d):\n${brief}\n\nHeuristic overlaps: ${overlaps.join("; ") || "none"}\nHeavy days: ${heavy.join("; ") || "none"}`,
      },
    ],
  });
  const text = res.choices[0]?.message?.content?.trim() ?? "";
  return { text, overlaps, heavyDays: heavy };
}
