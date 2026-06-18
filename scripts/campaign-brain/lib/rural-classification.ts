/**
 * Rural strategy overlay — push routing toward stated rural-heavy campaign path.
 */

import { ARKANSAS_TOP_75_CITIES } from "../../strategic-plan/data/arkansas-top-40-cities";

export type RuralClass = "urban" | "mixed" | "rural";

export const RURAL_MULTIPLIER: Record<RuralClass, number> = {
  urban: 1.0,
  mixed: 1.15,
  rural: 1.3,
};

const URBAN_CORE = new Set(["Pulaski", "Benton", "Washington"]);

const top75Counties = new Set(ARKANSAS_TOP_75_CITIES.map((c) => c.county));

export function classifyCounty(county: string, population2020: number): RuralClass {
  if (population2020 >= 100_000 || URBAN_CORE.has(county)) return "urban";
  if (population2020 >= 25_000 || top75Counties.has(county)) return "mixed";
  return "rural";
}

export function ruralBonusPoints(
  ruralClass: RuralClass,
  eventType: string,
  title: string,
): number {
  let bonus = 0;
  if (ruralClass === "rural") bonus += 8;
  if (eventType === "county_fair") bonus += 8;
  if (eventType === "festival" || title.toLowerCase().includes("festival")) bonus += 5;
  if (ruralClass === "rural" || ruralClass === "mixed") bonus += 3; // small-town / community tilt
  return Math.min(20, bonus);
}
