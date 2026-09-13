import "server-only";
import { z } from "zod";
import {
  formatOpenAIErrorForClient,
  getOpenAIClient,
  getOpenAIConfigFromEnv,
  isOpenAIConfigured,
} from "@/lib/openai/client";
import type { SiteTrafficSnapshot } from "@/lib/analytics/site-traffic-aggregate";
import {
  buildSiteTrafficIntelligence,
  trafficIntelligenceBriefInput,
  type SiteTrafficIntelligence,
} from "@/lib/analytics/site-traffic-intelligence";

export type SiteTrafficCommandBrief = {
  headline: string;
  situation: string;
  mood: "strong" | "steady" | "leaking" | "quiet";
  wins: string[];
  leaks: Array<{ page: string; problem: string; fix: string }>;
  audienceReads: string[];
  sharePlan: string[];
  copyLines: string[];
  tonightMoves: string[];
  watchNext: string[];
};

export type SiteTrafficBrief =
  | {
      ok: true;
      summary: string;
      moves: string[];
      command: SiteTrafficCommandBrief;
      cached: boolean;
      generatedAt: string;
    }
  | {
      ok: false;
      error: string;
    };

const commandSchema = z.object({
  headline: z.string().min(1),
  situation: z.string().min(1),
  mood: z.enum(["strong", "steady", "leaking", "quiet"]).optional(),
  wins: z.array(z.string()).max(6).optional(),
  leaks: z
    .array(
      z.object({
        page: z.string(),
        problem: z.string(),
        fix: z.string(),
      }),
    )
    .max(6)
    .optional(),
  audienceReads: z.array(z.string()).max(6).optional(),
  sharePlan: z.array(z.string()).max(6).optional(),
  copyLines: z.array(z.string()).max(6).optional(),
  tonightMoves: z.array(z.string()).max(8).optional(),
  watchNext: z.array(z.string()).max(6).optional(),
});

type CacheRow = {
  expiresAt: number;
  fingerprint: string;
  brief: Extract<SiteTrafficBrief, { ok: true }>;
};

const CACHE_MS = 20 * 60 * 1000;
const cache = new Map<string, CacheRow>();

function cleanList(rows: string[] | undefined, limit: number): string[] {
  return (rows ?? []).map((row) => row.trim()).filter(Boolean).slice(0, limit);
}

function fingerprint(snapshot: SiteTrafficSnapshot): string {
  return [
    snapshot.days,
    snapshot.pageViews,
    snapshot.visitors,
    snapshot.sessions,
    snapshot.formCompletes,
    snapshot.ctaClicks,
    snapshot.pages[0]?.path ?? "",
    snapshot.bounceRate == null ? "na" : snapshot.bounceRate.toFixed(3),
  ].join("|");
}

function quietCommand(): SiteTrafficCommandBrief {
  return {
    headline: "The public site is quiet in this window",
    situation:
      "No public page views yet. Share /from-the-road or /events from Facebook, then come back — this desk reads live neighbors only.",
    mood: "quiet",
    wins: [],
    leaks: [],
    audienceReads: [],
    sharePlan: [
      "Post the From the Road page with a county photo, not a generic link.",
      "Put utm_source=facebook and utm_campaign=trail on the first share so we can see what worked.",
    ],
    copyLines: [
      "Kelly is on the road in Arkansas — see the stops and come say hello.",
    ],
    tonightMoves: [
      "Share /from-the-road and /events from the campaign Facebook.",
      "Keep volunteer and donate visible on Home — first-time visitors usually stop there.",
    ],
    watchNext: ["First landing page, first referrer, and whether anyone opens a second page."],
  };
}

export function fallbackCommand(intel: SiteTrafficIntelligence): SiteTrafficCommandBrief {
  const leak = intel.leaks[0];
  return {
    headline:
      intel.mood === "quiet"
        ? "Waiting on the first public visits"
        : `Site health ${intel.healthScore} — ${intel.mood}`,
    situation: intel.reasons.join(" "),
    mood: intel.mood,
    wins: intel.reasons.slice(0, 3),
    leaks: leak
      ? [
          {
            page: leak.page,
            problem: leak.note,
            fix: "Add one clear next step on that page: events, volunteer, or the county trail.",
          },
        ]
      : [],
    audienceReads: [
      intel.deviceLead ? `Most visits are on ${intel.deviceLead}.` : "Device mix will appear on the next live views.",
      intel.countyNames.length
        ? `County pages with attention: ${intel.countyNames.join(", ")}.`
        : "No county pages drawn yet.",
    ],
    sharePlan: [
      "Share the page that already holds people, not only Home.",
      "Tag the link with utm_source and utm_campaign so the next window can compare.",
    ],
    copyLines: [],
    tonightMoves: intel.reasons.slice(0, 4),
    watchNext: ["Bounce on the top landing page", "Form finishes vs starts", "Whether county pages get a second click"],
  };
}

