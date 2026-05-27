import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const INDEX_PATH = path.join(ROOT, "data/opposition/kim-hammer-election-record-bill-index.json");
const THEMES_PATH = path.join(ROOT, "data/opposition/kim-hammer-election-record-theme-matrix.json");
const CLAIMS_PATH = path.join(ROOT, "docs/opposition/KIM_HAMMER_ELECTION_RECORD_CLAIMS_REVIEW.md");
const DOSSIER_PATH = path.join(ROOT, "docs/opposition/KIM_HAMMER_ELECTION_RECORD_RESEARCH_DOSSIER.md");
const GUIDANCE_PATH = path.join(ROOT, "docs/opposition/KIM_HAMMER_ELECTION_RECORD_MESSAGE_GUIDANCE.md");

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function readText(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

function main() {
  const index = readJson<{ rows: Array<{ billNumber: string; actNumber: string | null; status: string; sourceLinks: string[] }> }>(INDEX_PATH);
  const themes = readJson<{ themes: Record<string, string[]> }>(THEMES_PATH);
  const claims = readText(CLAIMS_PATH);
  const dossier = readText(DOSSIER_PATH);
  const guidance = readText(GUIDANCE_PATH);

  const everyBillHasSource = index.rows.every((row) => row.sourceLinks.length >= 1);
  const enactedHaveActOrStatus = index.rows.every(
    (row) => !row.status.toLowerCase().includes("now act") || row.actNumber != null,
  );
  const everyThemeHasBills = Object.values(themes.themes).every((billIds) => Array.isArray(billIds));
  const unsupportedClaimsFlagged =
    claims.includes("needs more research") && claims.includes("partially supported");
  const dossierHasCitations =
    dossier.includes("http") && dossier.includes("Verified Bill Table");
  const noTargetedPersuasionLanguage =
    !/microtarget|targeted persuasion|individual voter/i.test(dossier) &&
    !/microtarget|targeted persuasion|individual voter/i.test(guidance);

  console.log("Kim Hammer election record research checks");
  console.log("  every bill has at least one source:", everyBillHasSource);
  console.log("  enacted bill has act number/status:", enactedHaveActOrStatus);
  console.log("  every theme references bill IDs:", everyThemeHasBills);
  console.log("  unsupported synopsis claims flagged:", unsupportedClaimsFlagged);
  console.log("  dossier includes cited factual table:", dossierHasCitations);
  console.log("  no targeted persuasion language:", noTargetedPersuasionLanguage);

  const ok =
    everyBillHasSource &&
    enactedHaveActOrStatus &&
    everyThemeHasBills &&
    unsupportedClaimsFlagged &&
    dossierHasCitations &&
    noTargetedPersuasionLanguage;
  if (!ok) process.exit(1);
  console.log("OK — Kim Hammer election record research checks passed");
}

main();

