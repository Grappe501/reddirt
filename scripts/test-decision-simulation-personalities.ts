import { readFileSync } from "node:fs";
import {
  chrisJonesPersonality,
  frenchHillPersonality,
  listBuiltInPersonalities,
  resolvePersonality,
} from "../src/lib/agents/decision-simulation/personality-catalog";

function assert(ok: boolean, label: string) {
  console.log(`  ${ok ? "PASS" : "FAIL"} — ${label}`);
  if (!ok) throw new Error(label);
}

console.log("Decision Simulator personality research gates");

const catalog = listBuiltInPersonalities();
assert(catalog.some((item) => item.id === "chris-jones-ar02"), "Jones is in the catalog");
assert(catalog.some((item) => item.id === "french-hill-ar02"), "Hill is in the catalog");
assert(resolvePersonality("missing").badge === "HYPOTHESIS MODEL", "unknown ids fall back to hypothesis model");

assert(chrisJonesPersonality.sources.length >= 3, "Jones has multiple public sources");
assert(frenchHillPersonality.sources.length >= 3, "Hill has multiple public sources");
assert(chrisJonesPersonality.badge === "RESEARCH MODEL", "Jones is a research model, not a invented voice");
assert(frenchHillPersonality.badge === "RESEARCH MODEL", "Hill is a research model, not a invented voice");

const forbidden = ["radical far", "wish list can rewrite reality", "what he really thinks", "secret motive"];
const blob = `${JSON.stringify(chrisJonesPersonality)}${JSON.stringify(frenchHillPersonality)}`.toLowerCase();
assert(forbidden.every((item) => !blob.includes(item)), "no unsourced campaign-arm characterizations");

assert(
  chrisJonesPersonality.model.preferredFrames.every((frame) => frame.sourceState),
  "Jones frames are source-classified",
);
assert(
  frenchHillPersonality.model.preferredFrames.some((frame) => frame.sourceState === "OBSERVED"),
  "Hill has observed frames from the public record",
);
assert(
  chrisJonesPersonality.model.attackLanes.every((lane) => lane.sourceState !== "OBSERVED" || Boolean(lane.notes)),
  "Jones attack lanes are not presented as observed psychology",
);

const research = readFileSync("develop_notes/decision-simulation/DEC_SIM_PERSONALITY_RESEARCH_JONES_HILL_1_0.md", "utf8");
assert(research.includes("hill.house.gov/biography"), "research note cites official Hill biography");
assert(research.includes("chrisjonesforcongress.com"), "research note cites Jones campaign site");
assert(research.includes("Research completed before"), "research preceded voice weights");

console.log("OK — personality research gates passed");
