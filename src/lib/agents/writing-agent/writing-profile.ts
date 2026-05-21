export type WritingTone = "warm" | "direct" | "formal" | "plain";

export type WritingAudience = "candidate" | "host" | "volunteer" | "compliance" | "operator" | "public";

export type WritingProfile = {
  version: 1;
  preferredTone: WritingTone;
  formalityLevel: 1 | 2 | 3 | 4 | 5;
  sentenceLengthPreference: "short" | "medium" | "long";
  commonPhrases: string[];
  avoidPhrases: string[];
  campaignThemes: string[];
  candidateVoiceNotes: string;
  operatorStyleNotes: string;
  audienceOverrides: Partial<Record<WritingAudience, { tone: WritingTone; notes: string }>>;
  updatedAt: string;
};

export const DEFAULT_WRITING_PROFILE: WritingProfile = {
  version: 1,
  preferredTone: "warm",
  formalityLevel: 3,
  sentenceLengthPreference: "medium",
  commonPhrases: ["Arkansas", "county clerks", "transparent", "steady leadership"],
  avoidPhrases: ["guaranteed win", "slam dunk", "AI-powered"],
  campaignThemes: ["election integrity", "county partnership", "plain-language government"],
  candidateVoiceNotes: "Kelly: practical, calm, neighbor-to-neighbor — no hype.",
  operatorStyleNotes: "Internal copy: direct, action-oriented, show gates for sends/writes.",
  audienceOverrides: {
    host: { tone: "warm", notes: "Thank hosts; be specific about time and location." },
    compliance: { tone: "formal", notes: "No legal conclusions; cite human review." },
    public: { tone: "plain", notes: "No admin jargon; no 'AI' in public UI." },
  },
  updatedAt: new Date().toISOString(),
};

export function mergeWritingProfile(partial: Partial<WritingProfile>): WritingProfile {
  return { ...DEFAULT_WRITING_PROFILE, ...partial, version: 1, updatedAt: new Date().toISOString() };
}
