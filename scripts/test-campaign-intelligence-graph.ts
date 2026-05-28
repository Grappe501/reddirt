import fs from "node:fs";
import path from "node:path";
import {
  CAMPAIGN_INTELLIGENCE_GRAPH_REL,
  CAMPAIGN_PHILOSOPHY_GRAPH_REL,
  auditCampaignIntelligenceGraphLinks,
  loadCampaignIntelligenceGraph,
  loadCampaignPhilosophyGraph,
  resolveGraphEntity,
  resolveGraphEntityForBill,
  resolveLinkedGraphEntities,
  summarizeCampaignIntelligenceGraph,
} from "@/lib/intelligence/campaignIntelligenceGraph";
import { computeKimHammerBillCivicIntelligence } from "@/lib/intelligence/kimHammerBillCivicIntelligence";
import { resolveMessagingGuidance } from "@/lib/intelligence/campaignMessagingIntelligence";
import { findKimHammerBill, loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { CAMPAIGN_CIVIC_SIGNALS } from "@/lib/intelligence/types/campaignIntelligenceGraph";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const REQUIRED_FILES = [
  CAMPAIGN_INTELLIGENCE_GRAPH_REL,
  CAMPAIGN_PHILOSOPHY_GRAPH_REL,
  "src/lib/intelligence/campaignIntelligenceGraph.ts",
  "src/lib/intelligence/kimHammerBillCivicIntelligence.ts",
  "src/lib/intelligence/campaignMessagingIntelligence.ts",
  "src/app/admin/(board)/intelligence/kim-hammer/KimHammerBillCivicIntelligencePanel.tsx",
  "src/app/admin/(board)/intelligence/campaign-intelligence-graph/page.tsx",
];

function main() {
  for (const relPath of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing NSI-4 artifact: ${relPath}`);
  }

  const billPageSource = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/bills/[billNumber]/page.tsx"),
    "utf8",
  );
  assert(billPageSource.includes("KimHammerBillCivicIntelligencePanel"), "Bill briefing must render civic intelligence panel.");

  const debateSource = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/debate-command/page.tsx"),
    "utf8",
  );
  assert(debateSource.includes("NSI-4"), "Debate command must integrate NSI-4 civic intelligence.");
  assert(debateSource.includes("campaign-intelligence-graph"), "Debate command must link to intelligence graph.");

  const graph = loadCampaignIntelligenceGraph();
  assert(graph.entityCount >= 50, `Expected at least 50 graph entities; got ${graph.entityCount}.`);
  assert(graph.entities.length === graph.entityCount, "entityCount must match entities array length.");

  const philosophy = loadCampaignPhilosophyGraph();
  assert(philosophy.nodes.length >= 8, "Philosophy graph must include governing values.");

  const audit = auditCampaignIntelligenceGraphLinks();
  assert(audit.brokenLinks.length === 0, `Broken graph links: ${audit.brokenLinks.join("; ")}`);

  const sb487Entity = resolveGraphEntityForBill("SB487");
  assert(sb487Entity, "SB487 must resolve in intelligence graph.");
  assert(sb487Entity.doctrineLinks.length >= 2, "SB487 must link to doctrine entities.");

  const linked = resolveLinkedGraphEntities(sb487Entity.entityId);
  assert(linked.length >= 1, "SB487 must resolve linked graph entities.");

  const sb487Bill = findKimHammerBill("SB487");
  assert(sb487Bill, "SB487 must exist in workbench.");
  const civic = computeKimHammerBillCivicIntelligence(sb487Bill);
  assert(civic.civicQuestions.length >= 10, "Civic intelligence must answer governed civic questions.");
  assert(civic.civicSignalText.length > 0, "Civic signals must explain WHY.");
  assert(
    civic.civicSignal === "CIVICALLY_TENSE" || civic.civicSignalText.includes("SB487"),
    `SB487 expected civic tension signal; got ${civic.civicSignal}.`,
  );
  assert(civic.debateFramingLayer.bestContrast.length > 0, "Debate framing layer must populate.");
  assert(civic.publicExplanationLayer.length > 0, "Public explanation layer required.");

  for (const signal of CAMPAIGN_CIVIC_SIGNALS) {
    assert(typeof signal === "string", "Civic signal enum must be defined.");
  }

  const messaging = resolveMessagingGuidance(sb487Bill);
  assert(messaging.doctrineSafeFrames.length > 0, "Messaging intelligence must expose doctrine-safe frames.");
  assert(messaging.messagingRiskSummary.length > 0, "Messaging risk summary required.");

  const summary = summarizeCampaignIntelligenceGraph();
  assert(summary.billCount >= 11, "Graph must include narrative-tracked bills.");

  const workbench = loadKimHammerWorkbench();
  let billsWithCivic = 0;
  for (const bill of workbench.bills.slice(0, 5)) {
    const intel = computeKimHammerBillCivicIntelligence(bill);
    if (intel.civicImpactAnalysis.length > 0) billsWithCivic += 1;
  }
  assert(billsWithCivic >= 5, "Bill civic intelligence must compute for workbench bills.");

  const doctrineEntity = resolveGraphEntity("doctrine-steve-strategy");
  assert(doctrineEntity?.entityType === "DOCTRINE", "Doctrine entities must resolve by ID.");

  const evidenceIndex = loadKimHammerEvidenceIndex();
  assert(
    evidenceIndex.metrics.exportReadyClaims === 2,
    `NSI-4 must not mutate export-ready count; expected 2, got ${evidenceIndex.metrics.exportReadyClaims}.`,
  );

  console.log("Campaign intelligence graph (NSI-4) checks passed.");
  console.log(
    JSON.stringify(
      {
        entityCount: graph.entityCount,
        philosophyNodes: philosophy.nodes.length,
        sb487CivicSignal: civic.civicSignal,
        sb487SignalPreview: civic.civicSignalText.slice(0, 140),
        validGraphLinks: audit.validLinks,
        exportReadyClaims: evidenceIndex.metrics.exportReadyClaims,
        routes: [
          "/admin/intelligence/campaign-intelligence-graph",
          "/admin/intelligence/kim-hammer/bills/SB487",
        ],
      },
      null,
      2,
    ),
  );
}

main();
