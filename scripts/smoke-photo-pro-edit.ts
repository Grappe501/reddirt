/**
 * Smoke: Evidence Photo Pro Edit (propose pack + confirm render).
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs node ./node_modules/tsx/dist/cli.mjs scripts/smoke-photo-pro-edit.ts
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
  const { listCampaignPhotosLive } = await import("../src/lib/campaign-media/list-campaign-photos-live");
  const { proposePhotoEditProject } = await import("../src/lib/campaign-media/photo-edit-director");
  const { renderPhotoEditProject } = await import("../src/lib/campaign-media/photo-pro-render");
  const { listPhotoAssemblies } = await import("../src/lib/campaign-media/photo-edit-store");
  const { applyPhotoLook } = await import("../src/lib/campaign-media/photo-look-presets");
  const sharp = (await import("sharp")).default;

  // Look pipeline smoke (no file I/O beyond sharp buffer).
  let pipe = sharp({
    create: { width: 64, height: 64, channels: 3, background: { r: 120, g: 140, b: 160 } },
  });
  pipe = applyPhotoLook(pipe, "punch");
  const buf = await pipe.jpeg().toBuffer();
  if (!buf.length) {
    console.error("FAIL: applyPhotoLook punch produced empty buffer");
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

  const proposed = await proposePhotoEditProject({
    photoId: photo.id,
    look: "warm",
    useFocus: true,
    focusX: 0.4,
    focusY: 0.35,
    sharpen: true,
    exportSlots: ["grade_full", "hero_16x9", "square_1x1", "story_9x16", "thumb"],
    persist: true,
  });
  if (!proposed.ok || !proposed.project) {
    console.error("FAIL: propose", proposed);
    process.exit(1);
  }
  if (!proposed.project.exportSlots.includes("story_9x16")) {
    console.error("FAIL: expected story_9x16 slot", proposed.project.exportSlots);
    process.exit(1);
  }

  const rendered = await renderPhotoEditProject({ projectId: proposed.project.id });
  if (!rendered.ok || rendered.assemblies.length < 5) {
    console.error("FAIL: render", rendered);
    process.exit(1);
  }
  const slots = new Set(rendered.assemblies.map((a) => a.slot));
  for (const need of ["grade_full", "hero_16x9", "square_1x1", "story_9x16", "thumb"] as const) {
    if (!slots.has(need)) {
      console.error("FAIL: missing slot", need, [...slots]);
      process.exit(1);
    }
  }
  for (const a of rendered.assemblies) {
    const abs = path.join(process.cwd(), a.relativePath);
    if (!existsSync(abs)) {
      console.error("FAIL: missing assembly file", a.relativePath);
      process.exit(1);
    }
    if (a.look !== "warm") {
      console.error("FAIL: look not warm", a);
      process.exit(1);
    }
  }

  const story = rendered.assemblies.find((a) => a.slot === "story_9x16");
  if (!story || story.height <= story.width) {
    console.error("FAIL: story_9x16 should be taller than wide", story);
    process.exit(1);
  }

  const listed = listPhotoAssemblies(photo.id);
  if (!listed.some((a) => a.projectId === proposed.project!.id)) {
    console.error("FAIL: assemblies not persisted");
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        photoId: photo.id,
        projectId: proposed.project.id,
        assemblies: rendered.assemblies.length,
        slots: [...slots],
        promoteSuggestion: rendered.promoteSuggestion,
        warnings: rendered.warnings,
      },
      null,
      2,
    ),
  );
  console.log("OK smoke-photo-pro-edit");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
