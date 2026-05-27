import fs from "node:fs";
import path from "node:path";
import { loadKimHammerProfileWorkbench } from "../src/lib/opposition/kimHammerProfileWorkbench";

function fileExists(relPath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), relPath));
}

function main() {
  const data = loadKimHammerProfileWorkbench();
  const biographyHasSources = data.biography.records.every((row) => row.sources.length > 0);
  const electionRowsHaveVotesOrMissing = data.electoralHistory.rows.every(
    (row) => row.votes === "MISSING" || typeof row.votes === "object",
  );
  const controversiesHaveSources = data.publicControversies.items.every((row) => row.sources.length > 0);
  const noPrivateHomeAddress = data.biography.records.every(
    (row) => !/\\d+\\s+\\w+\\s+(st|street|ave|avenue|rd|road|dr|drive)/i.test(row.value),
  );
  const noFamilyTargetingLanguage =
    !/target family|family attack|spouse attack|children attack/i.test(JSON.stringify(data));
  const churchDetailsNeutralSourced = data.biography.records
    .filter((row) => row.field.toLowerCase().includes("ministry") || row.value.toLowerCase().includes("church"))
    .every((row) => row.sources.length > 0 && !/attack|extremist|radical/i.test(row.value));
  const interpretationLabeled = data.biography.records.some((row) => row.evidenceStatus === "INTERPRETATION");
  const mediaItemsHaveUrls = data.mediaFootprint.channels.every((row) => row.url.startsWith("http"));
  const requiredRoutesPresent =
    fileExists("src/app/admin/(board)/intelligence/kim-hammer/profile/page.tsx") &&
    fileExists("src/app/admin/(board)/intelligence/kim-hammer/electoral-history/page.tsx") &&
    fileExists("src/app/admin/(board)/intelligence/kim-hammer/media-footprint/page.tsx") &&
    fileExists("src/app/admin/(board)/intelligence/kim-hammer/public-timeline/page.tsx") &&
    fileExists("src/app/admin/(board)/intelligence/kim-hammer/public-controversies/page.tsx") &&
    fileExists("src/app/admin/(board)/intelligence/kim-hammer/contrast-vs-kelly/page.tsx");

  console.log("Kim Hammer profile research checks");
  console.log("  biography has sources:", biographyHasSources);
  console.log("  election rows have vote totals or MISSING:", electionRowsHaveVotesOrMissing);
  console.log("  each controversy has at least one source:", controversiesHaveSources);
  console.log("  no private home address stored:", noPrivateHomeAddress);
  console.log("  no family targeting language:", noFamilyTargetingLanguage);
  console.log("  church/ministry details sourced and neutral:", churchDetailsNeutralSourced);
  console.log("  interpretation is labeled:", interpretationLabeled);
  console.log("  media footprint items have URLs:", mediaItemsHaveUrls);
  console.log("  dashboard route data files present:", requiredRoutesPresent);

  const ok =
    biographyHasSources &&
    electionRowsHaveVotesOrMissing &&
    controversiesHaveSources &&
    noPrivateHomeAddress &&
    noFamilyTargetingLanguage &&
    churchDetailsNeutralSourced &&
    interpretationLabeled &&
    mediaItemsHaveUrls &&
    requiredRoutesPresent;

  if (!ok) process.exit(1);
  console.log("OK — Kim Hammer profile research checks passed");
}

main();

