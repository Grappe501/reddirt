/**
 * Phase 4N checks:
 * - all 75 counties get memory readiness rows
 * - memory tools are registered
 * - relationship graph loads
 * - missing data stays MISSING/NEEDS_REVIEW
 * - County Workbench tab content is aggregate-safe
 * - orchestration registry includes 4N
 * - no automation/strategy/contact-list permission is enabled
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { buildCountyAgentRuntimePayload } from "../src/lib/agents/county-intelligence/countyAgentRuntimePayloadBuilder";
import { ARKANSAS_COUNTY_REGISTRY } from "../src/lib/county/arkansas-county-registry";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

function readJson<T = Record<string, unknown>>(rel: string): T {
  const abs = path.join(process.cwd(), rel);
  return JSON.parse(fs.readFileSync(abs, "utf8")) as T;
}

async function main() {
  const readiness = readJson<{
    countyCount: number;
    rows: Array<{ countySlug: string; memoryTimeline: string; eventOutcomes: string; relationshipGraph: string }>;
  }>("data/audit/county-memory-readiness-table.json");
  const graph = readJson<{ edges: unknown[] }>("data/county-memory/county-relationship-graph.json");
  const orchestration = readJson<{
    toolGroups?: Record<string, string[]>;
    phase?: string;
    executionPolicy?: { automationEnabled?: boolean };
    cannot?: string[];
  }>("data/campaign-events/county-intelligence-copilot-orchestration.json");
  const runtime = await buildCountyAgentRuntimePayload();

  const has75Rows = readiness.countyCount === 75 && readiness.rows.length === 75;
  const allRegistryCountiesCovered = ARKANSAS_COUNTY_REGISTRY.every((county) =>
    readiness.rows.some((row) => row.countySlug === county.slug),
  );
  const memoryTools = orchestration.toolGroups?.countyInstitutionalMemory ?? [];
  const memoryToolsRegistered = memoryTools.length === 10;
  const graphLoads = Array.isArray(graph.edges);
  const missingDataProtected = readiness.rows.every(
    (row) =>
      ["PRESENT", "MISSING", "NEEDS_REVIEW"].includes(row.memoryTimeline) &&
      ["PRESENT", "MISSING", "NEEDS_REVIEW"].includes(row.eventOutcomes) &&
      ["PRESENT", "MISSING", "NEEDS_REVIEW"].includes(row.relationshipGraph),
  );
  const runtimeHasInstitutionalMemory = runtime.countyPayloads.every((county) =>
    ["PRESENT", "MISSING", "NEEDS_REVIEW"].includes(county.institutionalMemory.status),
  );
  const noSensitiveRowsInRuntime = runtime.countyPayloads.every(
    (county) =>
      !county.nextBestDataActions.some((action) => /address|phone|email|voter id|contact list/i.test(action)),
  );
  const orchestrationIncludes4N = ["4N", "4O", "4P", "4Q"].includes(String(orchestration.phase ?? ""));
  const noUnsafePermissions =
    orchestration.executionPolicy?.automationEnabled === false &&
    (orchestration.cannot ?? []).some((x) => x.includes("generate contact lists")) &&
    runtime.statewideDashboard.rows.every((row) => row.automationGate === "NO") &&
    runtime.statewideDashboard.rows.every((row) => row.strategyGate === "NO");

  console.log("Phase 4N institutional memory checks");
  console.log("  readiness rows = 75:", has75Rows);
  console.log("  all registry counties covered:", allRegistryCountiesCovered);
  console.log("  memory tools registered:", memoryToolsRegistered);
  console.log("  relationship graph loads:", graphLoads);
  console.log("  missing data stays guarded:", missingDataProtected);
  console.log("  runtime includes institutional memory:", runtimeHasInstitutionalMemory);
  console.log("  runtime remains aggregate-safe:", noSensitiveRowsInRuntime);
  console.log("  orchestration includes 4N:", orchestrationIncludes4N);
  console.log("  automation/strategy/contact-list permissions disabled:", noUnsafePermissions);

  const ok =
    has75Rows &&
    allRegistryCountiesCovered &&
    memoryToolsRegistered &&
    graphLoads &&
    missingDataProtected &&
    runtimeHasInstitutionalMemory &&
    noSensitiveRowsInRuntime &&
    orchestrationIncludes4N &&
    noUnsafePermissions;

  if (!ok) process.exit(1);
  console.log("OK — Phase 4N institutional memory checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

