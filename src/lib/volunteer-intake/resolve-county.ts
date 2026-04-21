import type { County } from "@prisma/client";

/** Match a freeform county string to a `County` row (slug, displayName, fips). */
export function resolveCountyFromText(
  text: string | null | undefined,
  counties: Pick<County, "id" | "slug" | "displayName" | "fips">[]
): { countyId: string; confidence: "high" | "low" } | null {
  if (!text?.trim()) return null;
  const t = text.trim().toLowerCase();
  const strip = t.replace(/[^a-z0-9]/g, "");
  for (const c of counties) {
    const slug = c.slug.toLowerCase();
    if (t === c.displayName.toLowerCase() || t === slug) return { countyId: c.id, confidence: "high" };
  }
  for (const c of counties) {
    const cs = c.slug.toLowerCase();
    const d = c.displayName.toLowerCase();
    if (d.includes(t) && t.length >= 4) return { countyId: c.id, confidence: "low" };
    if (t.includes(cs) && cs.length >= 4) return { countyId: c.id, confidence: "low" };
    const num = t.match(/\b(\d{5})\b/);
    if (num && c.fips === num[1]) return { countyId: c.id, confidence: "high" };
  }
  for (const c of counties) {
    if (strip && (c.fips.replace(/\D/g, "") === strip.slice(-5) || c.fips.replace(/\D/g, "") === strip)) {
      return { countyId: c.id, confidence: "low" };
    }
  }
  return null;
}
