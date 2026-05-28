import type { HammerBillRow } from "@/lib/opposition/kimHammerWorkbench";
import { findKimHammerBill, loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";
import {
  resolveKimHammerBillNarrative,
} from "@/lib/opposition/kimHammerLegislativeNarratives";
import { resolveNarrativeDoctrineAlignment } from "@/lib/intelligence/campaignStrategicAlignment";
import {
  resolveBillGraphBundle,
  resolveGraphEntityForBill,
} from "@/lib/intelligence/campaignIntelligenceGraph";
import type {
  CampaignCivicSignal,
  KimHammerBillCivicIntelligence,
  KimHammerBillCivicQuestion,
} from "@/lib/intelligence/types/campaignIntelligenceGraph";
import type { KimHammerLegislativeEvidenceStatus } from "@/lib/opposition/types/kimHammerLegislativeNarrative";

function mapEvidenceStatus(
  status: KimHammerLegislativeEvidenceStatus,
): KimHammerBillCivicQuestion["evidenceStatus"] {
  if (status === "VERIFIED_FACT") return "VERIFIED_FACT";
  if (status === "NEEDS_REVIEW" || status === "REPORTED_CLAIM") return "NEEDS_REVIEW";
  return "INTERPRETATION";
}

function resolveCivicSignal(
  bill: HammerBillRow,
  billNumber: string,
): { signal: CampaignCivicSignal; text: string } {
  const upper = billNumber.toUpperCase();
  const transparency = bill.secretaryOfStateDutyImpact.toLowerCase();
  const county = bill.countyAdministrationImpact.toLowerCase();
  const ballot = bill.ballotAccessImpact.toLowerCase();
  const direct = bill.directDemocracyImpact.toLowerCase();
  const voter = bill.voterAccessImpact.toLowerCase();

  if (upper === "SB488" || transparency.includes("foia") || transparency.includes("exempt")) {
    return {
      signal: "CIVICALLY_OPAQUE",
      text: `${upper} creates transparency tradeoffs around public records access — civic trust depends on published procedures and audit-ready processes, not secrecy rhetoric.`,
    };
  }

  if (upper === "SB487" || county.includes("precinct") || county.includes("polling")) {
    return {
      signal: "CIVICALLY_TENSE",
      text: `${upper} increases procedural verification authority but creates county implementation strain and may reduce perceived accessibility unless paired with modernization support and public transparency measures.`,
    };
  }

  if (direct.includes("petition") || direct.includes("initiative") || ballot.includes("restrict")) {
    return {
      signal: "CIVICALLY_TENSE",
      text: `${upper} affects direct-democracy pathways — civic participation implications require plain-language explanation of lawful access vs. administrative burden.`,
    };
  }

  if (county.includes("burden") || county.includes("workload")) {
    return {
      signal: "CIVICALLY_CENTRALIZING",
      text: `${upper} shifts operational burden to county institutions without guaranteed implementation support — risks centralizing discretion while offloading complexity locally.`,
    };
  }

  if (voter.includes("access") || voter.includes("assist") || ballot.includes("expand")) {
    return {
      signal: "CIVICALLY_EMPOWERING",
      text: `${upper} may expand workable voter access when paired with clerk training and public notice — verify act text before external claims.`,
    };
  }

  if (transparency.includes("audit") || transparency.includes("transparen")) {
    return {
      signal: "CIVICALLY_ACCOUNTABLE",
      text: `${upper} includes accountability or oversight mechanisms that can strengthen public trust when implementation is transparent.`,
    };
  }

  return {
    signal: "CIVICALLY_FRAGILE",
    text: `${upper} civic implications remain INTERPRETATION until enrolled-act verification and county implementation evidence are complete.`,
  };
}

function buildCivicQuestions(
  bill: HammerBillRow,
  narrative: ReturnType<typeof resolveKimHammerBillNarrative>,
): KimHammerBillCivicQuestion[] {
  const stance = narrative.strategicBriefing.campaignAlignment.conflictsWithKelly.length > 0
    ? "Kelly should contrast process-trust and county-support framing against over-centralization or access friction."
    : "Kelly can acknowledge election-integrity goals while asking whether implementation supports counties and voter confidence.";

  return [
    {
      question: "Why do we oppose/support this bill?",
      answer: stance,
      evidenceStatus: "INTERPRETATION",
    },
    {
      question: "How does it impact Arkansas voters?",
      answer: `${bill.voterAccessImpact}. ${narrative.plainEnglishSummary}`,
      evidenceStatus: mapEvidenceStatus(narrative.evidenceStatus),
    },
    {
      question: "How does it affect the ballot initiative process?",
      answer: bill.directDemocracyImpact,
      evidenceStatus: "INTERPRETATION",
    },
    {
      question: "How does it affect election integrity?",
      answer: narrative.billNarrative || bill.enforcementImpact,
      evidenceStatus: mapEvidenceStatus(narrative.evidenceStatus),
    },
    {
      question: "How does it affect transparency?",
      answer: bill.secretaryOfStateDutyImpact,
      evidenceStatus: "INTERPRETATION",
    },
    {
      question: "How does it affect accountability?",
      answer: narrative.courtRiskNarrative ?? bill.enforcementImpact,
      evidenceStatus: "INTERPRETATION",
    },
    {
      question: "Does it empower citizens or government institutions?",
      answer: bill.affectedGroups.includes("voters")
        ? "Evaluate whether practical effect expands citizen understanding/participation or concentrates institutional discretion."
        : `Primary actors: ${bill.affectedOfficeOrActor.join(", ")}.`,
      evidenceStatus: "INTERPRETATION",
    },
    {
      question: "Does it make government more accessible or less accessible?",
      answer: `${bill.voterAccessImpact} · ${bill.ballotAccessImpact}`,
      evidenceStatus: "INTERPRETATION",
    },
    {
      question: "Does it improve civic participation or weaken it?",
      answer: `${bill.directDemocracyImpact} · ${bill.ballotAccessImpact}`,
      evidenceStatus: "INTERPRETATION",
    },
    {
      question: "Does it strengthen public trust?",
      answer: narrative.strategicBriefing.kellyMessageHelp[0] ??
        "Trust improves when process is lawful, transparent, and explained in plain language.",
      evidenceStatus: "INTERPRETATION",
    },
    {
      question: "Does it burden counties operationally?",
      answer: `${narrative.countyImpactNarrative} ${narrative.operationalBurdenNarrative}`,
      evidenceStatus: mapEvidenceStatus(narrative.evidenceStatus),
    },
    {
      question: "Does it centralize power?",
      answer: bill.countyAdministrationImpact,
      evidenceStatus: "INTERPRETATION",
    },
    {
      question: "Does it align with campaign doctrine?",
      answer: narrative.strategicBriefing.campaignAlignment.alignsWithKelly.join("; ") ||
        "See governing philosophy alignment section.",
      evidenceStatus: "INTERPRETATION",
    },
    {
      question: "How should Kelly discuss it publicly?",
      answer: narrative.strategicBriefing.howToMessage.join(" ") ||
        "Use source-backed plain language; avoid motive inference.",
      evidenceStatus: "INTERPRETATION",
    },
    {
      question: "Why should average citizens care?",
      answer: narrative.plainEnglishSummary,
      evidenceStatus: mapEvidenceStatus(narrative.evidenceStatus),
    },
  ];
}

export function computeKimHammerBillCivicIntelligence(
  bill: HammerBillRow,
  repoRoot: string = process.cwd(),
): KimHammerBillCivicIntelligence {
  const narrative = resolveKimHammerBillNarrative(bill);
  const bundle = resolveBillGraphBundle(bill.billNumber, repoRoot);
  const graphEntity = bundle.billEntity ?? resolveGraphEntityForBill(bill.billNumber, repoRoot);
  const civic = resolveCivicSignal(bill, bill.billNumber);

  const narrativeId =
    bill.billNumber === "SB487"
      ? "kh0b-county-administration-burden"
      : bill.legislativePackageId === "kh0b-2021-integrity-foundation"
        ? "kh0b-2021-integrity-foundation"
        : `SB${bill.billNumber.replace(/^SB/i, "")}`;

  const doctrineAlignment = resolveNarrativeDoctrineAlignment(
    narrativeId.includes("kh0b") || narrativeId.startsWith("debate")
      ? narrativeId
      : bill.billNumber,
    repoRoot,
  );

  const aligned =
    doctrineAlignment && doctrineAlignment.alignmentSignal === "STRATEGICALLY_ALIGNED"
      ? doctrineAlignment.matchedDoctrineIds
      : narrative.strategicBriefing.campaignAlignment.alignsWithKelly;

  const tense =
    doctrineAlignment &&
    (doctrineAlignment.alignmentSignal === "STRATEGICALLY_TENSE" ||
      doctrineAlignment.alignmentSignal === "STRATEGICALLY_FRAGILE")
      ? [doctrineAlignment.signal]
      : narrative.strategicBriefing.campaignAlignment.conflictsWithKelly;

  return {
    billNumber: bill.billNumber,
    actNumber: bill.actNumber,
    civicSignal: civic.signal,
    civicSignalText: civic.text,
    civicQuestions: buildCivicQuestions(bill, narrative),
    civicImpactAnalysis: [
      narrative.plainEnglishSummary,
      narrative.billNarrative,
      `Affected groups: ${bill.affectedGroups.join(", ") || "—"}.`,
    ],
    democracyParticipationAnalysis: [
      bill.directDemocracyImpact,
      bill.ballotAccessImpact,
      ...narrative.debateFrames.filter((frame) => frame.toLowerCase().includes("access")),
    ],
    transparencyAccountabilityAnalysis: [
      bill.secretaryOfStateDutyImpact,
      narrative.courtRiskNarrative ?? "Court/oversight implications NEEDS_REVIEW until act-text pass.",
      ...narrative.governanceNotes.filter((note) => note.toLowerCase().includes("foia") || note.toLowerCase().includes("transparen")),
    ],
    countyOperationsImpact: [
      narrative.countyImpactNarrative,
      narrative.operationalBurdenNarrative,
      bill.countyAdministrationImpact,
    ],
    governingPhilosophyAlignment: {
      aligned: Array.isArray(aligned) ? aligned.map(String) : [String(aligned)],
      tense: tense.map(String),
      doctrineIds: graphEntity?.doctrineLinks ?? doctrineAlignment?.matchedDoctrineIds ?? [],
    },
    strategicMessagingGuidance: [
      ...narrative.strategicBriefing.howToMessage,
      ...narrative.strategicBriefing.whenToUse.map((row) => `When to use: ${row}`),
      ...narrative.strategicBriefing.whenNotToUse.map((row) => `When not to use: ${row}`),
      ...bundle.philosophyNodes.map((node) => `${node.title}: ${node.principle}`),
    ],
    publicExplanationLayer: [
      narrative.plainEnglishSummary,
      `Average Arkansan takeaway: ${narrative.strategicBriefing.kellyMessageHelp[0] ?? "Process clarity and county support matter more than rhetoric."}`,
    ],
    debateFramingLayer: {
      bestContrast: narrative.debateFrames,
      bridgeLines: narrative.strategicBriefing.kellyMessageHelp,
      counterarguments: narrative.counterArguments,
      traps: narrative.strategicBriefing.oppositionSetup,
    },
    riskCounterattackAnalysis: [
      ...narrative.supporterArguments.map((row) => `Supporter line: ${row}`),
      ...narrative.strategicBriefing.oppositionSetup.map((row) => `Opponent setup: ${row}`),
      `Publication risk: ${narrative.publicationRisk} · Evidence tier: ${narrative.evidenceTier}`,
    ],
    civicEnvironmentImpact: [
      civic.text,
      narrative.strategicBriefing.debateImpact.join(" "),
      ...narrative.strategicBriefing.campaignAlignment.neutralOrContextual,
    ],
    graphEntityId: graphEntity?.entityId ?? `bill-${bill.billNumber.toUpperCase()}`,
    linkedEntityIds: [
      ...(graphEntity?.linkedEntities ?? []),
      ...bundle.linkedEntities.map((row) => row.entityId),
    ],
    reviewStatus: narrative.evidenceStatus,
    computedAt: new Date().toISOString(),
  };
}

export function computeKimHammerBillCivicIntelligenceByNumber(
  billNumber: string,
  repoRoot?: string,
): KimHammerBillCivicIntelligence | undefined {
  const bill = findKimHammerBill(billNumber);
  if (!bill) return undefined;
  return computeKimHammerBillCivicIntelligence(bill, repoRoot);
}

export function listFlaggedBillCivicSummaries(
  repoRoot?: string,
): Array<{ billNumber: string; civicSignal: CampaignCivicSignal; signal: string }> {
  const workbench = loadKimHammerWorkbench();
  const flagged = workbench.strongestDebateAnchors.length
    ? workbench.strongestDebateAnchors
    : workbench.bills.slice(0, 6);

  return flagged.map((bill) => {
    const civic = computeKimHammerBillCivicIntelligence(bill, repoRoot);
    return {
      billNumber: bill.billNumber,
      civicSignal: civic.civicSignal,
      signal: civic.civicSignalText,
    };
  });
}
