/**
 * Copy website-ready photos into public/media/campaign-trail/ and regenerate
 * src/content/media/campaign-trail-photos.ts for the site + search ingest.
 *
 * Usage (from RedDirt/):
 *   npx tsx scripts/sync-website-photos.ts
 *   npx tsx scripts/sync-website-photos.ts --from "H:/SOSWebsite/campaign information for ingestion/Website photos-20260421T211003Z-3-001"
 *
 * Only .jpg .jpeg .png .webp .gif are copied (browser-safe). HEIC and others are skipped with a warning.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const destDir = path.join(repoRoot, "public", "media", "campaign-trail");
const outTs = path.join(repoRoot, "src", "content", "media", "campaign-trail-photos.ts");

const DEFAULT_FROM = path.resolve(
  repoRoot,
  "..",
  "campaign information for ingestion",
  "Website photos-20260421T211003Z-3-001",
);

const WEB_IMAGE = /\.(jpe?g|png|gif|webp)$/i;

function parseArgs(): { from: string } {
  const argv = process.argv.slice(2);
  let from = process.env.CAMPAIGN_WEBSITE_PHOTOS_DIR?.trim() || DEFAULT_FROM;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--from" && argv[i + 1]) {
      from = path.resolve(argv[i + 1]);
      i++;
    }
  }
  return { from };
}

function sanitizeFileBase(name: string): string {
  const base = path.basename(name, path.extname(name));
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "photo";
}

async function walkImages(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await walkImages(full)));
    } else if (ent.isFile() && WEB_IMAGE.test(ent.name)) {
      out.push(full);
    } else if (ent.isFile() && /\.(heic|heif|bmp|tiff?)$/i.test(ent.name)) {
      console.warn(`[photos:sync] Skipping (convert to JPG/PNG for web): ${full}`);
    }
  }
  return out;
}

function altFromFilename(filePath: string): string {
  const base = path.basename(filePath, path.extname(filePath));
  const words = base
    .replace(/[_-]+/g, " ")
    .replace(/(\d{4})(\d{2})(\d{2})/g, "$1-$2-$3")
    .trim();
  if (!words) return "Campaign trail — Kelly for Arkansas Secretary of State";
  const cleaned = words.replace(/\s+/g, " ");
  return `Campaign trail photo: ${cleaned}`;
}

function emitTs(entries: { id: string; src: string; alt: string }[]): string {
  const lines = entries.map(
    (e) =>
      `  { id: ${JSON.stringify(e.id)}, src: ${JSON.stringify(e.src)}, alt: ${JSON.stringify(e.alt)} },`,
  );
  return `/**
 * Campaign trail photos — copied to public/media/campaign-trail/ by \`npm run photos:sync\`.
 * Do not edit by hand; re-run the sync script after adding or renaming source images.
 */
export type CampaignTrailPhoto = {
  id: string;
  /** Public URL under /public */
  src: string;
  alt: string;
  caption?: string;
};

export const campaignTrailPhotos: CampaignTrailPhoto[] = [
${lines.join("\n")}
];
`;
}

async function main() {
  const { from } = parseArgs();
  console.log(`[photos:sync] Source: ${from}`);
  console.log(`[photos:sync] Dest:   ${destDir}`);

  await fs.mkdir(destDir, { recursive: true });
  const sources = (await walkImages(from)).sort((a, b) =>
    path.basename(a).localeCompare(path.basename(b), undefined, { sensitivity: "base" }),
  );

  if (sources.length === 0) {
    console.warn(
      `[photos:sync] No web images found under ${from}. ` +
        `Check the folder path or set CAMPAIGN_WEBSITE_PHOTOS_DIR / --from. Writing empty registry.`,
    );
    await fs.writeFile(
      outTs,
      emitTs([]),
      "utf8",
    );
    return;
  }

  const usedNames = new Set<string>();
  const entries: { id: string; src: string; alt: string }[] = [];

  for (let i = 0; i < sources.length; i++) {
    const srcPath = sources[i];
    const ext = path.extname(srcPath).toLowerCase();
    const slug = sanitizeFileBase(srcPath);
    let fileName = `${String(i + 1).padStart(3, "0")}-${slug}${ext}`;
    while (usedNames.has(fileName)) {
      fileName = `${String(i + 1).padStart(3, "0")}-${slug}-${usedNames.size}${ext}`;
    }
    usedNames.add(fileName);
    const destPath = path.join(destDir, fileName);
    await fs.copyFile(srcPath, destPath);
    const id = fileName.replace(ext, "");
    entries.push({
      id,
      src: `/media/campaign-trail/${fileName}`,
      alt: altFromFilename(srcPath),
    });
  }

  await fs.writeFile(outTs, emitTs(entries), "utf8");
  console.log(`[photos:sync] Copied ${entries.length} file(s); wrote ${path.relative(repoRoot, outTs)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
