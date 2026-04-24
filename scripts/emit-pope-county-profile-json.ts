/**
 * @deprecated Prefer **`npm run emit:pope-county-intel`** (COUNTY-INTEL-2: full static + merged JSON + nav).
 * Run: npx tsx scripts/emit-pope-county-profile-json.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildPopeCountyPoliticalProfile } from "../src/lib/campaign-engine/county-profiles/pope-county";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

async function main() {
  const profile = await buildPopeCountyPoliticalProfile();

  const fileSupplement = {
    primaryTurnoutComparison: {
      source: "campaign information for ingestion/electionResults (host path)",
      pope2024Primary: { file: "2024_Primary.json", votesCast: 8084, registeredVoters: 33510, votePercent: 24.12 },
      pope2026PreferentialPrimary: {
        file: "2026_Preferential_Primary.json",
        locationId: "05115",
        totalBallotsCast: 8783,
        registeredVoters: 34738,
        votePercent: 25.28,
      },
      state2026Primary: { registeredVoters: 1811267, totalBallotsCast: 434036, votePercent: 23.96 },
      trend:
        "Pope 2026 preferential primary rate (25.28% of registered) exceeds 2024 primary (24.12%) in these files and the statewide 2026 rate (23.96%) — a county-level primary turnout lift. This does not, by itself, name candidate coalitions; contest text in the raw JSON is ID-based without candidate labels in the sample checked.",
      confidence: "verified" as const,
    },
    generalAnchorForSosPlanning: {
      file: "2024_General.json",
      pope: { votesCast: 24323, registeredVoters: 35133, votePercent: 69.23 },
      note: "For November / statewide SOS, prefer certified 2026 general or polling when available — 2024 general is an historical planning anchor for math literacy only.",
    },
    runoff2026: { inCanonicalElectionFolder: false, note: "No 2026 runoff in the canonical 13 JSON set; add and ingest if it exists for your cycle." },
    fieldAssessmentNotInData: {
      threeWayLibertarian:
        "Claims about a strong third candidate or GOP members urging a Libertarian vote require citable public reporting or documented communications — not derived from the election title JSON in repo.",
    },
  };

  const siteSearch = {
    entries: [
      { href: "index.html", title: "Landing", keywords: "pope profile kelly grappe" },
      { href: "pages/path-to-victory.html", title: "Path to victory", keywords: "votes win turnout" },
      { href: "pages/election-trends.html", title: "Election trends", keywords: "primary 2026 2024" },
      { href: "pages/precincts.html", title: "Precincts", keywords: "geography votes" },
      { href: "pages/plurality.html", title: "Plurality", keywords: "libertarian three way" },
      { href: "pages/hammer-record.html", title: "Hammer record", keywords: "bills sos" },
      { href: "pages/get-involved.html", title: "Get involved", keywords: "volunteer kellygrappe" },
      { href: "pages/campaign-plan.html", title: "Campaign plan", keywords: "relational power of five engine" },
      { href: "pages/sources.html", title: "Sources", keywords: "verification" },
    ],
  };
  const out = { ...profile, fileSupplement, siteSearch };
  const outPath = join(__dirname, "../../dist-county-briefings/pope/data/pope-county-profile.json");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
  console.log("Wrote", outPath);
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