function toBrief(command: SiteTrafficCommandBrief, cached: boolean): Extract<SiteTrafficBrief, { ok: true }> {
  return {
    ok: true,
    summary: command.situation,
    moves: command.tonightMoves,
    command,
    cached,
    generatedAt: new Date().toISOString(),
  };
}

export async function analyzeSiteTraffic(
  snapshot: SiteTrafficSnapshot,
  options?: { refresh?: boolean },
): Promise<SiteTrafficBrief> {
  const intel = buildSiteTrafficIntelligence(snapshot);
  const key = `d${snapshot.days}`;
  const print = fingerprint(snapshot);
  const hit = cache.get(key);
  if (!options?.refresh && hit && hit.fingerprint === print && hit.expiresAt > Date.now()) {
    return { ...hit.brief, cached: true };
  }

  if (snapshot.pageViews === 0) {
    const brief = toBrief(quietCommand(), false);
    cache.set(key, { expiresAt: Date.now() + CACHE_MS, fingerprint: print, brief });
    return brief;
  }

  if (!isOpenAIConfigured()) {
    return { ok: false, error: "OpenAI is not configured on this server." };
  }

  try {
    const client = getOpenAIClient();
    const { model } = getOpenAIConfigFromEnv();
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are the chief website analyst for Kelly Grappe, Democratic candidate for Arkansas Secretary of State. " +
            "You write the operator command brief for the first-party visitor desk. " +
            "Use only the aggregate counts and machine reads provided. Never invent traffic numbers, counties, events, or endorsements. " +
            "Never ask for names, emails, or IP addresses. Do not mention opponents unless a provided path already does. " +
            "Be concrete: name real paths from the data, say what to share tonight, and write copy only for pages that already have hits. " +
            "If a number is missing, say the desk does not have it yet. " +
            "Return JSON only with keys: headline, situation, mood (strong|steady|leaking|quiet), wins[], " +
            "leaks[{page, problem, fix}], audienceReads[], sharePlan[], copyLines[], tonightMoves[], watchNext[].",
        },
        {
          role: "user",
          content: `Public-site traffic and machine reads (no names, no IPs):\n${trafficIntelligenceBriefInput(snapshot, intel)}`,
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim() || "";
    const parsed = commandSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      const fallback = toBrief(fallbackCommand(intel), false);
      cache.set(key, { expiresAt: Date.now() + CACHE_MS, fingerprint: print, brief: fallback });
      return fallback;
    }
    const data = parsed.data;
    const command: SiteTrafficCommandBrief = {
      headline: data.headline.trim(),
      situation: data.situation.trim(),
      mood: data.mood ?? intel.mood,
      wins: cleanList(data.wins, 5),
      leaks: (data.leaks ?? [])
        .filter((row) => row.page.trim() && row.problem.trim())
        .slice(0, 5)
        .map((row) => ({ page: row.page.trim(), problem: row.problem.trim(), fix: row.fix.trim() })),
      audienceReads: cleanList(data.audienceReads, 5),
      sharePlan: cleanList(data.sharePlan, 5),
      copyLines: cleanList(data.copyLines, 5),
      tonightMoves: cleanList(data.tonightMoves, 6),
      watchNext: cleanList(data.watchNext, 5),
    };
    if (!command.tonightMoves.length) command.tonightMoves = fallbackCommand(intel).tonightMoves;
    const brief = toBrief(command, false);
    cache.set(key, { expiresAt: Date.now() + CACHE_MS, fingerprint: print, brief });
    return brief;
  } catch (err) {
    if (err instanceof SyntaxError) {
      return toBrief(fallbackCommand(intel), false);
    }
    return { ok: false, error: formatOpenAIErrorForClient(err) };
  }
}
