import fs from "node:fs";
import path from "node:path";
import { composeIntelligenceCommandCenter } from "@/lib/intelligence/commandCenter/intelligenceCommandCenter";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const REQUIRED = [
  "src/lib/intelligence/commandCenter/intelligenceCommandCenter.ts",
  "src/lib/intelligence/commandCenter/types.ts",
  "src/app/admin/(board)/intelligence/command-center/page.tsx",
  "src/app/admin/(board)/intelligence/command-center/CommandCenterDashboard.tsx",
];

function main() {
  const cwd = process.cwd();
  for (const rel of REQUIRED) {
    assert(fs.existsSync(path.join(cwd, rel)), `Missing NSI-16 artifact: ${rel}`);
  }

  const exportReadyBefore = loadKimHammerEvidenceIndex().metrics.exportReadyClaims;

  console.log("Composing command center snapshot (may include cached NSI-14/15)...");
  const snapshot = composeIntelligenceCommandCenter();

  assert(snapshot.governanceBanner.length >= 3, "Governance banner required.");
  assert(snapshot.readinessCards.length >= 5, "Readiness cards required.");
  assert(snapshot.changeSignals.length > 0, "Change signals required.");
  assert(snapshot.actionQueue.totalActions >= 0, "Action queue summary required.");
  assert(snapshot.evidence.totalClaims > 0, "Evidence metrics required.");
  assert(snapshot.scenarioWatch.totalScenarios > 0, "Scenario watch required.");
  assert(snapshot.warRoom.opponentStatus.length > 10, "War room strip required.");
  assert(snapshot.weeklyPacket.status === "placeholder", "Weekly packet must stay placeholder.");
  assert(snapshot.institutionalMemory.href === "/admin/intelligence/memory", "NSI-17 memory strip required.");
  assert(
    snapshot.leadershipFocus.length > 0 && snapshot.kellyFocus.length > 0,
    "Leadership focus sections required.",
  );

  const exportReadyAfter = loadKimHammerEvidenceIndex().metrics.exportReadyClaims;
  assert(
    exportReadyBefore === exportReadyAfter,
    `Export-ready count must not change: ${exportReadyBefore} vs ${exportReadyAfter}`,
  );

  console.log("NSI-16 operations command center: OK");
  console.log(`  readiness overall: ${snapshot.readinessCards.find((c) => c.id === "overall")?.score}%`);
  console.log(`  actions tracked: ${snapshot.actionQueue.totalActions}`);
  console.log(`  export-ready claims: ${exportReadyAfter}`);
}

main();
