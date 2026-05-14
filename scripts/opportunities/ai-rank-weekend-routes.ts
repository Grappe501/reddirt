/**
 * Optional OpenAI narrative on top of deterministic weekend plans (no invented facts).
 * Run: npm run opportunities:ai-rank
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import { loadEnvConfig } from "@next/env";

import type { CommunityOpportunity } from "@/lib/opportunities/community-opportunity-types";
import type { WeekendRoutePlansFile } from "@/lib/opportunities/load-community-opportunities-data";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const shellOpenAi = typeof process.env["OPENAI_API_KEY"] === "string" ? process.env["OPENAI_API_KEY"].trim() : "";
delete process.env.OPENAI_API_KEY;
loadEnvConfig(root);
const fromFile = process.env["OPENAI_API_KEY"] as string | undefined;
const apiKey =
  (typeof fromFile === "string" && fromFile.trim() ? fromFile.trim() : "") || (shellOpenAi || "") || undefined;

const SYSTEM = `You are a campaign travel staff assistant. Use ONLY the JSON provided: opportunity records and weekend route plans (including precomputed drive totals and risks). Do not invent events, dates, people, locations, or drive times. Output valid JSON only: { "plans": [ { "id": string, "aiSummary": string, "risksExtra": string[] } ] } where risksExtra are additional risk notes grounded in the supplied data (empty array if none).`;

async function main() {
  const plansPath = path.join(root, "data/calendar-command-center/weekend-route-plans-2026.json");
  const normPath = path.join(root, "data/calendar-command-center/community-opportunities-2026.normalized.json");
  const cachePath = path.join(root, "data/calendar-command-center/route-matrix-cache.json");

  const plansFile = JSON.parse(await readFile(plansPath, "utf8")) as WeekendRoutePlansFile;
  const norm = JSON.parse(await readFile(normPath, "utf8")) as { rows?: CommunityOpportunity[] };
  const oppById = new Map((norm.rows ?? []).map((o) => [o.id, o] as const));
  let cacheSummary: { entryCount: number; sampleSources: string[] } = { entryCount: 0, sampleSources: [] };
  try {
    const c = JSON.parse(await readFile(cachePath, "utf8")) as { entries?: Record<string, { source?: string }> };
    const keys = Object.keys(c.entries ?? {});
    const sources = new Set<string>();
    for (const k of keys.slice(0, 40)) {
      const s = c.entries?.[k]?.source;
      if (s) sources.add(s);
    }
    cacheSummary = { entryCount: keys.length, sampleSources: [...sources] };
  } catch {
    /* no cache */
  }

  const payload = {
    routeMatrixSummary: cacheSummary,
    plans: plansFile.plans.map((p) => ({
      id: p.id,
      title: p.title,
      weekStart: p.weekStart,
      countiesCovered: p.countiesCovered,
      totalDriveMinutes: p.totalDriveMinutes,
      routeTightness: p.routeTightness,
      staffRecommendation: p.staffRecommendation,
      risks: p.risks,
      opportunities: p.opportunities.map((s) => {
        const o = oppById.get(s.opportunityId);
        return {
          slot: s,
          opportunity: o
            ? {
                id: o.id,
                type: o.type,
                title: o.title,
                county: o.county,
                verificationStatus: o.verificationStatus,
                campaignValue: o.campaignValue,
                recommendedCoverage: o.recommendedCoverage,
              }
            : { id: s.opportunityId, missing: true },
        };
      }),
    })),
  };

  if (!apiKey) {
    for (const p of plansFile.plans) {
      p.aiSummary =
        "OpenAI not configured — deterministic planner only. Set OPENAI_API_KEY for narrative grouping guidance.";
    }
    await writeFile(plansPath, JSON.stringify(plansFile, null, 2), "utf8");
    console.log("No OPENAI_API_KEY — wrote placeholder aiSummary on each plan.");
    return;
  }

  const client = new OpenAI({ apiKey });
  const user = JSON.stringify(payload);

  const res = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `${user}\n\nRemember: use only the provided opportunity records and route matrix summary. Do not invent events, dates, people, locations, or drive times.`,
      },
    ],
  });

  const text = res.choices[0]?.message?.content ?? "{}";
  let parsed: { plans?: Array<{ id: string; aiSummary?: string; risksExtra?: string[] }> };
  try {
    parsed = JSON.parse(text) as typeof parsed;
  } catch {
    console.error("Model did not return JSON:", text.slice(0, 500));
    process.exit(1);
  }

  const byId = new Map((parsed.plans ?? []).map((x) => [x.id, x] as const));
  for (const p of plansFile.plans) {
    const row = byId.get(p.id);
    if (row?.aiSummary) p.aiSummary = row.aiSummary;
    if (row?.risksExtra?.length) p.risks = [...p.risks, ...row.risksExtra];
  }

  plansFile.generatedAt = new Date().toISOString();
  await writeFile(plansPath, JSON.stringify(plansFile, null, 2), "utf8");
  console.log(`Updated aiSummary on ${plansFile.plans.length} plans.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
