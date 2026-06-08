/**
 * Smart intelligence search — AI query understanding, multi-query fusion, stage-safe briefs.
 */
import { z } from "zod";
import { getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";
import { INTEL_SMART_SEARCH_ANALYSIS_PROMPT, INTEL_SMART_SEARCH_BRIEF_PROMPT } from "@/lib/openai/prompts";
import {
  searchCandidateIntelligenceMulti,
  type CandidateIntelSearchResult,
  type CandidateIntelCorpusCounts,
  buildCandidateIntelContextBlock,
  inferStageSafeFromResult,
} from "@/lib/intelligence/candidateIntelligenceSearch";
import { detectIntelSearchIntent, expandIntelQueryTerms, tokenizeIntelQuery } from "@/lib/intelligence/intelligenceSearchCore";

export type IntelSearchSmartMode = "smart" | "quick";

export type IntelSearchUrgency = "stage_now" | "prep_tonight" | "research";

export type IntelSearchReadingOrderItem = {
  href: string;
  title: string;
  why: string;
  stageSafe: "clear" | "verify" | "blocked" | "research";
  kind: string;
};

export type IntelSearchSmartBrief = {
  intent: string;
  intentLabel: string;
  urgency: IntelSearchUrgency;
  rewrittenQueries: string[];
  readingOrder: IntelSearchReadingOrderItem[];
  brief: string;
  stageWarning: string | null;
  safeLine: string | null;
  doNotSay: string | null;
  followUps: string[];
  openFirstHref: string | null;
  openFirstTitle: string | null;
  confidence: "high" | "medium" | "low";
};

const analysisSchema = z.object({
  intent: z.string(),
  intentLabel: z.string(),
  urgency: z.enum(["stage_now", "prep_tonight", "research"]),
  entities: z.array(z.string()).max(8),
  searchQueries: z.array(z.string()).min(1).max(5),
  stageContext: z.string(),
});

const briefSchema = z.object({
  brief: z.string(),
  stageWarning: z.string().nullable(),
  safeLine: z.string().nullable(),
  doNotSay: z.string().nullable(),
  readingOrder: z
    .array(
      z.object({
        href: z.string(),
        title: z.string(),
        why: z.string(),
        stageSafe: z.enum(["clear", "verify", "blocked", "research"]),
      }),
    )
    .max(6),
  followUps: z.array(z.string()).max(5),
  openFirstHref: z.string().nullable(),
  openFirstTitle: z.string().nullable(),
  confidence: z.enum(["high", "medium", "low"]),
});

function fallbackQueryRewrites(query: string): string[] {
  const terms = tokenizeIntelQuery(query);
  const expanded = expandIntelQueryTerms(terms);
  const intent = detectIntelSearchIntent(query, terms);
  const out = new Set<string>([query.trim()]);
  if (intent === "opposition") {
    out.add(`Hammer ${query}`);
    out.add(`opposition ${expanded.slice(0, 3).join(" ")}`);
  }
  if (intent === "rehearse") {
    out.add(`trap lane ${query}`);
    out.add(`SOS question ${query}`);
  }
  if (intent === "claims") {
    out.add(`verified claim ${query}`);
  }
  if (intent === "philosophy") {
    out.add(`debate handling ${query}`);
  }
  if (expanded.length > terms.length) {
    out.add(expanded.slice(0, 5).join(" "));
  }
  return [...out].filter(Boolean).slice(0, 4);
}

async function analyzeSearchQuery(query: string): Promise<z.infer<typeof analysisSchema>> {
  const terms = tokenizeIntelQuery(query);
  const intent = detectIntelSearchIntent(query, terms);
  const fallback: z.infer<typeof analysisSchema> = {
    intent,
    intentLabel:
      intent === "opposition"
        ? "Opposition research"
        : intent === "rehearse"
          ? "Stage rehearsal"
          : intent === "claims"
            ? "Claims verification"
            : intent === "philosophy"
              ? "Philosophy & handling"
              : intent === "clerks"
                ? "Clerk-room prep"
                : "General prep",
    urgency: /\b(now|stage|tonight|minutes|about to)\b/i.test(query) ? "stage_now" : "prep_tonight",
    entities: terms.filter((t) => ["hammer", "pakko", "packo", "acca", "funding", "trap"].includes(t)),
    searchQueries: fallbackQueryRewrites(query),
    stageContext: `Candidate search: ${query}`,
  };

  if (!isOpenAIConfigured()) return fallback;

  try {
    const client = getOpenAIClient();
    const { model } = getOpenAIConfigFromEnv();
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: INTEL_SMART_SEARCH_ANALYSIS_PROMPT },
        { role: "user", content: query },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return fallback;
    const parsed = analysisSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return fallback;
    const q = parsed.data;
    if (!q.searchQueries.includes(query.trim())) {
      q.searchQueries = [query.trim(), ...q.searchQueries].slice(0, 5);
    }
    return q;
  } catch (err) {
    console.warn("[smart-search] analysis failed:", err);
    return fallback;
  }
}

function defaultReadingOrder(results: CandidateIntelSearchResult[]): IntelSearchReadingOrderItem[] {
  return results.slice(0, 5).map((r) => ({
    href: r.href,
    title: r.title,
    why: r.matchReason ?? r.snippet.slice(0, 120),
    stageSafe: r.stageSafe ?? inferStageSafeFromResult(r),
    kind: r.kind,
  }));
}

