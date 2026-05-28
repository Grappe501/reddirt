import fs from "node:fs";
import path from "node:path";
import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relPath), "utf8")) as T;
}

type Kh4AgentTools = {
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

type Kh4ClaimGraph = {
  generatedAt: string;
  claims: Array<{
    id: string;
    text: string;
    verificationTier: string;
    confidenceScore: number;
    publicationReadiness: string;
  }>;
  retrievalSuggestions: Array<{
    id: string;
    targetGapId: string;
    suggestion: string;
    retrievalConfidence: number;
    humanReviewRequired: boolean;
  }>;
  contradictions: Array<{
    id: string;
    contradictionSeverity: string;
    notes: string;
  }>;
};

type Kh4RiskRegister = {
  generatedAt: string;
  risks: Array<{
    id: string;
    claimId: string;
    narrativeRiskScore: number;
    overallThreatIndex: number;
    counterattackRisk: number;
    notes: string;
  }>;
};

type Kh4PublicationSafety = {
  generatedAt: string;
  rules: Array<{
    id: string;
    description: string;
    severity: "BLOCKER" | "REVIEW_REQUIRED" | "RECOMMENDED";
  }>;
};

export function loadKimHammerKh4Workbench() {
  const kh3 = loadKimHammerKh3Workbench();
  const agentTools = readJson<Kh4AgentTools>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh4-agent-tools.json",
  );
  const claimGraph = readJson<Kh4ClaimGraph>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh4-claim-graph.json",
  );
  const riskRegister = readJson<Kh4RiskRegister>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh4-risk-register.json",
  );
  const publicationSafety = readJson<Kh4PublicationSafety>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh4-publication-safety.json",
  );

  const debateExportItems = kh3.publicDebateEvidenceBoard.items.filter(
    (item) =>
      item.externalUseStatus === "READY_WITH_CITATION" &&
      item.citationStatus === "CITED" &&
      item.confidenceTier === "TIER_1_PUBLIC_DEPLOYABLE" &&
      item.legalRisk === "LOW",
  );

  const summary = {
    agentCount: agentTools.agents.length,
    riskRows: riskRegister.risks.length,
    retrievalSuggestions: claimGraph.retrievalSuggestions.length,
    contradictionFlags: claimGraph.contradictions.length,
    debateExportReady: debateExportItems.length,
  };

  return {
    kh3,
    agentTools,
    claimGraph,
    riskRegister,
    publicationSafety,
    debateExportItems,
    summary,
  };
}

