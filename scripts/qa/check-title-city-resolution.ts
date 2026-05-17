import { checkTitleCityResolution } from "../../src/lib/travel-ledger/ai/trip-resolution-autopilot/run-trip-resolution-autopilot";

const cases: Array<[string, string]> = [
  ["Prescott Rotary Lunch", "Prescott"],
  ["Elaine Williams House Party - Prescott", "Prescott"],
  ["Greene County Dems - Paragould", "Paragould"],
  ["Pulaski County Democrats", "Little Rock"],
  ["Arkadelphia House Parties", "Arkadelphia"],
  ["Fayetteville Campus Event", "Fayetteville"],
  ["Jonesboro Meeting", "Jonesboro"],
  ["Benton Saline County Democrats", "Benton"],
  ["Conway Faulkner County Meeting", "Conway"],
  ["Sherwood Community Event", "Sherwood"],
];

let failed = 0;
for (const [title, expected] of cases) {
  const actual = checkTitleCityResolution(title);
  if (actual !== expected) {
    failed += 1;
    console.error(`FAIL ${title}: expected ${expected}, got ${actual ?? "none"}`);
  }
}

if (failed > 0) {
  process.exit(1);
}

console.log(`qa:title-city OK (${cases.length} cases)`);

