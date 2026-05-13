import { z } from "zod";
import type { AiApprovalRecommendation } from "./ai-approval-recommendation-types";
import type { ApprovalContext } from "./build-approval-context";
import { formatOpenAIErrorForClient, getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";

const surrogateEnum = z.enum([
  "county_chair",
  "county_party_contact",
  "trusted_local",
  "volunteer",
  "local_elected",
  "staff_choose",
]);

const recommendationEnum = z.enum([
  "approve",
  "approve_with_modification",
  "send_local",
  "hold",
  "reject",
  "ask_staff",
]);

const actionEnum = z.enum(["approve", "modify", "send_local", "hold", "reject", "ask_staff"]);

const aiSchema = z.object({
  calendarItemId: z.string(),
  recommendation: recommendationEnum,
  confidence: z.number().min(0).max(1),
  headline: z.string(),
  why: z.array(z.string()),
  risks: z.array(z.string()),
  suggestedModifications: z.array(
    z.object({
      field: z.enum(["time", "date", "location", "travel", "overnight", "coverage", "verification"]),
      suggestion: z.string(),
    }),
  ),
  suggestedOptions: z.array(
    z.object({
      action: actionEnum,
      label: z.string(),
      reason: z.string(),
    }),
  ),
  localAsk: z
    .object({
      shouldSendLocal: z.boolean(),
      suggestedSurrogateType: surrogateEnum,
      reason: z.string(),
    })
    .optional(),
  clerkVisitSuggestion: z
    .object({
      recommend: z.boolean(),
      reason: z.string(),
      suggestedTimeWindow: z.string().optional(),
    })
    .optional(),
  lunchSuggestion: z
    .object({
      recommend: z.boolean(),
      reason: z.string(),
      suggestedTimeWindow: z.string().optional(),
    })
    .optional(),
});

const SYSTEM = `You are a scheduling assistant for Kelly Grappe, a candidate for Arkansas Secretary of State.

Facts below are provided as JSON ("context"). Treat them as authoritative. Do NOT invent contacts, fair dates, county meeting dates, locations, commitments, or people not implied by the context.

Rules:
- Kelly's home base is Rose Bud, Arkansas.
- Kelly usually works 8:00–17:00 Central on weekdays; context flags workWindowConflict when a timed event overlaps that window.
- Tuesday daytime must be in Little Rock / Pulaski unless context shows an explicit exception (we only know what is in context).
- If countySeatOpportunity is true, a county clerk visit may be worth suggesting (no specific clerk names).
- If noonLunchOpportunity is true and schedule allows, lunch with a local may be suggested (no specific names).
- Remote / under-touched counties are often higher value than filler metros. Context may include priorityTier; Pulaski, Saline, Faulkner, Fayetteville/Washington, Benton/NWA, and Jonesboro/Craighead often have many opportunities and can take a back seat when compared to underserved counties.
- Context includes travelOriginLabel / travelOriginKind, estimatedDistanceMiles (from that origin), optional estimatedDistanceMilesFromRoseBud, workScheduleSummary + workScheduleDetail, whoSummary, whyThisMatters, lunchWindowLabel, courthousePhotoSuggestion, localCivicStopSuggestion.
- Output MUST be a single JSON object matching the schema the user message describes. No markdown, no prose outside JSON.`;

function defaultSuggestedOptions(): AiApprovalRecommendation["suggestedOptions"] {
  return [
    { action: "approve", label: "Approve", reason: "Calendar can proceed as proposed if logistics check out." },
    { action: "modify", label: "Modify", reason: "Request a time/date/location tweak before committing." },
    { action: "send_local", label: "Send local", reason: "Surrogate coverage may fit better than Kelly travel." },
    { action: "hold", label: "Hold", reason: "Pause until more information or DPA/county confirmation." },
    { action: "reject", label: "Reject", reason: "Decline this slot if it does not meet goals." },
    { action: "ask_staff", label: "Ask staff", reason: "Escalate verification or scheduling tradeoffs to staff." },
  ];
}

export function buildDeterministicAiFallback(ctx: ApprovalContext): AiApprovalRecommendation {
  const why: string[] = [];
  if (ctx.whyThisMatters) why.push(ctx.whyThisMatters);
  const risks: string[] = [];
  const mods: AiApprovalRecommendation["suggestedModifications"] = [];

  if (ctx.conflicts.length) {
    why.push("Deterministic check found overlapping timed events the same day.");
    risks.push("Schedule overlap may require splitting attendance or choosing one event.");
  }
  if (ctx.workWindowConflict) {
    why.push(ctx.workWindowNote);
    risks.push("Weekday work-window overlap flagged.");
    mods.push({ field: "time", suggestion: "Move outside 8–5 Central weekday or confirm as a planned exception." });
  }
  if (ctx.tuesdayLittleRockConflict) {
    why.push(ctx.tuesdayLittleRockNote);
    risks.push("Tuesday Little Rock daytime rule may apply.");
  }
  if (ctx.estimatedDistanceMiles != null && ctx.estimatedDistanceMiles > 120) {
    why.push(`Rough distance from Rose Bud is about ${ctx.estimatedDistanceMiles} mi (${ctx.distanceConfidence} estimate).`);
    risks.push("Long travel may need overnight staging.");
  }
  if (ctx.countySeatOpportunity && ctx.countyClerkSuggestion) {
    why.push(ctx.countyClerkSuggestion);
  }
  if (ctx.noonLunchOpportunity && ctx.lunchSuggestion) {
    why.push(ctx.lunchSuggestion);
  }

  let recommendation: AiApprovalRecommendation["recommendation"] = "approve";
  if (ctx.conflicts.length) recommendation = "hold";
  else if (ctx.estimatedDistanceMiles != null && ctx.estimatedDistanceMiles > 160) recommendation = "send_local";
  else if (ctx.tuesdayLittleRockConflict || ctx.workWindowConflict) recommendation = "ask_staff";

  const headlines: Record<AiApprovalRecommendation["recommendation"], string> = {
    approve: "Looks workable if logistics match the workbook.",
    approve_with_modification: "Approve only with a time/location tweak.",
    send_local: "Consider local surrogate due to distance or timing pressure.",
    hold: "Hold — resolve conflicts before approving.",
    reject: "Decline unless goals change.",
    ask_staff: "Ask staff to verify or reschedule.",
  };
  const headline = headlines[recommendation];

  return {
    calendarItemId: ctx.calendarItemId,
    recommendation,
    confidence: 0.35,
    headline,
    why: why.length ? why : ["No hard conflicts flagged by deterministic checks."],
    risks,
    suggestedModifications: mods,
    suggestedOptions: defaultSuggestedOptions(),
    localAsk: {
      shouldSendLocal: recommendation === "send_local",
      suggestedSurrogateType: "staff_choose",
      reason: "Fallback: staff should pick a surrogate if Kelly cannot attend.",
    },
    clerkVisitSuggestion: ctx.countySeatOpportunity
      ? {
          recommend: true,
          reason: ctx.countyClerkSuggestion ?? "County seat opportunity noted in context.",
          suggestedTimeWindow: "Morning clerk hours (confirm locally).",
        }
      : { recommend: false, reason: "Not flagged as county seat opportunity in context." },
    lunchSuggestion: ctx.noonLunchOpportunity
      ? {
          recommend: true,
          reason: ctx.lunchSuggestion ?? "Noon window may be open.",
          suggestedTimeWindow: "11:45–13:00 Central",
        }
      : { recommend: false, reason: "Noon lunch window not clearly open per context." },
  };
}

export async function fetchAiCalendarRecommendation(ctx: ApprovalContext): Promise<{
  recommendation: AiApprovalRecommendation;
  error?: string;
}> {
  if (!isOpenAIConfigured()) {
    return { recommendation: buildDeterministicAiFallback(ctx), error: "OpenAI is not configured (OPENAI_API_KEY)." };
  }

  const user = `Return JSON with exactly these keys and types:
{
  "calendarItemId": string,
  "recommendation": "approve" | "approve_with_modification" | "send_local" | "hold" | "reject" | "ask_staff",
  "confidence": number (0-1),
  "headline": string (short),
  "why": string[],
  "risks": string[],
  "suggestedModifications": { "field": "time"|"date"|"location"|"travel"|"overnight"|"coverage"|"verification", "suggestion": string }[],
  "suggestedOptions": { "action": "approve"|"modify"|"send_local"|"hold"|"reject"|"ask_staff", "label": string, "reason": string }[],
  "localAsk"?: { "shouldSendLocal": boolean, "suggestedSurrogateType": "county_chair"|"county_party_contact"|"trusted_local"|"volunteer"|"local_elected"|"staff_choose", "reason": string },
  "clerkVisitSuggestion"?: { "recommend": boolean, "reason": string, "suggestedTimeWindow"?: string },
  "lunchSuggestion"?: { "recommend": boolean, "reason": string, "suggestedTimeWindow"?: string }
}

calendarItemId must be "${ctx.calendarItemId}".

Context (authoritative facts):
${JSON.stringify(ctx)}`;

  try {
    const client = getOpenAIClient();
    const { model } = getOpenAIConfigFromEnv();
    const res = await client.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
      ],
    });
    const raw = res.choices[0]?.message?.content;
    if (!raw) return { recommendation: buildDeterministicAiFallback(ctx), error: "Empty model response." };
    const parsed = JSON.parse(raw) as unknown;
    const zr = aiSchema.safeParse(parsed);
    if (!zr.success || zr.data.calendarItemId !== ctx.calendarItemId) {
      return { recommendation: buildDeterministicAiFallback(ctx), error: "Model JSON failed validation." };
    }
    const data = zr.data;
    const recommendation: AiApprovalRecommendation = {
      ...data,
      suggestedOptions: data.suggestedOptions?.length ? data.suggestedOptions : defaultSuggestedOptions(),
    };
    return { recommendation };
  } catch (e) {
    return {
      recommendation: buildDeterministicAiFallback(ctx),
      error: formatOpenAIErrorForClient(e),
    };
  }
}
