/**
 * Internal-only AI extraction from approved/published transcripts.
 * Suggestions require human approval before any public use.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { formatOpenAIErrorForClient, getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";
import { AI_ADVISORY_DIR, WORKSPACE_REL } from "./workspace-store";

export type AiTranscriptAdvisory = {
  youtubeVideoId: string;
  generatedAt: string;
  model: string;
  status: "DRAFT_INTERNAL" | "EDITOR_APPROVED" | "REJECTED";
  summary: string;
  bullets: string[];
  keyQuotes: string[];
  topics: string[];
  faqSuggestions: string[];
  issueTags: string[];
  countyTags: string[];
  relatedPageSuggestions: string[];
  socialClipSuggestions: string[];
};

const EMPTY: Omit<AiTranscriptAdvisory, "youtubeVideoId" | "generatedAt" | "model"> = {
  status: "DRAFT_INTERNAL",
  summary: "",
  bullets: [],
  keyQuotes: [],
  topics: [],
  faqSuggestions: [],
  issueTags: [],
  countyTags: [],
  relatedPageSuggestions: [],
  socialClipSuggestions: [],
};

export async function generateAiTranscriptAdvisory(opts: {
  youtubeVideoId: string;
  title: string;
  plainText: string;
}): Promise<{ ok: true; advisory: AiTranscriptAdvisory } | { ok: false; error: string }> {
  if (!isOpenAIConfigured()) return { ok: false, error: "OPENAI_API_KEY not configured." };
  if (!opts.plainText.trim()) return { ok: false, error: "Empty transcript." };

  const { model } = getOpenAIConfigFromEnv();
  const openai = getOpenAIClient();
  const prompt = `You are a campaign editorial assistant. Extract structured notes from this speech transcript.
Return STRICT JSON with keys: summary (string), bullets (string[]), keyQuotes (string[]), topics (string[]), faqSuggestions (string[]), issueTags (string[]), countyTags (string[]), relatedPageSuggestions (string[]), socialClipSuggestions (string[]).
Do not invent facts not present in the transcript. Keep quotes verbatim.

Title: ${opts.title}

Transcript:
${opts.plainText.slice(0, 12000)}`;

  try {
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Return only valid JSON. Internal advisory use only." },
        { role: "user", content: prompt },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as Partial<AiTranscriptAdvisory>;
    const advisory: AiTranscriptAdvisory = {
      youtubeVideoId: opts.youtubeVideoId,
      generatedAt: new Date().toISOString(),
      model,
      status: "DRAFT_INTERNAL",
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      bullets: Array.isArray(parsed.bullets) ? parsed.bullets.map(String) : [],
      keyQuotes: Array.isArray(parsed.keyQuotes) ? parsed.keyQuotes.map(String) : [],
      topics: Array.isArray(parsed.topics) ? parsed.topics.map(String) : [],
      faqSuggestions: Array.isArray(parsed.faqSuggestions) ? parsed.faqSuggestions.map(String) : [],
      issueTags: Array.isArray(parsed.issueTags) ? parsed.issueTags.map(String) : [],
      countyTags: Array.isArray(parsed.countyTags) ? parsed.countyTags.map(String) : [],
      relatedPageSuggestions: Array.isArray(parsed.relatedPageSuggestions)
        ? parsed.relatedPageSuggestions.map(String)
        : [],
      socialClipSuggestions: Array.isArray(parsed.socialClipSuggestions)
        ? parsed.socialClipSuggestions.map(String)
        : [],
    };
    return { ok: true, advisory };
  } catch (err) {
    return { ok: false, error: formatOpenAIErrorForClient(err) };
  }
}

export function saveAiAdvisory(advisory: AiTranscriptAdvisory, repoRoot: string = process.cwd()): string {
  const abs = path.join(repoRoot, WORKSPACE_REL, AI_ADVISORY_DIR, `${advisory.youtubeVideoId}.json`);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(advisory, null, 2)}\n`, "utf8");
  return abs;
}

export function emptyAiAdvisory(youtubeVideoId: string): AiTranscriptAdvisory {
  return {
    youtubeVideoId,
    generatedAt: new Date().toISOString(),
    model: "none",
    ...EMPTY,
  };
}
