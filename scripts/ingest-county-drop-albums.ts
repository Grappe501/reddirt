/**
 * Copy campaign-media/{County}/ stills into public/media/county-library/{slug}/
 * as web JPEGs and write data/campaign-media/county-drop-albums.json.
 *
 * Folder name is the county. Do not invent cities or event titles from filenames.
 */
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  COUNTY_DROP_INDEX_REL,
  COUNTY_DROP_PUBLIC_PREFIX,
  type CountyDropAlbumJson,
  type CountyDropIndexJson,
} from "@/lib/campaign-media/county-drop-types";
import { resolveCountyFromDropFolderName } from "@/lib/campaign-media/county-drop-folder";

const ROOT = path.resolve(__dirname, "..");
const DROP_ROOT = path.join(ROOT, "campaign-media");
const OUT_ROOT = path.join(ROOT, "public", "media", "county-library");
const WEB_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".heif"]);
const MAX_EDGE = 1600;

function walkImages(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walkImages(full, acc);
      continue;
    }
    if (WEB_EXT.has(path.extname(name).toLowerCase())) acc.push(full);
  }
  return acc;
}

function safeStem(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 72) || "photo"
  );
}

async function main() {
  mkdirSync(OUT_ROOT, { recursive: true });
  mkdirSync(path.dirname(path.join(ROOT, COUNTY_DROP_INDEX_REL)), { recursive: true });

  const folders = existsSync(DROP_ROOT)
    ? readdirSync(DROP_ROOT).filter((name) => statSync(path.join(DROP_ROOT, name)).isDirectory())
    : [];

  const albums: CountyDropAlbumJson[] = [];
  let wrote = 0;
  let skippedUnknown = 0;

  for (const folder of folders) {
    const county = resolveCountyFromDropFolderName(folder);
    if (!county) {
      if (folder.toLowerCase() !== "uploads") {
        console.log("skip_unknown_folder", folder);
        skippedUnknown += 1;
      }
      continue;
    }

    const destDir = path.join(OUT_ROOT, county.slug);
    mkdirSync(destDir, { recursive: true });
    const photos: CountyDropAlbumJson["photos"] = [];
    const used = new Set<string>();

    for (const abs of walkImages(path.join(DROP_ROOT, folder))) {
      const stem = safeStem(path.basename(abs));
      let destName = `${stem}.jpg`;
      let n = 2;
      while (used.has(destName)) {
        destName = `${stem}-${n}.jpg`;
        n += 1;
      }
      used.add(destName);
      const destAbs = path.join(destDir, destName);
      try {
        const pipeline = sharp(abs).rotate().resize({
          width: MAX_EDGE,
          height: MAX_EDGE,
          fit: "inside",
          withoutEnlargement: true,
        });
        const out = await pipeline.jpeg({ quality: 78, mozjpeg: true }).toBuffer();
        writeFileSync(destAbs, out);
        const meta = await sharp(out).metadata();
        photos.push({
          id: `drop-${county.slug}-${destName.replace(/\.jpg$/, "")}`,
          src: `${COUNTY_DROP_PUBLIC_PREFIX}/${county.slug}/${destName}`,
          filename: path.basename(abs),
          width: meta.width ?? MAX_EDGE,
          height: meta.height ?? MAX_EDGE,
        });
        wrote += 1;
      } catch (err) {
        console.log("skip_file", path.relative(DROP_ROOT, abs), (err as Error).message);
      }
    }

    if (photos.length === 0) continue;
    photos.sort((a, b) => a.filename.localeCompare(b.filename));
    albums.push({
      countySlug: county.slug,
      countyDisplayName: county.displayName,
      shortName: county.displayName.replace(/\s+County$/i, ""),
      photos,
    });
    console.log("album", county.slug, photos.length);
  }

  albums.sort((a, b) => a.shortName.localeCompare(b.shortName));
  const index: CountyDropIndexJson = {
    generatedAt: new Date().toISOString(),
    albums,
  };
  writeFileSync(path.join(ROOT, COUNTY_DROP_INDEX_REL), `${JSON.stringify(index, null, 2)}\n`, "utf8");
  console.log("wrote", wrote, "images", "albums", albums.length, "unknown_folders", skippedUnknown);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
