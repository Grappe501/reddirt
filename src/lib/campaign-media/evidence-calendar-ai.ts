/**
 * Calendar presence AI assist — propose fields from ICS text + registry.
 * Never writes; Prefer Unknown when ambiguous.
 */
import "server-only";

import { loadCalendarPresenceStore } from "@/lib/campaign-media/evidence-store";
import { resolveRegistryCountyFromLabel } from "@/lib/county/resolve-county-label";
import type { CalendarPresencePlace, CalendarPresenceStatus } from "@/lib/campaign-media/evidence-types";

export type CalendarPresenceSuggestion = {
  rowId: string;
  confidence: "high" | "medium" | "low";
  proposedStatus: CalendarPresenceStatus | null;
  places: CalendarPresencePlace[];
  hasPhysicalLocation: boolean | null;
  notesAppend?: string;
  warnings: string[];
  rationale: string;
};

const AR_CITY_HINTS: Array<{ city: string; county: string }> = [
  { city: "Little Rock", county: "Pulaski" },
  { city: "North Little Rock", county: "Pulaski" },
  { city: "Fayetteville", county: "Washington" },
  { city: "Springdale", county: "Washington" },
  { city: "Fort Smith", county: "Sebastian" },
  { city: "Jonesboro", county: "Craighead" },
  { city: "Conway", county: "Faulkner" },
  { city: "Rogers", county: "Benton" },
  { city: "Bentonville", county: "Benton" },
  { city: "Hot Springs", county: "Garland" },
  { city: "Hot Springs Village", county: "Garland" },
  { city: "Pine Bluff", county: "Jefferson" },
  { city: "Russellville", county: "Pope" },
  { city: "Mena", county: "Polk" },
  { city: "Clarksville", county: "Johnson" },
  { city: "Cave City", county: "Sharp" },
];

export function suggestCalendarPresenceFields(rowId: string): CalendarPresenceSuggestion | { ok: false; error: string } {
  const row = loadCalendarPresenceStore().rows.find((r) => r.id === rowId);
  if (!row) return { ok: false, error: `Calendar row not found: ${rowId}` };

  const hay = `${row.summary} ${row.location} ${row.notes ?? ""}`;
  const warnings: string[] = [];
  const places: CalendarPresencePlace[] = [];
  const rationaleBits: string[] = [];

  for (const hint of AR_CITY_HINTS) {
    const re = new RegExp(`\\b${hint.city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(hay)) {
      places.push({ city: hint.city, county: hint.county });
      rationaleBits.push(`Matched city phrase “${hint.city}” → ${hint.county}`);
    }
  }

  // County-only phrases (e.g. "Polk County Republican …")
  const countyMatch = hay.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+County\b/);
  if (countyMatch) {
    const hit = resolveRegistryCountyFromLabel(countyMatch[1]);
    if (hit) {
      const short = hit.displayName.replace(/\s+County$/i, "");
      if (!places.some((p) => p.county.toLowerCase() === short.toLowerCase())) {
        places.push({ city: "", county: short });
        rationaleBits.push(`Matched “${countyMatch[0]}” via registry`);
      }
    }
  }

  // Explicit registry lookup on location fragment
  if (!places.length && row.location.trim()) {
    const hit = resolveRegistryCountyFromLabel(row.location);
    if (hit) {
      places.push({ city: "", county: hit.displayName.replace(/\s+County$/i, "") });
      rationaleBits.push("Location string resolved to registry county");
    }
  }

  let confidence: CalendarPresenceSuggestion["confidence"] = "low";
  let proposedStatus: CalendarPresenceStatus | null = null;
  let hasPhysicalLocation: boolean | null = null;

  if (places.length === 1 && places[0].city && places[0].county) {
    confidence = "medium";
    proposedStatus = "Needs confirm";
    hasPhysicalLocation = true;
    warnings.push("Propose Needs confirm — operator must Confirm before geography is a prior.");
  } else if (places.length === 1 && places[0].county) {
    confidence = "low";
    proposedStatus = "Needs confirm";
    hasPhysicalLocation = Boolean(places[0].city);
    warnings.push("County-only cue — leave city Unknown unless operator knows the stop.");
  } else if (places.length > 1) {
    confidence = "low";
    proposedStatus = "Needs confirm";
    hasPhysicalLocation = places.some((p) => Boolean(p.city));
    warnings.push("Multiple place cues — review multi-stop places; do not auto-Confirm.");
  } else {
    warnings.push("No reliable place cues — leave Unknown. Do not invent geography.");
    proposedStatus = null;
  }

  if (/zoom|virtual|phone|call only|webinar/i.test(hay)) {
    hasPhysicalLocation = false;
    warnings.push("Looks virtual — hasPhysicalLocation proposed false.");
    rationaleBits.push("Virtual/meeting cues in text");
  }

  return {
    rowId: row.id,
    confidence,
    proposedStatus,
    places: places.slice(0, 6),
    hasPhysicalLocation,
    notesAppend: rationaleBits.length ? `AI cues: ${rationaleBits.join("; ")}` : undefined,
    warnings,
    rationale: rationaleBits.join(" · ") || "No geography inferred.",
  };
}
