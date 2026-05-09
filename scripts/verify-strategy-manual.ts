/**
 * Ensures every manifest manual file exists, chunking succeeds, internal .md links resolve, and content depth looks sane.
 * Run: npm run strategy-manual:verify
 */
import { existsSync } from "fs";
import path from "path";
import { listCampaignSystemMarkdownRelativePaths } from "../src/lib/campaign-strategy/campaign-system-md-discovery";
import { STRATEGY_MD_ENTRIES, STRATEGY_MANUAL_DIR, CAMPAIGN_SYSTEM_MANUAL_DIR } from "../src/lib/campaign-strategy/md-manifest";
import { loadAllStrategyManualChunks, type StrategyManualChunk } from "../src/lib/campaign-strategy/strategy-chunking";
import { auditManualContentDepth, verifyManualInternalMdLinks } from "../src/lib/campaign-strategy/verify-manual-links";

const root = process.cwd();

let missing = 0;
for (const e of STRATEGY_MD_ENTRIES) {
  const fp = path.join(root, STRATEGY_MANUAL_DIR, e.file);
  if (!existsSync(fp)) {
    console.error(`MISSING: path=${e.path || "(overview)"} file=${e.file}`);
    missing += 1;
  }
}
if (missing) {
  console.error(`strategy-manual:verify FAILED — ${missing} missing file(s)`);
  process.exit(1);
}

const manualAbs = path.join(root, STRATEGY_MANUAL_DIR);
const linkReport = verifyManualInternalMdLinks(manualAbs);
if (!linkReport.ok) {
  console.error("strategy-manual:verify FAILED — broken internal .md links:");
  for (const err of linkReport.errors) {
    console.error(`  • ${err}`);
  }
  process.exit(1);
}

const depth = auditManualContentDepth(manualAbs);
if (depth.warnings.length) {
  // eslint-disable-next-line no-console
  console.log("strategy-manual: content audit warnings (non-fatal):");
  for (const w of depth.warnings) {
    // eslint-disable-next-line no-console
    console.log(`  • ${w}`);
  }
}

async function main(): Promise<void> {
  const chunks = await loadAllStrategyManualChunks();
  const csAbs = path.join(root, CAMPAIGN_SYSTEM_MANUAL_DIR);
  const csFiles = existsSync(csAbs) ? await listCampaignSystemMarkdownRelativePaths() : [];

  const byPath = new Map<string, number>();
  for (const c of chunks) {
    byPath.set(c.pathKey, (byPath.get(c.pathKey) ?? 0) + 1);
  }

  const chunkCountBySource = new Map<string, number>();
  function noteSources(list: StrategyManualChunk[]): void {
    for (const c of list) {
      chunkCountBySource.set(c.sourceFile, (chunkCountBySource.get(c.sourceFile) ?? 0) + 1);
    }
  }
  noteSources(chunks);

  // eslint-disable-next-line no-console
  console.log("strategy-manual:verify OK");
  // eslint-disable-next-line no-console
  console.log(`  internal .md links: OK (${manualAbs})`);
  // eslint-disable-next-line no-console
  console.log(`  Kelly SOS manifest chapters: ${STRATEGY_MD_ENTRIES.length}`);
  // eslint-disable-next-line no-console
  console.log(
    `  campaign-system-manual markdown files: ${csFiles.length}${existsSync(csAbs) ? "" : " (folder missing — skipped)"}`,
  );
  // eslint-disable-next-line no-console
  console.log(`  total chunks (H2/H3 boundaries): ${chunks.length}`);
  for (const e of STRATEGY_MD_ENTRIES) {
    const k = e.path;
    const n = byPath.get(k) ?? 0;
    if (n === 0) {
      console.error(`WARNING: zero chunks for ${e.file} — check markdown has body`);
      process.exit(1);
    }
    // eslint-disable-next-line no-console
    console.log(`  ${k || "(overview)"}: ${n}`);
  }

  if (csFiles.length) {
    let missingCs = 0;
    for (const rel of csFiles) {
      const key = path.posix.join(CAMPAIGN_SYSTEM_MANUAL_DIR, rel.replace(/\\/g, "/"));
      const n = chunkCountBySource.get(key) ?? 0;
      if (n === 0) {
        console.error(`MISSING CHUNKS for campaign-system file: ${key}`);
        missingCs += 1;
      }
    }
    if (missingCs) {
      console.error(`strategy-manual:verify FAILED — ${missingCs} campaign-system file(s) produced zero chunks`);
      process.exit(1);
    }
  }
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