async function generateSmartBrief(
  query: string,
  analysis: z.infer<typeof analysisSchema>,
  results: CandidateIntelSearchResult[],
): Promise<IntelSearchSmartBrief | null> {
  const readingOrder = defaultReadingOrder(results);
  const top = results[0];

  if (!isOpenAIConfigured() || results.length === 0) {
    return {
      intent: analysis.intent,
      intentLabel: analysis.intentLabel,
      urgency: analysis.urgency,
      rewrittenQueries: analysis.searchQueries,
      readingOrder,
      brief:
        results.length === 0
          ? "No matches — try Hammer, trap lane, SOS, funding, or a shorter phrase."
          : `Open **${top?.title}** first — best keyword match for your search.`,
      stageWarning: readingOrder.some((r) => r.stageSafe === "verify")
        ? "Some hits need staff verification before stage."
        : null,
      safeLine: null,
      doNotSay: null,
      followUps: ["Hammer 2021 package", "trap lane pivot", "verified funding claims"],
      openFirstHref: top?.href ?? null,
      openFirstTitle: top?.title ?? null,
      confidence: results.length > 2 ? "medium" : "low",
    };
  }

  try {
    const client = getOpenAIClient();
    const { model } = getOpenAIConfigFromEnv();
    const context = buildCandidateIntelContextBlock(results, 14000);
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.28,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: INTEL_SMART_SEARCH_BRIEF_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            query,
            analysis,
            context,
            topTitles: results.slice(0, 8).map((r) => ({ title: r.title, href: r.href, kind: r.kind, stageSafe: r.stageSafe })),
          }),
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return null;
    const parsed = briefSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return {
        intent: analysis.intent,
        intentLabel: analysis.intentLabel,
        urgency: analysis.urgency,
        rewrittenQueries: analysis.searchQueries,
        readingOrder,
        brief: `Start with **${top?.title}** — strongest match for "${query}".`,
        stageWarning: readingOrder.some((r) => r.stageSafe === "verify") ? "Verify gated lines with staff before stage." : null,
        safeLine: null,
        doNotSay: null,
        followUps: ["Hammer 2021 package", "trap lane scripts", "verified claims"],
        openFirstHref: top?.href ?? null,
        openFirstTitle: top?.title ?? null,
        confidence: "medium",
      };
    }
    const b = parsed.data;
    return {
      intent: analysis.intent,
      intentLabel: analysis.intentLabel,
      urgency: analysis.urgency,
      rewrittenQueries: analysis.searchQueries,
      readingOrder:
        b.readingOrder.length > 0
          ? b.readingOrder.map((r) => ({ ...r, kind: results.find((x) => x.href === r.href)?.kind ?? "nav" }))
          : readingOrder,
      brief: b.brief,
      stageWarning: b.stageWarning,
      safeLine: b.safeLine,
      doNotSay: b.doNotSay,
      followUps: b.followUps,
      openFirstHref: b.openFirstHref ?? top?.href ?? null,
      openFirstTitle: b.openFirstTitle ?? top?.title ?? null,
      confidence: b.confidence,
    };
  } catch (err) {
    console.error("[smart-search] brief failed:", err);
    return {
      intent: analysis.intent,
      intentLabel: analysis.intentLabel,
      urgency: analysis.urgency,
      rewrittenQueries: analysis.searchQueries,
      readingOrder,
      brief: top ? `Open **${top.title}** first — top match for your search.` : "No strong match — try a shorter phrase.",
      stageWarning: null,
      safeLine: null,
      doNotSay: null,
      followUps: [],
      openFirstHref: top?.href ?? null,
      openFirstTitle: top?.title ?? null,
      confidence: "low",
    };
  }
}

export type RunSmartIntelligenceSearchOptions = {
  query: string;
  profile?: "CANDIDATE" | "STAFF" | "CLERK_WEEK";
  mode?: IntelSearchSmartMode;
  includeBrief?: boolean;
  limit?: number;
};

export async function runSmartIntelligenceSearch(
  options: RunSmartIntelligenceSearchOptions,
): Promise<{
  results: CandidateIntelSearchResult[];
  smart: IntelSearchSmartBrief | null;
  corpusCounts: CandidateIntelCorpusCounts;
  analysis: z.infer<typeof analysisSchema> | null;
}> {
  const q = options.query.trim();
  const profile = options.profile ?? "CANDIDATE";
  const mode = options.mode ?? "smart";
  const limit = options.limit ?? 24;

  if (!q) {
    const empty = await searchCandidateIntelligenceMulti([""], { profile, limit: 0 });
    return { results: [], smart: null, corpusCounts: empty.corpusCounts, analysis: null };
  }

  let analysis: z.infer<typeof analysisSchema> | null = null;
  let queries = [q];

  if (mode === "smart") {
    analysis = await analyzeSearchQuery(q);
    queries = analysis.searchQueries;
  }

  const { results: rawResults, corpusCounts } = await searchCandidateIntelligenceMulti(queries, {
    profile,
    limit: limit + 8,
    semanticRerank: true,
  });

  const results = rawResults.slice(0, limit).map((r) => ({
    ...r,
    stageSafe: r.stageSafe ?? inferStageSafeFromResult(r),
  }));

  let smart: IntelSearchSmartBrief | null = null;
  if (options.includeBrief) {
    const a = analysis ?? (await analyzeSearchQuery(q));
    smart = await generateSmartBrief(q, a, results);
  }

  return { results, smart, corpusCounts, analysis };
}
