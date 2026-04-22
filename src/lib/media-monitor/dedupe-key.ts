import { createHash } from "crypto";
import type { ExternalMediaSource } from "@prisma/client";

export function normalizeCanonicalUrl(raw: string): string {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return raw.trim().toLowerCase();
  }
  u.hash = "";
  const drop = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"];
  for (const k of drop) u.searchParams.delete(k);
  let path = u.pathname.replace(/\/+$/, "") || "/";
  u.pathname = path;
  return u.toString().toLowerCase();
}

export function makeMentionDedupeKey(args: {
  sourceSlug: string;
  canonicalUrl: string;
  publishedAt: Date | null;
  title: string;
}): string {
  const u = normalizeCanonicalUrl(args.canonicalUrl);
  const datePart = args.publishedAt ? args.publishedAt.toISOString().slice(0, 10) : "nodate";
  const titlePart = args.title
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .slice(0, 140);
  const basis = `${args.sourceSlug}|${u}|${datePart}|${titlePart}`;
  return createHash("sha256").update(basis).digest("hex");
}

export function denormFromSource(source: Pick<ExternalMediaSource, "name" | "slug" | "sourceType" | "region" | "coveredCities">): {
  sourceName: string;
  sourceType: ExternalMediaSource["sourceType"];
  sourceRegion: string | null;
  cityCoverage: string[];
} {
  return {
    sourceName: source.name,
    sourceType: source.sourceType,
    sourceRegion: source.region,
    cityCoverage: source.coveredCities ?? [],
  };
}
