import type { HammerBillRow } from "@/lib/opposition/kimHammerWorkbench";
import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";
import { resolveNarrativeDoctrineAlignment } from "@/lib/intelligence/campaignStrategicAlignment";
import {
  computeKimHammerBillCivicIntelligence,
} from "@/lib/intelligence/kimHammerBillCivicIntelligence";
import type { KimHammerBillCivicIntelligence } from "@/lib/intelligence/types/campaignIntelligenceGraph";
import { resolvePhilosophyForBill } from "@/lib/intelligence/campaignIntelligenceGraph";
import type { CampaignCivicSignal } from "@/lib/intelligence/types/campaignIntelligenceGraph";

export type CampaignMessagingGuidance = {
  billNumber?: string;
  narrativeId?: string;
  strongestFrames: string[];
  riskyFrames: string[];
  doctrineSafeFrames: string[];
  citizenImpactSummary: string[];
  countySensitiveNotes: string[];
  civicTrustFrames: string[];
  operationalGovernanceFrames: string[];
  messagingRiskSummary: string;
  civicSignal: CampaignCivicSignal | "NONE";
  computedAt: string;
};

export function resolveMessagingGuidance(
  bill: HammerBillRow,
  repoRoot: string = process.cwd(),
): CampaignMessagingGuidance {
  const civic = computeKimHammerBillCivicIntelligence(bill, repoRoot);
  return buildMessagingFromCivic(civic, bill.billNumber, repoRoot);
}

export function computeCitizenImpactMessaging(
  bill: HammerBillRow,
  repoRoot?: string,
): string[] {
  const civic = computeKimHammerBillCivicIntelligence(bill, repoRoot);
  return [...civic.publicExplanationLayer, ...civic.civicImpactAnalysis.slice(0, 2)];
}

export function resolveDoctrineSafeFrames(
  billNumber: string,
  repoRoot: string = process.cwd(),
): string[] {
  const philosophy = resolvePhilosophyForBill(billNumber, repoRoot);
  const frames = philosophy.flatMap((node) => node.messagingFrames);
  const narrativeId =
    billNumber === "SB487" ? "kh0b-county-administration-burden" : "debate-frame-election-integrity";
  const alignment = resolveNarrativeDoctrineAlignment(narrativeId, repoRoot);
  if (alignment?.alignmentSignal === "STRATEGICALLY_ALIGNED") {
    frames.push("Process clarity over polarization");
  }
  return [...new Set(frames)];
}

export function computeDebatePositioning(
  bill: HammerBillRow,
  repoRoot?: string,
): KimHammerBillCivicIntelligence["debateFramingLayer"] & {
  doctrineWarnings: string[];
} {
  const civic = computeKimHammerBillCivicIntelligence(bill, repoRoot);
  const narrativeId =
    bill.billNumber === "SB487" ? "kh0b-county-administration-burden" : "debate-frame-election-integrity";
  const alignment = resolveNarrativeDoctrineAlignment(narrativeId, repoRoot);
  const doctrineWarnings =
    alignment &&
    alignment.alignmentSignal !== "STRATEGICALLY_ALIGNED" &&
    alignment.alignmentSignal !== "STRATEGICALLY_PRIORITY"
      ? [alignment.signal]
      : [];

  return {
    ...civic.debateFramingLayer,
    doctrineWarnings,
  };
}

export function summarizeMessagingRisk(
  bill: HammerBillRow,
  repoRoot?: string,
): CampaignMessagingGuidance {
  return resolveMessagingGuidance(bill, repoRoot);
}

function buildMessagingFromCivic(
  civic: KimHammerBillCivicIntelligence,
  billNumber: string,
  repoRoot: string,
): CampaignMessagingGuidance {
  const risky: string[] = [];
  if (civic.civicSignal === "CIVICALLY_OPAQUE") risky.push("Secrecy or FOIA exemption framing without audit context");
  if (civic.civicSignal === "CIVICALLY_CENTRALIZING") risky.push("County blame without SOS support offer");
  risky.push(...civic.riskCounterattackAnalysis.filter((row) => row.includes("HIGH")).slice(0, 1));

  const doctrineSafe = resolveDoctrineSafeFrames(billNumber, repoRoot);

  return {
    billNumber,
    strongestFrames: civic.debateFramingLayer.bestContrast.slice(0, 4),
    riskyFrames: [...risky, ...civic.debateFramingLayer.traps.slice(0, 2)],
    doctrineSafeFrames: doctrineSafe,
    citizenImpactSummary: civic.publicExplanationLayer,
    countySensitiveNotes: civic.countyOperationsImpact.slice(0, 3),
    civicTrustFrames: civic.civicEnvironmentImpact.slice(0, 2),
    operationalGovernanceFrames: civic.strategicMessagingGuidance.slice(0, 3),
    messagingRiskSummary:
      civic.civicSignal === "CIVICALLY_ALIGNED" || civic.civicSignal === "CIVICALLY_EMPOWERING"
        ? "Doctrine-safe civic framing available with source verification."
        : `${civic.civicSignal}: ${civic.civicSignalText}`,
    civicSignal: civic.civicSignal,
    computedAt: new Date().toISOString(),
  };
}

export function summarizeDebateCommandMessaging(
  repoRoot?: string,
): {
  flaggedBills: Array<{ billNumber: string; civicSignal: CampaignCivicSignal; citizenSummary: string }>;
  philosophyConsistency: string[];
  strategicRiskWarnings: string[];
} {
  const workbench = loadKimHammerWorkbench();
  const anchors = workbench.strongestDebateAnchors.slice(0, 5);

  const flaggedBills = anchors.map((bill) => {
    const civic = computeKimHammerBillCivicIntelligence(bill, repoRoot);
    return {
      billNumber: bill.billNumber,
      civicSignal: civic.civicSignal,
      citizenSummary: civic.publicExplanationLayer[0] ?? civic.civicSignalText,
    };
  });

  return {
    flaggedBills,
    philosophyConsistency: [
      "Civic trust + county partnership philosophy must frame opposition bill critique.",
      "Balls-and-strikes SOS doctrine — avoid cultural-war election rhetoric.",
    ],
    strategicRiskWarnings: flaggedBills
      .filter((row) => row.civicSignal !== "CIVICALLY_ALIGNED" && row.civicSignal !== "CIVICALLY_EMPOWERING")
      .map((row) => `${row.billNumber}: ${row.citizenSummary.slice(0, 120)}`),
  };
}
