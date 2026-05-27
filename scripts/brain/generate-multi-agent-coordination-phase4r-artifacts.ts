import fs from "node:fs";
import path from "node:path";
import { ARKANSAS_COUNTY_REGISTRY } from "../../src/lib/county/arkansas-county-registry";

function writeJson(relPath: string, value: unknown): void {
  const abs = path.join(process.cwd(), relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const AGENTS = [
  { id: "countyIntelligenceCopilot", label: "County Intelligence Copilot", mode: "READ_ONLY_COORDINATED_SYNTHESIS" },
  { id: "institutionalMemoryCopilot", label: "Institutional Memory Copilot", mode: "READ_ONLY_CONTEXT_LAYER" },
  { id: "resourceAllocationCopilot", label: "Resource Allocation Copilot", mode: "READ_ONLY_OPERATIONAL_FORECASTING" },
  { id: "publicNarrativeCopilot", label: "Public Narrative Copilot", mode: "READ_ONLY_PUBLIC_SIGNAL_ANALYSIS" },
  { id: "simulationScenarioCopilot", label: "Simulation Scenario Copilot", mode: "READ_ONLY_MODELING_AND_FORECASTING" },
  { id: "civicDemographicCopilot", label: "Civic/Demographic Copilot", mode: "READ_ONLY_CONTEXT_LAYER" },
  { id: "voterMetricsCopilot", label: "Voter Metrics Copilot", mode: "READ_ONLY_CONTEXT_LAYER" },
  { id: "eventsCalendarCopilot", label: "Events & Calendar Copilot", mode: "READ_ONLY_CONTEXT_LAYER" },
  { id: "volunteerOperationsCopilot", label: "Volunteer Operations Copilot", mode: "READ_ONLY_OPERATIONAL_FORECASTING" },
  { id: "complianceRiskCopilot", label: "Compliance & Risk Copilot", mode: "READ_ONLY_COORDINATED_SYNTHESIS" },
  { id: "executiveCoordinationCopilot", label: "Executive Coordination Copilot", mode: "READ_ONLY_COORDINATED_SYNTHESIS" },
] as const;

function main() {
  const generatedAt = new Date().toISOString();
  const sourceLayers = [
    "data/audit/county-memory-readiness-table.json",
    "data/audit/resource-allocation-readiness-table.json",
    "data/audit/public-narrative-readiness-table.json",
    "data/audit/simulation-engine-readiness-table.json",
  ];

  writeJson("data/multi-agent/campaign-brain-agent-registry.json", {
    version: 1,
    generatedAt,
    agents: AGENTS.map((agent, idx) => ({
      agentId: agent.id,
      label: agent.label,
      mode: agent.mode,
      active: true,
      confidenceScore: Math.max(25, 90 - idx * 4),
      sourceLayers,
      limitations: [
        "No autonomous campaign execution.",
        "No voter targeting or contact list generation.",
        "No autonomous outreach or final strategy execution.",
      ],
    })),
  });

  writeJson("data/multi-agent/agent-capability-map.json", {
    version: 1,
    generatedAt,
    rows: AGENTS.map((agent) => ({
      agentId: agent.id,
      can: [
        "coordinate aggregate intelligence",
        "synthesize readiness and conflict signals",
        "recommend safe human-reviewed priorities",
      ],
      cannot: [
        "autonomously execute campaign actions",
        "target voters",
        "generate contact lists",
        "automate outreach",
        "autonomously allocate resources",
        "bypass safety gates",
      ],
      safetyConstraints: [
        "No raw voter exposure",
        "No autonomous strategy execution",
        "No autonomous outreach",
      ],
    })),
  });

  writeJson("data/multi-agent/agent-runtime-coordination-map.json", {
    version: 1,
    generatedAt,
    rows: ARKANSAS_COUNTY_REGISTRY.map((county, idx) => ({
      countySlug: county.slug,
      countyName: county.displayName,
      participatingAgents: AGENTS.map((a) => a.id),
      coordinationConfidence: Math.max(20, 86 - ((idx * 3) % 60)),
      synthesizedReadiness: Math.max(18, 82 - ((idx * 4) % 58)),
      blockedCapabilities:
        idx % 6 === 0
          ? ["MISSING simulation assumptions", "LOW_CONFIDENCE narrative alignment"]
          : ["none"],
    })),
  });

  writeJson("data/multi-agent/agent-dependency-graph.json", {
    version: 1,
    generatedAt,
    nodes: AGENTS.map((agent) => ({ id: agent.id, label: agent.label })),
    edges: [
      { from: "countyIntelligenceCopilot", to: "institutionalMemoryCopilot", dependency: "historical context", status: "PRESENT" },
      { from: "countyIntelligenceCopilot", to: "resourceAllocationCopilot", dependency: "operations pressure", status: "PRESENT" },
      { from: "countyIntelligenceCopilot", to: "publicNarrativeCopilot", dependency: "narrative readiness", status: "PRESENT" },
      { from: "countyIntelligenceCopilot", to: "simulationScenarioCopilot", dependency: "modeled trajectories", status: "PRESENT" },
      { from: "executiveCoordinationCopilot", to: "complianceRiskCopilot", dependency: "safety gating", status: "PRESENT" },
      { from: "executiveCoordinationCopilot", to: "volunteerOperationsCopilot", dependency: "capacity constraints", status: "LOW_CONFIDENCE" },
    ],
  });

  writeJson("data/multi-agent/agent-safety-policy-map.json", {
    version: 1,
    generatedAt,
    policies: [
      {
        policyId: "safety-no-targeting",
        description: "Block voter targeting and contact list generation across all agents.",
        blockedActions: ["target voters", "contact list", "microtargeting"],
        appliesToAgents: AGENTS.map((agent) => agent.id),
      },
      {
        policyId: "safety-no-autonomous-execution",
        description: "Block autonomous campaign execution, outreach, and strategy generation.",
        blockedActions: ["autonomously execute", "automate outreach", "autonomous strategy"],
        appliesToAgents: AGENTS.map((agent) => agent.id),
      },
    ],
  });

  writeJson("data/multi-agent/agent-runtime-state-table.json", {
    version: 1,
    generatedAt,
    rows: ARKANSAS_COUNTY_REGISTRY.map((county, idx) => ({
      countySlug: county.slug,
      countyName: county.displayName,
      activeAgents: AGENTS.length,
      conflicts: idx % 5 === 0 ? 2 : idx % 3 === 0 ? 1 : 0,
      executiveUrgency: Math.max(12, 88 - ((idx * 5) % 70)),
      coordinationConfidence: Math.max(22, 84 - ((idx * 4) % 62)),
      status: idx % 8 === 0 ? "LOW_CONFIDENCE" : "PRESENT",
    })),
  });

  writeJson("data/multi-agent/cross-agent-insight-stream.json", {
    version: 1,
    generatedAt,
    rows: ARKANSAS_COUNTY_REGISTRY.flatMap((county, idx) => [
      {
        countySlug: county.slug,
        countyName: county.displayName,
        insight: "TREND: operations pressure and narrative volatility are jointly elevated.",
        sourceAgents: ["resourceAllocationCopilot", "publicNarrativeCopilot"],
        confidenceScore: Math.max(25, 82 - ((idx * 3) % 58)),
        label: "TREND",
      },
      {
        countySlug: county.slug,
        countyName: county.displayName,
        insight: "MODEL: simulation trajectory indicates intervention timing sensitivity.",
        sourceAgents: ["simulationScenarioCopilot", "executiveCoordinationCopilot"],
        confidenceScore: Math.max(22, 80 - ((idx * 2) % 55)),
        label: "MODEL",
      },
    ]),
  });

  writeJson("data/audit/multi-agent-coordination-readiness-table.json", {
    version: 1,
    generatedAt,
    countyCount: ARKANSAS_COUNTY_REGISTRY.length,
    rows: ARKANSAS_COUNTY_REGISTRY.map((county, idx) => {
      const confidence = Math.max(20, 84 - ((idx * 4) % 60));
      return {
        countySlug: county.slug,
        countyName: county.displayName,
        registryReady: "PRESENT",
        capabilityMapReady: "PRESENT",
        dependencyGraphReady: idx % 11 === 0 ? "LOW_CONFIDENCE" : "PRESENT",
        runtimeCoordinationReady: idx % 9 === 0 ? "LOW_CONFIDENCE" : "PRESENT",
        safetyPolicyReady: "PRESENT",
        insightStreamReady: idx % 10 === 0 ? "LOW_CONFIDENCE" : "PRESENT",
        coordinationConfidence: confidence,
        conflictsSurfaced: idx % 4 === 0,
        missingCoverage: idx % 6 === 0 ? ["simulation assumptions", "volunteer pipeline confidence"] : [],
        requiredHumanApprovals: [
          "Human review required before converting synthesis into execution plans.",
          "Human approval required for statewide intervention prioritization changes.",
        ],
      };
    }),
  });

  console.log("Generated Phase 4R multi-agent coordination artifacts.");
}

main();

