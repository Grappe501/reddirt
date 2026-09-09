import { readFileSync, writeFileSync } from "node:fs";
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
import { HILL_CAMPAIGN_SEED_URLS, JONES_SEED_URLS } from "../src/lib/agents/decision-simulation/writing-intelligence/seed-urls";
import { writeWritingCache } from "../src/lib/agents/decision-simulation/writing-intelligence/runtime-retrieval";
import type { DerivedWritingRecord, WritingActorId } from "../src/lib/agents/decision-simulation/writing-intelligence/contracts";
import { WRITING_RETRIEVAL_DATE } from "../src/lib/agents/decision-simulation/writing-intelligence/contracts";

const OUT = path.join("src/lib/agents/decision-simulation/writing-intelligence/data/corpus.json");
const UA = "RedDirtDecisionSimulator/writing-intelligence-research (+https://dec-sim.netlify.app)";
const CAMPAIGN_SEEDS = [
  ...JONES_SEED_URLS.filter((item) => item.sourceType === "CAMPAIGN_ARTICLE"),
  ...HILL_CAMPAIGN_SEED_URLS,
];

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
    .replace(/<form[\s\S]*?<\/form>/gi, " ")
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
  const title = html.match(/<title>([^<]+)<\/title>/i);
  return decodeHtml(og?.[1] || title?.[1] || fallback).slice(0, 180);
}

function cleanCampaignBody(text: string, actorId: WritingActorId): string {
  let body = text;
  if (actorId === "chris-jones-ar02") {
    body = body.split("A NEW AUGUST POLL")[0] ?? body;
    body = body.split("A brand-new poll")[0] ?? body;
    body = body.split("Paid for by the Committee")[0] ?? body;
    body = body.replace(/Skip to content|Continue to Site|I'm in!/gi, " ");
  } else {
    const issues = body.match(/French on the Issues[\s\S]*?(?=Fighting for French|Meet French|$)/i);
    if (issues?.[0] && issues[0].length > 400) body = issues[0];
    body = body.split("Join the Fight")[0] ? body.replace(/Join the Fight[\s\S]*?(?=French on the Issues)/i, " ") : body;
    body = body.split("By providing your phone number")[0] ?? body;
  }
  return body.replace(/\s{2,}/g, " ").trim();
}

function toRecord(actorId: WritingActorId, url: string, title: string, body: string, quality: DerivedWritingRecord["source"]["retrievalQuality"]): DerivedWritingRecord | null {
  const cleaned = cleanCampaignBody(body, actorId);
  if (cleaned.length < 280) return null;
  const id = `${actorId}-${hashFingerprint([url])}`;
  writeWritingCache(id, cleaned);
  return {
    source: {
      id,
      actorId,
      canonicalUrl: url,
      title,
      publishedAt: WRITING_RETRIEVAL_DATE,
      sourceType: "CAMPAIGN_ARTICLE",
      provenance: "FIRST_PARTY",
      authorshipConfidence: "ATTRIBUTED",
      retrievalDate: WRITING_RETRIEVAL_DATE,
      topicTags: classifyTopics(title, cleaned),
      wordCountEstimate: cleaned.split(/\s+/).length,
      sourceFingerprint: hashFingerprint([url, title, WRITING_RETRIEVAL_DATE]),
      retrievalQuality: quality,
      excerpt: clipExcerpt(cleaned),
    },
    issueVoices: classifyIssueVoices(title, cleaned),
    features: analyzeFeatures(cleaned),
    rhetoric: analyzeRhetoric(cleaned),
    structure: analyzeStructure(cleaned),
    motifs: analyzeMotifs(cleaned, actorId),
    lexical: analyzeLexical(cleaned),
  };
}

async function main() {
  const existing = JSON.parse(readFileSync(OUT, "utf8")) as DerivedWritingRecord[];
  const seen = new Set(existing.map((item) => item.source.canonicalUrl.replace(/\/$/, "")));
  const records = [...existing];

  for (const seed of CAMPAIGN_SEEDS) {
    const key = seed.url.replace(/\/$/, "");
    if (seen.has(key) || seen.has(seed.url)) {
      console.log(`SKIP ${seed.url}`);
      continue;
    }
    const html = await fetchText(seed.url);
    if (!html) {
      console.log(`MISS ${seed.url}`);
      continue;
    }
    const record = toRecord(
      seed.actorId,
      seed.url,
      extractTitle(html, seed.url),
      stripHtml(html),
      html.length > 8000 ? "FULL_PUBLIC" : "PARTIAL_PUBLIC",
    );
    if (!record) {
      console.log(`SHORT ${seed.url}`);
      continue;
    }
    seen.add(key);
    records.push(record);
    console.log(`ADD ${seed.actorId} ${record.source.title}`);
  }

  writeFileSync(OUT, `${JSON.stringify(records, null, 2)}\n`, "utf8");
  const campaign = records.filter((item) => item.source.sourceType === "CAMPAIGN_ARTICLE");
  console.log(`WROTE ${records.length} total; campaign articles=${campaign.length}`);
}

void main();
