/**
 * V2.4 ops smoke: tooling readiness + HEIC convert (when fixture) + production proof helpers.
 * From RedDirt:
 *   npm run smoke:photo-editor-v24
 *   node scripts/run-with-h-drive-env.cjs node ./node_modules/tsx/dist/cli.mjs scripts/smoke-photo-editor-v24-ops.ts
 */
import Module from "node:module";
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
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

async function smokeHeicRoundTrip(): Promise<{ ok: boolean; detail: string }> {
  const sharp = (await import("sharp")).default;
  const photosRoot = path.join(process.cwd(), "public", "media", "campaign-photos");
  const tmpDir = path.join(process.cwd(), "public", "media", "campaign-derivatives", "_smoke-v24");
  mkdirSync(tmpDir, { recursive: true });

  if (existsSync(photosRoot)) {
    const heic = readdirSync(photosRoot).find((n) => /\.(heic|heif)$/i.test(n));
    if (heic) {
      const src = path.join(photosRoot, heic);
      const out = path.join(tmpDir, `${path.parse(heic).name}-smoke.jpg`);
      try {
        await sharp(src, { failOn: "none" }).rotate().jpeg({ quality: 85 }).toFile(out);
      } catch (err) {
        return {
          ok: false,
          detail: `FAIL HEIC→JPEG ${heic}: ${err instanceof Error ? err.message : "convert error"}`,
        };
      }
      if (!existsSync(out)) return { ok: false, detail: `FAIL HEIC convert missing output ${heic}` };
      try {
        unlinkSync(out);
      } catch {
        /* ignore */
      }
      return { ok: true, detail: `OK HEIC→JPEG round-trip · ${heic}` };
    }
  }

  const out = path.join(tmpDir, "heic-proxy-smoke.jpg");
  await sharp({
    create: { width: 32, height: 32, channels: 3, background: { r: 18, g: 18, b: 74 } },
  })
    .jpeg({ quality: 80 })
    .toFile(out);
  if (!existsSync(out)) return { ok: false, detail: "FAIL sharp JPEG smoke write" };
  try {
    unlinkSync(out);
  } catch {
    /* ignore */
  }
  return { ok: true, detail: "OK sharp JPEG smoke (no HEIC fixture present)" };
}

async function main() {
  const { getEvidenceToolingReadiness } = await import(
    "../src/lib/campaign-media/evidence-tooling-readiness"
  );
  const { getOpenAIKeySource, describeOpenAIKeySource } = await import("../src/lib/openai/client");
  const { provePhotoProduction } = await import("../src/lib/campaign-media/photo-production-proof");
  const { buildEvidenceShipReport } = await import("../src/lib/campaign-media/evidence-ship-report");
  const { loadPhotoEvidenceStore } = await import("../src/lib/campaign-media/evidence-store");

  const readiness = getEvidenceToolingReadiness();
  if (!readiness.heic?.sharpAvailable) {
    console.error("FAIL: sharp not available", readiness.heic);
    process.exit(1);
  }
  if (!readiness.openaiKeySource) {
    console.error("FAIL: openaiKeySource missing", readiness);
    process.exit(1);
  }
  const source = getOpenAIKeySource();
  console.log("OpenAI key source:", source, "·", describeOpenAIKeySource(source));
  console.log("Images model:", readiness.openaiImageModel);
  console.log("HEIC:", readiness.heic.detail);

  const heicSmoke = await smokeHeicRoundTrip();
  console.log(heicSmoke.detail);
  if (!heicSmoke.ok) {
    console.error("FAIL HEIC/sharp smoke");
    process.exit(1);
  }

  const report = buildEvidenceShipReport({ persist: false, includeDerivativeScan: false });
  const shipOnlyItem = report.checklist.find((c) => c.id === "ship_only_live");
  if (!shipOnlyItem) {
    console.error("FAIL: ship_only_live checklist item missing");
    process.exit(1);
  }
  console.log("Ship checklist ship_only_live:", shipOnlyItem.ok, shipOnlyItem.detail);

  const store = loadPhotoEvidenceStore();
  const withOverride = Object.entries(store.photos ?? {}).find(([, o]) =>
    Boolean(String(o?.publicSrcOverride ?? "").trim()),
  );
  if (withOverride) {
    const proof = await provePhotoProduction({
      photoId: withOverride[0],
      runHttpSmoke: false,
    });
    console.log("Production proof sample:", proof.photoId, proof.ok, proof.message);
    if (proof.publicSrcOverride?.includes("campaign-derivatives") && proof.ok) {
      console.error("FAIL: derivative override should not pass ship-only proof", proof);
      process.exit(1);
    }
  } else {
    console.log("SKIP production proof sample — no publicSrcOverride in store");
  }

  // Marker that smoke ran (ops artifact under derivatives — gitignored).
  const markerDir = path.join(process.cwd(), "public", "media", "campaign-derivatives", "_smoke-v24");
  mkdirSync(markerDir, { recursive: true });
  writeFileSync(
    path.join(markerDir, "ops-ok.json"),
    `${JSON.stringify({ at: new Date().toISOString(), purpose: "smoke-photo-editor-v24-ops" }, null, 2)}\n`,
    "utf8",
  );

  console.log("OK smoke-photo-editor-v24-ops");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
