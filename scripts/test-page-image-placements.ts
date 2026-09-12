import assert from "node:assert/strict";
import { media } from "../src/content/media/registry";
import {
  PAGE_IMAGE_PLACEMENTS,
  assertPageImagePlacementsUnique,
} from "../src/content/media/page-image-placements";
import { listAllPublicMediaSlots } from "../src/lib/public-media/slot-registry";

for (const slot of listAllPublicMediaSlots()) {
  assert.ok(media[slot.staticFallbackMediaKey], `missing media key ${slot.staticFallbackMediaKey} for ${slot.slotKey}`);
}

for (const placement of PAGE_IMAGE_PLACEMENTS) {
  const still = media[placement.mediaKey];
  assert.ok(still, `missing placement media ${placement.id} → ${placement.mediaKey}`);
  assert.ok(still.alt.trim().length > 12, `thin alt on ${placement.id}`);
  if (!still.src.includes("/placeholders/")) {
    assert.match(still.alt, /secretary of state/i, `campaign SEO missing from alt on ${placement.id}`);
    assert.ok(still.seoTitle, `missing seoTitle on ${placement.id}`);
    assert.ok(still.seoDescription, `missing seoDescription on ${placement.id}`);
    assert.ok(still.credit, `missing credit on ${placement.id}`);
  }
}

const dupes = assertPageImagePlacementsUnique();
assert.deepEqual(dupes, [], `duplicate page stills:\n${dupes.map((d) => `${d.src} → ${d.ids.join(", ")}`).join("\n")}`);

console.log(`test-page-image-placements ok (${PAGE_IMAGE_PLACEMENTS.length} placements)`);
