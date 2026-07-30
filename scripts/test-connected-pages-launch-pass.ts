/**
 * Connected-pages launch pass invariants.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { listPublicMediaCollections, summarizePublicMediaInventory } from "../src/content/media/public-media-collections";
import { listPublishedCampaignMedia } from "../src/content/media/campaign-media-registry";
import { getHomepageAcrossArkansasVideo, getHomepagePrimaryMessageVideo } from "../src/content/media/homepage-campaign-videos";

const root = path.join(__dirname, "..");
const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf8");

for (const rel of [
  "src/app/(site)/about/page.tsx",
  "src/app/(site)/about/journey/page.tsx",
  "src/app/(site)/priorities/page.tsx",
  "src/app/(site)/campaign-photos/page.tsx",
  "src/app/(site)/endorsements/page.tsx",
  "src/app/(site)/accessibility/page.tsx",
  "src/app/(site)/kelly-speaks/page.tsx",
  "src/app/(site)/updates/page.tsx",
  "docs/website/PUBLIC_SITE_DISCLOSURE_AND_CTA_AUDIT.md",
]) {
  assert.ok(fs.existsSync(path.join(root, rel)), `missing ${rel}`);
}

const about = read("src/app/(site)/about/page.tsx");
assert.ok(!about.includes("ContentPendingBadge"), "about must not show draft/pending badges");
assert.ok(about.includes("aboutLaunchCopy") || about.includes("Who Kelly is"), "about launch narrative");

const journey = read("src/app/(site)/about/journey/page.tsx");
assert.ok(!journey.includes("ContentPendingBadge"), "journey must not show pending badges");
assert.ok(journey.includes("CampaignVideoFeature") || journey.includes("getHomepageAcrossArkansasVideo"), "journey video");

const priorities = read("src/app/(site)/priorities/page.tsx");
assert.ok(!priorities.includes("ContentPendingBadge"), "priorities without pending badges");
assert.ok(priorities.includes("Limits of the office") || priorities.includes("limits"), "authority limits");

const footer = read("src/components/layout/SiteFooter.tsx");
assert.ok(footer.includes("getVolunteerSignupHref"), "footer volunteer aligned");
assert.ok(!footer.includes("getJoinCampaignHref"), "footer must not default volunteer to mailto join");

const endorsements = read("src/app/(site)/endorsements/page.tsx");
assert.ok(endorsements.includes("listConfirmedEndorsements"), "endorsement canon wired");
assert.ok(endorsements.includes("AFL-CIO") || read("src/content/website/confirmed-endorsements.ts").includes("afl-cio"), "AFL-CIO confirmed in canon");
assert.ok(!/invent logos/i.test(endorsements) || endorsements.includes("Attendance at an event"), "honest policy footer");

const primary = getHomepagePrimaryMessageVideo();
const across = getHomepageAcrossArkansasVideo();
assert.ok(primary && across);

const published = listPublishedCampaignMedia();
const ids = published.map((m) => m.id);
assert.equal(ids.length, new Set(ids).size, "no duplicate media ids");
const yt = published.map((m) => m.youtubeVideoId);
assert.equal(yt.length, new Set(yt).size, "no duplicate youtube ids among published");

const collections = listPublicMediaCollections();
assert.ok(collections.some((c) => c.id === "featured-messages" && c.items.length >= 1));
assert.ok(collections.some((c) => c.id === "short-moments"));
const inv = summarizePublicMediaInventory();
assert.ok(inv.publishedTotal >= 1);

console.log("Connected-pages launch checks passed.");
console.log("  media=", inv);
