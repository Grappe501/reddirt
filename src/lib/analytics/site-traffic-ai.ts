import "server-only";
import { z } from "zod";
import {
  formatOpenAIErrorForClient,
  getOpenAIClient,
  getOpenAIConfigFromEnv,
  isOpenAIConfigured,
} from "@/lib/openai/client";
import type { SiteTrafficSnapshot } from "@/lib/analytics/site-traffic-aggregate";
import { trafficBriefInput } from "@/lib/analytics/site-traffic-aggregate";
import {
  parseTrafficAnalysisMode,
  trafficAnalysisModeMeta,
  type TrafficAnalysisMode,
} from "@/lib/analytics/traffic-analysis-modes";
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
  mode: TrafficAnalysisMode;
};

export type SiteTrafficBrief =
  | {
      ok: true;
      summary: string;
      moves: string[];
      command: SiteTrafficCommandBrief;
      cached: boolean;
      generatedAt: string;
      mode: TrafficAnalysisMode;
    }
  | {
      ok: false;
      error: string;
    };

const commandSchema = z.object({
  headline: z.string().min(1),
  situation: z.string().min(1),
  mood: z.enum(["strong", "steady", "leaking", "quiet"]).optional(),
  wins: z.array(z.string()).max(8).optional(),
  leaks: z
    .array(
      z.object({
        page: z.string(),
        problem: z.string(),
        fix: z.string(),
      }),
    )
    .max(8)
    .optional(),
  audienceReads: z.array(z.string()).max(8).optional(),
  sharePlan: z.array(z.string()).max(8).optional(),
  copyLines: z.array(z.string()).max(8).optional(),
  tonightMoves: z.array(z.string()).max(10).optional(),
  watchNext: z.array(z.string()).max(8).optional(),
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

function fingerprint(snapshot: SiteTrafficSnapshot, mode: TrafficAnalysisMode): string {
  return [
    mode,
    snapshot.days,
    snapshot.pageViews,
    snapshot.visitors,
    snapshot.sessions,
    snapshot.formCompletes,
    snapshot.ctaClicks,
    snapshot.pages[0]?.path ?? "",
    snapshot.bounceRate == null ? "na" : snapshot.bounceRate.toFixed(3),
    snapshot.seo.sessions,
    snapshot.deepSessions,
  ].join("|");
}

function quietCommand(mode: TrafficAnalysisMode): SiteTrafficCommandBrief {
  return {
    headline: "The public site is quiet in this window",
    situation:
      "No public page views are stored for this window. If people were on kellygrappe.com, the recorder may still have been off. After /api/analytics is live, new visits will appear here.",
    mood: "quiet",
    wins: [],
    leaks: [],
    audienceReads: [],
    sharePlan: [
      "Post the From the Road page with a county photo, not a generic link.",
      "Put utm_source=facebook and utm_campaign=trail on the first share so we can see what worked.",
    ],
    copyLines: ["Kelly is on the road in Arkansas — see the stops and come say hello."],
    tonightMoves: [
      "Open a public page after the recorder deploy and confirm a hit lands on this desk.",
      "Share /from-the-road and /events from the campaign Facebook with utm tags.",
    ],
    watchNext: ["First stored landing page, first referrer, and whether anyone opens a second page."],
    mode,
  };
}

export function fallbackCommand(intel: SiteTrafficIntelligence, mode: TrafficAnalysisMode = "command"): SiteTrafficCommandBrief {
  const leak = intel.leaks[0];
  return {
    headline:
      intel.mood === "quiet"
        ? "Waiting on the first public visits"
        : `Site health ${intel.healthScore} — ${intel.mood}`,
    situation: intel.reasons.join(" "),
    mood: intel.mood,
    wins: intel.reasons.slice(0, 4),
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
      intel.leadChannel ? `Main arrival channel: ${intel.leadChannel}.` : "No channel lead yet.",
    ],
    sharePlan: [
      "Share the page that already holds people, not only Home.",
      "Tag the link with utm_source and utm_campaign so the next window can compare.",
    ],
    copyLines: [],
    tonightMoves: intel.reasons.slice(0, 5),
    watchNext: ["Bounce on the top landing page", "Form finishes vs starts", "Whether search visits open a second page"],
    mode,
  };
}

function toBrief(
  command: SiteTrafficCommandBrief,
  cached: boolean,
  mode: TrafficAnalysisMode,
): Extract<SiteTrafficBrief, { ok: true }> {
  return {
    ok: true,
    summary: command.situation,
    moves: command.tonightMoves,
    command,
    cached,
    generatedAt: new Date().toISOString(),
    mode,
  };
}

function modePayload(snapshot: SiteTrafficSnapshot, intel: SiteTrafficIntelligence, mode: TrafficAnalysisMode): string {
  const full = JSON.parse(trafficIntelligenceBriefInput(snapshot, intel)) as Record<string, unknown>;
  if (mode === "seo") {
    return JSON.stringify({ lens: mode, seo: snapshot.seo, sourceLandings: snapshot.sourceLandings.filter((row) => /search/i.test(row.source)), pageIntel: snapshot.pageIntel.slice(0, 12), analysis: snapshot.analysis }, null, 2);
  }
  if (mode === "journeys") {
    return JSON.stringify({
      lens: mode,
      analysis: snapshot.analysis,
      transitions: snapshot.transitions,
      landingNext: snapshot.landingNext,
      depth: snapshot.depth,
      pageIntel: snapshot.pageIntel.slice(0, 16),
      journeys: snapshot.journeys.slice(0, 24).map((row) => ({
        source: row.sourceLabel,
        path: row.steps.join(" → "),
        bounced: row.bounced,
        minutes: Number(row.minutes.toFixed(2)),
        formCompleted: row.formCompleted,
        returning: row.returning,
      })),
    }, null, 2);
  }
  if (mode === "conversion") {
    return JSON.stringify({
      lens: mode,
      forms: snapshot.forms,
      funnel: snapshot.funnel,
      conversionPaths: snapshot.conversionPaths,
      ctas: snapshot.ctas,
      channels: snapshot.channels.filter((row) => row.sessions > 0),
    }, null, 2);
  }
  if (mode === "publish") {
    return JSON.stringify({
      lens: mode,
      topPages: snapshot.pages.slice(0, 12),
      sections: snapshot.sections,
      campaigns: snapshot.campaigns,
      utmRows: snapshot.utmRows,
      seoLandings: snapshot.seo.landings,
      shareHints: snapshot.analysis,
    }, null, 2);
  }
  if (mode === "visitors") {
    return JSON.stringify({
      lens: mode,
      windowDays: snapshot.days,
      journeys: snapshot.journeys.slice(0, snapshot.days === 1 ? 40 : 16).map((row) => ({
        source: row.sourceLabel,
        referrer: row.referrer,
        path: row.steps.join(" → "),
        bounced: row.bounced,
        engaged: row.engaged,
        formStarted: row.formStarted,
        formCompleted: row.formCompleted,
        returning: row.returning,
        device: row.device,
        minutes: Number(row.minutes.toFixed(2)),
      })),
    }, null, 2);
  }
  return JSON.stringify({ lens: mode, ...full, extra: JSON.parse(trafficBriefInput(snapshot)) }, null, 2);
}

export async function analyzeSiteTraffic(
  snapshot: SiteTrafficSnapshot,
  options?: { refresh?: boolean; mode?: string },
): Promise<SiteTrafficBrief> {
  const mode = parseTrafficAnalysisMode(options?.mode);
  const meta = trafficAnalysisModeMeta(mode);
  const intel = buildSiteTrafficIntelligence(snapshot);
  const key = `d${snapshot.days}:${mode}`;
  const print = fingerprint(snapshot, mode);
  const hit = cache.get(key);
  if (!options?.refresh && hit && hit.fingerprint === print && hit.expiresAt > Date.now()) {
    return { ...hit.brief, cached: true };
  }

  if (snapshot.pageViews === 0) {
    const brief = toBrief(quietCommand(mode), false, mode);
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
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are the chief website analyst for Kelly Grappe, Democratic candidate for Arkansas Secretary of State. " +
            "The operator picked an analysis lens and hit Run. " +
            `${meta.focus} ` +
            "Use only the counts provided. Never invent traffic numbers, counties, events, endorsements, or search queries. " +
            "Never ask for names, emails, or IP addresses. Do not mention opponents unless a provided path already does. " +
            "Be concrete: name real paths, say what the data proves, and what to do next. " +
            "If a number is missing, say the desk does not have it yet. " +
            "Return JSON only with keys: headline, situation, mood (strong|steady|leaking|quiet), wins[], " +
            "leaks[{page, problem, fix}], audienceReads[], sharePlan[], copyLines[], tonightMoves[], watchNext[].",
        },
        {
          role: "user",
          content: `Lens: ${meta.title}. Public-site traffic (no names, no IPs):\n${modePayload(snapshot, intel, mode)}`,
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim() || "";
    const parsed = commandSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      const fallback = toBrief(fallbackCommand(intel, mode), false, mode);
      cache.set(key, { expiresAt: Date.now() + CACHE_MS, fingerprint: print, brief: fallback });
      return fallback;
    }
    const data = parsed.data;
    const command: SiteTrafficCommandBrief = {
      headline: data.headline.trim(),
      situation: data.situation.trim(),
      mood: data.mood ?? intel.mood,
      wins: cleanList(data.wins, 6),
      leaks: (data.leaks ?? [])
        .filter((row) => row.page.trim() && row.problem.trim())
        .slice(0, 6)
        .map((row) => ({ page: row.page.trim(), problem: row.problem.trim(), fix: row.fix.trim() })),
      audienceReads: cleanList(data.audienceReads, 6),
      sharePlan: cleanList(data.sharePlan, 6),
      copyLines: cleanList(data.copyLines, 6),
      tonightMoves: cleanList(data.tonightMoves, 8),
      watchNext: cleanList(data.watchNext, 6),
      mode,
    };
    if (!command.tonightMoves.length) command.tonightMoves = fallbackCommand(intel, mode).tonightMoves;
    const brief = toBrief(command, false, mode);
    cache.set(key, { expiresAt: Date.now() + CACHE_MS, fingerprint: print, brief });
    return brief;
  } catch (err) {
    if (err instanceof SyntaxError) {
      return toBrief(fallbackCommand(intel, mode), false, mode);
    }
    return { ok: false, error: formatOpenAIErrorForClient(err) };
  }
}
