/**
 * Smoke: Evidence Video Prep package + 9:16 encode.
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs node ./node_modules/tsx/dist/cli.mjs scripts/smoke-video-prep-package.ts
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
  const { encodeVideoExcerptClip } = await import("../src/lib/campaign-media/media-derivatives");
  const { prepSpeechVideoPackage, listVideoDerivativesForSpeech } = await import(
    "../src/lib/campaign-media/video-prep-package"
  );

  const tempDir = path.resolve(process.cwd(), "..", ".local", "temp", "ffmpeg-smoke");
  mkdirSync(tempDir, { recursive: true });
  const sample = path.join(tempDir, "smoke-video-prep.mp4");
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
    "color=c=blue:s=1280x720:d=4",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=440:duration=4",
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

  const packet = prepSpeechVideoPackage({
    speechId: "smoke-video-prep",
    youtubeVideoId: "smoke-yt-video-prep-missing",
    confirmEncode: false,
    confirmPoster: true,
    absPath: sample,
  });
  if (!packet.tooling.ffmpegAvailable) {
    console.error("FAIL: ffmpeg not available", packet);
    process.exit(1);
  }
  if (!packet.master.found) {
    console.error("FAIL: master override not found", packet.master);
    process.exit(1);
  }
  if (!packet.postersThisRun.length) {
    console.error("FAIL: expected poster from confirmPoster", packet);
    process.exit(1);
  }

  const vertical = encodeVideoExcerptClip({
    absPath: sample,
    outId: "smoke-video-prep",
    speechId: "smoke-video-prep",
    clipIndex: 0,
    startSeconds: 0.5,
    endSeconds: 2.2,
    title: "smoke vertical",
    aspect: "vertical_9x16",
  });
  if (!vertical.ok) {
    console.error("FAIL: vertical encode", vertical.error);
    process.exit(1);
  }
  if (vertical.record.aspect !== "vertical_9x16") {
    console.error("FAIL: aspect not recorded", vertical.record);
    process.exit(1);
  }
  const abs = path.join(process.cwd(), vertical.relativePath);
  if (!existsSync(abs)) {
    console.error("FAIL: vertical file missing", abs);
    process.exit(1);
  }
  if (!vertical.record.width || !vertical.record.height || vertical.record.width >= vertical.record.height) {
    console.error("FAIL: expected portrait 9:16 dimensions", {
      w: vertical.record.width,
      h: vertical.record.height,
    });
    process.exit(1);
  }

  const listed = listVideoDerivativesForSpeech("smoke-video-prep");
  if (!listed.clips.some((c) => c.id === vertical.record.id)) {
    console.error("FAIL: list_video_derivatives missing clip");
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        prepMessage: packet.message,
        poster: packet.postersThisRun[0]?.publicSrc,
        verticalSrc: vertical.publicSrc,
        width: vertical.record.width,
        height: vertical.record.height,
        planErrorExpected: Boolean(packet.planError),
      },
      null,
      2,
    ),
  );
  console.log("OK smoke-video-prep-package");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
