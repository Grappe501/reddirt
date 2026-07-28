/**
 * KELLY-PUBLIC-WEBSITE-48H-LAUNCH-SPRINT-1.0 — homepage narrative invariants.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  getHomepageAcrossArkansasVideo,
  getHomepagePrimaryMessageVideo,
  HOMEPAGE_ACROSS_ARKANSAS_VIDEO_ID,
  HOMEPAGE_PRIMARY_MESSAGE_VIDEO_ID,
} from "../src/content/media/homepage-campaign-videos";
import {
  HOMEPAGE_ACROSS_ARKANSAS_PHOTO_IDS,
  listHomepageAcrossArkansasPhotos,
  listHomepageCampaignPhotos,
} from "../src/content/media/homepage-campaign-photos";
import { trustFunnelHomeCopy } from "../src/content/home/trust-funnel-home";

const root = path.join(__dirname, "..");
const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf8");
const wireframe = read("src/components/home/HomeTrustFunnelWireframe.tsx");
const feature = read("src/components/media/CampaignVideoFeature.tsx");
const lazy = read("src/components/media/LazyYouTubeEmbed.tsx");

const order = [
  "<TrustFunnelHero",
  "<TrustFunnelFourPillarsSection",
  "<TrustFunnelPrimaryMessageSection",
  "<TrustFunnelMeetKellySection",
  "<TrustFunnelKellyAcrossArkansasSection",
  "<TrustFunnelCampaignPhotosSection",
  "<TrustFunnelEndorsementsSection",
  "<TrustFunnelNewsUpdatesSection",
  "<TrustFunnelFinalActionSection",
];
let last = -1;
for (const name of order) {
  const idx = wireframe.indexOf(name);
  assert.ok(idx > last, `section order missing/out of order: ${name}`);
  last = idx;
}

assert.ok(!wireframe.includes("TrustFunnelOfficeServesStrip"), "office serves strip removed from spine");
assert.ok(!wireframe.includes("TrustFunnelDirectDemocracySection"), "direct democracy not mid-spine");
assert.ok(!wireframe.includes("TrustFunnelRolesSection"), "roles mid-page removed");

const primary = getHomepagePrimaryMessageVideo();
assert.ok(primary);
assert.equal(primary!.id, HOMEPAGE_PRIMARY_MESSAGE_VIDEO_ID);
assert.equal(primary!.youtubeVideoId, "eKVz5pFJxtk");

const across = getHomepageAcrossArkansasVideo();
assert.ok(across);
assert.equal(across!.id, HOMEPAGE_ACROSS_ARKANSAS_VIDEO_ID);
assert.equal(across!.youtubeVideoId, "aO712RsR0pQ");

assert.ok(feature.includes("CampaignVideoFeature"), "feature component present");
assert.ok(lazy.includes("youtube-nocookie.com"), "privacy-enhanced embeds");
assert.ok(lazy.includes("autoplay=1"), "autoplay only after click activate");

assert.equal(trustFunnelHomeCopy.hero.promise, "This office belongs to the people.");
assert.equal(trustFunnelHomeCopy.hero.ctas.length, 2);
assert.ok(trustFunnelHomeCopy.governmentThatWorks.pillars.every((p) => p.commitments.length >= 3));
assert.ok(trustFunnelHomeCopy.meetKelly.values.length > 40);

const photos = listHomepageCampaignPhotos();
assert.ok(photos.length >= 6 && photos.length <= 10);
const acrossPhotos = listHomepageAcrossArkansasPhotos();
assert.equal(acrossPhotos.length, HOMEPAGE_ACROSS_ARKANSAS_PHOTO_IDS.length);

const endorsements = read("src/components/home/trust-funnel/TrustFunnelEndorsementsSection.tsx");
assert.ok(endorsements.includes("emptyState") || endorsements.includes("No endorsements"));
assert.ok(!endorsements.toLowerCase().includes("afl-cio"), "AFL-CIO not hardcoded without confirmation");

console.log("48h launch sprint homepage checks passed.");
console.log("  primary=", primary!.youtubeVideoId);
console.log("  across=", across!.youtubeVideoId);
console.log("  photos=", photos.length, "acrossStills=", acrossPhotos.length);
