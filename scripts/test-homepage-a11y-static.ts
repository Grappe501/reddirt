/**
 * Static a11y smoke for public homepage spine (no browser).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.join(__dirname, "..");
const files = [
  "src/components/home/trust-funnel/TrustFunnelHero.tsx",
  "src/components/home/trust-funnel/TrustFunnelFourPillarsSection.tsx",
  "src/components/home/trust-funnel/TrustFunnelMeetKellySection.tsx",
  "src/components/home/trust-funnel/TrustFunnelKellyAcrossArkansasSection.tsx",
  "src/components/home/trust-funnel/TrustFunnelCampaignPhotosSection.tsx",
  "src/components/home/trust-funnel/TrustFunnelEndorsementsSection.tsx",
  "src/components/home/trust-funnel/TrustFunnelNewsUpdatesSection.tsx",
  "src/components/home/trust-funnel/TrustFunnelFinalActionSection.tsx",
];

for (const rel of files) {
  const src = fs.readFileSync(path.join(root, rel), "utf8");
  const labelled = [...src.matchAll(/aria-labelledby=["']([^"']+)["']/g)].map((m) => m[1]);
  for (const id of labelled) {
    assert.ok(src.includes(`id="${id}"`), `${rel} missing id for aria-labelledby=${id}`);
  }
  assert.ok(/focus-visible:outline|focus-visible:ring/.test(src), `${rel} should expose focus-visible styles`);
}

const primary = fs.readFileSync(path.join(root, "src/components/home/trust-funnel/TrustFunnelPrimaryMessageSection.tsx"), "utf8");
assert.ok(primary.includes('headingId="primary-message-heading"'));
assert.ok(primary.includes('aria-labelledby="primary-message-heading"'));

const feature = fs.readFileSync(path.join(root, "src/components/media/CampaignVideoFeature.tsx"), "utf8");
assert.ok(feature.includes("id={headingId}"), "video feature must bind headingId to h2");
assert.ok(feature.includes("LazyYouTubeEmbed"), "click-to-play embed required");

console.log("Static homepage a11y landmark checks passed.");
