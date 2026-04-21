import { unstable_cache } from "next/cache";
import { isThePlanPath } from "@/config/campaign-brand";
import { getOpenAIClient, isOpenAIConfigured } from "@/lib/openai/client";
import { getBrandPlaceholderRoadVisuals, getPublicRoadVisualPool } from "./road-pool";
import type { RoadVisual } from "./types";

function dedupeBySrc(vis: RoadVisual[]): RoadVisual[] {
  const seen = new Set<string>();
  const out: RoadVisual[] = [];
  for (const v of vis) {
    const k = v.src.trim();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(v);
  }
  return out;
}

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i += 1) h = (h * 33) ^ s.charCodeAt(i);
  return Math.abs(h);
}

function humanizePath(pathname: string): string {
  if (pathname === "/") return "Home — Kelly Grappe for Arkansas Secretary of State";
  const segs = pathname.split("/").filter(Boolean);
  if (segs.length === 0) return "Campaign";
  return segs
    .map((s) => s.replace(/-/g, " ").replace(/\[|\]/g, ""))
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" · ");
}

function deterministicPick(pathname: string, pool: RoadVisual[], n: 3): RoadVisual[] {
  if (pool.length === 0) return brandPlaceholders(3);
  if (pool.length <= n) return padWithBrand(pool, 3);
  const start = djb2(pathname) % pool.length;
  const picked: RoadVisual[] = [];
  for (let i = 0; i < n; i += 1) {
    picked.push(pool[(start + i) % pool.length]!);
  }
  return picked;
}

function brandPlaceholders(n: 3) {
  const b = getBrandPlaceholderRoadVisuals();
  return Array.from({ length: n }, (_, i) => b[i % b.length]!);
}

function padWithBrand(vis: RoadVisual[], n: 3): RoadVisual[] {
  const b = getBrandPlaceholderRoadVisuals();
  if (vis.length >= n) return vis.slice(0, n);
  const out = [...vis];
  let i = 0;
  while (out.length < n) {
    out.push(b[i % b.length]!);
    i += 1;
  }
  return out;
}

async function openaiPickIndices(
  pathname: string,
  pageContext: string,
  candidate: RoadVisual[]
): Promise<number[] | null> {
  if (!isOpenAIConfigured() || candidate.length < 2) return null;
  const lines = candidate.map(
    (v, i) => `${i}: ${v.label || v.alt} [${v.source}${v.countySlug ? ` · ${v.countySlug}` : ""}]`
  );
  const client = getOpenAIClient();
  const model = process.env.OPENAI_ROAD_PICK_MODEL?.trim() || process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const res = await client.chat.completions.create({
    model,
    max_tokens: 100,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You pick 3 image indices (0-11) for a campaign website page. Match page theme: Arkansas field organizing, democracy, work, rural and urban communities, Secretary of State race. Favor on-the-road / real campaign photography. Return JSON only: {\"indices\":[a,b,c]} with 3 different integers 0-11.",
      },
      {
        role: "user",
        content: `Path: ${pathname}\nContext: ${pageContext}\n\nImages (index: description):\n${lines.join("\n")}`,
      },
    ],
  });
  const text = res.choices[0]?.message?.content?.trim();
  if (!text) return null;
  const parsed = JSON.parse(text) as { indices?: number[] };
  const arr = parsed.indices;
  if (!Array.isArray(arr) || arr.length < 1) return null;
  const cap = Math.min(candidate.length, 12) - 1;
  return [...new Set(arr.map((n) => Math.max(0, Math.min(cap, Math.floor(n)))))].slice(0, 3);
}

async function computeRoadMosaicForPathname(pathname: string): Promise<RoadVisual[]> {
  const pool = await getPublicRoadVisualPool();
  const pageContext = humanizePath(pathname);
  const brandFirst = getBrandPlaceholderRoadVisuals();
  const mergedBase = pool.length > 0 ? pool : brandFirst;
  /** “The Plan” and related content pages: always surface Kelly + field art first so the band matches the main campaign. */
  const merged =
    isThePlanPath(pathname) && pool.length > 0
      ? dedupeBySrc([...brandFirst, ...pool])
      : mergedBase;
  if (merged.length < 2) {
    return padWithBrand(merged, 3);
  }

  const candidate = merged.slice(0, 12);
  const idx = await openaiPickIndices(pathname, pageContext, candidate).catch(() => null);
  if (idx && idx.length === 3) {
    const out = idx.map((i) => candidate[i]!).filter(Boolean);
    if (out.length === 3) return out;
  }
  return deterministicPick(pathname, merged, 3);
}

/**
 * 3 “from the road” images for a path: model selects from the pool when `OPENAI_API_KEY` is set
 * (uses titles/captions, not image bytes). To add true vision, tag assets in admin or a batch on ingest.
 * Cached per path to limit OpenAI/CPU.
 */
export async function getRoadMosaicForPathname(pathname: string): Promise<RoadVisual[]> {
  return unstable_cache(
    async () => computeRoadMosaicForPathname(pathname),
    [pathname, "road-mosaic-v1"],
    { revalidate: 300 }
  )();
}
