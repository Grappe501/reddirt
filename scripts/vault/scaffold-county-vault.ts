/**
 * Scaffold county vault folders (metadata + .gitkeep leaves — no media binaries).
 * Run from RedDirt: npx tsx scripts/vault/scaffold-county-vault.ts
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { ArkansasCountyFairRow } from "@/lib/fairs/arkansas-county-fair-types";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const base = path.join(root, "county-vault/arkansas");

const SUBS = [
  "contacts",
  "events",
  "speeches",
  "photos",
  "videos",
  "press",
  "scripts",
  "social-posts",
  "clerk-courthouse",
  "football",
  "education",
  "fairs-festivals",
] as const;

async function ensureDir(p: string) {
  await mkdir(p, { recursive: true });
  await writeFile(path.join(p, ".gitkeep"), "", "utf8");
}

async function main() {
  const fairsPath = path.join(root, "data/calendar-command-center/arkansas-county-fairs-2026.normalized.json");
  const raw = JSON.parse(await readFile(fairsPath, "utf8")) as { rows?: ArkansasCountyFairRow[] };
  const counties = [...new Set((raw.rows ?? []).map((r) => r.county))].sort();
  await ensureDir(base);
  await writeFile(
    path.join(base, "README.md"),
    [
      "# Arkansas county vault",
      "",
      "Per-county working tree for profiles, events, media metadata pointers, and press.",
      "Do not commit large binaries — keep storage paths in JSON and move blobs to object storage later.",
      "",
    ].join("\n"),
    "utf8",
  );

  for (const county of counties) {
    const slug = county
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const croot = path.join(base, slug);
    await mkdir(croot, { recursive: true });
    await writeFile(
      path.join(croot, "county-profile.md"),
      [`# ${county} County`, "", "Seat, demographics, and organizer notes — fill from public sources.", ""].join("\n"),
      "utf8",
    );
    await writeFile(
      path.join(croot, "priority-notes.md"),
      ["# Priority notes", "", "Tiering, surrogates, and under-touched angles.", ""].join("\n"),
      "utf8",
    );
    await writeFile(path.join(croot, "county-facts.json"), "{}\n", "utf8");
    for (const s of SUBS) await ensureDir(path.join(croot, s));
  }
  console.log(`Scaffolded ${counties.length} counties under ${path.relative(root, base)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
