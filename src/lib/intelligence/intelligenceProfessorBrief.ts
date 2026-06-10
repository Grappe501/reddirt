/**
 * Collegiate professor-level briefs for intelligence search and debate prep.
 */
import { z } from "zod";
import { getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";
import {
  INTEL_SEARCH_V5_PROFESSOR_BRIEF_PROMPT,
  INTEL_SEARCH_V5_PROFESSOR_ANALYSIS_PROMPT,
} from "@/lib/openai/prompts";
import type { CandidateIntelSearchResult } from "@/lib/intelligence/candidateIntelligenceSearch";
import { buildCandidateIntelContextBlock } from "@/lib/intelligence/candidateIntelligenceSearch";
import type { IntelSearchSmartBrief } from "@/lib/intelligence/intelligenceSmartSearch";

export type ProfessorEvidenceTier = "verified" | "verify_first" | "research";

export type IntelProfessorBrief = {
  thesis: string;
  lectureOutline: { section: string; points: string[] }[];
  evidenceTiers: { tier: ProfessorEvidenceTier; label: string; items: string[] }[];
  socraticQuestions: string[];
  seminarReadingList: { href: string; title: string; professorNote: string }[];
  stageApplication: string;
  officeHoursNote: string;
  rhetoricalFrame: string;
  confidence: "high" | "medium" | "low";
};

const professorBriefSchema = z.object({
  thesis: z.string(),
  lectureOutline: z
    .array(z.object({ section: z.string(), points: z.array(z.string()).max(5) }))
    .max(5),
  evidenceTiers: z
    .array(
      z.object({
        tier: z.enum(["verified", "verify_first", "research"]),
        label: z.string(),
        items: z.array(z.string()).max(4),
      }),
    )
    .max(3),
  socraticQuestions: z.array(z.string()).max(5),
  seminarReadingList: z
    .array(z.object({ href: z.string(), title: z.string(), professorNote: z.string() }))
    .max(6),
  stageApplication: z.string(),
  officeHoursNote: z.string(),
  rhetoricalFrame: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
});

function fallbackProfessorBrief(
  query: string,
  results: CandidateIntelSearchResult[],
  smart: IntelSearchSmartBrief | null,
): IntelProfessorBrief {
  const top = results.slice(0, 5);
  const verified = results.filter((r) => r.badge?.toLowerCase().includes("verified"));
  const verify = results.filter(
    (r) =>
      r.stageSafe === "verify" ||
      r.badge?.toLowerCase().includes("review") ||
      r.badge?.toLowerCase().includes("needs"),
  );

  return {
    thesis: smart?.brief
      ? smart.brief.split("\n")[0]!.slice(0, 200)
      : `Tonight's prep on "${query}" centers on ${top[0]?.title ?? "the strongest corpus match"} — read evidence before rhetoric.`,
    lectureOutline: [
      {
        section: "I. Framing the question",
        points: [
          `Search intent: ${smart?.intentLabel ?? "general prep"}`,
          `Start with ${top[0]?.title ?? "command home"} — highest relevance in corpus.`,
        ],
      },
      {
        section: "II. Evidence architecture",
        points: [
          `${verified.length} verified hits · ${verify.length} need staff verification`,
          smart?.stageWarning ?? "No stage warnings from retrieval — still verify numbers aloud.",
        ],
      },
      {
        section: "III. Stage application",
        points: [
          smart?.safeLine ? `Safe line candidate: ${smart.safeLine.slice(0, 120)}` : "No safe line auto-generated — open claims gate.",
          smart?.doNotSay ? `Blocked: ${smart.doNotSay.slice(0, 100)}` : "Run what-not-to-say before stage.",
        ],
      },
    ],
    evidenceTiers: [
      {
        tier: "verified",
        label: "Tier A — stage-clear if context matches",
        items: verified.slice(0, 3).map((r) => `${r.title} (${r.kind})`),
      },
      {
        tier: "verify_first",
        label: "Tier B — verify with staff before stage",
        items: verify.slice(0, 3).map((r) => `${r.title} — ${r.badge ?? "review"}`),
      },
      {
        tier: "research",
        label: "Tier C — research / depth reading",
        items: top
          .filter((r) => !verified.includes(r) && !verify.includes(r))
          .slice(0, 2)
          .map((r) => r.title),
      },
    ].filter((t) => t.items.length > 0) as IntelProfessorBrief["evidenceTiers"],
    socraticQuestions: [
      `What is the ONE sentence thesis if a moderator asked: "${query}"?`,
      "Where is your fresh add after any agreement with Hammer or Packo?",
      "Which act number or claim in your answer is verified on Arkleg?",
      ...(smart?.followUps?.slice(0, 2) ?? []),
    ],
    seminarReadingList: top.map((r) => ({
      href: r.href,
      title: r.title,
      professorNote: r.matchReason ?? r.snippet.slice(0, 100),
    })),
    stageApplication:
      smart?.openFirstTitle
        ? `Open ${smart.openFirstTitle} first — then rehearse one 30-second answer out loud before drill queue.`
        : "Rehearse one 30-second answer from the top hit, then run tutor critique.",
    officeHoursNote:
      "Professor rule: one thesis, three receipts, one pivot. If time is short, skip breadth — go depth on the top trap or SOS card.",
    rhetoricalFrame: "Forensic accountability (logos) + county service (ethos) — avoid motive attacks (no unsupported pathos).",
    confidence: results.length > 3 ? "medium" : "low",
  };
}

export async function generateIntelProfessorBrief(
  query: string,
  results: CandidateIntelSearchResult[],
  smart: IntelSearchSmartBrief | null,
): Promise<IntelProfessorBrief> {
  const fallback = fallbackProfessorBrief(query, results, smart);
  if (!isOpenAIConfigured() || results.length === 0) return fallback;

  try {
    const client = getOpenAIClient();
    const { model } = getOpenAIConfigFromEnv();
    const context = buildCandidateIntelContextBlock(results, 16000);
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.28,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: INTEL_SEARCH_V5_PROFESSOR_BRIEF_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            query,
            smartBrief: smart,
            context,
            topHits: results.slice(0, 10).map((r) => ({
              title: r.title,
              href: r.href,
              kind: r.kind,
              stageSafe: r.stageSafe,
              badge: r.badge,
            })),
          }),
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return fallback;
    const parsed = professorBriefSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return fallback;
    return parsed.data;
  } catch {
    return fallback;
  }
}

export async function analyzeQueryProfessorLens(query: string): Promise<{
  academicFrame: string;
  debateDiscipline: string;
  recommendedDepth: "survey" | "seminar" | "moot";
}> {
  const fallback = {
    academicFrame: `Treat "${query}" as a applied civics seminar — SOS implementation, not Senate rhetoric.`,
    debateDiscipline: "Political communication + forensic evidence — three-way panel dynamics.",
    recommendedDepth: "seminar" as const,
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
        { role: "system", content: INTEL_SEARCH_V5_PROFESSOR_ANALYSIS_PROMPT },
        { role: "user", content: query },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<typeof fallback>;
    return {
      academicFrame: parsed.academicFrame ?? fallback.academicFrame,
      debateDiscipline: parsed.debateDiscipline ?? fallback.debateDiscipline,
      recommendedDepth: parsed.recommendedDepth ?? fallback.recommendedDepth,
    };
  } catch {
    return fallback;
  }
}
