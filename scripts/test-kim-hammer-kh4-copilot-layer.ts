import fs from "node:fs";
import path from "node:path";
import {
  loadKimHammerKh4SuggestionAgents,
} from "@/lib/opposition/kimHammerKh4SuggestionAgents";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relPath), "utf8")) as T;
}

const REQUIRED_SUGGESTION_AGENT_NAMES = [
  "Retrieval Suggestion Agent",
  "Contradiction Scan Agent",
  "Timeline Drift Agent",
  "Publication Safety Agent",
  "Debate Packet Readiness Agent",
];

function main() {
  const required = [
    "data/opposition/kim-hammer-profile/kim-hammer-kh4-agent-tools.json",
    "data/opposition/kim-hammer-profile/kim-hammer-kh4-claim-graph.json",
    "data/opposition/kim-hammer-profile/kim-hammer-kh4-risk-register.json",
    "data/opposition/kim-hammer-profile/kim-hammer-kh4-publication-safety.json",
    "src/lib/opposition/kimHammerKh4Workbench.ts",
    "src/lib/opposition/kimHammerKh4SuggestionAgents.ts",
    "src/app/admin/(board)/intelligence/kim-hammer/kh4-agent-tools/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/attack-surface/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/intel-heat-map/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/narrative-drift-monitor/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/debate-packet-export/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/page.tsx",
  ];

  required.forEach((p) => assert(fs.existsSync(path.join(process.cwd(), p)), `Missing KH-4 artifact: ${p}`));

  const tools = readJson<{ agents: Array<{ id: string; outputFields: string[] }> }>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh4-agent-tools.json",
  );
  assert(tools.agents.length >= 4, "KH-4 should define at least 4 agents.");

  const risk = readJson<{ risks: Array<{ overallThreatIndex: number; narrativeRiskScore: number }> }>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh4-risk-register.json",
  );
  assert(risk.risks.length >= 1, "KH-4 risk register cannot be empty.");
  assert(
    risk.risks.every((r) => r.overallThreatIndex >= 0 && r.overallThreatIndex <= 1),
    "Threat index must be between 0 and 1.",
  );

  const safety = readJson<{ rules: Array<{ severity: string }> }>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh4-publication-safety.json",
  );
  assert(safety.rules.some((r) => r.severity === "BLOCKER"), "Publication safety must include blocker rules.");

  const suggestions = loadKimHammerKh4SuggestionAgents();
  assert(suggestions.agents.length === 5, "KH-4 suggestion registry must expose exactly 5 read-only agents.");

  for (const name of REQUIRED_SUGGESTION_AGENT_NAMES) {
    assert(
      suggestions.agents.some((agent) => agent.name === name),
      `Missing required suggestion agent registration: ${name}`,
    );
  }

  assert(
    suggestions.agents.every((agent) => agent.humanReviewRequired === true),
    "All suggestion agents must require human review.",
  );
  assert(
    suggestions.agents.every((agent) => agent.guardrails.length > 0),
    "All suggestion agents must include guardrails.",
  );
  assert(
    suggestions.agents.every(
      (agent) => agent.inputSources.length > 0 && agent.outputType.length > 0 && agent.nextOperatorAction.length > 0,
    ),
    "Suggestion agents must define input sources, output type, and next operator action.",
  );

  const pageSource = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/kh4-agent-tools/page.tsx"),
    "utf8",
  );
  assert(pageSource.includes("Read-only"), "KH-4 agent tools page must state read-only mode.");
  assert(pageSource.includes("Input sources"), "KH-4 agent tools page must display input sources.");
  assert(pageSource.includes("Output type"), "KH-4 agent tools page must display output type.");
  assert(pageSource.includes("Next operator action"), "KH-4 agent tools page must display next operator action.");
  assert(pageSource.includes("Human review required"), "KH-4 agent tools page must display human review requirement.");
  assert(pageSource.includes("KH4_NON_PUBLISHABLE_LABEL"), "KH-4 agent tools page must show non-publishable label.");

  const evidenceCommandPagePath =
    "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/page.tsx";
  const evidenceCommandDashboardPath =
    "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx";

  const evidenceCommandSource = fs.readFileSync(path.join(process.cwd(), evidenceCommandPagePath), "utf8");
  const evidenceCommandDashboardSource = fs.readFileSync(
    path.join(process.cwd(), evidenceCommandDashboardPath),
    "utf8",
  );
  assert(
    evidenceCommandDashboardSource.includes("Copilot suggestions / agent readiness"),
    "Evidence Command Center must include copilot suggestions panel.",
  );
  assert(
    evidenceCommandDashboardSource.includes("/admin/intelligence/kim-hammer/kh4-agent-tools"),
    "Evidence Command Center must link to KH-4 agent tools page.",
  );
  assert(
    evidenceCommandSource.includes("EvidenceCommandDashboard"),
    "Evidence command page must render the dashboard component.",
  );

  console.log("KH-4 copilot layer checks passed.");
  console.log(
    JSON.stringify(
      {
        registeredAgents: suggestions.readiness.registeredAgents,
        exportReadyClaims: suggestions.readiness.exportReadyClaims,
        agentNames: suggestions.agents.map((agent) => agent.name),
      },
      null,
      2,
    ),
  );
}

main();
