import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export type CountyWikipediaReference = {
  countySeat: string | null;
  fips: string | null;
  canonicalUrl: string | null;
  retrievedAt: string | null;
  excerpt: string | null;
  licenseNote: string;
};

function parseMetaLine(raw: string, key: string): string | null {
  const re = new RegExp(`\\*\\*${key}:\\*\\*\\s*([^·\\n]+)`, "i");
  const m = raw.match(re);
  return m?.[1]?.trim() ?? null;
}

/** Internal reference only — CC BY-SA Wikipedia ingest under docs/ingested/county-wikipedia/ */
export function loadCountyWikipediaReference(registrySlug: string): CountyWikipediaReference | null {
  const abs = path.join(process.cwd(), "docs/ingested/county-wikipedia", `${registrySlug}.md`);
  if (!existsSync(abs)) return null;

  const raw = readFileSync(abs, "utf8");
  const seatMatch = raw.match(/\*\*County seats \(campaign directory\):\*\*\s*([^\n·]+)/i);
  const fips = parseMetaLine(raw, "FIPS");
  const canonicalUrl = parseMetaLine(raw, "Canonical URL");
  const retrievedAt = parseMetaLine(raw, "Retrieved \\(UTC\\)") ?? parseMetaLine(raw, "Retrieved");

  const encyclopediaIdx = raw.indexOf("## Encyclopedia text");
  let excerpt: string | null = null;
  if (encyclopediaIdx >= 0) {
    const body = raw.slice(encyclopediaIdx).replace(/^## Encyclopedia text[^\n]*\n?/m, "");
    const trimmed = body.replace(/\n+/g, " ").trim();
    excerpt = trimmed.length > 0 ? trimmed.slice(0, 1400) + (trimmed.length > 1400 ? "…" : "") : null;
  }

  return {
    countySeat: seatMatch?.[1]?.trim() ?? null,
    fips,
    canonicalUrl,
    retrievedAt,
    excerpt,
    licenseNote: "Wikipedia (CC BY-SA) — internal reference; verify before public use.",
  };
}
