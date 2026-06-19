export type PriorityCitySearchRow = {
  slug: string;
  name: string;
  county: string;
  isBonusCity?: boolean;
};

export type PriorityCityMatch = {
  city: PriorityCitySearchRow;
  score: number;
};

export type PriorityCityMatchOutcome =
  | { kind: "empty" }
  | { kind: "exact"; city: PriorityCitySearchRow }
  | { kind: "choices"; matches: PriorityCityMatch[] }
  | { kind: "none"; query: string };

function slugifyPlaceName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeCityQuery(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/,?\s*arkansas$/i, "")
    .replace(/,?\s*ar$/i, "")
    .replace(/\s+county$/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function scoreCityMatch(query: string, city: PriorityCitySearchRow): number {
  const normalizedQuery = normalizeCityQuery(query);
  if (!normalizedQuery) return 0;

  const normalizedName = normalizeCityQuery(city.name);
  const querySlug = slugifyPlaceName(query);
  const nameSlug = slugifyPlaceName(city.name);

  if (querySlug && querySlug === city.slug) return 100;
  if (normalizedQuery === normalizedName) return 98;
  if (querySlug && querySlug === nameSlug) return 96;
  if (normalizedName.startsWith(normalizedQuery) && normalizedQuery.length >= 2) return 88;
  if (normalizedQuery.startsWith(normalizedName) && normalizedName.length >= 3) return 84;

  const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);
  const nameWords = normalizedName.split(/\s+/).filter(Boolean);
  if (queryWords.length > 0 && queryWords.every((w) => nameWords.some((nw) => nw.startsWith(w) || w.startsWith(nw)))) {
    return 78;
  }

  if (normalizedName.includes(normalizedQuery) && normalizedQuery.length >= 3) return 72;
  if (normalizedQuery.includes(normalizedName) && normalizedName.length >= 4) return 68;

  return 0;
}

export function matchPriorityCities(query: string, cities: PriorityCitySearchRow[]): PriorityCityMatchOutcome {
  const trimmed = query.trim();
  if (!trimmed) return { kind: "empty" };

  const scored = cities
    .map((city) => ({ city, score: scoreCityMatch(trimmed, city) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.city.name.localeCompare(b.city.name));

  if (scored.length === 0) return { kind: "none", query: trimmed };

  const top = scored[0]!;
  if (top.score >= 96) {
    const tied = scored.filter((row) => row.score >= 96);
    if (tied.length === 1) return { kind: "exact", city: top.city };
    return { kind: "choices", matches: tied.slice(0, 8) };
  }

  const strong = scored.filter((row) => row.score >= 72);
  if (strong.length === 1) return { kind: "exact", city: strong[0]!.city };

  return { kind: "choices", matches: (strong.length > 0 ? strong : scored).slice(0, 8) };
}

export function filterPriorityCitySuggestions(
  query: string,
  cities: PriorityCitySearchRow[],
  limit = 6,
): PriorityCityMatch[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  return cities
    .map((city) => ({ city, score: scoreCityMatch(trimmed, city) }))
    .filter((row) => row.score >= 68)
    .sort((a, b) => b.score - a.score || a.city.name.localeCompare(b.city.name))
    .slice(0, limit);
}
