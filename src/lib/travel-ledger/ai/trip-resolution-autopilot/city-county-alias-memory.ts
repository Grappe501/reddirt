import { ARKANSAS_CITY_ALIASES, type ArkansasCityAlias } from "@/lib/travel-ledger/geo/arkansas-city-aliases";

export type AliasMatchKind = "city" | "alias" | "county";

export type CityAliasMatch = {
  entry: ArkansasCityAlias;
  matchedText: string;
  kind: AliasMatchKind;
  confidence: "high" | "medium" | "low";
};

export function findCityAliasMatches(text: string): CityAliasMatch[] {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  const matches: CityAliasMatch[] = [];
  for (const entry of ARKANSAS_CITY_ALIASES) {
    if (containsPhrase(normalized, entry.city)) {
      matches.push({
        entry,
        matchedText: entry.city,
        kind: "city",
        confidence: entry.city === "Rose Bud" ? "low" : "high",
      });
    }

    for (const alias of entry.aliases) {
      if (alias.toLowerCase() === entry.city.toLowerCase()) continue;
      if (!containsPhrase(normalized, alias)) continue;
      const countyOnly = /\bcounty\b/i.test(alias) && !containsPhrase(normalized, entry.city);
      matches.push({
        entry,
        matchedText: alias,
        kind: countyOnly ? "county" : "alias",
        confidence: countyOnly ? "medium" : entry.confidence ?? "high",
      });
    }
  }

  return matches.sort((a, b) => {
    const confidenceScore = scoreConfidence(b.confidence) - scoreConfidence(a.confidence);
    if (confidenceScore !== 0) return confidenceScore;
    return b.matchedText.length - a.matchedText.length;
  });
}

export function normalizeText(text: string): string {
  return ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()} `;
}

function containsPhrase(normalizedText: string, phrase: string): boolean {
  const normalizedPhrase = normalizeText(phrase).trim();
  if (!normalizedPhrase) return false;
  return normalizedText.includes(` ${normalizedPhrase} `);
}

function scoreConfidence(confidence: "high" | "medium" | "low"): number {
  if (confidence === "high") return 3;
  if (confidence === "medium") return 2;
  return 1;
}

