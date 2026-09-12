import "server-only";
import { formatOpenAIErrorForClient, getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";
import { trafficBriefInput, type SiteTrafficSnapshot } from "@/lib/analytics/site-traffic-aggregate";

export type SiteTrafficBrief = {
  ok: true;
  summary: string;
  moves: string[];
} | {
  ok: false;
  error: string;
};

export async function analyzeSiteTraffic(snapshot: SiteTrafficSnapshot): Promise<SiteTrafficBrief> {
  if (!isOpenAIConfigured()) {
    return { ok: false, error: "OpenAI is not configured on this server." };
  }
  if (snapshot.pageViews === 0) {
    return {
      ok: true,
      summary: "No public page views in this window yet. Share a page, then come back — the wall will fill from live neighbors.",
      moves: [
        "Share /from-the-road and /events from Facebook so the first paths are trail and calendar.",
        "Keep the homepage volunteer and donate buttons obvious — first-time visitors usually stop on Home.",
      ],
    };
  }

  try {
    const client = getOpenAIClient();
    const { model } = getOpenAIConfigFromEnv();
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are a campaign website analyst for Kelly Grappe, candidate for Arkansas Secretary of State. " +
            "Use only the aggregate counts provided. Do not invent traffic numbers, counties, or endorsements. " +
            "Do not ask for personal data. Write short, practical advice to help more Arkansans find and stay on the public site. " +
            "Return JSON only: {\"summary\": string, \"moves\": string[]} with 3 to 6 moves.",
        },
        {
          role: "user",
          content: `Public-site traffic (no names, no IPs):\n${trafficBriefInput(snapshot)}`,
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim() || "";
    const jsonText = raw.replace(/^```json\s*|\s*```$/g, "").trim();
    const parsed = JSON.parse(jsonText) as { summary?: unknown; moves?: unknown };
    const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : "";
    const moves = Array.isArray(parsed.moves)
      ? parsed.moves.filter((m): m is string => typeof m === "string" && m.trim().length > 0).slice(0, 8)
      : [];
    if (!summary) return { ok: false, error: "The model returned an empty brief." };
    return { ok: true, summary, moves };
  } catch (err) {
    return { ok: false, error: formatOpenAIErrorForClient(err) };
  }
}
