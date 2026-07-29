/**
 * Smoke: non-destructive photo derivatives (sharp).
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs node --require ./scripts/tsx-server-only-shim.cjs ./node_modules/tsx/dist/cli.mjs scripts/smoke-media-derivatives.ts
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { CAMPAIGN_PHOTO_REGISTRY } from "../src/content/media/campaign-photo-registry";
import {
  createPhotoDerivative,
  inspectPhotoPixels,
  listPhotoDerivatives,
  probeVideoTooling,
  suggestCropPlan,
} from "../src/lib/campaign-media/media-derivatives";
import { listCampaignPhotosLive } from "../src/lib/campaign-media/list-campaign-photos-live";

async function main() {
  const live = listCampaignPhotosLive();
  const photo =
    live.find((p) => {
      const abs = path.join(process.cwd(), "public", p.src.replace(/^\//, ""));
      return existsSync(abs);
    }) ??
    CAMPAIGN_PHOTO_REGISTRY.find((p) => {
      const abs = path.join(process.cwd(), "public", p.src.replace(/^\//, ""));
      return existsSync(abs);
    });

  if (!photo) {
    console.error("FAIL: no on-disk campaign photo found");
    process.exit(1);
  }

  console.log("photo", photo.id, photo.src);

  const inspect = await inspectPhotoPixels({ photoId: photo.id });
  if (!inspect.found || !inspect.width) {
    console.error("FAIL: inspect", inspect);
    process.exit(1);
  }
  console.log("inspect", `${inspect.width}x${inspect.height}`, inspect.format);

  const plan = await suggestCropPlan(photo.id);
  if (!plan.ok) {
    console.error("FAIL: crop plan", plan.error);
    process.exit(1);
  }
  console.log(
    "crop-plan",
    plan.plan.recommended.map((r) => r.kind).join(", "),
  );

  const web = await createPhotoDerivative({ photoId: photo.id, kind: "web_max", maxEdge: 800 });
  if (!web.ok) {
    console.error("FAIL: web_max", web.error);
    process.exit(1);
  }
  console.log("web_max", web.record.publicSrc, `${web.record.width}x${web.record.height}`);

  const thumb = await createPhotoDerivative({ photoId: photo.id, kind: "thumb" });
  if (!thumb.ok) {
    console.error("FAIL: thumb", thumb.error);
    process.exit(1);
  }
  console.log("thumb", thumb.record.publicSrc);

  const listed = listPhotoDerivatives(photo.id);
  if (listed.length < 2) {
    console.error("FAIL: expected >=2 derivatives, got", listed.length);
    process.exit(1);
  }

  const tooling = probeVideoTooling();
  console.log("ffmpeg", tooling.ffmpegAvailable ? tooling.ffmpegPath : "not installed (ok for photo slice)");

  console.log("OK smoke-media-derivatives");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
