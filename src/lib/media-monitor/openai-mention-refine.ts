import { z } from "zod";
import { ExternalMediaMatchTier, ExternalMediaMentionType } from "@prisma/client";
import { getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";

const schema = z.object({
  matchTier: z.enum(["DEFINITE", "LIKELY", "UNCERTAIN", "NOT_RELEVANT"]),
  mentionType: z.enum([
    "NEWS_ARTICLE",
    "EDITORIAL",
    "OPINION",
    "LETTER_TO_EDITOR",
    "TV_WEB_STORY",
    "CANDIDATE_LISTING",
    "EVENT_RECAP",
    "ENDORSEMENT",
    "OTHER",
  ]),
  isOpinion: z.boolean(),
  isEditorial: z.boolean(),
  sentimentHint: z.string().nullable(),
  confidenceScore: z.number().min(0).max(1),
});

export type RefinedMention = z.infer<typeof schema>;

export async function refineMentionWithOpenAi(args: {
  title: string;
  summary: string;
  url: string;
  excerpt?: string | null;
}): Promise<RefinedMention | null> {
  if (!isOpenAIConfigured()) return null;
  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();
  const body = [
    `Title: ${args.title}`,
    `URL: ${args.url}`,
    `Summary/snippet: ${args.summary.slice(0, 4000)}`,
    args.excerpt ? `Excerpt: ${args.excerpt.slice(0, 6000)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await client.chat.completions.create({
    model,
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You classify US news items about Arkansas candidate Kelly Grappe (also "Kelly Wiles Grappe") for a compliant press-monitoring system.
Return JSON only with keys: matchTier, mentionType, isOpinion, isEditorial, sentimentHint (short: positive/neutral/negative/unknown or null), confidenceScore (0-1).
matchTier NOT_RELEVANT if the piece is not meaningfully about Kelly Grappe (e.g. incidental surname, different person).
Be conservative when unsure.`,
      },
      { role: "user", content: body },
    ],
  });

  const raw = res.choices[0]?.message?.content;
  if (!raw) return null;
  try {
    const parsed = schema.safeParse(JSON.parse(raw) as unknown);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function mapTier(s: RefinedMention["matchTier"]): ExternalMediaMatchTier {
  return ExternalMediaMatchTier[s as keyof typeof ExternalMediaMatchTier];
}

export function mapMentionType(s: RefinedMention["mentionType"]): ExternalMediaMentionType {
  return ExternalMediaMentionType[s as keyof typeof ExternalMediaMentionType];
}
