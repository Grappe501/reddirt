import { writeFileSync } from "node:fs";
import path from "node:path";
import {
  analyzeFeatures,
  analyzeLexical,
  analyzeMotifs,
  analyzeRhetoric,
  analyzeStructure,
  classifyIssueVoices,
  classifyTopics,
  clipExcerpt,
  hashFingerprint,
} from "../src/lib/agents/decision-simulation/writing-intelligence/analyze";
import { HILL_ARCHIVE_PAGES, JONES_SEED_URLS } from "../src/lib/agents/decision-simulation/writing-intelligence/seed-urls";
import { writeWritingCache } from "../src/lib/agents/decision-simulation/writing-intelligence/runtime-retrieval";
import type { DerivedWritingRecord, RetrievalQuality, WritingActorId, WritingSourceType } from "../src/lib/agents/decision-simulation/writing-intelligence/contracts";
import { WRITING_RETRIEVAL_DATE } from "../src/lib/agents/decision-simulation/writing-intelligence/contracts";

const OUT = path.join("src/lib/agents/decision-simulation/writing-intelligence/data/corpus.json");
const UA = "RedDirtDecisionSimulator/writing-intelligence-research (+https://dec-sim.netlify.app)";

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { "user-agent": UA, accept: "text/html" } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function decodeHtml(value: string): string {
  return value
    .replace(/&#x27;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractTitle(html: string, fallback: string): string {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i);
  if (og?.[1]) return og[1].replace(/\s+/g, " ").trim();
  const title = html.match(/<title>([^<]+)<\/title>/i);
  const raw = og?.[1] || title?.[1]?.replace(/\s+\|.*/, "") || fallback;
  const decoded = decodeHtml(raw);
  if (decoded === "Representative French Hill") return fallback;
  return decoded;
}

function extractDate(html: string, fallback: string): string {
  const time = html.match(/datetime=["'](\d{4}-\d{2}-\d{2})/i);
  if (time?.[1]) return time[1];
  const published = html.match(/"datePublished"\s*:\s*"(\d{4}-\d{2}-\d{2})/i);
  if (published?.[1]) return published[1];
  const posted = html.match(/Posted on\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(20\d{2})/i);
  const month = posted ?? html.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(20\d{2})/i);
  if (month) {
    const months: Record<string, string> = {
      january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
      july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
    };
    return `${month[3]}-${months[month[1].toLowerCase()]}-${String(month[2]).padStart(2, "0")}`;
  }
  return fallback;
}

function cleanBody(text: string, actorId: WritingActorId): string {
  let body = text;
  if (actorId === "chris-jones-ar02") {
    body = body.replace(/^[\s\S]*?(SubscribeSign in|Share)/i, "");
    body = body.split("Everything Is Rocket Science is a reader-supported")[0] ?? body;
    body = body.split("Ready for more?")[0] ?? body;
    body = body.split("© 2026 Dr. Chris Jones")[0] ?? body;
  } else {
    body = body.split("Office Locations")[0] ?? body;
    body = body.split("Keep In Touch")[0] ?? body;
    body = body.replace(/^[\s\S]*?Representative French Hill/i, "Representative French Hill");
  }
  return body.replace(/Subscribe|Sign in|Share|Leave a comment/g, " ").replace(/\s{2,}/g, " ").trim();
}

function toRecord(input: {
  actorId: WritingActorId;
  url: string;
  title: string;
  publishedAt: string;
  sourceType: WritingSourceType;
  authorshipConfidence: DerivedWritingRecord["source"]["authorshipConfidence"];
  body: string;
  quality: RetrievalQuality;
}): DerivedWritingRecord | null {
  const body = cleanBody(input.body, input.actorId);
  if (body.length < 280) return null;
  const id = `${input.actorId}-${hashFingerprint([input.url])}`;
  writeWritingCache(id, body);
  return {
    source: {
      id,
      actorId: input.actorId,
      canonicalUrl: input.url,
      title: decodeHtml(input.title).slice(0, 180),
      publishedAt: input.publishedAt,
      sourceType: input.sourceType,
      provenance: "FIRST_PARTY",
      authorshipConfidence: input.authorshipConfidence,
      retrievalDate: WRITING_RETRIEVAL_DATE,
      topicTags: classifyTopics(input.title, body),
      wordCountEstimate: body.split(/\s+/).length,
      sourceFingerprint: hashFingerprint([input.url, input.title, input.publishedAt]),
      retrievalQuality: input.quality,
      excerpt: clipExcerpt(body),
    },
    issueVoices: classifyIssueVoices(input.title, body),
    features: analyzeFeatures(body),
    rhetoric: analyzeRhetoric(body),
    structure: analyzeStructure(body),
    motifs: analyzeMotifs(body, input.actorId),
    lexical: analyzeLexical(body),
  };
}

function hillListings(html: string): Map<string, string> {
  const rows = new Map<string, string>();
  const re = /show\.aspx\?ID=([A-Z0-9]+)[^>]*>([^<]{8,160})/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const title = decodeHtml(match[2]).replace(/\s+rr\s+Posted.*/i, "").trim();
    if (title && !rows.has(match[1])) rows.set(match[1], title);
  }
  const ids = /show\.aspx\?ID=([A-Z0-9]+)/gi;
  let idMatch: RegExpExecArray | null;
  while ((idMatch = ids.exec(html))) {
    if (!rows.has(idMatch[1])) rows.set(idMatch[1], `Hill newsletter ${idMatch[1].slice(0, 8)}`);
  }
  return rows;
}

function titleFromBody(body: string, fallback: string): string {
  const district = body.match(/District Update:\s*([^\n]{8,120})/i);
  if (district?.[1]) return decodeHtml(district[1]);
  const friends = body.match(/Friends,\s*([^\n.]{12,90})/i);
  if (friends?.[1]) return `Friends — ${decodeHtml(friends[1])}`;
  return fallback;
}

function hillType(title: string): WritingSourceType {
  return /^release:/i.test(title) ? "OFFICIAL_STATEMENT" : "OFFICIAL_NEWSLETTER";
}

async function main() {
  const records: DerivedWritingRecord[] = [];
  const seen = new Set<string>();

  for (const seed of JONES_SEED_URLS) {
    if (seen.has(seed.url)) continue;
    const html = await fetchText(seed.url);
    if (!html) continue;
    const title = extractTitle(html, seed.title ?? seed.url);
    if (/page not found|404/i.test(title) && html.length < 4000) continue;
    const record = toRecord({
      actorId: seed.actorId,
      url: seed.url,
      title,
      publishedAt: extractDate(html, seed.publishedAt ?? "2026-01-01"),
      sourceType: seed.sourceType,
      authorshipConfidence: seed.authorshipConfidence,
      body: stripHtml(html),
      quality: html.length > 8000 ? "FULL_PUBLIC" : "PARTIAL_PUBLIC",
    });
    if (!record) continue;
    seen.add(seed.url);
    records.push(record);
    console.log(`JONES ${records.filter((item) => item.source.actorId === "chris-jones-ar02").length} ${record.source.title}`);
  }

  const hillMap = new Map<string, string>();
  for (const page of HILL_ARCHIVE_PAGES) {
    const html = await fetchText(page);
    if (!html) continue;
    for (const [id, title] of hillListings(html)) {
      if (!hillMap.has(id) || hillMap.get(id)?.startsWith("Hill newsletter")) {
        hillMap.set(id, title);
      }
    }
  }
  console.log(`HILL ids discovered ${hillMap.size}`);

  for (const [id, listingTitle] of hillMap) {
    const url = `https://hill.house.gov/news/email/show.aspx?ID=${id}`;
    if (seen.has(url)) continue;
    const html = await fetchText(url);
    if (!html) continue;
    const stripped = stripHtml(html);
    const title = titleFromBody(stripped, extractTitle(html, listingTitle));
    const record = toRecord({
      actorId: "french-hill-ar02",
      url,
      title,
      publishedAt: extractDate(html, "2026-01-01"),
      sourceType: hillType(title),
      authorshipConfidence: "OFFICIAL_OFFICE",
      body: stripHtml(html),
      quality: html.length > 6000 ? "FULL_PUBLIC" : "PARTIAL_PUBLIC",
    });
    if (!record) continue;
    seen.add(url);
    records.push(record);
    console.log(`HILL ${records.filter((item) => item.source.actorId === "french-hill-ar02").length} ${record.source.title}`);
  }

  writeFileSync(OUT, `${JSON.stringify(records, null, 2)}\n`, "utf8");
  const jones = records.filter((item) => item.source.actorId === "chris-jones-ar02").length;
  const hill = records.filter((item) => item.source.actorId === "french-hill-ar02").length;
  console.log(`WROTE ${records.length} records jones=${jones} hill=${hill} -> ${OUT}`);
  if (jones < 20 || hill < 30) {
    console.error("Corpus below target floors.");
    process.exitCode = 1;
  }
}

void main();
