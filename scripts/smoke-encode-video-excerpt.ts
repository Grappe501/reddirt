/**
 * Smoke: Pass 7 encode timed video excerpt.
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs npx --yes tsx scripts/smoke-encode-video-excerpt.ts
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
  const { encodeVideoExcerptClip, listVideoClips } = await import(
    "../src/lib/campaign-media/media-derivatives"
  );

  const tempDir = path.resolve(process.cwd(), "..", ".local", "temp", "ffmpeg-smoke");
  mkdirSync(tempDir, { recursive: true });
  const sample = path.join(tempDir, "smoke-pass7.mp4");
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
    "color=c=green:s=640x360:d=3",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=880:duration=3",
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

  const encoded = encodeVideoExcerptClip({
    absPath: sample,
    outId: "smoke-pass7",
    speechId: "smoke-pass7",
    clipIndex: 0,
    startSeconds: 0.5,
    endSeconds: 1.8,
    title: "smoke clip",
  });
  if (!encoded.ok) {
    console.error("FAIL: encode", encoded.error);
    process.exit(1);
  }
  const abs = path.join(process.cwd(), encoded.relativePath);
  if (!existsSync(abs)) {
    console.error("FAIL: clip file missing", abs);
    process.exit(1);
  }

  const listed = listVideoClips("smoke-pass7");
  if (!listed.some((c) => c.id === encoded.record.id)) {
    console.error("FAIL: ledger missing clip", listed);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        publicSrc: encoded.publicSrc,
        durationSeconds: encoded.record.durationSeconds,
        bytes: encoded.record.bytes,
      },
      null,
      2,
    ),
  );
  console.log("OK smoke-encode-video-excerpt");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
