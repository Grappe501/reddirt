/**
 * Append/update file-staged media index (metadata only — no binaries).
 * Usage: npx tsx scripts/media/ingest-county-media.ts --dry-run
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { MediaIndexFile } from "@/lib/media/media-metadata-types";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const out = path.join(root, "data/media/media-index.json");

async function main() {
  const dry = process.argv.includes("--dry-run");
  let existing: MediaIndexFile = { version: 1, items: [] };
  try {
    existing = JSON.parse(await readFile(out, "utf8")) as MediaIndexFile;
  } catch {
    /* fresh */
  }
  if (!dry) {
    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, JSON.stringify(existing, null, 2), "utf8");
  }
  console.log(dry ? "[dry-run] media index unchanged" : `Wrote ${existing.items.length} media rows → ${path.relative(root, out)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
