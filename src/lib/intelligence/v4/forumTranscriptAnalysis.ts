import { createReadStream } from "node:fs";
import { getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured, formatOpenAIErrorForClient } from "@/lib/openai/client";
import { FORUM_TRANSCRIPT_ANALYSIS_PROMPT } from "@/lib/openai/prompts";
import type { ForumTranscriptAnalysis } from "@/lib/intelligence/v4/forumTranscriptLab";

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
