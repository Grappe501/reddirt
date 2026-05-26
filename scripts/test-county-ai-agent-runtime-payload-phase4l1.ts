/**
 * Phase 4L.1 checks with 4N runtime extensions.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { buildCountyAgentRuntimePayload } from "../src/lib/agents/county-intelligence/countyAgentRuntimePayloadBuilder";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

async function main() {
  const payload = await buildCountyAgentRuntimePayload();
  const countyCountOk = payload.countyPayloads.length === 75;

  const hasSchemaBlockers = payload.countyPayloads.every(
    (c) => c.voterWarehouseBlockerStatus.blocked && c.voterWarehouseBlockerStatus.blockerCount > 0,
  );

  const hasBlockedLandingSections = payload.countyPayloads.some(
    (c) => c.landingPageReadiness.blockedSections.length > 0,
  );

  const hasMemoryInPayload = payload.countyPayloads.every((c) =>
    ["PRESENT", "MISSING", "NEEDS_REVIEW"].includes(c.institutionalMemory.status),
  );

  const noAutomationEnabled = payload.statewideDashboard.rows.every((r) => r.automationGate === "NO");
  const noStrategyEnabled = payload.statewideDashboard.rows.every((r) => r.strategyGate === "NO");
  const noContactListPermission = payload.countyPayloads.every((c) =>
    c.forbiddenActions.some((f) => f.toLowerCase().includes("contact")),
  );

  const registriesLoad = payload.meta.countyCount === 75;

  console.log("Phase 4L.1 runtime payload checks");
  console.log("  registries load:", registriesLoad);
  console.log("  runtime payload county count:", payload.countyPayloads.length);
  console.log("  schema blockers in payload:", hasSchemaBlockers);
  console.log("  landing blocked sections explicit:", hasBlockedLandingSections);
  console.log("  memory status in payload:", hasMemoryInPayload);
  console.log("  automation gate disabled:", noAutomationEnabled);
  console.log("  strategy gate disabled:", noStrategyEnabled);
  console.log("  contact-list permission disabled:", noContactListPermission);

  const ok =
    registriesLoad &&
    countyCountOk &&
    hasSchemaBlockers &&
    hasBlockedLandingSections &&
    hasMemoryInPayload &&
    noAutomationEnabled &&
    noStrategyEnabled &&
    noContactListPermission;

  if (!ok) process.exit(1);
  console.log("OK — Phase 4L.1 county AI runtime payload checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

