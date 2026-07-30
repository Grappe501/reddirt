/**
 * Smoke: Evidence Video Pro Edit (propose cut list + confirm render pack).
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs node ./node_modules/tsx/dist/cli.mjs scripts/smoke-video-pro-edit.ts
 */
import Module from "node:module";
import { existsSync, mkdirSync, unlinkSync } from "node:fs";
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
  const { runFfmpeg } = await import("../src/lib/campaign-media/ffmpeg-tooling");
  const { upsertVideoEditProject, listVideoAssemblies } = await import(
    "../src/lib/campaign-media/video-edit-store"
  );
  const { renderVideoEditProject } = await import("../src/lib/campaign-media/video-pro-render");
  const { proposeVideoEditProject } = await import("../src/lib/campaign-media/video-edit-director");

  const tempDir = path.resolve(process.cwd(), "..", ".local", "temp", "ffmpeg-smoke");
  mkdirSync(tempDir, { recursive: true });
  const sample = path.join(tempDir, "smoke-video-pro-edit.mp4");
  if (existsSync(sample)) {
    try {
      unlinkSync(sample);
    } catch {
      /* ignore */
    }
  }

  const gen = runFfmpeg([
    "-y",
    "-f",
    "lavfi",
    "-i",
    "color=c=green:s=1280x720:d=5",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=520:duration=5",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-shortest",
    sample,
  ]);
  if (!gen.ok) {
    console.error("FAIL: generate sample", gen.error);
    process.exit(1);
  }

  const speechId = "smoke-video-pro-edit";
  const youtubeVideoId = "smoke-yt-pro-edit-missing";
  const now = new Date().toISOString();
  const projectId = `vedit-${speechId}-smoke`;

  upsertVideoEditProject({
    id: projectId,
    speechId,
    youtubeVideoId,
    createdAt: now,
    updatedAt: now,
    title: "Smoke Pro Edit",
    clips: [
      { id: "clip-1", startSeconds: 0.3, endSeconds: 1.6, title: "open" },
      { id: "clip-2", startSeconds: 2.0, endSeconds: 3.5, title: "close" },
    ],
    transition: "crossfade",
    look: "warm",
    captionMode: "none",
    exportAspects: ["source", "vertical_9x16", "square_1x1"],
    loudnorm: true,
    directorRationale: "Smoke cut list.",
    notes: "smoke",
  });

  const rendered = renderVideoEditProject({
    projectId,
    absPath: sample,
  });
  if (!rendered.ok || rendered.assemblies.length < 3) {
    console.error("FAIL: render", rendered);
    process.exit(1);
  }

  const aspects = new Set(rendered.assemblies.map((a) => a.aspect));
  if (!aspects.has("source") || !aspects.has("vertical_9x16") || !aspects.has("square_1x1")) {
    console.error("FAIL: missing aspect pack", [...aspects]);
    process.exit(1);
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

  const listed = listVideoAssemblies(speechId);
  if (!listed.some((a) => a.projectId === projectId)) {
    console.error("FAIL: assemblies not persisted", listed.length);
    process.exit(1);
  }

  const noClips = proposeVideoEditProject({
    speechId: "smoke-pro-edit-empty",
    youtubeVideoId: "smoke-yt-empty-no-plan",
    persist: false,
  });
  if (noClips.ok) {
    console.error("FAIL: empty propose should fail without plan/intel", noClips);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        projectId,
        assemblies: rendered.assemblies.length,
        aspects: [...aspects],
        warnings: rendered.warnings,
        emptyProposeMessage: noClips.message,
      },
      null,
      2,
    ),
  );
  console.log("OK smoke-video-pro-edit");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
