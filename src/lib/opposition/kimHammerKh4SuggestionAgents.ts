import fs from "node:fs";
import path from "node:path";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { loadKimHammerKh4Workbench } from "@/lib/opposition/kimHammerKh4Workbench";

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relPath), "utf8")) as T;
}

export const KH4_NON_PUBLISHABLE_LABEL =
  "NON_PUBLISHABLE UNTIL REVIEWED — All copilot / suggestion outputs require human review and publication-safety clearance before external use.";

export type KimHammerKh4SuggestionAgent = {
  id: string;
  name: string;
  purpose: string;
  inputSources: string[];
  outputType: string;
  guardrails: string[];
  publicationStatus: "INTERNAL_SUGGESTION_ONLY" | "NON_PUBLISHABLE_UNTIL_REVIEW";
  humanReviewRequired: true;
  nextOperatorAction: string;
  registryAgentId?: string;
};

type Kh4AgentToolsFile = {
  generatedAt: string;
  mode: string;
  agents: Array<{
    id: string;
    name: string;
    purpose: string;
    capabilities: string[];
    outputFields: string[];
  }>;
  guardrails: string[];
};

function findAgent(tools: Kh4AgentToolsFile, id: string) {
  const agent = tools.agents.find((entry) => entry.id === id);
  if (!agent) {
    throw new Error(`Missing KH-4 agent registration: ${id}`);
  }
  return agent;
}

export function loadKimHammerKh4SuggestionAgents() {
  const kh4 = loadKimHammerKh4Workbench();
  const index = loadKimHammerEvidenceIndex();
  const tools = readJson<Kh4AgentToolsFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh4-agent-tools.json",
  );

  const globalGuardrails = [
    KH4_NON_PUBLISHABLE_LABEL,
    ...tools.guardrails,
    ...kh4.publicationSafety.rules.map((rule) => `${rule.severity}: ${rule.description}`),
  ];

  const retrieval = findAgent(tools, "retrieval-agent");
  const contradiction = findAgent(tools, "contradiction-engine");
  const timeline = findAgent(tools, "timeline-intelligence-agent");
  const publication = findAgent(tools, "evidence-confidence-engine");

  const agents: KimHammerKh4SuggestionAgent[] = [
    {
      id: "suggestion-retrieval",
      registryAgentId: retrieval.id,
      name: "Retrieval Suggestion Agent",
      purpose: retrieval.purpose,
      inputSources: [
        "kim-hammer-intelligence-gaps.json",
        "KH-4 claim graph retrievalSuggestions",
        "KH-3B ranked retrieval queue",
      ],
      outputType: `Suggestion list (${retrieval.outputFields.join(", ")})`,
      guardrails: globalGuardrails,
      publicationStatus: "NON_PUBLISHABLE_UNTIL_REVIEW",
      humanReviewRequired: true,
      nextOperatorAction:
        "Review ranked KH-3B gaps, validate suggested sources manually, then update task notes in JSON when evidence is captured.",
    },
    {
      id: "suggestion-contradiction-scan",
      registryAgentId: contradiction.id,
      name: "Contradiction Scan Agent",
      purpose: contradiction.purpose,
      inputSources: [
        "kim-hammer-kh4-claim-graph.json contradictions",
        "Public debate evidence board",
        "KH-3 timeline and statement archives",
      ],
      outputType: `Contradiction flags (${contradiction.outputFields.join(", ")})`,
      guardrails: globalGuardrails,
      publicationStatus: "NON_PUBLISHABLE_UNTIL_REVIEW",
      humanReviewRequired: true,
      nextOperatorAction:
        "Inspect flagged inconsistencies in the claim graph; do not publish contradiction summaries until source-backed review is complete.",
    },
    {
      id: "suggestion-timeline-drift",
      registryAgentId: timeline.id,
      name: "Timeline Drift Agent",
      purpose: timeline.purpose,
      inputSources: [
        "kim-hammer-kh4-claim-graph.json timelineEvents",
        "KH-3 timeline heatmap",
        "Public timeline and debate archive indexes",
      ],
      outputType: `Chronology alerts (${timeline.outputFields.join(", ")})`,
      guardrails: globalGuardrails,
      publicationStatus: "NON_PUBLISHABLE_UNTIL_REVIEW",
      humanReviewRequired: true,
      nextOperatorAction:
        "Open narrative drift monitor and reconcile chronology gaps before using drift findings in debate prep.",
    },
    {
      id: "suggestion-publication-safety",
      registryAgentId: publication.id,
      name: "Publication Safety Agent",
      purpose: publication.purpose,
      inputSources: [
        "kim-hammer-kh4-publication-safety.json",
        "kim-hammer-public-debate-evidence-board.json",
        "Runtime publication-safety gate (kimHammerPublicationSafety.ts)",
      ],
      outputType: `Safety tiers and blockers (${publication.outputFields.join(", ")})`,
      guardrails: globalGuardrails,
      publicationStatus: "NON_PUBLISHABLE_UNTIL_REVIEW",
      humanReviewRequired: true,
      nextOperatorAction:
        "Apply publication-safety rules before any external messaging; resolve blockers on Tier 4 / uncited / high-risk claims first.",
    },
    {
      id: "suggestion-debate-packet-readiness",
      name: "Debate Packet Readiness Agent",
      purpose: "Summarize export-ready debate claims that pass Tier 1 safety and approved review status.",
      inputSources: [
        "Unified evidence index exportReadyClaims",
        "/api/opposition/kim-hammer/debate-export",
        "Debate packet export admin view",
      ],
      outputType: "Export-ready claim shortlist (JSON / Markdown packet preview)",
      guardrails: globalGuardrails,
      publicationStatus: "INTERNAL_SUGGESTION_ONLY",
      humanReviewRequired: true,
      nextOperatorAction: `Verify ${index.metrics.exportReadyClaims} export-ready claim(s) on the debate packet export page before download or copy.`,
    },
  ];

  return {
    generatedAt: tools.generatedAt,
    mode: tools.mode,
    nonPublishableLabel: KH4_NON_PUBLISHABLE_LABEL,
    globalGuardrails,
    agents,
    readiness: {
      registeredAgents: agents.length,
      exportReadyClaims: index.metrics.exportReadyClaims,
      retrievalSuggestions: kh4.claimGraph.retrievalSuggestions.length,
      contradictionFlags: kh4.claimGraph.contradictions.length,
      publicationSafetyRules: kh4.publicationSafety.rules.length,
    },
  };
}
