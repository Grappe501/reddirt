/**
 * Extract Kelly Grappe SOS campaign team .docx files into markdown under docs/background/
 * so `npm run ingest` indexes them for search + assistant.
 *
 * Usage:
 *   npm run sync:team-positions
 *   npm run sync:team-positions -- "C:\path\to\Kelly Grappe Secretary of State Team Positions"
 *
 * Or set CAMPAIGN_TEAM_POSITIONS_DIR to the folder containing the .docx files.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractTextFromDocxBuffer } from "../src/lib/campaign-briefings/extract-docx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

/** Default matches common Windows Downloads layout; override with argv or env. */
const DEFAULT_SOURCE = path.join(
  "C:",
  "Users",
  "User",
  "Downloads",
  "Kelly_Grappe_Secretary_of_State_Team_Positions_Converted",
  "Kelly Grappe Secretary of State Team Positions",
);

async function main() {
  const sourceDir = process.argv[2]?.trim() || process.env.CAMPAIGN_TEAM_POSITIONS_DIR?.trim() || DEFAULT_SOURCE;
  const outDir = path.join(repoRoot, "docs", "background", "campaign-team-positions");

  await fs.mkdir(outDir, { recursive: true });

  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(sourceDir, { withFileTypes: true });
  } catch (e) {
    console.error(`Cannot read source directory:\n  ${sourceDir}\n`, e);
    process.exit(1);
  }

  const docx = entries.filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".docx"));
  if (!docx.length) {
    console.error("No .docx files in", sourceDir);
    process.exit(1);
  }

  let n = 0;
  for (const e of docx.sort((a, b) => a.name.localeCompare(b.name))) {
    const fp = path.join(sourceDir, e.name);
    const buf = await fs.readFile(fp);
    let text: string;
    try {
      text = await extractTextFromDocxBuffer(buf);
    } catch (err) {
      console.warn(`[sync-team-positions] skip ${e.name}:`, err);
      continue;
    }

    const base = e.name.replace(/\.docx$/i, "");
    const safe = base.replace(/[^\w.\-()+]+/g, "_");
    const mdPath = path.join(outDir, `${safe}.md`);
    const body = [
      `# ${base}`,
      "",
      "Internal campaign staffing document for **Kelly Grappe for Arkansas Secretary of State**. Ingested for site search and the campaign guide—not a voter-facing campaign promise page.",
      "",
      `Source file: \`${e.name}\``,
      "",
      text || "_[No extractable text]_",
      "",
    ].join("\n");

    await fs.writeFile(mdPath, body, "utf8");
    n++;
    console.log(`Wrote docs/background/campaign-team-positions/${safe}.md (${text.length} chars)`);
  }

  console.log(`\nDone: ${n} files → ${path.relative(repoRoot, outDir)}`);
  console.log("Next: npm run ingest  (requires DATABASE_URL; OPENAI_API_KEY for embeddings)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
