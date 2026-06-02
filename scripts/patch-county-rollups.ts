import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const profilesDir = path.join(root, "data/county-workbench/compiled-profiles");
const briefsDir = path.join(root, "data/county-workbench/briefs");

const profileRollup = JSON.parse(readFileSync(path.join(profilesDir, "_rollup.json"), "utf8"));
const briefRollup = JSON.parse(readFileSync(path.join(briefsDir, "_rollup.json"), "utf8"));

profileRollup.countyIndex = readdirSync(profilesDir)
  .filter((f) => f.endsWith(".json") && f !== "_rollup.json")
  .map((f) => {
    const p = JSON.parse(readFileSync(path.join(profilesDir, f), "utf8"));
    return {
      countySlug: p.countySlug,
      countyName: p.countyName,
      score: p.readinessScore,
      status: p.profileStatus,
    };
  })
  .sort((a, b) => a.countySlug.localeCompare(b.countySlug));

briefRollup.countyIndex = readdirSync(briefsDir)
  .filter((f) => f.endsWith(".json") && f !== "_rollup.json")
  .map((f) => {
    const b = JSON.parse(readFileSync(path.join(briefsDir, f), "utf8"));
    return {
      countySlug: b.countySlug,
      countyName: b.countyName,
      readinessScore: b.readinessScore,
      briefGenerated: true,
      shellBrief: (b.whatWeKnow?.length ?? 0) <= 3,
    };
  })
  .sort((a, b) => a.countySlug.localeCompare(b.countySlug));

writeFileSync(path.join(profilesDir, "_rollup.json"), `${JSON.stringify(profileRollup, null, 2)}\n`);
writeFileSync(path.join(briefsDir, "_rollup.json"), `${JSON.stringify(briefRollup, null, 2)}\n`);

console.log("countyIndex added:", profileRollup.countyIndex.length, briefRollup.countyIndex.length);
