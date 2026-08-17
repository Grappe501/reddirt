import { ARKANSAS_COUNTIES, type ArkansasCountyName } from "@/data/kelly-county-visits/arkansas-counties";
import { arkansasCountyKey } from "@/lib/events/county-key";

export type MentionedCounty = {
  key: string;
  name: ArkansasCountyName;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Conservative county mentions: require "X County" so "Hot Springs" never maps to Hot Spring County,
 * and "Arkansas" alone never maps to Arkansas County.
 */
export function countiesMentionedInText(text: string): MentionedCounty[] {
  const hay = text ?? "";
  if (!hay.trim()) return [];
  const found: MentionedCounty[] = [];
  const seen = new Set<string>();
  const names = [...ARKANSAS_COUNTIES].sort((a, b) => b.length - a.length);
  for (const name of names) {
    const pattern =
      name === "Arkansas"
        ? /\bArkansas County\b/i
        : new RegExp(`\\b${escapeRegExp(name)} County\\b`, "i");
    if (!pattern.test(hay)) continue;
    const key = arkansasCountyKey(name);
    if (seen.has(key)) continue;
    seen.add(key);
    found.push({ key, name });
  }
  return found;
}
