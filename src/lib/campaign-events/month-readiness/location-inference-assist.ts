import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import { extractTitleCity } from "@/lib/travel-ledger/ai/trip-resolution-autopilot/title-city-extractor";
import { findCityAliasMatches } from "@/lib/travel-ledger/ai/trip-resolution-autopilot/city-county-alias-memory";
import { resolveRegistryCountyFromLabel } from "@/lib/county/resolve-county-label";
import type { WorkbenchEventRow } from "../merge-persisted-row";
import type { EventAiInference } from "../infer-event-assumptions";

export type LocationGuess = {
  value: string;
  confidence: "high" | "medium" | "low";
  source: string;
};

export type LocationInferenceAssist = {
  city?: LocationGuess;
  county?: LocationGuess;
  humanLockedCity: boolean;
  humanLockedCounty: boolean;
  hints: string[];
};

function countyFromCity(city: string): string | undefined {
  const matches = findCityAliasMatches(city);
  const county = matches.find((m) => m.entry.county)?.entry.county;
  if (county) return county.includes("County") ? county : `${county} County`;
  const reg = resolveRegistryCountyFromLabel(city);
  if (reg) return reg.displayName;
  return undefined;
}

function parseLocationString(location?: string | null): { city?: string; venue?: string } {
  if (!location?.trim()) return {};
  const loc = location.trim();
  const comma = loc.split(",").map((s) => s.trim());
  if (comma.length >= 2) {
    const city = comma[comma.length - 2] || comma[0];
    return { city, venue: comma[0] };
  }
  const titleCity = extractTitleCity(loc);
  if (titleCity.city) return { city: titleCity.city };
  return { city: loc };
}

function findPriorLocationFromPeers(
  row: WorkbenchEventRow,
  peers: WorkbenchEventRow[],
): { city?: string; county?: string; source: string } | null {
  const loc = row.calendar.location?.trim();
  const titleKey = row.calendar.title.trim().slice(0, 24).toLowerCase();
  for (const p of peers) {
    if (p.recordId === row.recordId) continue;
    if (loc && p.calendar.location?.trim() === loc && p.likelyCity?.trim()) {
      return { city: p.likelyCity, county: p.county, source: "Prior event with same calendar location" };
    }
    if (titleKey.length > 8 && p.calendar.title.trim().toLowerCase().startsWith(titleKey) && p.likelyCity?.trim()) {
      return { city: p.likelyCity, county: p.county, source: "Prior event with similar title" };
    }
  }
  return null;
}

export function buildLocationInferenceAssist(
  row: WorkbenchEventRow,
  inference: EventAiInference,
  calendar: CampaignCalendarItem,
  options: {
    humanLockedCity?: boolean;
    humanLockedCounty?: boolean;
    peerRows?: WorkbenchEventRow[];
  } = {},
): LocationInferenceAssist {
  const hints: string[] = [];
  const humanLockedCity = Boolean(options.humanLockedCity);
  const humanLockedCounty = Boolean(options.humanLockedCounty);

  const prior = options.peerRows?.length ? findPriorLocationFromPeers(row, options.peerRows) : null;
  const fromLoc = parseLocationString(calendar.location);
  const titleCity = extractTitleCity(calendar.title ?? "");
  const notesCity = calendar.notes?.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s+AR\b/)?.[1];

  let city: string | undefined;
  let citySource = "needs human";
  let cityConf: LocationGuess["confidence"] = "low";

  if (prior?.city) {
    city = prior.city;
    citySource = prior.source;
    cityConf = "high";
  } else if (calendar.city?.trim()) {
    city = calendar.city.trim();
    citySource = "Calendar city field";
    cityConf = "high";
  } else if (fromLoc.city) {
    city = fromLoc.city;
    citySource = "Parsed from calendar location";
    cityConf = "medium";
  } else if (titleCity.city) {
    city = titleCity.city;
    citySource = titleCity.source;
    cityConf = titleCity.confidence === "high" ? "high" : "medium";
  } else if (inference.travelDestinationCity) {
    city = inference.travelDestinationCity;
    citySource = "Event inference engine";
    cityConf = "medium";
  } else if (notesCity) {
    city = notesCity;
    citySource = "Parsed from event notes";
    cityConf = "low";
  }

  if (calendar.location) hints.push(`Location on file: ${calendar.location}`);
  if (calendar.notes?.trim()) hints.push(`Notes excerpt: ${calendar.notes.trim().slice(0, 120)}…`);

  let county: string | undefined;
  let countySource = "needs human";
  let countyConf: LocationGuess["confidence"] = "low";

  if (calendar.county?.trim()) {
    county = calendar.county.trim();
    countySource = "Calendar county field";
    countyConf = "high";
  } else if (prior?.county) {
    county = prior.county;
    countySource = prior.source;
    countyConf = "high";
  } else if (city) {
    county = countyFromCity(city);
    if (county) {
      countySource = "Arkansas city → county registry / alias memory";
      countyConf = "medium";
    }
  } else {
    const infCounty = inference.prefill.where.county;
    if (infCounty) {
      county = infCounty;
      countySource = "Event inference engine";
      countyConf = "medium";
    }
  }

  return {
    humanLockedCity,
    humanLockedCounty,
    hints,
    city: city ? { value: city, confidence: cityConf, source: citySource } : undefined,
    county: county ? { value: county, confidence: countyConf, source: countySource } : undefined,
  };
}
