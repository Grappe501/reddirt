/**
 * Smoke: focus-point geometry + focus crop derivative (Pass 5).
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs npx --yes tsx scripts/smoke-focus-crop.ts
 */
import Module from "node:module";
import { existsSync } from "node:fs";
import path from "node:path";

const originalLoad = (Module as unknown as { _load: (...args: unknown[]) => unknown })._load;
(Module as unknown as { _load: (...args: unknown[]) => unknown })._load = function (...args: unknown[]) {
  const request = String(args[0] ?? "");
  const normalized = request.replace(/\\/g, "/");
  if (
    request === "server-only" ||
    normalized.includes("/server-only/") ||
    normalized.endsWith("/server-only")
  ) {
    return {};
  }
  return originalLoad.apply(this, args);
};

async function main() {
  const {
    clickToFocusPoint,
    coverCropRect,
    parseCropAdviceToKind,
  } = await import("../src/lib/campaign-media/focus-crop");
  const { createPhotoDerivative, createDerivativeFromCropAdvice } = await import(
    "../src/lib/campaign-media/media-derivatives"
  );
  const { listCampaignPhotosLive } = await import("../src/lib/campaign-media/list-campaign-photos-live");

  // Geometry: object-contain click → focus
  const point = clickToFocusPoint({
    clientX: 100,
    clientY: 100,
    elementLeft: 0,
    elementTop: 0,
    elementWidth: 200,
    elementHeight: 200,
    naturalWidth: 400,
    naturalHeight: 200,
  });
  if (!point || Math.abs(point.x - 0.5) > 0.02 || Math.abs(point.y - 0.5) > 0.02) {
    console.error("FAIL: clickToFocusPoint", point);
    process.exit(1);
  }

  const rect = coverCropRect({
    srcWidth: 1600,
    srcHeight: 900,
    targetAspect: 1,
    focus: { x: 0.2, y: 0.8 },
  });
  if (rect.width !== rect.height || rect.left < 0 || rect.top < 0) {
    console.error("FAIL: coverCropRect", rect);
    process.exit(1);
  }
  // Landscape → square: crop height fills source, so only X can bias (left should hug focus).
  if (rect.left !== 0 || rect.top !== 0) {
    console.error("FAIL: coverCropRect landscape square bias", rect);
    process.exit(1);
  }

  const rectPortrait = coverCropRect({
    srcWidth: 900,
    srcHeight: 1600,
    targetAspect: 1,
    focus: { x: 0.2, y: 0.8 },
  });
  if (rectPortrait.left !== 0 || rectPortrait.top < 200) {
    console.error("FAIL: coverCropRect portrait square bias", rectPortrait);
    process.exit(1);
  }

  const parsed = parseCropAdviceToKind("tight portrait for stories / 4:5");
  if (parsed.kind !== "focus_portrait_4x5") {
    console.error("FAIL: parseCropAdviceToKind", parsed);
    process.exit(1);
  }

  const live = listCampaignPhotosLive().filter((p) => {
    const abs = path.join(process.cwd(), "public", p.src.replace(/^\//, ""));
    return existsSync(abs) && !p.src.includes("campaign-derivatives");
  });
  const photo = live[0];
  if (!photo) {
    console.error("FAIL: no on-disk photo");
    process.exit(1);
  }

  const focus = { x: 0.35, y: 0.42 };
  const created = await createPhotoDerivative({
    photoId: photo.id,
    kind: "focus_hero_16x9",
    focusX: focus.x,
    focusY: focus.y,
    maxEdge: 960,
  });
  if (!created.ok) {
    console.error("FAIL: create focus_hero_16x9", created.error);
    process.exit(1);
  }
  if (created.record.focusX !== focus.x || created.record.focusY !== focus.y) {
    console.error("FAIL: focus not recorded on derivative", created.record);
    process.exit(1);
  }

  const fromAdvice = await createDerivativeFromCropAdvice({
    photoId: photo.id,
    cropAdvice: "square avatar crop",
    focusX: focus.x,
    focusY: focus.y,
  });
  if (!fromAdvice.ok) {
    console.error("FAIL: createDerivativeFromCropAdvice", fromAdvice.error);
    process.exit(1);
  }
  if (fromAdvice.record.kind !== "focus_square_1x1") {
    console.error("FAIL: unexpected kind from advice", fromAdvice.record.kind);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        photoId: photo.id,
        focusHero: created.record.publicSrc,
        fromAdvice: fromAdvice.record.publicSrc,
        cropRect: rect,
        parsedKind: parsed.kind,
      },
      null,
      2,
    ),
  );
  console.log("OK smoke-focus-crop");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
