import type { TravelCity } from "@/lib/travel-ledger/types";
import type { TitleCityMatch } from "./autopilot-types";
import { findCityAliasMatches } from "./city-county-alias-memory";

export function extractTitleCity(title: string): TitleCityMatch {
  const matches = findCityAliasMatches(title).filter((match) => match.entry.city !== "Rose Bud");

  if (!matches.length) {
    return {
      confidence: "none",
      source: "none",
      needsHumanConfirmation: true,
      reason: "No Arkansas city or campaign alias was found in the event title.",
    };
  }

  const uniqueCities = dedupeCities(
    matches.map((match) => ({
      city: match.entry.city,
      state: match.entry.state,
    })),
  );
  const first = matches[0];
  const source =
    first.kind === "city"
      ? "title_exact_city_match"
      : first.kind === "county"
        ? "title_county_to_city_match"
        : "title_alias_match";

  return {
    city: first.entry.city,
    state: first.entry.state,
    county: first.entry.county,
    cities: uniqueCities,
    confidence: first.confidence,
    matchedText: first.matchedText,
    source,
    needsHumanConfirmation: first.confidence !== "high" || uniqueCities.length > 1,
    reason:
      uniqueCities.length > 1
        ? `Found ${uniqueCities.length} title city matches; human should confirm route order.`
        : `${first.kind === "county" ? "County alias" : "Title text"} matched ${first.entry.city}, ${first.entry.state}.`,
  };
}

function dedupeCities(cities: TravelCity[]): TravelCity[] {
  const seen = new Set<string>();
  const out: TravelCity[] = [];
  for (const city of cities) {
    const key = `${city.city.toLowerCase()}|${city.state.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(city);
  }
  return out;
}

