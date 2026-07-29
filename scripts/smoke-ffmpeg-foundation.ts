/**
 * Smoke: Pass 6 ffmpeg foundation (detect .local binaries, probe, poster).
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs npx --yes tsx scripts/smoke-ffmpeg-foundation.ts
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
  const { probeVideoTooling, runFfmpeg } = await import("../src/lib/campaign-media/ffmpeg-tooling");
  const { probeLocalVideo, extractLocalVideoPoster } = await import(
    "../src/lib/campaign-media/media-derivatives"
  );

  const tooling = probeVideoTooling();
  if (!tooling.ffmpegAvailable || !tooling.ffprobeAvailable) {
    console.error("FAIL: ffmpeg/ffprobe missing", tooling);
    process.exit(1);
  }
  if (tooling.source !== "local" && tooling.source !== "env" && tooling.source !== "path") {
    console.error("FAIL: unexpected source", tooling.source);
    process.exit(1);
  }

  const tempDir = path.resolve(process.cwd(), "..", ".local", "temp", "ffmpeg-smoke");
  mkdirSync(tempDir, { recursive: true });
  const sample = path.join(tempDir, "smoke-pass6.mp4");
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
    "color=c=blue:s=640x360:d=2",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=440:duration=2",
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
  if (!existsSync(sample)) {
    console.error("FAIL: sample not written");
    process.exit(1);
  }

  const probe = probeLocalVideo({
    absPath: sample,
    startSeconds: 0.5,
    endSeconds: 1.5,
  });
  if (!probe.ok || !probe.durationSeconds || probe.durationSeconds < 1.5) {
    console.error("FAIL: probe", probe);
    process.exit(1);
  }
  if (!probe.clipWindow?.inBounds) {
    console.error("FAIL: clip window", probe.clipWindow);
    process.exit(1);
  }

  const poster = extractLocalVideoPoster({
    absPath: sample,
    outId: "smoke-pass6",
    atSeconds: 1,
  });
  if (!poster.ok) {
    console.error("FAIL: poster", poster.error);
    process.exit(1);
  }
  const posterAbs = path.join(process.cwd(), poster.relativePath);
  if (!existsSync(posterAbs)) {
    console.error("FAIL: poster file missing", posterAbs);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        source: tooling.source,
        ffmpegVersion: tooling.ffmpegVersion,
        durationSeconds: probe.durationSeconds,
        poster: poster.publicSrc,
      },
      null,
      2,
    ),
  );
  console.log("OK smoke-ffmpeg-foundation");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
