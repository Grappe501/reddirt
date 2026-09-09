import type { RhetoricScores, VoiceSimilarityScore } from "./contracts";

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Number(Math.min(1, Math.max(0, value)).toFixed(4));
}

function closeness(a: number, b: number, scale: number): number {
  return clamp01(1 - Math.abs(a - b) / Math.max(scale, 0.0001));
}

function rhetoricCloseness(a: RhetoricScores, b: RhetoricScores): number {
  const keys = Object.keys(a) as Array<keyof RhetoricScores>;
  const total = keys.reduce((sum, key) => sum + closeness(a[key], b[key], 1), 0);
  return clamp01(total / keys.length);
}

export function scoreVoiceSimilarity(input: {
  lexicalOverlap: number;
  avgSentenceLengthA: number;
  avgSentenceLengthB: number;
  shortPunchA: number;
  shortPunchB: number;
  structureA: number;
  structureB: number;
  rhetoricA: RhetoricScores;
  rhetoricB: RhetoricScores;
  issueOverlap: number;
  channelMatch: number;
}): VoiceSimilarityScore {
  const lexicalSimilarity = clamp01(input.lexicalOverlap);
  const rhythmSimilarity = clamp01(
    (closeness(input.avgSentenceLengthA, input.avgSentenceLengthB, 20) +
      closeness(input.shortPunchA, input.shortPunchB, 1)) /
      2,
  );
  const structuralSimilarity = closeness(input.structureA, input.structureB, 1);
  const rhetoricalSimilarity = rhetoricCloseness(input.rhetoricA, input.rhetoricB);
  const issueStyleSimilarity = clamp01(input.issueOverlap);
  const channelStyleSimilarity = clamp01(input.channelMatch);
  const voiceSimilarityScore = clamp01(
    lexicalSimilarity * 0.2 +
      rhythmSimilarity * 0.15 +
      structuralSimilarity * 0.15 +
      rhetoricalSimilarity * 0.25 +
      issueStyleSimilarity * 0.15 +
      channelStyleSimilarity * 0.1,
  );
  return {
    voiceSimilarityScore,
    lexicalSimilarity,
    rhythmSimilarity,
    structuralSimilarity,
    rhetoricalSimilarity,
    issueStyleSimilarity,
    channelStyleSimilarity,
    methodology:
      "Weighted closeness of lexical overlap, sentence rhythm, document-arc hits, rhetoric rates, issue-voice overlap, and channel match. Not an authorship identification score.",
  };
}

export function assertScoreRange(score: VoiceSimilarityScore): string[] {
  const errors: string[] = [];
  for (const [key, value] of Object.entries(score)) {
    if (key === "methodology") continue;
    if (typeof value !== "number" || value < 0 || value > 1) {
      errors.push(`${key} must be between 0 and 1`);
    }
  }
  return errors;
}
