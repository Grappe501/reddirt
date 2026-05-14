import { z } from "zod";

import type { AgentContextPack, KellyAgentTask } from "@/lib/kelly-agent/agent-context-pack";
import { buildAgentContextPack } from "@/lib/kelly-agent/build-agent-context-pack";
import { runKellyAgentTools, type KellyAgentToolBundle, type KellyAgentToolTrace } from "@/lib/kelly-agent/kelly-agent-tools";
import { formatOpenAIErrorForClient, getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";

const outSchema = z.object({
  headline: z.string(),
  bullets: z.array(z.string()).max(14),
  recommendation: z.enum(["approve", "modify", "hold", "split", "defer_to_staff"]),
  weekActions: z.array(z.object({ day: z.string(), label: z.string(), kind: z.string() })).optional(),
  risks: z.array(z.string()).max(12),
  citations: z.array(z.string()).max(10).optional(),
});

export type KellyAgentRecommendResult = z.infer<typeof outSchema>;

export type KellyAgentRecommendResponse =
  | {
      ok: true;
      task: KellyAgentTask;
      tools: KellyAgentToolBundle;
      toolTrace: KellyAgentToolTrace[];
      result: KellyAgentRecommendResult;
      openaiModel: string | null;
      contextPackSummary: {
        currentDate: string;
        homeBase: string;
        calendarStart: string;
        calendarEnd: string;
        calendarItemCount: number;
        opportunityRows: number;
        routeMatrixEntries: number;
      };
    }
  | { ok: false; error: string; detail?: string };

export async function runKellyAgentRecommend(args: {
  task: KellyAgentTask;
  weekMondayYmd?: string;
  calendarItemId?: string;
  extraStaffRules?: string[];
  extraConstraints?: string[];
}): Promise<KellyAgentRecommendResponse> {
  const built = await buildAgentContextPack({ weekMondayYmd: args.weekMondayYmd });
  const pack: AgentContextPack = {
    ...built,
    staffRules: [...built.staffRules, ...(args.extraStaffRules ?? [])],
    knownConstraints: [...built.knownConstraints, ...(args.extraConstraints ?? [])],
  };
  const { tools, trace } = await runKellyAgentTools(args.task, pack, {
    calendarItemId: args.calendarItemId,
  });

  const contextPackSummary = {
    currentDate: pack.currentDate,
    homeBase: pack.homeBase,
    calendarStart: pack.calendarWindow.start,
    calendarEnd: pack.calendarWindow.end,
    calendarItemCount: Array.isArray(pack.calendarWindow.items) ? pack.calendarWindow.items.length : 0,
    opportunityRows: (pack.tentativeOpportunities as unknown[]).length,
    routeMatrixEntries:
      typeof pack.routeMatrix === "object" && pack.routeMatrix && "entryCount" in pack.routeMatrix
        ? Number((pack.routeMatrix as { entryCount?: number }).entryCount ?? 0)
        : 0,
  };

  if (!isOpenAIConfigured()) {
    return {
      ok: true,
      task: args.task,
      tools,
      toolTrace: trace,
      openaiModel: null,
      contextPackSummary,
      result: {
        headline: "OpenAI not configured — tool bundle only",
        bullets: [
          "Set OPENAI_API_KEY on the server for JSON recommendations.",
          "Use the `tools` object for deterministic calendar, route cache, opportunities, and Google lane discovery.",
        ],
        recommendation: "defer_to_staff",
        risks: [],
      },
    };
  }

  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();
  const SYSTEM = `You are the Kelly Grappe campaign scheduling brain (single persona). Reply JSON only with keys: headline, bullets, recommendation, weekActions?, risks, citations?. recommendation ∈ approve|modify|hold|split|defer_to_staff. Use ONLY the provided contextPack and tools — no invented events, people, addresses, drive times, or opponent claims. Never say an event is covered unless the event_coverage_plan tool says coverage is ready/covered or a human has explicitly confirmed it. Every outbound, Google, email, SMS, public publishing, or volunteer assignment action requires human approval.`;

  const user = JSON.stringify({
    task: args.task,
    calendarItemId: args.calendarItemId ?? null,
    contextPack: pack,
    tools,
  });

  try {
    const res = await client.chat.completions.create({
      model,
      temperature: 0.12,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
      ],
    });
    const text = res.choices[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { ok: false, error: "model_invalid_json" };
    }
    const safe = outSchema.safeParse(parsed);
    if (!safe.success) {
      return {
        ok: true,
        task: args.task,
        tools,
        toolTrace: trace,
        openaiModel: model,
        contextPackSummary,
        result: {
          headline: "Model JSON did not match the staff schema — review raw output in logs",
          bullets: [String(text).slice(0, 500)],
          recommendation: "defer_to_staff",
          risks: ["schema_mismatch"],
        },
      };
    }
    return {
      ok: true,
      task: args.task,
      tools,
      toolTrace: trace,
      openaiModel: model,
      contextPackSummary,
      result: safe.data,
    };
  } catch (e) {
    return { ok: false, error: "openai_error", detail: formatOpenAIErrorForClient(e) };
  }
}
