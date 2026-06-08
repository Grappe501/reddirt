import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { isDatabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/db";
import { isOpenAIConfigured } from "@/lib/openai/client";
import { countIntelSearchCorpus } from "@/lib/intelligence/intelligenceSearchCorpus";
import { INTEL_SEARCH_SUGGESTIONS_V4 } from "@/lib/intelligence/intelligenceSearchCore";
import {
  INTEL_SEARCH_V4_VERSION,
  runIntelligenceSearchV4,
  getProfileSearchSuggestions,
} from "@/lib/intelligence/intelligenceSearchV4";
import { buildTonightPrepStack } from "@/lib/intelligence/intelligenceTonightStack";
import { recordIntelSearchEvent, summarizeIntelSearchGaps } from "@/lib/intelligence/intelligenceSearchAnalytics";
import { loadIntelligencePrepSearchChunks } from "@/lib/intelligence/intelligenceSearchIngestChunks";
import { resolveIntelligenceNavProfileServer } from "@/lib/intelligence/v4/roleBasedNavProfile";
import { countRegisteredCopilotTools } from "@/lib/intelligence/intelligenceAiPrepV4";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  query: z.string().min(1).max(500),
  includeAnswer: z.boolean().optional(),
  includeBrief: z.boolean().optional(),
  mode: z.enum(["smart", "quick"]).optional(),
  profile: z.enum(["CANDIDATE", "STAFF", "CLERK_WEEK"]).optional(),
});

export async function GET() {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const profile = resolveIntelligenceNavProfileServer();

  let chunkCount = 0;
  if (isDatabaseConfigured()) {
    try {
      chunkCount = await prisma.searchChunk.count();
    } catch {
      chunkCount = 0;
    }
  }

  const meta = countIntelSearchCorpus(profile);

  return NextResponse.json({
    ok: true,
    route: "admin-intelligence-search",
    version: INTEL_SEARCH_V4_VERSION,
    database: isDatabaseConfigured(),
    chunkCount,
    openai: isOpenAIConfigured(),
    profile,
    corpus: {
      navLinks: meta.byKind.nav ?? 0,
      fieldBookArticles: meta.byKind.field_book ?? 0,
      claims: meta.byKind.claim ?? 0,
      trapLanes: meta.byKind.trap_lane ?? 0,
      sosQuestions: meta.byKind.sos_question ?? 0,
      hammerModules: meta.byKind.hammer_module ?? 0,
      glossaryTerms: meta.byKind.glossary ?? 0,
      debateDepth: meta.byKind.debate_depth ?? 0,
      offensiveMoves: meta.byKind.offensive_move ?? 0,
      rehearsalDocs: meta.byKind.rehearsal ?? 0,
      copilotTools: meta.byKind.copilot_tool ?? 0,
      registeredCopilotTools: countRegisteredCopilotTools(),
      searchChunks: chunkCount,
      corpusTotal: meta.total,
      byKind: meta.byKind,
    },
    suggestions: getProfileSearchSuggestions(profile),
    defaultSuggestions: [...INTEL_SEARCH_SUGGESTIONS_V4],
    tonightStack: buildTonightPrepStack(),
    ingestPending: loadIntelligencePrepSearchChunks().length,
    gaps: summarizeIntelSearchGaps(),
    features: [
      "smart_v4_unified_corpus",
      "sre_rehearsal_stack_indexed",
      "copilot_tool_registry_indexed",
      "multi_query_ai_rewrite",
      "reciprocal_rank_fusion",
      "semantic_rerank",
      "stage_safe_brief",
      "reading_order",
      "follow_up_queries",
      "tonight_stack",
      "copilot_recommendations",
      "sre_shortcuts",
      "profile_aware_suggestions",
      "intelligence_prep_ingest",
      "search_analytics",
      "claims_gate_policy",
      "full_body_ai_context",
      "did_you_mean",
      "search_ai_prep_bridge",
    ],
  });
}

export async function POST(req: Request) {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const ip = clientIp(req);
  const rl = rateLimit(`admin-intel-search:${ip}`, 50, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "rate_limited", retryAfterMs: rl.retryAfterMs }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation", message: "`query` required" }, { status: 400 });
  }

  const { query, includeAnswer, includeBrief, mode, profile } = parsed.data;
  const wantBrief = includeBrief ?? includeAnswer ?? false;
  const resolvedProfile = profile ?? resolveIntelligenceNavProfileServer();

  try {
    const payload = await runIntelligenceSearchV4({
      query,
      profile: resolvedProfile,
      mode: mode ?? "smart",
      includeBrief: wantBrief,
      limit: 24,
    });

    recordIntelSearchEvent({
      query,
      resultCount: payload.results.length,
      intent: payload.analysis?.intent,
      urgency: payload.analysis?.urgency,
      mode: mode ?? "smart",
      rewrittenQueries: payload.analysis?.rewrittenQueries,
    });

    return NextResponse.json({
      ok: true,
      version: payload.version,
      results: payload.results,
      smart: payload.smart,
      answer: payload.smart?.brief ?? null,
      didYouMean: payload.didYouMean,
      copilotRecommendations: payload.copilotRecommendations,
      sreShortcuts: payload.sreShortcuts,
      profileSuggestions: payload.profileSuggestions,
      tonightStack: payload.results.length === 0 ? buildTonightPrepStack() : undefined,
      analysis: payload.analysis,
      corpus: payload.corpusCounts,
      openai: isOpenAIConfigured(),
      profile: resolvedProfile,
    });
  } catch (e) {
    console.error("[admin-intelligence-search]", e);
    const detail = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json(
      { ok: false, error: "search_failed", message: `Search failed: ${detail}` },
      { status: 500 },
    );
  }
}
