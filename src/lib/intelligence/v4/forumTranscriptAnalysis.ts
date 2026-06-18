import { createReadStream } from "node:fs";
import { getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured, formatOpenAIErrorForClient } from "@/lib/openai/client";
import { FORUM_TRANSCRIPT_ANALYSIS_PROMPT, FORUM_TRANSCRIPT_DEEP_ANALYSIS_PROMPT, FORUM_TRANSCRIPT_DIARIZATION_PROMPT } from "@/lib/openai/prompts";
import type { ForumDeepAnalysis, ForumTranscriptAnalysis } from "@/lib/intelligence/v4/forumTranscriptLab";

export async function transcribeForumMediaFile(
  absolutePath: string,
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  if (!isOpenAIConfigured()) {
    return { ok: false, error: "OPENAI_API_KEY not set — paste transcript manually." };
  }
  try {
    const openai = getOpenAIClient();
    const result = await openai.audio.transcriptions.create({
      file: createReadStream(absolutePath),
      model: "whisper-1",
      response_format: "text",
    });
    const text = typeof result === "string" ? result : String(result);
    if (!text.trim()) return { ok: false, error: "Whisper returned empty transcript." };
    return { ok: true, text: text.trim() };
  } catch (err) {
    return { ok: false, error: formatOpenAIErrorForClient(err) };
  }
}

export async function analyzeForumTranscript(transcriptText: string): Promise<ForumTranscriptAnalysis> {
  if (!isOpenAIConfigured()) {
    throw new Error("OPENAI_API_KEY not set — cannot run AI analysis.");
  }
  const { model } = getOpenAIConfigFromEnv();
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: FORUM_TRANSCRIPT_ANALYSIS_PROMPT },
      {
        role: "user",
        content: `TRANSCRIPT (internal forum — analyze for Kelly Grappe SOS debate prep):\n\n${transcriptText.slice(0, 120_000)}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as ForumTranscriptAnalysis;
  return {
    generatedAt: new Date().toISOString(),
    model,
    hammerThemes: parsed.hammerThemes ?? [],
    pakkoThemes: parsed.pakkoThemes ?? [],
    kellyOpportunities: parsed.kellyOpportunities ?? [],
    predictedDebateQuestions: parsed.predictedDebateQuestions ?? [],
    capitalizeMoves: parsed.capitalizeMoves ?? [],
    watchForTells: parsed.watchForTells ?? [],
    newspaperAngles: parsed.newspaperAngles ?? [],
    claimsGateNotes: parsed.claimsGateNotes ?? [],
    summary: parsed.summary ?? "",
  };
}

export async function analyzeForumTranscriptDeep(transcriptText: string): Promise<ForumDeepAnalysis> {
  if (!isOpenAIConfigured()) {
    throw new Error("OPENAI_API_KEY not set — cannot run deep analysis.");
  }
  const { model } = getOpenAIConfigFromEnv();
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.25,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: FORUM_TRANSCRIPT_DEEP_ANALYSIS_PROMPT },
      {
        role: "user",
        content: `TRANSCRIPT (deep forensic analysis for 7-day Kelly Grappe debate intensive):\n\n${transcriptText.slice(0, 120_000)}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Partial<ForumDeepAnalysis>;
  const emptyProfile = {
    rhetoricalStyle: "",
    favoritePhrases: [] as string[],
    evasionPatterns: [] as string[],
    weakUnderPressure: "",
    strongestMoments: "",
  };

  return {
    generatedAt: new Date().toISOString(),
    model,
    speakerProfiles: {
      hammer: { ...emptyProfile, ...parsed.speakerProfiles?.hammer },
      pakko: { ...emptyProfile, ...parsed.speakerProfiles?.pakko },
      kelly: { ...emptyProfile, ...parsed.speakerProfiles?.kelly },
    },
    verbatimQuotes: parsed.verbatimQuotes ?? [],
    predictedDebateScript: parsed.predictedDebateScript ?? [],
    crossExamStarters: parsed.crossExamStarters ?? [],
    sevenDayIntegration: parsed.sevenDayIntegration ?? [],
    mockModeratorBlock: parsed.mockModeratorBlock ?? { openingQuestion: "", followUps: [], closingQuestion: "" },
    commandDrills: parsed.commandDrills ?? [],
    newspaperPullQuotes: parsed.newspaperPullQuotes ?? [],
    executiveBrief: parsed.executiveBrief ?? "",
  };
}

const DIARIZATION_CHUNK = 14_000;

function formatDiarizedSegments(segments: Array<{ speaker: string; text: string }>): string {
  return segments
    .filter((s) => s.text.trim())
    .map((s) => `[${s.speaker}] ${s.text.trim()}`)
    .join("\n\n");
}

async function diarizeForumTranscriptChunk(chunk: string): Promise<Array<{ speaker: string; text: string }>> {
  const { model } = getOpenAIConfigFromEnv();
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.15,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: FORUM_TRANSCRIPT_DIARIZATION_PROMPT },
      {
        role: "user",
        content: `RAW TRANSCRIPT CHUNK (label each speaker turn):\n\n${chunk}`,
      },
    ],
  });
  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as { segments?: Array<{ speaker: string; text: string }> };
  return parsed.segments ?? [];
}

/** AI speaker labeling for debate prep — Kelly, Hammer, Pakko, Moderator. */
export async function diarizeForumTranscript(transcriptText: string): Promise<string> {
  if (!isOpenAIConfigured()) {
    throw new Error("OPENAI_API_KEY not set — cannot label speakers.");
  }
  const trimmed = transcriptText.trim();
  if (trimmed.length < 50) throw new Error("Transcript too short to diarize.");

  if (trimmed.length <= DIARIZATION_CHUNK) {
    return formatDiarizedSegments(await diarizeForumTranscriptChunk(trimmed));
  }

  const parts: Array<{ speaker: string; text: string }> = [];
  for (let i = 0; i < trimmed.length; i += DIARIZATION_CHUNK) {
    const chunk = trimmed.slice(i, i + DIARIZATION_CHUNK);
    const segs = await diarizeForumTranscriptChunk(chunk);
    parts.push(...segs);
  }
  return formatDiarizedSegments(parts);
}
