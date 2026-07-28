/**
 * Pass 1 focused tests — campaign video transcripts foundation.
 * Run: npm run agents:test-campaign-video-transcripts
 */

import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import {
  assertCampaignMediaRegistryInvariants,
  CAMPAIGN_MEDIA_REGISTRY,
  getCampaignMediaByYoutubeId,
  getPublishedCampaignMediaBySlug,
  listPublishedCampaignMedia,
} from "../src/content/media/campaign-media-registry";
import { TRANSCRIPT_SYSTEM_DEMO_FIXTURE } from "../src/content/media/fixtures/transcript-system-demo";
import { CampaignTranscriptDisclosure } from "../src/components/media/CampaignTranscriptDisclosure";
import { CampaignVideoStructuredData } from "../src/components/seo/CampaignVideoStructuredData";
import {
  buildVideoObjectJsonLd,
  formatTranscriptTimestamp,
  isPublicMedia,
  isPublicTranscript,
  omitUndefinedDeep,
  youtubeNocookieEmbedUrl,
} from "../src/lib/media/campaign-transcript";
import { emptyTranscript } from "../src/lib/media/campaign-transcript";
import { extractCanonicalYoutubeVideoId } from "../src/lib/media/youtube-id";
import { resolveCampaignMediaImport } from "../src/lib/media/campaign-media-import";

function section(name: string) {
  console.log(`\n== ${name} ==`);
}

section("registry invariants");
assertCampaignMediaRegistryInvariants();
const ids = CAMPAIGN_MEDIA_REGISTRY.map((m) => m.youtubeVideoId);
assert.equal(new Set(ids).size, ids.length);
assert.ok(ids.includes("eKVz5pFJxtk"));
assert.ok(ids.includes("aO712RsR0pQ"));
assert.ok(ids.includes("52egsV4WWgc"));
assert.ok(ids.includes("X6M_SMmbYQ4"));
assert.ok(ids.includes("scytoSXSO3A"));
assert.ok(ids.includes("1BOFM9ao8bU"));
assert.ok(ids.includes("b_tGYhWuXqI"));
assert.ok(ids.includes("Scpu5qASiTQ"));
assert.ok(ids.includes("KSCpwLsGT0o"));
assert.ok(ids.includes("72oKVAwfzZw"));
assert.equal(ids.filter((id) => id === "72oKVAwfzZw").length, 1);
assert.equal(CAMPAIGN_MEDIA_REGISTRY.length, 17);

section("duplicate youtube import protection");
const sampleUrls = [
  "72oKVAwfzZw",
  "https://youtu.be/72oKVAwfzZw",
  "https://youtu.be/72oKVAwfzZw?si=abc",
  "https://www.youtube.com/watch?v=72oKVAwfzZw",
  "https://youtube.com/watch?v=72oKVAwfzZw",
  "https://www.youtube.com/embed/72oKVAwfzZw",
  "https://www.youtube-nocookie.com/embed/72oKVAwfzZw",
];
for (const u of sampleUrls) {
  assert.equal(extractCanonicalYoutubeVideoId(u), "72oKVAwfzZw");
  const r = resolveCampaignMediaImport(u);
  assert.equal(r.action, "OPEN_EXISTING");
  assert.equal(r.youtubeVideoId, "72oKVAwfzZw");
  assert.ok(r.media);
}
assert.ok(getCampaignMediaByYoutubeId("https://youtu.be/72oKVAwfzZw?si=x"));
assert.equal(resolveCampaignMediaImport("not-a-real-id").action, "INVALID_INPUT");
assert.equal(resolveCampaignMediaImport("").action, "INVALID_INPUT");
assert.equal(resolveCampaignMediaImport("dQw4w9WgXcQ").action, "CREATE_NEW_CANDIDATE");

section("public selectors hide drafts");
for (const m of listPublishedCampaignMedia()) {
  assert.equal(m.publicationStatus, "PUBLISHED");
  assert.notEqual(m.title, "Campaign Video — Editorial Review Pending");
}
assert.equal(getPublishedCampaignMediaBySlug("campaign-video-editorial-review-pending-kz33"), null);
assert.ok(getPublishedCampaignMediaBySlug("this-office-belongs-to-the-people"));

section("shorts format");
const shorts = CAMPAIGN_MEDIA_REGISTRY.filter((m) => m.format === "SHORT");
assert.equal(shorts.length, 7);
assert.ok(shorts.every((m) => m.youtubeVideoId.length >= 6));

section("timestamps");
assert.equal(formatTranscriptTimestamp(72), "1:12");
assert.equal(formatTranscriptTimestamp(3672), "1:01:12");
assert.equal(formatTranscriptTimestamp(0), "0:00");

section("public transcript gate");
assert.equal(isPublicTranscript(TRANSCRIPT_SYSTEM_DEMO_FIXTURE), true);
const noTx = {
  ...TRANSCRIPT_SYSTEM_DEMO_FIXTURE,
  transcript: emptyTranscript({ status: "DRAFT", plainText: "secret" }),
};
assert.equal(isPublicTranscript(noTx), false);
const emptyPub = {
  ...TRANSCRIPT_SYSTEM_DEMO_FIXTURE,
  transcript: emptyTranscript({ status: "PUBLISHED", plainText: "  " }),
};
assert.equal(isPublicTranscript(emptyPub), false);

section("disclosure SSR");
const html = renderToStaticMarkup(
  React.createElement(CampaignTranscriptDisclosure, { media: TRANSCRIPT_SYSTEM_DEMO_FIXTURE }),
);
assert.ok(html.includes("Read the transcript"));
assert.ok(html.includes("synthetic transcript"));
assert.ok(html.includes("<details"));
assert.ok(html.includes("<summary"));

const hidden = renderToStaticMarkup(
  React.createElement(CampaignTranscriptDisclosure, { media: noTx }),
);
assert.equal(hidden, "");

section("structured data");
const ld = renderToStaticMarkup(
  React.createElement(CampaignVideoStructuredData, { media: TRANSCRIPT_SYSTEM_DEMO_FIXTURE }),
);
assert.ok(ld.includes("application/ld+json"));
assert.ok(ld.includes("VideoObject"));
assert.ok(ld.includes("transcript"));
const parsed = JSON.parse(ld.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "").replace(/\\u003c/g, "<"));
assert.equal(parsed["@type"], "VideoObject");
assert.ok(String(parsed.embedUrl).includes("youtube-nocookie.com"));

const office = getPublishedCampaignMediaBySlug("this-office-belongs-to-the-people")!;
assert.ok(isPublicMedia(office));
assert.equal(isPublicTranscript(office), false);
const officeLd = omitUndefinedDeep(buildVideoObjectJsonLd(office));
assert.equal("transcript" in officeLd, false);
assert.ok(String(officeLd.embedUrl).startsWith("https://www.youtube-nocookie.com/embed/"));

section("embed helper");
assert.equal(youtubeNocookieEmbedUrl("eKVz5pFJxtk"), "https://www.youtube-nocookie.com/embed/eKVz5pFJxtk");

console.log("\nAll campaign video transcript Pass 1 checks passed.");
