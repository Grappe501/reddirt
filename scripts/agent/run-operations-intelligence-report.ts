import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/agent/operations-intelligence-report-latest.json");

function readJson<T>(rel: string): T | null {
  const file = path.join(ROOT, rel);
  if (!existsSync(file)) return null;
  try { return JSON.parse(readFileSync(file, "utf8")) as T; } catch { return null; }
}

function sum<T>(rows: T[], pick: (row: T) => number | null | undefined): number {
  return rows.reduce((acc, row) => acc + Number(pick(row) ?? 0), 0);
}

async function main() {
  const generatedAt = new Date().toISOString();
  const win = readJson<{ statewide?: Record<string, unknown>; counties?: Array<Record<string, unknown>> }>("data/election/kelly-win-target-scenario-v1.json");
  const gotv = readJson<{ statewideGoal?: number; counties?: Array<Record<string, unknown>> }>("data/field-ops/gotv-commitment-allocation-v1.json");
  const capacity = readJson<{ counties?: Array<Record<string, unknown>> }>("data/field-ops/volunteer-capacity-model-v1.json");
  const priorities = readJson<Array<Record<string, unknown>>>("data/calendar-command-center/county-priority-snapshot.json");
  const coverage = readJson<{ stats?: Record<string, number>; plans?: Array<Record<string, unknown>> }>("data/calendar-command-center/event-coverage-plans.staged.json");

  const gotvCounties = gotv?.counties ?? [];
  const capacityCounties = capacity?.counties ?? [];
  const priorityRows = Array.isArray(priorities) ? priorities : [];
  const report = {
    generatedAt,
    statewideTargetContext: win?.statewide ?? null,
    statewideGotvCommitmentGoal: Number(gotv?.statewideGoal ?? 5000),
    totalCommitmentGap: sum(gotvCounties, (c) => Number(c.commitmentGap ?? c.remainingCommitments ?? 0)),
    totalHousePartyGoal: sum(gotvCounties, (c) => Number(c.housePartyGoal ?? c.housePartiesNeeded ?? 0)),
    totalPhoneBankCapacityHours: sum(capacityCounties, (c) => Number(c.phoneBankCapacityHours ?? 0)),
    totalPostcardCapacity: sum(capacityCounties, (c) => Number(c.postcardCapacity ?? c.postcardCapacityTotal ?? 0)),
    totalVolunteerCapacityNeed: sum(capacityCounties, (c) => Number(c.eventStaffingNeed ?? c.volunteerNeed ?? 0)),
    countiesNeedingLocalGuides: capacityCounties.filter((c) => Boolean(c.localGuideGap) || Number(c.localGuideNeed ?? 0) > 0).length,
    countiesNeedingAccessSupport: capacityCounties.filter((c) => Boolean(c.accessSupportNeeded) || Boolean(c.communityAccessSupportNeeded)).length,
    coverageCapacityGaps: {
      eventsNeedingLocalCoverage: coverage?.stats?.needsLocalCoverage ?? 0,
      eventsNeedingVolunteerLead: coverage?.stats?.needsVolunteerLead ?? 0,
      eventsNeedingTablePermission: coverage?.stats?.needsTablePermission ?? 0,
    },
    topCountiesNeedingStaffAction: [...capacityCounties, ...priorityRows]
      .map((c) => ({
        county: String(c.county ?? c.name ?? "Unknown"),
        localGuideGap: Boolean(c.localGuideGap) || Number(c.localGuideNeed ?? 0) > 0,
        accessSupportNeeded: Boolean(c.accessSupportNeeded) || Boolean(c.communityAccessSupportNeeded),
        eventStaffingNeed: Number(c.eventStaffingNeed ?? c.volunteerNeed ?? 0),
        priority: Number(c.priorityScore ?? c.score ?? 0),
      }))
      .sort((a, b) => Number(b.localGuideGap) - Number(a.localGuideGap) || b.eventStaffingNeed - a.eventStaffingNeed || b.priority - a.priority)
      .slice(0, 15),
  };
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
