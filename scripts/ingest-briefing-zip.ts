/**
 * Ingest a zip of campaign files into DB + RAG. See ingest-campaign-files-core.ts.
 *
 * Usage (from RedDirt root, DATABASE_URL set; OPENAI in .env.local overrides .env):
 *   npx tsx scripts/ingest-briefing-zip.ts --zip "C:\path\to\file.zip" [--public] [--comms] [--community-training]
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";
import { ingestCampaignFileBuffer, supportedIngestExt } from "./ingest-campaign-files-core";
import { loadRedDirtEnv } from "./load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
loadRedDirtEnv(root);

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

type Preset = "briefing" | "comms" | "community-training";

function resolvePreset(): Preset {
  if (process.argv.includes("--community-training")) return "community-training";
  if (process.argv.includes("--comms")) return "comms";
  return "briefing";
}

async function main() {
  const zipPath = arg("--zip");
  const publish = process.argv.includes("--public");
  const preset = resolvePreset();
  if (!zipPath) {
    // eslint-disable-next-line no-console
    console.error(
      "Usage: npx tsx scripts/ingest-briefing-zip.ts --zip <path-to.zip> [--public] [--comms] [--community-training]"
    );
    process.exit(1);
  }
  if (!process.env.DATABASE_URL?.trim()) {
    // eslint-disable-next-line no-console
    console.error("DATABASE_URL required");
    process.exit(1);
  }

  const buf = await readFile(path.resolve(zipPath));
  const zip = await JSZip.loadAsync(buf);
  const sourceBundle = path.basename(path.resolve(zipPath));
  const out: { file: string; result: Awaited<ReturnType<typeof ingestCampaignFileBuffer>> }[] = [];

  const names = Object.keys(zip.files).filter(
    (n) => !zip.files[n]!.dir && !path.basename(n).startsWith("._")
  );

  for (const name of names) {
    const file = zip.files[name];
    if (!file) continue;
    const ext = path.extname(name).toLowerCase();
    if (!supportedIngestExt(ext)) continue;
    const data = await file.async("nodebuffer");
    if (!(data instanceof Buffer) || data.length === 0) continue;
    // eslint-disable-next-line no-console
    console.log(`[ingest:${preset}] ${name} (${data.length} bytes)…`);
    const result = await ingestCampaignFileBuffer(data, name, {
      publish,
      sourceBundle,
      relativePath: name.split(path.sep).join("/"),
      preset,
      ingestFrom: "zip",
    });
    out.push({ file: name, result });
  }

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ok: true, count: out.length, publish, preset, results: out }, null, 2));
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
