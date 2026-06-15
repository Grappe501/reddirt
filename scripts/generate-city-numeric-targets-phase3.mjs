/**
 * Phase 3 — locked numeric targets from Lane budget (chapter-05 county allocation)
 * and Power of 5 / Sherwood ops. Run: node scripts/generate-city-numeric-targets-phase3.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const snapshot = JSON.parse(
  fs.readFileSync(path.join(root, "data/election-plan/election-plan-workbench.snapshot.json"), "utf8"),
);
const sherwoodOps = JSON.parse(
  fs.readFileSync(path.join(root, "data/campaign-brain/win-sherwood-operation.json"), "utf8"),
);
const chapter05 = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "docs/strategic-plan/plurality-victory-plan/part-ii-electoral-math/chapter-05-fifty-thousand-new-voter-plan/statewide-registration-summary.json",
    ),
    "utf8",
  ),
);

const countyByName = new Map(snapshot.counties.map((c) => [c.county.toLowerCase(), c]));
const citiesByCounty = new Map();
for (const city of snapshot.cities) {
  const key = city.county.toLowerCase();
  if (!citiesByCounty.has(key)) citiesByCounty.set(key, []);
  citiesByCounty.get(key).push(city);
}

function chapter05Source(countyName) {
  const row = chapter05.top10ByGoal?.find((r) => r.county.toLowerCase() === countyName.toLowerCase());
  if (row) return row.source;
  const county = countyByName.get(countyName.toLowerCase());
  return county ? "election_plan_county_registration_goal" : "unknown";
}

function allocateRegistration(city, county) {
  const siblings = citiesByCounty.get(city.county.toLowerCase()) ?? [city];
  const totalVotes = siblings.reduce((s, c) => s + c.targetVotes, 0);
  const share = totalVotes > 0 ? city.targetVotes / totalVotes : 1;
  const newRegistrations = Math.max(50, Math.round(county.registrationGoal * share));
  const registrationChecks = Math.round(newRegistrations * 1.4);
  return {
    newRegistrations,
    registrationChecks,
    countySharePct: Math.round(share * 1000) / 10,
    countyRegistrationGoal: county.registrationGoal,
    chapter05Source: chapter05Source(city.county),
  };
}

function powerOf5Targets(city) {
  const hosts = Math.max(4, Math.round(city.targetVotes / 500));
  const powerOf5Circles = hosts;
  const conversationsTarget = hosts * 5;
  return { hosts, powerOf5Circles, conversationsTarget };
}

function volunteerTargets(city) {
  if (city.isTop10) {
    return {
      activeVolunteers: Math.round(city.targetVotes / 200),
      captains: Math.max(8, Math.round(city.targetVotes / 800)),
    };
  }
  return {
    activeVolunteers: Math.max(15, Math.round(city.targetVotes / 150)),
    captains: Math.max(3, Math.round(city.targetVotes / 600)),
  };
}

function sherwoodTargets(city, county) {
  const base = allocateRegistration(city, county);
  return {
    locked: true,
    source: "win-sherwood-operation.json + chapter-05",
    registration: {
      newRegistrations: 150,
      registrationChecks: 500,
      countySharePct: base.countySharePct,
      countyRegistrationGoal: county.registrationGoal,
      chapter05Source: base.chapter05Source,
    },
    houseParties: {
      hosts: sherwoodOps.hostTier.goal,
      activeHosts: 20,
      powerOf5Circles: 20,
      conversationsTarget: 100,
      vipTables: sherwoodOps.tracking.vipTablesGoal,
    },
    volunteers: {
      activeVolunteers: 25,
      captains: 10,
      currentSignups: sherwoodOps.tracking.volunteerSignups,
    },
    votes: { target: city.targetVotes, gainNeeded: city.voteGain },
  };
}

function standardTargets(city, county) {
  const reg = allocateRegistration(city, county);
  const hp = powerOf5Targets(city);
  const vol = volunteerTargets(city);
  return {
    locked: true,
    source: "chapter-05 county allocation + Power of 5 formulas",
    registration: reg,
    houseParties: {
      hosts: hp.hosts,
      activeHosts: Math.max(4, Math.round(hp.hosts * 0.6)),
      powerOf5Circles: hp.powerOf5Circles,
      conversationsTarget: hp.conversationsTarget,
      vipTables: null,
    },
    volunteers: vol,
    votes: { target: city.targetVotes, gainNeeded: city.voteGain },
  };
}

const targets = {};
for (const city of snapshot.cities) {
  const county = countyByName.get(city.county.toLowerCase());
  if (!county) continue;
  targets[city.slug] = city.slug === "sherwood" ? sherwoodTargets(city, county) : standardTargets(city, county);
}

const out = {
  version: 1,
  note: "Locked numeric targets for priority city location briefs. Registration allocated from county registrationGoal (chapter-05 Lane 3). House party / volunteer math from Power of 5; Sherwood from win-sherwood-operation.json.",
  generatedAt: new Date().toISOString(),
  statewideRegistrationGoal: chapter05.statewideGoal,
  targets,
};

fs.writeFileSync(
  path.join(root, "data/campaign-brain/city-location-numeric-targets.source.json"),
  JSON.stringify(out, null, 2) + "\n",
);
console.log("Wrote", Object.keys(targets).length, "city numeric target sets");
